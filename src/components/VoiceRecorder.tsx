"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, X, Send } from "lucide-react";
import { Button } from "./ui/button";

interface VoiceRecorderProps {
    onRecordingComplete: (blob: Blob, duration: number) => void;
    onCancel: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onCancel }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef<any>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<any>(null);

    const startRecording = async () => {
        if (typeof window === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
            console.error("Voice recording is not supported in this browser or environment.");
            onCancel();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Try to find a supported MIME type
            const mimeType = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/ogg;codecs=opus',
                'audio/mp4',
                ''
            ].find(type => type === '' || MediaRecorder.isTypeSupported(type));

            const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
                if (duration > 0 || chunksRef.current.length > 0) {
                    onRecordingComplete(audioBlob, duration);
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } catch (err: any) {
            console.error("Failed to start recording:", err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                alert("Microphone access was denied. Please enable microphone permissions in your browser settings to record voice messages.");
            } else {
                alert("Could not start recording. Please ensure your microphone is connected and working.");
            }
            onCancel();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatDuration = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        startRecording();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    return (
        <div className="flex items-center space-x-3 bg-accent rounded-full px-4 py-2 w-full animate-in slide-in-from-bottom-2">
            <div className="flex items-center space-x-2 flex-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">{formatDuration(duration)}</span>
            </div>
            <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 hover:bg-red-100 hover:text-red-500 rounded-full">
                    <X size={18} />
                </Button>
                <Button onClick={stopRecording} className="h-8 w-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-0 flex items-center justify-center">
                    <Send size={16} />
                </Button>
            </div>
        </div>
    );
}
