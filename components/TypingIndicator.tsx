"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TypingIndicatorProps {
    userName: string
    userInitial?: string
}

export function TypingIndicator({ userName, userInitial }: TypingIndicatorProps) {
    return (
        <div className="flex gap-2 items-end mb-4 animate-fade-in">
            <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-cyan-500/20 text-cyan-300 text-xs">
                    {userInitial || userName[0]}
                </AvatarFallback>
            </Avatar>

            <div className="bg-gradient-to-br from-slate-700 to-slate-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-lg">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>

            <span className="text-xs text-slate-400 mb-1">{userName} is typing...</span>
        </div>
    )
}
