import { create } from "zustand";
import { User, Message, DirectChat, GroupChat, ReadReceipt, MessageReaction, GroupMember } from "@/lib/types";

interface ChatStore {
  socket: any | null;
  setSocket: (socket: any | null) => void;

  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  directChats: DirectChat[];
  setDirectChats: (chats: DirectChat[]) => void;
  addDirectChat: (chat: DirectChat) => void;
  updateDirectChat: (chatId: string, updates: Partial<DirectChat>) => void;

  groupChats: GroupChat[];
  setGroupChats: (chats: GroupChat[]) => void;
  addGroupChat: (chat: GroupChat) => void;
  updateGroupChat: (chatId: string, updates: Partial<GroupChat>) => void;
  leaveGroup: (chatId: string) => void;

  selectedChatId: string | null;
  setSelectedChatId: (chatId: string | null) => void;

  isSelectedChatGroup: () => boolean;

  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;

  messages: { [chatId: string]: Message[] };
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (
    chatId: string,
    messageId: string,
    updates: Partial<Message>
  ) => void;
  deleteMessage: (messageId: string) => Promise<{ ok: boolean; error?: string }>;
  setMessages: (chatId: string, messages: Message[]) => void;
  editMessage: (messageId: string, newContent: string) => Promise<{ ok: boolean; error?: string }>;

  unreadCounts: Record<string, number>;
  totalUnreadCount: number;
  setUnreadCounts: (counts: Record<string, number>) => void;
  setUnreadCount: (chatId: string, count: number) => void;
  setTotalUnreadCount: (count: number) => void;
  clearChatUnread: (chatId: string) => void;

  onlineUsers: Set<string>;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;

  typingUsers: { [chatId: string]: Set<string> };
  setUserTyping: (chatId: string, userId: string) => void;
  setUserStoppedTyping: (chatId: string, userId: string) => void;

  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  uploadingFiles: { [chatId: string]: boolean };
  setUploading: (chatId: string, isUploading: boolean) => void;

  sendMessage: (
    chatId: string,
    content: string,
    type?: string,
    options?: {
      replyToId?: string;
      fileData?: {
        fileUrl: string;
        fileName: string;
        fileSize: number;
        fileMimeType: string;
        publicId?: string;
      };
      voiceData?: {
        audioUrl: string;
        audioDuration: number;
      };
    }
  ) => Promise<void>;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  uploadFile: (chatId: string, file: File) => Promise<void>;

  showAllUsers: boolean;
  setShowAllUsers: (show: boolean) => void;

  isProfilePanelOpen: boolean;
  setIsProfilePanelOpen: (open: boolean) => void;

  stories: any[];
  addStory: (story: any) => void;
  updateCurrentUserState: (updates: Partial<User>) => void;

  chatFilter: 'all' | 'direct' | 'groups';
  setChatFilter: (filter: 'all' | 'direct' | 'groups') => void;

  setChatWallpaper: (chatId: string, wallpaper: string) => void;
  syncData: () => void;
}

const deduplicate = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),

  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  directChats: [],
  setDirectChats: (chats) => set({ directChats: deduplicate(chats) }),
  addDirectChat: (chat) =>
    set((state) => ({
      directChats: deduplicate([chat, ...state.directChats]),
    })),
  updateDirectChat: (chatId, updates) =>
    set((state) => {
      const chatIndex = state.directChats.findIndex((dc) => dc.id === chatId);
      if (chatIndex === -1) {
        return state;
      }

      const newDirectChats = [...state.directChats];
      newDirectChats[chatIndex] = {
        ...newDirectChats[chatIndex],
        ...updates,
      };

      return { directChats: deduplicate(newDirectChats) };
    }),

  groupChats: [],
  setGroupChats: (chats) => set({ groupChats: deduplicate(chats) }),
  addGroupChat: (chat) =>
    set((state) => ({
      groupChats: deduplicate([chat, ...state.groupChats]),
    })),
  updateGroupChat: (chatId, updates) =>
    set((state) => {
      const existing = state.groupChats.findIndex((gc) => gc.id === chatId);

      if (existing === -1) {
        return state;
      }

      const newGroupChats = [...state.groupChats];
      newGroupChats[existing] = {
        ...newGroupChats[existing], ...updates,
      };
      return { groupChats: deduplicate(newGroupChats) };
    }),

  leaveGroup: (chatId) =>
    set((state) => {
      const newGroups = state.groupChats.filter(gc => gc.id !== chatId);
      localStorage.setItem('groupChats', JSON.stringify(newGroups));
      return {
        groupChats: newGroups,
        selectedChatId: state.selectedChatId === chatId ? null : state.selectedChatId
      };
    }),

  selectedChatId: null,
  setSelectedChatId: (chatId) => set({ selectedChatId: chatId }),

  isSelectedChatGroup: () => {
    const { selectedChatId, groupChats } = get();
    if (!selectedChatId) return false;
    return groupChats.some(gc => gc.id === selectedChatId);
  },

  replyingTo: null,
  setReplyingTo: (message) => set({ replyingTo: message }),

  messages: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('chat_messages') || '{}') : {},
  addMessage: (chatId, message) =>
    set((state) => {
      const newMessages = {
        ...state.messages,
        [chatId]: deduplicate([...(state.messages[chatId] || []), message]),
      };
      localStorage.setItem('chat_messages', JSON.stringify(newMessages));
      return { messages: newMessages };
    }),
  updateMessage: (chatId, messageId, updates) =>
    set((state) => {
      const newMessages = {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      };
      localStorage.setItem('chat_messages', JSON.stringify(newMessages));
      return { messages: newMessages };
    }),

  editMessage: async (messageId: string, newContent: string) => {
    const { updateMessage, messages } = get();
    for (const chatId in messages) {
      const msg = messages[chatId].find(m => m.id === messageId);
      if (msg) {
        updateMessage(chatId, messageId, { content: newContent, isEdited: true });
        return { ok: true };
      }
    }
    return { ok: true };
  },

  deleteMessage: async (messageId: string) => {
    const { messages, setMessages } = get();
    for (const chatId in messages) {
      if (messages[chatId].some(m => m.id === messageId)) {
        const newMessages = messages[chatId].filter(m => m.id !== messageId);
        setMessages(chatId, newMessages);
        return { ok: true };
      }
    }
    return { ok: true };
  },

  setMessages: (chatId, messages) =>
    set((state) => {
      const newMsgs = { ...state.messages, [chatId]: deduplicate(messages) };
      localStorage.setItem('chat_messages', JSON.stringify(newMsgs));
      return { messages: newMsgs };
    }),

  unreadCounts: {},
  totalUnreadCount: 0,
  setUnreadCounts: (counts) => set({ unreadCounts: counts }),
  setUnreadCount: (chatId, count) =>
    set((state) => {
      return {
        unreadCounts: { ...state.unreadCounts, [chatId]: count },
      };
    }),
  setTotalUnreadCount: (count) => set({ totalUnreadCount: count }),
  clearChatUnread: (chatId) =>
    set((state) => {
      return {
        unreadCounts: { ...state.unreadCounts, [chatId]: 0 },
      };
    }),

  onlineUsers: new Set(),
  setUserOnline: (userId) =>
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
    })),
  setUserOffline: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    }),

  typingUsers: {},
  setUserTyping: (chatId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: new Set([
          ...(state.typingUsers[chatId] || new Set()),
          userId,
        ]),
      },
    })),
  setUserStoppedTyping: (chatId, userId) =>
    set((state) => {
      const chatTyping = new Set(state.typingUsers[chatId] || new Set());
      chatTyping.delete(userId);
      return {
        typingUsers: { ...state.typingUsers, [chatId]: chatTyping },
      };
    }),

  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  uploadingFiles: {},
  setUploading: (chatId, isUploading) =>
    set((state) => ({
      uploadingFiles: { ...state.uploadingFiles, [chatId]: isUploading },
    })),

  sendMessage: async (chatId, content, type = "TEXT", options = {}) => {
    const { currentUser, addMessage } = get();
    if (!currentUser) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      type,
      senderId: currentUser.id,
      sender: currentUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readReceipts: [],
      ...(options.fileData || {}),
      ...(options.voiceData || {})
    };

    addMessage(chatId, newMessage);

    if (options.replyToId) {
      set({ replyingTo: null });
    }
  },

  joinChat: (chatId) => { console.log("Mock join:", chatId); },
  leaveChat: (chatId) => { console.log("Mock leave:", chatId); },
  startTyping: (chatId) => { console.log("Mock typing:", chatId); },
  stopTyping: (chatId) => { console.log("Mock stop typing:", chatId); },
  addReaction: (messageId, emoji) => { console.log("Mock reaction:", messageId, emoji); },
  removeReaction: (messageId, emoji) => { console.log("Mock remove reaction:", messageId, emoji); },

  uploadFile: async (chatId, file) => {
    const { setUploading, sendMessage } = get();
    try {
      setUploading(chatId, true);
      await new Promise(resolve => setTimeout(resolve, 800));
      const fileData = {
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
      };
      let messageType = "FILE";
      if (file.type.startsWith("image/")) messageType = "IMAGE";
      await sendMessage(chatId, file.name, messageType, { fileData });
    } finally {
      setUploading(chatId, false);
    }
  },

  showAllUsers: false,
  setShowAllUsers: (show) => set({ showAllUsers: show }),

  isProfilePanelOpen: false,
  setIsProfilePanelOpen: (open) => set({ isProfilePanelOpen: open }),

  stories: [],
  addStory: (story) => set((state) => ({ stories: [story, ...state.stories] })),

  updateCurrentUserState: (updates) => set((state) => ({
    currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
  })),

  chatFilter: 'all',
  setChatFilter: (filter) => set({ chatFilter: filter, showAllUsers: false }),

  syncData: () => {
    if (typeof window === 'undefined') return;
    try {
      const storedMsgs = localStorage.getItem('chat_messages');
      const storedDirects = localStorage.getItem('directChats');
      const storedGroups = localStorage.getItem('groupChats');

      const updates: any = {};

      if (storedMsgs) {
        const parsedMsgs = JSON.parse(storedMsgs);
        const { messages: currentMessages, selectedChatId, currentUser } = get();

        // Notification logic
        Object.keys(parsedMsgs).forEach(chatId => {
          const oldMsgs = currentMessages[chatId] || [];
          const newMsgs = parsedMsgs[chatId] || [];
          if (newMsgs.length > oldMsgs.length) {
            const latestMsg = newMsgs[newMsgs.length - 1];
            if (latestMsg.senderId !== currentUser?.id && chatId !== selectedChatId) {
              const { unreadCounts } = get();
              updates.unreadCounts = { ...unreadCounts, [chatId]: (unreadCounts[chatId] || 0) + 1 };
            }
          }
        });
        updates.messages = parsedMsgs;
      }

      if (storedDirects) {
        updates.directChats = deduplicate(JSON.parse(storedDirects));
      }

      if (storedGroups) {
        updates.groupChats = deduplicate(JSON.parse(storedGroups));
      }

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    } catch (e) {
      console.error("Sync error", e);
    }
  },

  setChatWallpaper: (chatId: string, wallpaper: string) =>
    set((state) => {
      const isGroup = state.groupChats.some((gc) => gc.id === chatId);
      if (isGroup) {
        const newGroups = state.groupChats.map((gc) =>
          gc.id === chatId ? { ...gc, wallpaper } : gc
        );
        localStorage.setItem("groupChats", JSON.stringify(newGroups));
        return { groupChats: newGroups };
      } else {
        const newDirects = state.directChats.map((dc) =>
          dc.id === chatId ? { ...dc, wallpaper } : dc
        );
        localStorage.setItem("directChats", JSON.stringify(newDirects));
        return { directChats: newDirects };
      }
    }),
}));