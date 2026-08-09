import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";


export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    groups: [],
    unreadMessages: [], // array of message objects
    typingUsers: {}, // { [chatId]: senderId }
    selectedUser: null, // this will also represent selectedGroup
    isUsersLoading: false,
    isGroupsLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            const authUser = useAuthStore.getState().authUser;
            const filteredUsers = res.data.filter(user => user._id !== authUser?._id);
            set({ users: filteredUsers });

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to get users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getGroups: async () => {
        set({ isGroupsLoading: true });
        try {
            const res = await axiosInstance.get("/groups");
            set({ groups: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to get groups");
        } finally {
            set({ isGroupsLoading: false });
        }
    },

    createGroup: async (name, members) => {
        try {
            const res = await axiosInstance.post("/groups/create", { name, members });
            set({ groups: [...get().groups, res.data] });
            toast.success("Group created successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group");
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.messages || "Failed to get messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        
        // Optimistic update
        const tempId = "temp-" + Date.now();
        const isGroup = selectedUser.members !== undefined;
        const optimisticMessage = {
            _id: tempId,
            senderId: useAuthStore.getState().authUser, // store full user for group UI
            ...(isGroup ? { groupId: selectedUser._id } : { receiverId: selectedUser._id }),
            text: messageData.text,
            image: messageData.image,
            fileUrl: messageData.file,
            fileType: messageData.fileType,
            createdAt: new Date().toISOString(),
            isSending: true,
        };
        
        set({ messages: [...messages, optimisticMessage] });

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser?._id}`, messageData);
            // Replace optimistic message with the real one
            set({ 
                messages: get().messages.map(msg => msg._id === tempId ? res.data : msg) 
            });
        } catch (error) {
            // Remove optimistic message if it failed
            set({ messages: get().messages.filter(msg => msg._id !== tempId) });
            toast.error(error.response?.data?.message || error.message || "Failed to send message");
        }
    },


    deleteMessage: async (messageId) => {
        const { messages } = get();
        try {
            await axiosInstance.delete(`/messages/delete/${messageId}`)
            set({ messages: messages.filter(message => message._id !== messageId) })
            toast.success("Message deleted");
        } catch (error) {
            toast.error(error.response.data.message || "Failed to delete message");
        }
    },

    editMessage: async (messageId, text) => {
        const { messages } = get();
        try {
            const res = await axiosInstance.put(`/messages/edit/${messageId}`, { text });
            set({
                messages: messages.map((msg) => (msg._id === messageId ? res.data : msg)),
            });
            toast.success("Message updated");
        } catch (error) {
            toast.error(error.response.data.message || "Failed to edit message");
        }
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser });
        // Clear unread messages for this chat
        if (selectedUser) {
            set((state) => ({
                unreadMessages: state.unreadMessages.filter(msg => {
                    const msgChatId = msg.groupId ? msg.groupId : (msg.senderId._id || msg.senderId);
                    return msgChatId !== selectedUser._id;
                })
            }));
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const { selectedUser } = get();
            const msgChatId = newMessage.groupId ? newMessage.groupId : (newMessage.senderId._id || newMessage.senderId);
            
            if (selectedUser && selectedUser._id === msgChatId) {
                // Currently in this chat, append to messages
                set({ messages: [...get().messages, newMessage] });
            } else {
                // Not in this chat, add to unread badges
                set({ unreadMessages: [...get().unreadMessages, newMessage] });
            }
        });

        socket.on("messageDeleted", (messageId) => {
            set({ messages: get().messages.filter(msg => msg._id !== messageId) });
        });

        socket.on("messageEdited", (updatedMessage) => {
            set({
                messages: get().messages.map(msg => 
                    msg._id === updatedMessage._id ? updatedMessage : msg
                )
            });
        });

        socket.on("userTyping", ({ senderId, groupId }) => {
            const chatId = groupId || senderId;
            set((state) => ({
                typingUsers: { ...state.typingUsers, [chatId]: senderId }
            }));
        });

        socket.on("userStoppedTyping", ({ senderId, groupId }) => {
            const chatId = groupId || senderId;
            set((state) => {
                const newTyping = { ...state.typingUsers };
                delete newTyping[chatId];
                return { typingUsers: newTyping };
            });
        });
    },

    unsubscribeFromMessage: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
        socket.off("messageDeleted");
        socket.off("messageEdited");
        socket.off("userTyping");
        socket.off("userStoppedTyping");
    },
}))
