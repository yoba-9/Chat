'use client'

import { useState, useRef, useEffect } from "react";
import { useSocket } from "@/app/hooks/useSocket";
import { GroupChat, Message } from "@/lib/types";
import { useChatStore } from "@/store/chatStore";
import {
  Loader2,
  LucideReply,
  LucideUpload,
  MessageSquare,
  Send,
  Smile,
  X,
  Users,
  Settings,
  UserPlus,
  MoreVertical,
  Shield,
  LogOut,
  ChevronLeft,
  Mic,
  Image as ImageIcon
} from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";
import { WallpaperSettings } from "./WallpaperSettings";
import { Button } from "./ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmojiPicker from "emoji-picker-react";
import { EmojiClickData } from "emoji-picker-react";
import MessageItem from "./Message";
import FileDropZone from "./FileDropZone";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";


export default function GroupChatWindow() {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);

  const {
    selectedChatId,
    messages,
    currentUser,
    groupChats,
    setMessages,
    sendMessage,
    addMessage,
    typingUsers,
    onlineUsers,
    socket,
    isConnected,
    replyingTo,
    setReplyingTo,
    joinChat,
    startTyping,
    stopTyping,
    editMessage,
    uploadingFiles,
    leaveChat,
    uploadFile,
    addReaction,
    removeReaction,
  } = useChatStore();

  const currentMessages = selectedChatId ? messages[selectedChatId] || [] : [];
  const selectedChat = groupChats.find((chat) => chat.id === selectedChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUploading = uploadingFiles[selectedChatId!];

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChatId]);

  const hasMarkedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!socket || !selectedChatId) return;
    if (hasMarkedRef.current === selectedChatId) return;
    hasMarkedRef.current === selectedChatId;
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

  const handleSendMessage = async () => {
    if (editingMessage) {
      if (!editingText.trim()) return;
      try {
        await editMessage(editingMessage.id, editingText);
        setEditingMessage(null);
        setEditingText("");
      } catch (error) {
        console.error("Failed to edit message", error);
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
        console.error("upload failed:", error);
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

  const getOnlineMembersCount = () => {
    if (!selectedChat) return 0;
    return selectedChat.members.filter((m: any) =>
      onlineUsers.has(m.user.id)
    ).length;
  };

  const getTypingUserNames = () => {
    if (!selectedChat || !typingUsers[selectedChat.id]) return null;
    const typing = Array.from(typingUsers[selectedChat.id] || []);
    const typingMembers = selectedChat.members
      .filter((m: any) => typing.includes(m.user.id) && m.user.id !== currentUser?.id)
      .map((m: any) => m.user.name || m.user.email);

    if (typingMembers.length === 0) return null;
    if (typingMembers.length === 1) return `${typingMembers[0]} is typing...`;
    if (typingMembers.length === 2) return `${typingMembers[0]} and ${typingMembers[1]} are typing...`;
    return `${typingMembers.length} people are typing...`;
  };

  return (
    <div className="relative h-full w-full bg-background">
      {selectedChat ? (
        <>
          {/* Members Sidebar/Modal Overlay */}
          {showMembers && selectedChat && (
            <div className="absolute inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-border flex items-center space-x-4 bg-card sticky top-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedChat.avatar ? (
                      <img
                        src={selectedChat.avatar}
                        alt={selectedChat.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {selectedChat.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {getOnlineMembersCount()} of {selectedChat.members.length} online
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowMembers(false)} className="ml-auto">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Members</h3>
                <div className="space-y-3">
                  {selectedChat.members.map((member) => (
                    <div key={member.user.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-medium">
                        {member.user.avatar ? (
                          <img
                            src={member.user.avatar}
                            alt={member.user.name || ''}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          member.user.name?.charAt(0).toUpperCase() || member.user.email?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {member.user.name || member.user.email}
                          {member.user.id === currentUser?.id && " (You)"}
                          {member.user.id === selectedChat.ownerId && " (Admin)"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {onlineUsers.has(member.user.id) ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Chat Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedChat.avatar ? (
                    <img
                      src={selectedChat.avatar}
                      alt={selectedChat.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {selectedChat.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {getOnlineMembersCount()} of {selectedChat.members.length} online
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
                    className="py-3 px-3 cursor-pointer focus:bg-accent flex items-center gap-3"
                    onClick={() => setIsWallpaperModalOpen(true)}
                  >
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Chat Wallpaper</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="py-3 px-3 cursor-pointer focus:bg-accent flex items-center gap-3" onClick={() => setShowMembers(true)}>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>View Members</span>
                  </DropdownMenuItem>

                  {selectedChat.ownerId === currentUser?.id && (
                    <>
                      <DropdownMenuItem className="py-3 px-3 cursor-pointer focus:bg-accent flex items-center gap-3">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                        <span>Add Members</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="py-3 px-3 cursor-pointer focus:bg-accent flex items-center gap-3">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span>Group Settings</span>
                      </DropdownMenuItem>
                    </>
                  )}

                  {selectedChat.ownerId !== currentUser?.id && (
                    <DropdownMenuItem
                      className="py-3 px-3 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-3"
                      onClick={() => {
                        if (confirm("Are you sure you want to leave this group?")) {
                          useChatStore.getState().leaveGroup(selectedChat.id);
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Leave Group</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {!isConnected && (
            <div className="mt-2 text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded">
              Connecting...
            </div>
          )}

          {/* Messages */}
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
                        onEdit={(message: any) => {
                          setEditingMessage(message);
                          setEditingText(message.content || "");
                        }}
                        isReadByOther={false} // Group chats don't show individual read receipts
                      />
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Message Input */}
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
                  <button onClick={() => setReplyingTo(null)}>
                    <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
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
                  onChange={(e) =>
                    editingMessage
                      ? setEditingText(e.target.value)
                      : setNewMessage(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-input bg-background text-foreground rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50"
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
                  disabled={(!newMessage.trim() && !replyingTo) || sending}
                  className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <Button onClick={() => setIsWallpaperModalOpen(false)} className="bg-purple-600 hover:bg-purple-700 text-white">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}