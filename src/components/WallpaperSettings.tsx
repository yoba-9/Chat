"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

const WALLPAPER_COLORS = [
    "transparent",
    "#f3f4f6", // gray
    "#e0f2fe", // blue
    "#fef2f2", // red
    "#f0fdf4", // green
    "#faf5ff", // purple
    "#fff7ed", // orange
    "#1a1a1a", // dark
    "#262626", // charcoal
];

export function WallpaperSettings({ chatId }: { chatId: string }) {
    const { directChats, groupChats, setChatWallpaper } = useChatStore();

    const chat = [...directChats, ...groupChats].find(c => c.id === chatId);
    const currentWallpaper = chat?.wallpaper || "transparent";

    return (
        <div className="p-2 space-y-4">
            <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Solid Colors</h4>
                <div className="grid grid-cols-5 gap-2 px-2">
                    {WALLPAPER_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => setChatWallpaper(chatId, color)}
                            className="w-8 h-8 rounded-md border border-border flex items-center justify-center transition-transform hover:scale-110 relative overflow-hidden"
                            style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
                        >
                            {currentWallpaper === color && (
                                <Check size={14} className={color === '#1a1a1a' || color === '#262626' ? 'text-white' : 'text-gray-900'} />
                            )}
                            {color === 'transparent' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-[1px] bg-red-500 transform rotate-45 opacity-50" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Image URL</h4>
                <div className="px-2">
                    <input
                        type="text"
                        placeholder="https://..."
                        className="w-full text-xs p-2 rounded border border-border bg-background outline-none focus:ring-1 focus:ring-primary"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setChatWallpaper(chatId, e.currentTarget.value);
                                e.currentTarget.value = "";
                            }
                        }}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 px-1">Press Enter to apply wallpaper</p>
                </div>
            </div>
        </div>
    );
}
