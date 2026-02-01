'use client'

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useSession } from '@/components/providers';
import { useChatStore } from '@/store/chatStore';

export default function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const updateCurrentUserState = useChatStore((state) => state.updateCurrentUserState);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || undefined
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update local storage for persistence
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = { ...currentUser, name: formData.name, avatar: formData.avatar };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Update store state
    updateCurrentUserState({
      name: formData.name,
      avatar: formData.avatar
    });

    setLoading(false);
    onClose();
    // Force reload to sync session (crude but effective for this mock setup)
    window.location.reload();
  };

  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sheba',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Cookie',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="relative group cursor-pointer">
            <Avatar className="h-24 w-24 border-2 border-border">
              <AvatarImage src={formData.avatar} />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {formData.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white h-8 w-8" />
            </div>
          </div>

          <div className="grid w-full gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label>Quick Avatars</Label>
              <div className="flex justify-between">
                {avatars.map((url, idx) => (
                  <div
                    key={idx}
                    className={`cursor-pointer rounded-full p-0.5 border-2 transition-all ${formData.avatar === url ? 'border-primary scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    onClick={() => setFormData({ ...formData, avatar: url })}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={url} />
                    </Avatar>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar-url">Avatar URL</Label>
              <div className="flex gap-2">
                <Input
                  id="avatar-url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}