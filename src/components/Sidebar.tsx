// components/Sidebar.tsx
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, Settings, Users } from 'lucide-react';
import SettingsModal from './SettingModal';
import ThemeToggle from './ModeToggle';
import { useChatStore } from '@/store/chatStore';

export default function Sidebar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const showAllUsers = useChatStore((state) => state.showAllUsers);
  const setShowAllUsers = useChatStore((state) => state.setShowAllUsers);

  return (
    <div className="w-16 md:w-20 bg-card border-r border-border h-full flex flex-col items-center py-6">
      <div className="flex-grow flex flex-col items-center space-y-4">
        <Button
          variant={!showAllUsers && useChatStore.getState().chatFilter === 'all' ? "secondary" : "ghost"}
          size="icon"
          onClick={() => {
            setShowAllUsers(false);
            useChatStore.getState().setChatFilter('all');
          }}
          title="Messages"
          className="rounded-xl h-12 w-12 transition-all hover:scale-110"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        <Button
          variant={!showAllUsers && useChatStore.getState().chatFilter === 'groups' ? "secondary" : "ghost"}
          size="icon"
          onClick={() => {
            setShowAllUsers(false);
            useChatStore.getState().setChatFilter('groups');
          }}
          title="Groups"
          className="rounded-xl h-12 w-12 transition-all hover:scale-110"
        >
          <Users className="h-6 w-6" />
        </Button>
        <Button
          variant={showAllUsers ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setShowAllUsers(true)}
          title="All Users"
          className="rounded-xl h-12 w-12 transition-all hover:scale-110"
        >
          <User className="h-6 w-6" />
        </Button>
      </div>

      <div className="mt-auto flex flex-col items-center space-y-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setShowAllUsers(false);
            setIsSettingsOpen(true);
          }}
          title="Settings"
          className="rounded-xl h-12 w-12"
        >
          <Settings className="h-6 w-6" />
        </Button>
        <ThemeToggle />
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}