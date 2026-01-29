
export interface User {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
    isOnline?: boolean;
}

export interface ReadReceipt {
    userId: string;
    readAt: string;
    messageId: string;
    chatId: string;
}

export interface MessageReaction {
    id: string;
    messageId: string;
    userId: string;
    emoji: string;
    createdAt: string;
    user: User;
}

export interface Message {
    id: string;
    content: string;
    type: string;
    senderId: string;
    isEdited?: boolean;
    isDeleted?: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    sender: User;
    directChatId?: string;
    groupChatId?: string;
    replyTo?: {
        id: string;
        content: string;
        sender: User;
    };
    readReceipts?: ReadReceipt[];
    reactions?: MessageReaction[];
    fileUrl?: string;
    fileName?: string;
    filename?: string;
    fileSize?: number;
    fileType?: string;
    fileMimeType?: string;
    audioUrl?: string;
    audioDuration?: number;
}

export interface DirectChat {
    id: string;
    user1: User;
    user2: User;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
    unreadCount: number;
    wallpaper?: string;
}

export interface GroupMember {
    user: User;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
}

export interface GroupChat {
    id: string;
    name: string;
    description?: string;
    avatar?: string;
    isPrivate?: boolean;
    messages: Message[];
    members: GroupMember[];
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    unreadCount: number;
    wallpaper?: string;
}

export interface SearchGroup {
    id: string;
    name: string;
    description: string | null;
    avatar: string | null;
    isPrivate: boolean;
    memberCount: number;
    messageCount: number;
    isMember: boolean;
    memberRole?: string;
}

export interface SocketEvents {
    connect: () => void;
    disconnect: () => void;
    user_online: (userId: string) => void;
    user_offline: (userId: string) => void;
    message_received: (message: Message) => void;
    typing_start: (data: { chatId: string; userId: string }) => void;
    typing_stop: (data: { chatId: string; userId: string }) => void;
}

export interface CreateChatRequest {
    participantId: string;
}