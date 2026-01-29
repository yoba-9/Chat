"use client";

import { useSocket } from "@/app/hooks/useSocket";
import { Message, User } from "@/lib/types";
import { useChatStore } from "@/store/chatStore";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Play, Pause, Download, Trash2, Heart, Edit2, Reply, Smile, MoreHorizontal, Check, CheckCheck, AudioLines } from "lucide-react";
import { useEffect, useState } from "react";
import { AudioPlayer } from "./AudioPlayer";

interface MessageItemProps {
  message: Message;
  currentUser: User;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onRemoveReact: (messageId: string, emoji: string) => void;
  isReadByOther: boolean;
  onEdit: (message: Message) => void;
}

interface Reaction {
  userId: string;
  emoji: string;
}

const MessageItem = ({
  message,
  currentUser,
  onReply,
  onReact,
  onRemoveReact,
  isReadByOther,
  onEdit,
}: MessageItemProps) => {
  const socket = useChatStore((state) => state.socket);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const selectedChatId = useChatStore((state) => state.selectedChatId);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isOwnMessage = message.senderId === currentUser?.id;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReactionClick = (emoji: string) => {
    const existingReaction = message.reactions?.find(
      (r) => r.userId === currentUser?.id && r.emoji === emoji
    );

    if (existingReaction) {
      onRemoveReact(message.id, emoji);
    } else {
      onReact(message.id, emoji);
    }
  };

  const handleDelete = async (messageId: string) => {
    const result = await deleteMessage(messageId);
    if (!result.ok) {
      console.error("Delete failed:", result.error);
    }
  };

  const renderFileContent = () => {
    if (!message.fileUrl) return null;

    const isImage = message.type === "IMAGE";
    const isVideo = message.type === "VIDEO";
    const isAudio = message.type === "AUDIO";

    if (isImage) {
      return (
        <div className="mt-2">
          <img
            src={message.fileUrl}
            alt={message.filename}
            className="max-w-xs rounded-lg cursor-pointer object-cover"
            onClick={() => window.open(message.fileUrl, "_blank")}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="mt-2">
          <video
            src={message.fileUrl}
            controls
            className="max-w-xs max-h-64 rounded-lg"
          />
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="mt-2">
          <audio src={message.fileUrl} controls className="w-full max-w-xs" />
        </div>
      );
    }

    return (
      <div className="mt-2 p-2 bg-muted rounded-lg max-w-xs">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📎</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate text-foreground">{message.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {message.fileSize
                ? (message.fileSize / 1024 / 1024).toFixed(1) + "MB"
                : "Unknown size"}
            </p>
          </div>
        </div>
        <a
          href={message.fileUrl}
          download={message.fileName}
          className="inline-block mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
        >
          Download
        </a>
      </div>
    );
  };

  const renderReactions = () => {
    if (!message.reactions?.length) return null;

    const reactionGroups = message.reactions.reduce((groups: Record<string, Reaction[]>, reaction: Reaction) => {
      if (!groups[reaction.emoji]) {
        groups[reaction.emoji] = [];
      }

      groups[reaction.emoji].push(reaction);
      return groups;
    }, {} as Record<string, Reaction[]>);

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(reactionGroups).map(([emoji, reactions]: [string, Reaction[]]) => {
          const hasUserReaction = reactions.some(
            (r) => r.userId === currentUser?.id
          );
          return (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className={`flex gap-1 px-2 py-1 rounded-full text-sm transition-colors ${hasUserReaction
                ? "bg-blue-100 border-2 border-blue-300 text-blue-700"
                : "bg-secondary border border-border hover:bg-muted"
                }`}
            >
              <span>{emoji}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`flex gap-3 group ${isOwnMessage ? "flex-row-reverse" : ""}`}
    >
      {!message.directChatId && (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${isOwnMessage ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-pink-400 to-orange-500'}`}>
          {message.sender.name?.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`flex-1 max-w-md p-2 ${isOwnMessage ? "text-right" : ""}`}>
        <div className="relative">
          <div
            className={`inline-block px-3 py-1 rounded-lg ${isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-secondary text-secondary-foreground"
              } ${message.isDeleted ? "italic opacity-75" : ""}`}
          >
            {message.isDeleted ? (
              <span className="text-sm">This message was deleted</span>
            ) : (
              <>
                {message.content && message.type !== "SYSTEM" && (
                  <div
                    onClick={() => setShowMenu((prev) => !prev)}
                    className="flex-1"
                  >
                    {message.replyTo && (
                      <div className={`flex flex-col border-l-4 p-1 items-start rounded-md ${isOwnMessage ? 'bg-blue-400/30 border-blue-400 text-blue-100' : 'bg-secondary border-muted-foreground/30 text-muted-foreground'}`}>
                        <p className="text-xs font-semibold">{message.replyTo.sender.name}</p>
                        <p className="text-xs truncate">{message.replyTo.content}</p>
                      </div>
                    )}

                    <div className="flex flex-col">
                      {message.type === "VOICE" && message.audioUrl ? (
                        <AudioPlayer url={message.audioUrl} duration={message.audioDuration} isOwnMessage={isOwnMessage} />
                      ) : (
                        <div className="flex flex-start pr-3">
                          <p className="text-md text-start justify-start whitespace-pre-wrap">{message.content}</p>
                        </div>
                      )}
                      <div className="pl-3 flex justify-end items-end pt-0 pl-1 justify-right text-[10px] gap-1">
                        <span className="">
                          {message.isEdited && (
                            <span className="px-1">edited</span>
                          )}
                          {formatTime(message.createdAt)}
                        </span>
                        <span className="">
                          {isOwnMessage &&
                            (isReadByOther ? (
                              <>
                                <span><CheckCheck className="w-5 h-4" /></span>
                              </>
                            ) : (
                              <>
                                <span><Check className="w-5 h-4" /></span>
                              </>
                            ))}
                        </span>
                      </div>
                    </div>
                    {renderReactions()}
                  </div>
                )}

                {renderFileContent()}
              </>
            )}
          </div>
          {message.type === "SYSTEM" && (
            <div className="backdrop-blur-sm translucent bg-purple-800 text-white border shadow-2xl rounded-2xl p-1 max-w-sm text-center">
              <p className="text-center text-sm">{message.content}</p>
            </div>
          )}
          {!message.isDeleted && (
            <div className="group relative">
              {showMenu && (
                <div className="">
                  <div className={`absolute -top-2 flex flex-col w-40 bg-popover shadow-md border border-border rounded z-50 ${isOwnMessage ? "left-0" : "right-0"}`}>
                    <button
                      onClick={() => { setShowReactionPicker(!showReactionPicker); setShowMenu(false) }}
                      className="px-2 py-1 text-xs hover:bg-muted text-popover-foreground"
                    >
                      😊 React
                    </button>
                    <button
                      onClick={() => { onReply(message); setShowMenu(false) }}
                      className="px-2 py-1 text-xs hover:bg-muted text-popover-foreground"
                    >
                      Reply
                    </button>
                    {isOwnMessage && (
                      <>
                        <button
                          onClick={() => { onEdit(message); setShowMenu(false) }}
                          className="px-2 py-1 text-xs hover:bg-muted text-popover-foreground"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { handleDelete(message.id); setShowMenu(false); }}
                          className="px-2 py-1 text-xs hover:bg-muted text-popover-foreground"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {showReactionPicker && (
            <EmojiPicker
              onEmojiClick={(emojiData: EmojiClickData) => {
                handleReactionClick(emojiData.emoji)
                setShowReactionPicker(false);
              }}
            />
          )}
        </div>
      </div>
    </div >
  );
};

export default MessageItem;