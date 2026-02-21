"use client"

import { Check, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
    content: string
    timestamp: number
    isMe: boolean
    status?: 'sent' | 'delivered' | 'read'
    senderName?: string
    reactions?: { emoji: string; count: number; users: string[] }[]
    onReact?: (emoji: string) => void
    onReply?: () => void
    onDelete?: () => void
}

export function MessageBubble({
    content,
    timestamp,
    isMe,
    status = 'sent',
    senderName,
    reactions = [],
    onReact,
    onReply,
    onDelete
}: MessageBubbleProps) {
    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className={cn("flex gap-2 group", isMe ? "justify-end" : "justify-start")}>
            {!isMe && (
                <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-cyan-500/20 text-cyan-300 text-xs">
                        {senderName?.[0] || "U"}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className="flex flex-col max-w-[75%]">
                {!isMe && senderName && (
                    <span className="text-xs text-cyan-400 mb-1 ml-3">{senderName}</span>
                )}

                <div
                    className={cn(
                        "relative px-4 py-2 rounded-2xl shadow-lg transition-all duration-200",
                        isMe
                            ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-br-md"
                            : "bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-bl-md",
                        "hover:shadow-xl hover:scale-[1.02]"
                    )}
                >
                    <p className="text-sm break-words">{content}</p>

                    <div className="flex items-center gap-1 mt-1 justify-end">
                        <span className="text-[10px] opacity-70">{formatTime(timestamp)}</span>
                        {isMe && (
                            <span className="opacity-70">
                                {status === 'read' ? (
                                    <CheckCheck className="w-3 h-3 text-blue-300" />
                                ) : status === 'delivered' ? (
                                    <CheckCheck className="w-3 h-3" />
                                ) : (
                                    <Check className="w-3 h-3" />
                                )}
                            </span>
                        )}
                    </div>

                    {/* Reactions */}
                    {reactions.length > 0 && (
                        <div className="absolute -bottom-2 right-2 flex gap-1 bg-slate-900/90 rounded-full px-2 py-0.5 border border-cyan-500/30">
                            {reactions.map((reaction, idx) => (
                                <span key={idx} className="text-xs flex items-center gap-0.5">
                                    {reaction.emoji}
                                    {reaction.count > 1 && (
                                        <span className="text-[10px] text-slate-400">{reaction.count}</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions (shown on hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 mt-1 ml-2">
                    {onReact && (
                        <button
                            onClick={() => onReact('😊')}
                            className="text-xs px-2 py-1 rounded bg-slate-700/50 hover:bg-slate-600 text-slate-300"
                        >
                            😊
                        </button>
                    )}
                    {onReply && (
                        <button
                            onClick={onReply}
                            className="text-xs px-2 py-1 rounded bg-slate-700/50 hover:bg-slate-600 text-slate-300"
                        >
                            Reply
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
