"use client"

import { useState } from "react"
import { Smile } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MessageReactionsProps {
    messageId: string
    onReact: (emoji: string) => void
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '✨']

export function MessageReactions({ messageId, onReact }: MessageReactionsProps) {
    const [showPicker, setShowPicker] = useState(false)

    const handleReaction = (emoji: string) => {
        onReact(emoji)
        setShowPicker(false)
    }

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPicker(!showPicker)}
                className="h-8 w-8 p-0 hover:bg-slate-700"
            >
                <Smile className="w-4 h-4 text-slate-400" />
            </Button>

            {showPicker && (
                <div className="absolute bottom-full mb-2 left-0 bg-slate-800 border border-cyan-500/30 rounded-lg shadow-xl p-2 flex gap-1 animate-fade-in z-50">
                    {QUICK_REACTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className="text-xl hover:scale-125 transition-transform duration-200 p-1 hover:bg-slate-700 rounded"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
