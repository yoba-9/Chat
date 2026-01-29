"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
    url: string;
    duration?: number;
    isOwnMessage: boolean;
}

export function AudioPlayer({ url, duration, isOwnMessage }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const onTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
    };

    const onEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    };

    const formatTime = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const secs = Math.floor(sec % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center space-x-3 py-1 min-w-[200px] ${isOwnMessage ? 'text-white' : 'text-foreground'}`}>
            <button
                onClick={togglePlay}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOwnMessage ? 'bg-white/20 hover:bg-white/30' : 'bg-primary/20 hover:bg-primary/30'
                    }`}
            >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </button>

            <div className="flex-1 flex flex-col space-y-1">
                <div className={`h-1 rounded-full relative ${isOwnMessage ? 'bg-white/30' : 'bg-muted'}`}>
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full ${isOwnMessage ? 'bg-white' : 'bg-blue-400'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] opacity-70">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || 0)}</span>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={url}
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
                className="hidden"
            />
        </div>
    );
}
