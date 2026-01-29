'use client'

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, Phone, Video, MoreHorizontal, Mail, MapPin, Calendar, Clock, FileText, ImageIcon } from 'lucide-react';
import { User } from '@/lib/types';
import { useChatStore } from '@/store/chatStore';

export default function UserProfilePanel({ user, onClose }: { user: User; onClose: () => void }) {
    const onlineUsers = useChatStore((state) => state.onlineUsers);
    const isOnline = onlineUsers.has(user.id);

    return (
        <div className="w-80 border-l border-border bg-card flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Contact Info</h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 flex flex-col items-center text-center">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg mb-4">
                        <AvatarImage src={user.avatar || undefined} alt={user.name || ''} />
                        <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                            {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <div className="flex items-center mt-1 space-x-2">
                        <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-sm text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>

                    <div className="flex items-center space-x-2 mt-6 w-full">
                        <Button variant="outline" className="flex-1 rounded-xl" size="sm">
                            <Phone className="h-4 w-4 mr-2" /> Call
                        </Button>
                        <Button variant="outline" className="flex-1 rounded-xl" size="sm">
                            <Video className="h-4 w-4 mr-2" /> Video
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl" title="More">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="px-6 py-4 space-y-6">
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">About</h4>
                        <div className="space-y-3">
                            <div className="flex items-center text-sm">
                                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                                <span>{user.email || 'No email provided'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                                <span>Active 5m ago</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                                <span>Member since Jan 2024</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Media & Links</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-dashed border-border flex-col cursor-pointer hover:bg-muted/50 transition-colors">
                                <span className="text-xs font-medium text-muted-foreground">+12</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
