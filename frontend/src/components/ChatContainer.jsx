import React, { useRef, useState, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import ChatHeader from './ChatHeader.jsx';
import MessageInput from './MessageInput.jsx';
import MessageSkeleton from './skeleton/MessageSkeleton.jsx';
import { useAuthStore } from '../store/useAuthStore.js';
import { formatMessageTime } from '../lib/utils.js';
import { MoreVertical, Edit2, Trash2, Check, X, FileText, Download } from 'lucide-react';

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessage, deleteMessage, editMessage } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessage();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessage]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages])


  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat group ${(typeof message.senderId === 'object' ? message.senderId._id : message.senderId) === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            {selectedUser.members && (
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      (typeof message.senderId === 'object' ? message.senderId._id : message.senderId) === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : (typeof message.senderId === 'object' ? message.senderId.profilePic : selectedUser.profilePic) || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
            )}
            <div className="chat-header mb-1 flex items-center gap-1">
              {/* Show sender name in group chats if it's not the authUser */}
              {selectedUser.members && (typeof message.senderId === 'object' ? message.senderId._id : message.senderId) !== authUser._id && (
                <span className="text-xs font-semibold mr-1">
                  {typeof message.senderId === 'object' ? message.senderId.fullName : "User"}
                </span>
              )}
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
              
              {/* Dropdown for Edit/Delete on own messages */}
              {(typeof message.senderId === 'object' ? message.senderId._id : message.senderId) === authUser._id && (
                <div className="dropdown dropdown-left">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle opacity-50 hover:opacity-100 transition-opacity">
                    <MoreVertical className="size-4" />
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-1 shadow bg-base-100 rounded-box w-28 text-xs">
                    <li>
                      <button onClick={() => { setEditingMessageId(message._id); setEditContent(message.text || ""); }}>
                        <Edit2 className="size-3" /> Edit
                      </button>
                    </li>
                    <li>
                      <button onClick={() => deleteMessage(message._id)} className="text-error">
                        <Trash2 className="size-3" /> Delete
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className={`chat-bubble flex flex-col relative ${message.isSending ? 'opacity-50' : ''}`}>
              {(message.image || message.fileType === "image") && (
                <div className="relative">
                  <img
                    src={message.image || message.fileUrl}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                  {message.isSending && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                    </div>
                  )}
                </div>
              )}
              {message.fileType === "video" && (
                <div className="relative">
                  <video
                    src={message.fileUrl}
                    controls
                    className="sm:max-w-[250px] rounded-md mb-2 bg-black"
                  />
                  {message.isSending && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                    </div>
                  )}
                </div>
              )}
              {message.fileType === "document" && (
                <div className="relative mb-2">
                  <a href={message.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-base-300 rounded-lg hover:bg-base-200 transition-colors border border-base-content/10">
                    <FileText className="size-8 text-primary" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate w-32">Document</span>
                      <span className="text-xs text-base-content/50">Click to download</span>
                    </div>
                    <Download className="size-4 text-base-content/70" />
                  </a>
                  {message.isSending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-100/50 rounded-lg">
                      <span className="loading loading-spinner loading-sm text-primary"></span>
                    </div>
                  )}
                </div>
              )}
              {message.fileType === "audio" && (
                <div className="relative mb-2">
                  <audio
                    src={message.fileUrl}
                    controls
                    className="sm:max-w-[250px] rounded-full"
                  />
                  {message.isSending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-100/50 rounded-full">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                    </div>
                  )}
                </div>
              )}
              {editingMessageId === message._id ? (
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="text" 
                    className="input input-xs input-bordered flex-1 text-base-content bg-base-100" 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        editMessage(message._id, editContent); 
                        setEditingMessageId(null);
                      }
                    }}
                  />
                  <button className="btn btn-xs btn-circle btn-success" onClick={() => { editMessage(message._id, editContent); setEditingMessageId(null); }}>
                    <Check className="size-3" />
                  </button>
                  <button className="btn btn-xs btn-circle btn-error" onClick={() => setEditingMessageId(null)}>
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                message.text && (
                  <div className="flex items-end gap-2">
                    <p>{message.text}</p>
                    {message.isEdited && <span className="text-[10px] opacity-50 mb-0.5">(edited)</span>}
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  )
}

export default ChatContainer
