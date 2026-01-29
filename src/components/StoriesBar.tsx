'use client'

import React, { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/store/chatStore';

export default function StoriesBar() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const currentUser = useChatStore((state) => state.currentUser);
    const directChats = useChatStore((state) => state.directChats);

    // Filter users who are "online" or just show all users from chats for demo purposes
    const usersWithStories = directChats.map(chat => {
        const otherUser = chat.user1.id === currentUser?.id ? chat.user2 : chat.user1;
        return {
            id: chat.id,
            name: otherUser.name,
            avatar: otherUser.avatar,
            hasStory: Math.random() > 0.3 // Mock data
        };
    });

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group border-b border-border bg-card/50 px-2 py-3 flex items-center">
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 z-10 hidden group-hover:flex bg-background/80 hover:bg-background h-8 w-8 rounded-full shadow-md"
                onClick={() => scroll('left')}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div
                ref={scrollRef}
                className="flex space-x-4 overflow-x-auto no-scrollbar scroll-smooth px-2"
            >
                {/* Current User Story */}
                <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group/item">
                    <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-background p-0.5">
                            <AvatarImage src={currentUser?.avatar || undefined} />
                            <AvatarFallback className="bg-secondary">{currentUser?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center border-2 border-background shadow-lg group-hover/item:scale-110 transition-transform">
                            <Plus className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <span className="text-[10px] font-medium max-w-[60px] truncate">My Story</span>
                </div>

                {/* Other Stories */}
                {usersWithStories.map((u) => (
                    <div key={u.id} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group/item">
                        <div className={`p-0.5 rounded-full ${u.hasStory ? 'bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px]' : ''}`}>
                            <Avatar className="h-14 w-14 border-2 border-background shadow-sm hover:scale-105 transition-transform">
                                <AvatarImage src={u.avatar || undefined} />
                                <AvatarFallback className="bg-secondary">{u.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <span className="text-[10px] font-medium max-w-[60px] truncate">{u.name}</span>
                    </div>
                ))}
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 z-10 hidden group-hover:flex bg-background/80 hover:bg-background h-8 w-8 rounded-full shadow-md"
                onClick={() => scroll('right')}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
