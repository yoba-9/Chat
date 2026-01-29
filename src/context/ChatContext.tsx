
'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

type ChatContextType = {
    socket: any;
    isConnected: boolean;
};

const ChatContext = createContext<ChatContextType>({
    socket: null,
    isConnected: false,
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    return (
        <ChatContext.Provider value={{ socket: null, isConnected: true }}>
            {children}
        </ChatContext.Provider>
    );
};
