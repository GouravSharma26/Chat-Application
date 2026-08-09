import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isTyping = Boolean(typingUsers[selectedUser._id]);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar / Icon */}
          <div className="avatar">
            {selectedUser.members ? (
              <div className="size-10 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold text-lg">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="size-10 rounded-full relative">
                <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName || selectedUser.name}</h3>
            <p className="text-sm text-base-content/70">
              {isTyping ? (
                <span className="text-primary font-medium animate-pulse">Typing...</span>
              ) : (
                selectedUser.members 
                  ? `${selectedUser.members.length} members` 
                  : (onlineUsers.includes(selectedUser._id) ? "Online" : "Offline")
              )}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;