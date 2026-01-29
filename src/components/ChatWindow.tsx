"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "@/components/providers";
import { useSocket } from "@/app/hooks/useSocket";
import { DirectChat, Message, User, GroupChat } from "@/lib/types";
import { useChatStore } from "@/store/chatStore";
import { FileAxis3D, FileSliders, Forward, Info, Loader2, LucideReply, LucideUpload, MessageSquare, MoreVertical, Phone, Pickaxe, Reply, ReplyIcon, Send, Settings, Smile, Upload, UploadCloud, UploadIcon, UserPlus, Users, Video, X, Mic, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmojiPicker from "emoji-picker-react";
import { EmojiClickData } from "emoji-picker-react";
import MessageItem from "./Message";
import FileDropZone from "./FileDropZone";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { VoiceRecorder } from "./VoiceRecorder";
import { WallpaperSettings } from "./WallpaperSettings";

export default function ChatWindow({ onBack }: { onBack: () => void }) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const {
    selectedChatId,
    messages,
    sendMessage,
    currentUser,
    directChats,
    groupChats,
    setMessages,
    addMessage,
    typingUsers,
    onlineUsers,
    socket,
    replyingTo,
    setReplyingTo,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
    editMessage,
    uploadingFiles,
    uploadFile,
    updateMessage,
    addReaction,
    removeReaction,
    isConnected
  } = useChatStore();
  const currentMessages = selectedChatId ? messages[selectedChatId] || [] : [];
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isUploading = uploadingFiles[selectedChatId!];
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const isGroupChat = groupChats.some((gc) => gc.id === selectedChatId);
  const selectedChat = isGroupChat
    ? groupChats.find((gc) => gc.id === selectedChatId)
    : directChats.find((dc) => dc.id === selectedChatId);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChatId]);

  const hasMarkedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!socket || !selectedChatId) return;
    if (hasMarkedRef.current === selectedChatId) return;
    hasMarkedRef.current = selectedChatId;
    socket.emit("mark_chat_read", { chatId: selectedChatId });
  }, [socket, selectedChatId]);

  const handleSendVoice = async (blob: Blob, duration: number) => {
    if (!selectedChatId) return;
    const audioUrl = URL.createObjectURL(blob);
    await sendMessage(selectedChatId, "Voice message", "VOICE", {
      voiceData: { audioUrl, audioDuration: duration }
    });
    setIsRecording(false);
  };

  useEffect(() => {
    if (!selectedChatId) return;
    joinChat(selectedChatId);
    return () => {
      leaveChat(selectedChatId);
    };
  }, [selectedChatId]);


  const handleEdit = async (messageId: string, newContent: string) => {
    const result = await editMessage(messageId, newContent);
    if (!result.ok) {
      console.error('Edit failed:', result.error);
    }
  };
  const handleSendMessage = async () => {

    if (editingMessage) {
      if (!editingText.trim()) return;

      try {
        await editMessage(editingMessage.id, editingText);
        setEditingMessage(null);
        setEditingText("");
      } catch (error) {
        console.error("Failed to edit message: ", error);
      }
    } else {
      if (!newMessage.trim()) return;

      setSending(true);
      try {
        await sendMessage(selectedChatId!, newMessage.trim(), "TEXT", {
          replyToId: replyingTo?.id,
        });
        setNewMessage("");
        setReplyingTo(null);
      } catch (error) {
        console.error(error);
      } finally {
        setSending(false);
      }
    }
  };

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleFileUpload = async (files: any) => {
    for (const file of files) {
      try {
        await uploadFile(selectedChatId!, file);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
    setShowFileUpload(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedChatId || !currentUser) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      stopTyping(selectedChatId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      return;
    }

    startTyping(selectedChatId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedChatId) {
        stopTyping(selectedChatId);
      }
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherUser = (chat: DirectChat) => {
    return chat.user1.id === currentUser?.id ? chat.user2 : chat.user1;
  }

  const getOnlineMembersCount = (chat: GroupChat) => {
    return chat.members.filter((m: any) => onlineUsers.has(m.user.id)).length;
  }

  const getTypingUserNames = () => {
    if (!selectedChat || !typingUsers[selectedChatId!]) return null;
    const typing = Array.from(typingUsers[selectedChatId!] || []);

    if (isGroupChat) {
      const groupChat = selectedChat as GroupChat;
      const typingMembers = groupChat.members
        .filter((m: any) => typing.includes(m.user.id) && m.user.id !== currentUser?.id)
        .map((m: any) => m.user.name || m.user.email);

      if (typingMembers.length === 0) return null;
      if (typingMembers.length === 1) return `${typingMembers[0]} is typing...`;
      if (typingMembers.length === 2)
        return `${typingMembers[0]} and ${typingMembers[1]} are typing...`;
      return `${typingMembers.length} people are typing...`;
    } else {
      const directChat = selectedChat as DirectChat;
      const otherUser =
        directChat.user1.id === currentUser?.id
          ? directChat.user2 : directChat.user1;
      return typing.includes(otherUser.id) ? "typing..." : null;
    }
  };

  const renderChatHeader = () => {
    if (!selectedChat) return null;

    if (isGroupChat) {
      const groupChat = selectedChat as GroupChat;
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white">
              {groupChat.avatar ? (
                <img
                  src={groupChat.avatar}
                  alt={groupChat.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (<Users className="w-6 h-6" />)}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{groupChat.name}</h2>
              <p className="text-sm text-muted-foreground">
                {groupChat.members.length} members
                {getTypingUserNames() && (
                  <span className="ml-2 text-blue-500">
                    {getTypingUserNames()}
                  </span>
                )}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuItem
                className="py-3 px-3 cursor-pointer focus:bg-accent flex items-center gap-3 hover:bg-accent rounded-sm"
                onClick={() => setIsWallpaperModalOpen(true)}
              >
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Chat Wallpaper</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 px-3 cursor-pointer focus:bg-accent flex items-center gap-3 hover:bg-accent rounded-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">View Members</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 px-3 cursor-pointer focus:bg-accent flex items-center gap-3 hover:bg-accent rounded-sm">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Add Members</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 px-3 cursor-pointer focus:bg-accent flex items-center gap-3 hover:bg-accent rounded-sm">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Group Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    } else {
      const directChat = selectedChat as DirectChat;
      const otherUser = getOtherUser(directChat);

      return (
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
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
            {onlineUsers.has(otherUser.id) && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {otherUser.name || otherUser.email}
            </h2>
            <p className="text-sm text-muted-foreground">
              {onlineUsers.has(otherUser.id) ? (
                <span>
                  {typingUsers[selectedChat.id]?.has(otherUser.id) ? "...typing" : "Online"}
                </span>
              ) : (
                "Offline"
              )}
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Video className="h-5 w-5" />
            </Button>
            <Button
              variant={useChatStore.getState().isProfilePanelOpen ? "secondary" : "ghost"}
              size="icon"
              className="rounded-full"
              onClick={() => useChatStore.getState().setIsProfilePanelOpen(!useChatStore.getState().isProfilePanelOpen)}
            >
              <Info className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuItem
                  className="py-2 px-3 cursor-pointer focus:bg-accent flex items-center gap-3 hover:bg-accent rounded-sm"
                  onClick={() => setIsWallpaperModalOpen(true)}
                >
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Chat Wallpaper</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="relative h-full w-full bg-background">
      {selectedChat ? (
        <>

          <div className="absolute top-0 left-0 right-0 z-10 p-4 border-b border-border bg-card">
            {renderChatHeader()}
          </div>

          {!isConnected && (
            <div className="mt-2 text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded">
              Connecting
            </div>
          )}
          <div className="absolute top-20 bottom-20 left-0 right-0">
            <ScrollArea className="h-full w-full">
              <div
                className="p-4 bg-background min-h-full transition-all duration-300"
                style={selectedChat?.wallpaper ? (
                  selectedChat.wallpaper.startsWith('#') || selectedChat.wallpaper === 'transparent'
                    ? { backgroundColor: selectedChat.wallpaper }
                    : { backgroundImage: `url(${selectedChat.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'local' }
                ) : {}}
              >
                {currentMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  currentMessages.map((message) => {
                    const isOwn = message.senderId === currentUser?.id;
                    let isReadByOther = false;

                    if (isOwn) {
                      if (!isGroupChat) {
                        const directChat = selectedChat as DirectChat;
                        const otherUserId = getOtherUser(directChat).id;
                        const receipts = message.readReceipts || [];
                        isReadByOther = receipts.some((rr) => rr.userId == otherUserId);
                      } else {
                        const groupChat = selectedChat as GroupChat;
                        const receipts = message.readReceipts || [];

                        const otherMemberIds = groupChat.members
                          .filter((m: any) => m.user.id !== currentUser?.id)
                          .map((m: any) => m.user.id);

                        const readByOtherMembers = otherMemberIds.filter((memberId: string) =>
                          receipts.some((rr: any) => rr.userId === memberId)
                        );

                        isReadByOther = readByOtherMembers.length > 0;
                      }
                    }

                    return (
                      <MessageItem
                        key={message.id}
                        message={message}
                        currentUser={currentUser!}
                        onReply={(message: any) => setReplyingTo(message)}
                        onReact={(messageId: any, emoji: any) =>
                          addReaction(messageId, emoji)
                        }
                        onRemoveReact={(messageId: any, emoji: any) =>
                          removeReaction(messageId, emoji)
                        }
                        onEdit={(message: any) => { setEditingMessage(message); setEditingText(message.content || "") }}
                        isReadByOther={isReadByOther}
                      />
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-card border-t border-border">
            {replyingTo && (
              <div className="border-blue-500 mx-1 pb-1">
                <div className="flex justify-between items-start">
                  <div className="flex">
                    <LucideReply className="w-6 h-6" />
                    <div className="pl-3">
                      <p className="text-xs font-medium text-blue-700">
                        Reply to {replyingTo.sender.name}
                      </p>
                      <p className="text-xs truncate max-w-md">
                        {replyingTo.content}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                  >
                    <X className="h-5 w-5 text-muted-foreground hover:text-foreground" onClick={() => setReplyingTo(null)} />
                  </button>
                </div>
              </div>
            )}
            {isRecording ? (
              <VoiceRecorder
                onRecordingComplete={handleSendVoice}
                onCancel={() => setIsRecording(false)}
              />
            ) : (
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={editingMessage ? editingText : newMessage}
                  onChange={(e) => editingMessage ? setEditingText(e.target.value) : setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-input bg-background text-foreground rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                />
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant={"ghost"}
                    size="icon"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                    className="text-muted-foreground"
                    disabled={isUploading}
                  >
                    <LucideUpload className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant={"ghost"}
                    size="icon"
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    className="text-muted-foreground"
                  >
                    <Smile className="h-5 w-5" />
                    <span className="sr-only">Open Emoji Picker</span>
                  </Button>
                  <Button
                    type="button"
                    variant={"ghost"}
                    size="icon"
                    onClick={() => setIsRecording(true)}
                    className="text-muted-foreground"
                    disabled={sending || isUploading}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={(!editingMessage && !newMessage.trim() && !replyingTo) || (editingMessage && !editingText.trim()) || sending}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </Button>

              </div>
            )}
            {isEmojiPickerOpen && (
              <div className="absolute bottom-16 right-4">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            {showFileUpload && (
              <div className="p-4 border-t border-border bg-muted">
                <FileDropZone onFilesSelected={handleFileUpload} />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <MessageSquare size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No chat selected
            </h2>
            <p className="text-muted-foreground">
              Choose a conversation to start messaging
            </p>
          </div>
        </div>
      )}
      {isWallpaperModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Chat Wallpaper</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsWallpaperModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {selectedChat && <WallpaperSettings chatId={selectedChat.id} />}
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <Button onClick={() => setIsWallpaperModalOpen(false)} className="bg-blue-500 hover:bg-blue-600 text-white">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
