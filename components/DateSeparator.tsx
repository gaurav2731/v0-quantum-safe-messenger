"use client"

interface DateSeparatorProps {
    date: Date
}

export function DateSeparator({ date }: DateSeparatorProps) {
    const formatDate = (d: Date) => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (d.toDateString() === today.toDateString()) {
            return "Today"
        } else if (d.toDateString() === yesterday.toDateString()) {
            return "Yesterday"
        } else {
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }
    }

    return (
        <div className="flex items-center justify-center my-4">
            <div className="bg-slate-800/50 backdrop-blur-sm px-4 py-1 rounded-full border border-cyan-500/20">
                <span className="text-xs text-slate-400 font-medium">{formatDate(date)}</span>
            </div>
        </div>
    )
}
