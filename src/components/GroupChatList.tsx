'use client'

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, Search, Check, Users } from "lucide-react";
import { User } from "@/lib/types";


interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateGroup: (data: {
        name: string;
        description?: string;
        memberIds: string[];
        isPrivate: boolean;
    }) => void;
}

export default function CreateGroupModal({
    isOpen,
    onClose,
    onCreateGroup
}: CreateGroupModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            searchUsers();
        }
    }, [isOpen]);

    const searchUsers = async (query?: string) => {
        // Mock search users
        setLoading(true);
        setTimeout(() => {
            setUsers([
                { id: '1', name: 'Mock User 1', email: 'user1@example.com', avatar: null },
                { id: '2', name: 'Mock User 2', email: 'user2@example.com', avatar: null },
                { id: '3', name: 'Mock User 3', email: 'user3@example.com', avatar: null }
            ]);
            setLoading(false);
        }, 500);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length >= 2) {
            searchUsers(query);
        } else if (query.length === 0) {
            searchUsers();
        }
    };

    const toggleUserSelection = (userId: string) => {
        const newSelection = new Set(selectedUsers);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }

        setSelectedUsers(newSelection);
    };

    const handleSubmit = async () => {
        if (!name.trim() || selectedUsers.size === 0) {
            return;
        }

        setLoading(true);
        try {
            await onCreateGroup({
                name: name.trim(),
                description: description.trim() || undefined,
                memberIds: Array.from(selectedUsers),
                isPrivate,
            });

            setName(""),
                setDescription("");
            setSelectedUsers(new Set());
            setIsPrivate(false);
            setSearchQuery("");
            onClose();
        } catch (error) {
            console.error("Error creating group", error);
        } finally {
            setLoading(false);
        }
    };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Create Group Chat</h2>
                    <Button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Group name *
                            </label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter group name"
                                maxLength={100}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e: any) => setDescription(e.target.value)}
                                placeholder="What is this group about?"
                                rows={3}
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isPrivate"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
                                Make this group private
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Members ({selectedUsers.size} selected)
                        </label>

                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search Users ...."
                                className="pl-10 w-full"
                            />
                        </div>

                        {selectedUsers.size > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {Array.from(selectedUsers).map((userId) => {
                                    const user = users.find((u) => u.id === userId);
                                    if (!user) return null;
                                    return (
                                        <div
                                            key={userId}
                                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                                        >
                                            <span>{user.name || user.email}</span>
                                            <button
                                                onClick={() => toggleUserSelection(userId)}
                                                className="hover:bg-blue-200 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="border rounded-lg max-h-64 overflow-y-auto">
                            {users.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No Users found
                                </div>
                            ) : (
                                users.map((user) => {
                                    const isSelected = selectedUsers.has(user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => toggleUserSelection(user.id)}
                                            className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${isSelected ? "bg-blue-50" : ""}`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                                                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {user.name || user.email}
                                                    </p>
                                                    {user.email && user.name && (
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <Check className="h-5 w-5 text-blue-600" />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim() || selectedUsers.size === 0 || loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                creating....
                            </>
                        ) : (
                            <>
                                <Users className="mr-2 h-4 w-4" />
                                Create Group
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}