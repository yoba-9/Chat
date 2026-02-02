"use client";

import { useEffect, useState } from "react";
import { DirectChat, GroupChat, SearchGroup, User } from "@/lib/types";
import { SearchModal } from "./SearchModal";
import { useChatStore } from "@/store/chatStore";
import { useSession } from "@/components/providers";
import { Check, CheckCheck, CheckCheckIcon, CheckIcon, MessageCircle, Plus, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import CreateGroupModal from "./GroupChatList";

async function createChat(participant: User, currentUser: User | null): Promise<DirectChat> {
  console.log("Mock create chat with:", participant.id);
  const now = new Date().toISOString();
  return {
    id: `direct-${participant.id}`,
    user1: {
      id: currentUser?.id || "1",
      name: currentUser?.name || "Me",
      email: currentUser?.email || "me@example.com",
      avatar: currentUser?.avatar || null
    },
    user2: {
      id: participant.id,
      name: participant.name || "Mock User",
      email: participant.email || "mock@example.com",
      avatar: participant.avatar || null
    },
    messages: [],
    createdAt: now,
    updatedAt: now,
    unreadCount: 0
  };
}

async function createGroup(data: {
  name: string;
  description?: string;
  memberIds: string[];
  isPrivate: boolean;
}, currentUser: any): Promise<GroupChat> {
  console.log("Mock create group:", data);
  const now = new Date().toISOString();
  // Ensure currentUser is included in members if not already there
  const allMemberIds = Array.from(new Set([currentUser.id, ...data.memberIds]));

  return {
    id: `group-${Date.now()}`,
    name: data.name,
    description: data.description || "",
    isPrivate: data.isPrivate,
    ownerId: currentUser.id,
    members: allMemberIds.map(id => ({
      user: {
        id,
        name: id === currentUser.id ? (currentUser.name || "Owner") : "Member",
        avatar: id === currentUser.id ? (currentUser.avatar || null) : null,
        email: id === currentUser.id ? (currentUser.email || null) : null
      },
      role: (id === currentUser.id ? 'owner' : 'member') as 'owner' | 'member',
      joinedAt: now
    })),
    messages: [],
    createdAt: now,
    updatedAt: now,
    unreadCount: 0
  };
}

export default function UserList() {
  const { data: session, status } = useSession();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "direct" | "groups">("all");
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const {
    messages,
    sendMessage,
    currentUser,
    directChats,
    groupChats,
    typingUsers,
    onlineUsers,
    socket,
    isConnected,
    replyingTo,
    selectedChatId,
    setDirectChats,
    setGroupChats,
    setUnreadCount,
    setMessages,
    clearChatUnread,
    addDirectChat,
    setSelectedChatId,
    addGroupChat,
    updateGroupChat,
    updateDirectChat,
    setReplyingTo,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
    editMessage,
    uploadingFiles,
    uploadFile,
    addReaction,
    removeReaction,
    setUserOnline,
    setUserOffline,
    showAllUsers,
    setShowAllUsers,
    chatFilter,
    setChatFilter,
  } = useChatStore();

  useEffect(() => {
    setActiveTab(chatFilter);
  }, [chatFilter]);


  useEffect(() => {
    if (!socket) return;

    socket.on("user_online", (userId: string) => {
      setUserOnline(userId);
    });

    socket.on("user_offline", (userId: string) => {
      setUserOffline(userId);
    });

    socket.on("new_group_chat", (group: GroupChat) => {
      addGroupChat(group);
    });

    socket.on("group_member_joined", (data: { groupChatId: string; member: any }) => {
      fetchAllChats();
    });

    socket.on("group_member_left", (data: { groupChatId: string; memberId: string }) => {
      fetchAllChats();
    });


    socket.on("unread_count_updated", (data: { chatId: string; unreadCount: number }) => {
      setUnreadCount(data.chatId, data.unreadCount);
    });

    socket.on("last_messages", (data: { chatId: string; messages: any[] }) => {
      console.log("📨 Received last messages for chat:", {
        chatId: data.chatId,
        messageCount: data.messages.length,
        lastMessage: data.messages[data.messages.length - 1]?.content
      });

      if (data.messages.length > 0) {
        setMessages(data.chatId, data.messages);
      }
    });

    socket.on("chat_messages", (data: { chatId: string; messages: any[]; hasMore: boolean; total: number }) => {
      if (data.messages) {
        const sortedMessages = data.messages.sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(data.chatId, sortedMessages);

        if (currentUser) {
          const unreadIds = sortedMessages
            .filter(
              (m: any) =>
                m.senderId !== currentUser.id &&
                !(m.readReceipts || []).some((rr: any) => rr.userId === currentUser.id)
            )
            .map((m: any) => m.id);

          if (unreadIds.length > 0 && socket) {
            socket.emit("mark_messages_read", { chatId: data.chatId, messageIds: unreadIds });
          }
        }
      }
    });

    return () => {
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("new_group_chat");
      socket.off("group_member_joined");
      socket.off("group_member_left");
      socket.off("unread_count_updated");
      socket.off("last_messages");
      socket.off("chat_messages");
    };
  }, [socket, setUserOnline, setUserOffline, addGroupChat, updateGroupChat, updateDirectChat, setUnreadCount, currentUser, setMessages]);

  useEffect(() => {
    if (session?.user?.email && isConnected && !isLoadingChats) {
      fetchAllChats();
    }
  }, [session, isConnected]);

  const fetchAllChats = async () => {
    if (isLoadingChats) return;

    setIsLoadingChats(true);
    try {
      console.log("Fetching mock chats...");
      // Mock data + Local Storage persistence
      setTimeout(() => {
        const storedGroups = JSON.parse(localStorage.getItem('groupChats') || '[]');
        const storedDirects = JSON.parse(localStorage.getItem('directChats') || '[]');
        const currentDirects = useChatStore.getState().directChats;

        let finalDirects = storedDirects.length > 0 ? storedDirects : (currentDirects.length > 0 ? currentDirects : []);

        const uniqueDirects = Array.from(new Map(finalDirects.map((c: any) => [c.id, c])).values());
        const uniqueGroups = Array.from(new Map(storedGroups.map((c: any) => [c.id, c])).values());

        setDirectChats(uniqueDirects as DirectChat[]);
        setGroupChats(uniqueGroups as GroupChat[]);
        setIsLoadingChats(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching chats: ", error);
      setIsLoadingChats(false);
    }
  };


  const getOtherUser = (chat: DirectChat) => {
    if (!chat || !chat.user1 || !chat.user2) {
      console.warn("Skipping invalid chat:", chat);
      return null;
    }
    return chat.user1.id === currentUser?.id ? chat.user2 : chat.user1;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (selectedChatId && socket) {
      console.log("📡 Requesting messages for selected chat:", selectedChatId);
      socket.emit('get_chat_messages', { chatId: selectedChatId, limit: 50 });
    }
  }, [selectedChatId, socket]);

  const handleChatSelect = (chat: DirectChat | GroupChat | SearchGroup) => {
    setSelectedChatId(chat.id);
    joinChat(chat.id);
    if (socket) {
      socket.emit("mark_chat_read", { chatId: chat.id });
    }
    clearChatUnread(chat.id);
  };

  const handleCreateAndSelectChat = async (user: any) => {
    const newChat = await createChat(user, currentUser);
    if (newChat) {
      const existingChat = directChats.find(c => c.id === newChat.id);
      if (!existingChat) {
        // Persist to local storage
        const storedDirects = JSON.parse(localStorage.getItem('directChats') || '[]');
        if (!storedDirects.find((c: any) => c.id === newChat.id)) {
          localStorage.setItem('directChats', JSON.stringify([newChat, ...storedDirects]));
        }
        addDirectChat(newChat);
      }
      handleChatSelect(newChat);
      setShowAllUsers(false);
    }
  };

  const handleCreateGroup = async (data: {
    name: string;
    description?: string;
    memberIds: string[];
    isPrivate: boolean;
  }) => {
    const newGroup = await createGroup(data, currentUser);
    if (newGroup) {
      // Persist to local storage
      const storedGroups = JSON.parse(localStorage.getItem('groupChats') || '[]');
      localStorage.setItem('groupChats', JSON.stringify([newGroup, ...storedGroups]));

      addGroupChat(newGroup);

      if (socket) {
        socket.emit('group_chat_created', {
          groupChat: newGroup,
          memberIds: data.memberIds
        });
      }

      handleChatSelect(newGroup);
    }
  };

  const renderDirectChat = (chat: DirectChat) => {
    const otherUser = getOtherUser(chat);
    if (!otherUser) return null;

    const chatMessages = messages[chat.id] || [];
    const lastMessage = chatMessages.length > 0
      ? chatMessages[chatMessages.length - 1]
      : chat.messages?.[0];
    const isOnline = onlineUsers.has(otherUser.id);


    return (
      <div
        key={chat.id}
        onClick={() => handleChatSelect(chat)}
        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChatId === chat.id ? "bg-gray-100" : ""
          }`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
              {otherUser.avatar || (otherUser as any).image ? (
                <img
                  src={otherUser.avatar || (otherUser as any).image}
                  alt={otherUser.name || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                otherUser.name?.charAt(0).toUpperCase() || otherUser.email?.charAt(0).toUpperCase()
              )}
            </div>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground truncate">
                {otherUser.name || otherUser.email}
              </h3>
              <div className="flex items-center gap-2">
                {typeof chat.unreadCount === "number" && chat.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs min-w-5 h-5 px-2">
                    {chat.unreadCount}
                  </span>
                )}
                {lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatTime(lastMessage.createdAt)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {lastMessage ? (
                <>
                  {lastMessage.senderId === currentUser?.id && "You: "}
                  {lastMessage.content}
                  {lastMessage.senderId === currentUser?.id &&
                    (() => {
                      const receipts = (lastMessage as any).readReceipts || [];
                      const otherId = currentUser?.id === chat.user1.id ? chat.user2.id : chat.user1.id;
                      const isReadByOther = receipts.some((rr: any) => rr.userId === otherId);
                      return (
                        <span className="ml-2 inline-flex align-middle text-muted-foreground">
                          {isReadByOther ? (
                            <CheckCheckIcon size={14} />
                          ) : (
                            <CheckIcon size={14} />
                          )}
                        </span>
                      );
                    })()}
                </>
              ) : (
                "No messages yet"
              )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderGroupChat = (chat: GroupChat) => {
    const chatMessages = messages[chat.id] || [];
    const lastMessage = chatMessages.length > 0
      ? chatMessages[chatMessages.length - 1]
      : chat.messages?.[0];




    return (
      <div
        key={chat.id}
        onClick={() => handleChatSelect(chat)}
        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChatId === chat.id ? "bg-gray-100" : ""
          }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white">
            {chat.avatar ? (
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Users className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground truncate">
                {chat.name}
              </h3>
              <div className="flex items-center gap-2">
                {typeof chat.unreadCount === "number" && chat.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-purple-600 text-white text-xs min-w-5 h-5 px-2">
                    {chat.unreadCount}
                  </span>
                )}
                {lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatTime(lastMessage.createdAt)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {lastMessage ? (
                <>
                  <span className="font-semibold">{lastMessage.sender?.name || lastMessage.sender?.email}:</span>{" "}
                  {lastMessage.content}
                </>
              ) : (
                <span className="italic">{chat.members.length} members • {chat.ownerId === currentUser?.id ? "Owner" : "Member"}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const allChats = [...directChats, ...groupChats].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const renderAllUsers = () => {
    const usersJson = typeof window !== 'undefined' ? localStorage.getItem('users') || '[]' : '[]';
    let allUsers: User[] = [];
    try {
      allUsers = JSON.parse(usersJson);
      if (!Array.isArray(allUsers)) allUsers = [];
    } catch (e) {
      allUsers = [];
    }

    if (allUsers.length < 5) {
      const fallbacks: User[] = [
        { id: "mock-eyob", name: "Eyob", email: "eyob@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eyob" },
        { id: "mock-1", name: "Abraham Degu", email: "abraham@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abraham" },
        { id: "mock-2", name: "Mercy Demeke", email: "mercy@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie" },
        { id: "mock-3", name: "Yonas Mamo", email: "yonas@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Albert" },
        { id: "mock-4", name: "Addis Neway", email: "addis@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isaac" },
      ];
      allUsers = [...allUsers, ...fallbacks.filter(f => !allUsers.find((u) => u.id === f.id))];
    }

    const filteredUsers = allUsers.filter((u) => u.id !== currentUser?.id);

    return (
      <div className="w-full md:w-96 bg-card border-r border-border flex flex-col h-full text-foreground">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold">All Users</h1>
          <Button variant="ghost" size="sm" onClick={() => setShowAllUsers(false)}>
            Back to Chats
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/10" />
              <p>No other users found</p>
            </div>
          ) : (
            filteredUsers.map((user: User) => (
              <div
                key={user.id}
                onClick={() => {
                  handleCreateAndSelectChat(user);
                }}
                className="p-4 border-b border-border cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name || ''} className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${onlineUsers.has(user.id) ? 'bg-green-500' : 'bg-muted-foreground/30'
                      }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-foreground">{user.name || user.email}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {onlineUsers.has(user.id) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (showAllUsers) {
    return renderAllUsers();
  }

  return (
    <div className="w-full md:w-96 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Messages</h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsCreateGroupOpen(true)}
            title="Create Group"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <SearchModal onCreateChat={handleCreateAndSelectChat} onJoinGroup={handleChatSelect} />
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 px-4">
          <TabsTrigger value="all">
            All
            {(directChats.length + groupChats.length > 0) && (
              <span className="ml-1 text-xs">({directChats.length + groupChats.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="direct">
            <MessageCircle className="h-4 w-4 mr-1" />
            Direct
            {directChats.length > 0 && (
              <span className="ml-1 text-xs">({directChats.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-1" />
            Groups
            {groupChats.length > 0 && (
              <span className="ml-1 text-xs">({groupChats.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="all" className="mt-0">
            {isLoadingChats ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p>Loading chats...</p>
              </div>
            ) : allChats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No conversations yet</p>
              </div>
            ) : (
              allChats.map((chat) =>
                "user1" in chat ? renderDirectChat(chat as DirectChat) : renderGroupChat(chat as GroupChat)
              )
            )}
          </TabsContent>

          <TabsContent value="direct" className="mt-0">
            {isLoadingChats ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p>Loading chats...</p>
              </div>
            ) : directChats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No direct chats yet</p>
              </div>
            ) : (
              directChats.map(renderDirectChat)
            )}
          </TabsContent>

          <TabsContent value="groups" className="mt-0">
            {isLoadingChats ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p>Loading groups...</p>
              </div>
            ) : groupChats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No group chats yet</p>
                <Button
                  onClick={() => setIsCreateGroupOpen(true)}
                  className="mt-4"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            ) : (
              groupChats.map(renderGroupChat)
            )}
          </TabsContent>
        </div>
      </Tabs>

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}
