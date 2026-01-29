'use client'

import React from 'react';
import Image from 'next/image';
import { Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useSession, signOut } from '@/components/providers';
import { useChatStore } from '@/store/chatStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ProfileModal from './ProfileModal';

export default function Header() {
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const { data: session } = useSession();
    const totalUnreadCount = useChatStore((state) => state.totalUnreadCount);
    const user = session?.user;

    return (
        <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} />
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hidden sm:block">
                        Zemenay
                    </span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {mounted && totalUnreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                            </span>
                        )}
                    </Button>
                </div>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 flex items-center space-x-2 px-2 hover:bg-accent rounded-full transition-colors">
                            <Avatar className="h-8 w-8 border border-border">
                                <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start text-xs">
                                <span className="font-semibold leading-none">{user?.name || 'User'}</span>
                                <span className="text-muted-foreground truncate max-w-[100px]">{user?.email}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal px-3 py-2">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-semibold leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem className="py-3 px-3 cursor-pointer focus:bg-accent flex items-center gap-3" onClick={() => setIsProfileOpen(true)}>
                            <User className="h-4 w-4 text-gray-500" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="py-3 px-3 cursor-pointer focus:bg-accent flex items-center gap-3">
                            <Settings className="h-4 w-4 text-gray-500" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem className="py-3 px-3 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-3" onClick={() => signOut()}>
                            <LogOut className="h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </header>
    );
}
