import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeleton/SidebarSkeleton";
import { Users, Search, Plus } from "lucide-react";
const Sidebar = () => {
  const { getUsers, users, getGroups, groups, selectedUser, setSelectedUser, isUsersLoading, isGroupsLoading, unreadMessages } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  const filteredUsers = users.filter((user) => {
    const matchesOnline = showOnlineOnly ? onlineUsers.includes(user._id) : true;
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOnline && matchesSearch;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Chats</span>
          </div>
          <button onClick={()=>document.getElementById('create_group_modal').showModal()} className="btn btn-xs btn-ghost hidden lg:flex items-center gap-1">
            <Plus className="size-4" /> New Group
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-3 hidden lg:block">
          <label className="input input-sm input-bordered flex items-center gap-2">
            <Search className="size-4 text-zinc-500" />
            <input
              type="text"
              className="grow"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        {/* Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {groups.map((group) => (
          <button
            key={group._id}
            onClick={() => setSelectedUser(group)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <div className="size-12 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold text-lg">
                {group.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="font-medium truncate">{group.name}</div>
              <div className="text-xs text-zinc-500">{group.members.length} members</div>
            </div>
            {/* Unread Badge for Group */}
            {(() => {
              const count = unreadMessages.filter(msg => msg.groupId === group._id).length;
              if (count > 0) {
                return (
                  <div className="badge badge-primary badge-sm">
                    {count}
                  </div>
                );
              }
              return null;
            })()}
          </button>
        ))}

        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
            
            {/* Unread Badge for User */}
            {(() => {
              const count = unreadMessages.filter(msg => !msg.groupId && (msg.senderId._id || msg.senderId) === user._id).length;
              if (count > 0) {
                return (
                  <div className="badge badge-primary badge-sm">
                    {count}
                  </div>
                );
              }
              return null;
            })()}
          </button>
        ))}

        {filteredUsers.length === 0 && groups.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            {searchQuery ? "No chats found" : "No online users"}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <dialog id="create_group_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-4">Create New Group</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const name = formData.get('groupName');
            const members = formData.getAll('members');
            if (name && members.length > 0) {
              useChatStore.getState().createGroup(name, members);
              e.target.reset();
              document.getElementById('create_group_modal').close();
            }
          }}>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Group Name</span>
              </label>
              <input type="text" name="groupName" placeholder="Enter group name" className="input input-bordered w-full" required />
            </div>
            
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text">Select Members</span>
              </label>
              <div className="max-h-48 overflow-y-auto border border-base-300 rounded-lg p-2 bg-base-200">
                {users.map(user => (
                  <label key={user._id} className="cursor-pointer label flex justify-start gap-4 p-2 hover:bg-base-300 rounded-md transition-colors">
                    <input type="checkbox" name="members" value={user._id} className="checkbox checkbox-sm" />
                    <span className="label-text">{user.fullName}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary w-full">Create Group</button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </aside>
  );
};
export default React.memo(Sidebar);