"use client";

import { useState } from "react";
import { debounce } from "lodash";
import { Loader2, Search, Users, Lock, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useChatStore } from "@/store/chatStore";
import { SearchGroup } from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";

export function SearchModal({
  onCreateChat,
  onJoinGroup,
}: {
  onCreateChat: (user: any) => void;
  onJoinGroup: (groupId: SearchGroup) => void;
}) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  const { addGroupChat, socket } = useChatStore();

  const searchAll = debounce(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setUsers([]);
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Mock search results
    setTimeout(() => {
      setUsers([
        { id: 'mock-u1', name: 'Mock User 1', email: 'user1@example.com' },
        { id: 'mock-u2', name: 'Mock User 2', email: 'user2@example.com' }
      ]);
      setGroups([
        { id: 'g1', name: 'Mock Group', description: 'A test group', memberCount: 5, messageCount: 10, isMember: false, isPrivate: false, avatar: null }
      ]);
      setLoading(false);
    }, 500);
  }, 300);

  const handleInputChange = (value: string) => {
    setQuery(value);
    searchAll(value);
  };

  const handleCreateChat = (participantId: string) => {
    onCreateChat(participantId);
    setQuery("");
    setUsers([]);
    setGroups([]);
  };

  const handleJoinGroup = async (groupId: string) => {
    setJoiningGroupId(groupId);
    // Mock join group
    setTimeout(() => {
      alert("Joined group successfully (Mocked)");
      const group = groups.find(g => g.id === groupId);
      if (group) {
        onJoinGroup({ ...group, isMember: true });
      }
      setJoiningGroupId(null);
    }, 500);
  };

  return (
    <ScrollArea className="relative flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search users or groups..."
            className="pl-10"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
          </div>
        ) : query.length < 2 ? (
          <></>
        ) : (
          <div className="p-4 space-y-6">
            {/* Users Section */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">Users</h2>
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      const guestUser = { ...user, image: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || user.id}` };
                      onCreateChat(guestUser);
                      setQuery("");
                      setUsers([]);
                      setGroups([]);
                    }}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0).toUpperCase() ||
                        user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user.name || user.email}</p>
                      {user.name && (
                        <p className="text-sm text-gray-500">{user.email}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground px-2">No users found</p>
              )}
            </div>

            {/* Groups Section */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">Groups</h2>
              {groups.length > 0 ? (
                groups.map((group) => (
                  <div
                    key={group.id}
                    className="border border-border rounded-lg p-4 hover:shadow-sm transition"
                    onClick={() => onJoinGroup(group)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                        {group.avatar ? (
                          <img
                            src={group.avatar}
                            alt={group.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {group.name}
                          </h3>
                          {group.isPrivate && (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {group.description || "No description"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {group.memberCount} members
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {group.messageCount} messages
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {group.isMember ? (
                          <Button variant="outline" disabled size="sm">
                            Joined
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleJoinGroup(group.id)}
                            disabled={
                              joiningGroupId === group.id || group.isPrivate
                            }
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {joiningGroupId === group.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : group.isPrivate ? (
                              "Private"
                            ) : (
                              "Join"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 px-2">No groups found</p>
              )}
            </div>
          </div>
        )}
      </ScrollArea>
    </ScrollArea>
  );
}
