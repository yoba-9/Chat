'use client'

import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
    id: string;
    name: string | null;
    email: string | null;
    username?: string;
    avatar: string | null;
    password?: string;
}

interface SessionData {
    user: User | null;
}

interface SessionState {
    data: SessionData | null;
    status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<{
    session: SessionState;
    setSession: React.Dispatch<React.SetStateAction<SessionState>>;
} | null>(null);

export const useSession = () => {
    const context = useContext(AuthContext);
    if (!context) {
        return { data: null, status: "loading" };
    }
    return context.session;
};

// Legacy support for useUser
const UserContext = createContext<{ user: User | null; setUser: (u: User | null) => void } | null>(null);
export const useUser = () => useContext(UserContext);

export const signIn = async (provider: string, credentials?: any) => {
    if (typeof window === 'undefined') return { error: "Browser environment required" };

    if (provider === "credentials") {
        const { email, password } = credentials;
        try {
            const usersJson = localStorage.getItem('users') || '[]';
            const users: User[] = JSON.parse(usersJson);
            const user = users.find(u => (u.email === email || u.id === email) && u.password === password);

            if (user) {
                const { password: _, ...userWithoutPassword } = user;
                sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
                window.location.href = '/';
                return { ok: true };
            }
            return { error: "Invalid Email or Password" };
        } catch (e) {
            return { error: "Authentication failed. Local storage might be corrupted." };
        }
    }
    return { ok: true };
};

export const signOut = async () => {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentUser');
        window.location.href = '/login';
    }
    return { ok: true };
};

export const signUp = async (userData: User) => {
    if (typeof window === 'undefined') return { error: "Browser environment required" };

    try {
        const usersJson = localStorage.getItem('users') || '[]';
        const users: User[] = JSON.parse(usersJson);

        if (users.find(u => u.email === userData.email || u.id === userData.id)) {
            return { error: "User already exists" };
        }

        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        window.location.href = '/';
        return { ok: true };
    } catch (e) {
        return { error: "Sign up failed. Local storage might be corrupted." };
    }
};

export const FrontendProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<SessionState>({
        data: null,
        status: "loading"
    });
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const loadSession = () => {
            try {
                const userJson = sessionStorage.getItem('currentUser');
                if (userJson) {
                    const parsedUser = JSON.parse(userJson);
                    setSession({ data: { user: parsedUser }, status: "authenticated" });
                    setUser(parsedUser);
                } else {
                    setSession({ data: null, status: "unauthenticated" });
                    setUser(null);
                }
            } catch (e) {
                console.error("Session load error", e);
                setSession({ data: null, status: "unauthenticated" });
                setUser(null);
            }
        };
        loadSession();
    }, []);

    return (
        <AuthContext.Provider value={{ session, setSession }}>
            <UserContext.Provider value={{ user, setUser }}>
                {children}
            </UserContext.Provider>
        </AuthContext.Provider>
    );
};
