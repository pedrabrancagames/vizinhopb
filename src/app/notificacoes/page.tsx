'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from '@/lib/utils'

interface Notification {
    id: string
    type: 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'message' | 'review' | 'system'
    title: string
    message: string
    read: boolean
    created_at: string
    link?: string
}

export default function NotificacoesPage() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadNotifications()
    }, [])

    const loadNotifications = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setLoading(false)
            return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (!error && data) {
            setNotifications(data)
        }
        setLoading(false)
    }

    const handleMarkAsRead = async (id: string) => {
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('notifications')
            .update({ read: true })
            .eq('id', id)

        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const handleMarkAllAsRead = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)

        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'offer_received': return '🤝'
            case 'offer_accepted': return '✅'
            case 'offer_rejected': return '❌'
            case 'message': return '💬'
            case 'review': return '⭐'
            default: return '🔔'
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg">🔔 Notificações</h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-primary font-medium"
                        >
                            Marcar todas
                        </button>
                    )}
                    {unreadCount === 0 && <div className="w-20" />}
                </div>
            </header>
            <div className="h-[60px]" />

            <main className="px-4 py-4 max-w-lg mx-auto pb-8">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-4 animate-pulse">
                                <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-2">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => {
                                    handleMarkAsRead(notification.id)
                                    if (notification.link) router.push(notification.link)
                                }}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${notification.read
                                        ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
                                        : 'bg-primary/5 dark:bg-primary/10 border-primary/20'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.read && (
                                                <span className="w-2 h-2 bg-primary rounded-full" />
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-2" suppressHydrationWarning>
                                            {formatDistanceToNow(notification.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="text-5xl mb-4 block">🔔</span>
                        <h2 className="text-lg font-bold mb-2">Nenhuma notificação</h2>
                        <p className="text-zinc-500">
                            Você será notificado quando receber ofertas, mensagens ou atualizações.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
