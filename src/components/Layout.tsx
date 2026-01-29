'use client'

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import Header from './Header';
import UserProfilePanel from './UserProfilePanel';
import StoriesBar from './StoriesBar';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSession } from '@/components/providers';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/app/hooks/useSocket';
import { useChatStore } from '@/store/chatStore';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: session, status } = useSession();

  const selectedChatId = useChatStore((state) => state.selectedChatId);
  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);
  const currentUser = useChatStore((state) => state.currentUser);
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);
  const directChats = useChatStore((state) => state.directChats);
  const isProfilePanelOpen = useChatStore((state) => state.isProfilePanelOpen);
  const setIsProfilePanelOpen = useChatStore((state) => state.setIsProfilePanelOpen);

  const router = useRouter();

  useSocket();



  useEffect(() => {
    if (session?.user && !currentUser) {
      setCurrentUser({
        id: session.user.id || '',
        name: session.user.name || null,
        email: session.user.email || null,
        avatar: session.user.image || null
      });
    }
  }, [currentUser, session, setCurrentUser]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat_messages' || e.key === 'directChats' || e.key === 'groupChats') {
        useChatStore.getState().syncData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'>
          </div>
          <p className='mt-4 text-muted-foreground'>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null;
  }

  const handleBackClick = () => {
    setSelectedChatId(null);
  };

  const selectedChat = directChats.find(chat => chat.id === selectedChatId);
  const otherUser = selectedChat ? (selectedChat.user1.id === currentUser?.id ? selectedChat.user2 : selectedChat.user1) : null;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className={`md:block ${isSidebarOpen ? 'block' : 'hidden'} h-full`}>
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="md:hidden flex justify-between items-center p-2 border-b border-border text-card-foreground">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-6 w-6" />
              <span className="sr-only">Toggle search</span>
            </Button>
          </div>
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className={`w-full md:w-96 ${selectedChatId ? 'hidden md:block' : 'block'} border-r border-border flex flex-col`}>
              <StoriesBar />
              <div className="flex-1 overflow-hidden">
                <UserList />
              </div>
            </div>
            {selectedChatId ? (
              <div className="flex-1 flex h-full overflow-hidden">
                <div className="flex-1 h-full min-w-0">
                  <ChatWindow onBack={handleBackClick} />
                </div>
                {isProfilePanelOpen && otherUser && (
                  <UserProfilePanel
                    user={otherUser}
                    onClose={() => setIsProfilePanelOpen(false)}
                  />
                )}
              </div>
            ) : (
              <div className="hidden md:flex flex-1 flex-col items-center justify-center p-4 bg-muted/30">
                <Image src="/logo.png" alt="Logo" width={120} height={120} priority className="mb-6 drop-shadow-xl" />
                <h2 className="text-2xl font-bold mb-2 text-primary">Welcome to Zemenay Chat</h2>
                <p className="text-muted-foreground max-w-xs text-center">Select a conversation from the left to start messaging your friends and family.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}