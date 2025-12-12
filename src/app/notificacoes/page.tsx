'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from '@/lib/utils'

interface Notification {
    id: string
    type: 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'message' | 'review' | 'system'
    title: string
    body: string
    read: boolean
    created_at: string
    data: {
        request_id?: string
        offer_id?: string
        conversation_id?: string
    } | null
}

export default function NotificacoesPage() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    // Dados fake para demonstração
    const fakeNotifications: Notification[] = [
        {
            id: '1',
            type: 'offer_received',
            title: 'Nova oferta de ajuda!',
            body: 'Maria Santos ofereceu ajuda no seu pedido "Furadeira para fazer uns furos"',
            read: false,
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            data: { request_id: '1' }
        },
        {
            id: '2',
            type: 'message',
            title: 'Nova mensagem',
            body: 'Carlos Lima: "Posso te emprestar amanhã!"',
            read: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            data: { conversation_id: '1' }
        },
        {
            id: '3',
            type: 'offer_accepted',
            title: 'Sua oferta foi aceita!',
            body: 'João aceitou sua oferta de ajuda no pedido "Escada de 6 degraus"',
            read: true,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            data: { request_id: '2' }
        },
        {
            id: '4',
            type: 'review',
            title: 'Você recebeu uma avaliação!',
            body: 'Ana Paula te avaliou com 5 estrelas ⭐',
            read: true,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            data: null
        },
        {
            id: '5',
            type: 'system',
            title: 'Bem-vindo ao Vizinho PB!',
            body: 'Complete seu perfil para começar a ajudar e receber ajuda da comunidade.',
            read: true,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            data: null
        },
    ]

    useEffect(() => {
        // Simular carregamento
        setTimeout(() => {
            setNotifications(fakeNotifications)
            setLoading(false)
        }, 300)
    }, [])

    const getIcon = (type: string) => {
        switch (type) {
            case 'offer_received': return '🤝'
            case 'offer_accepted': return '✅'
            case 'offer_rejected': return '❌'
            case 'message': return '💬'
            case 'review': return '⭐'
            case 'system': return '📢'
            default: return '🔔'
        }
    }

    const handleClick = async (notification: Notification) => {
        // Marcar como lida
        setNotifications(notifications.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
        ))

        // Navegar
        if (notification.data?.request_id) {
            router.push(`/pedido/${notification.data.request_id}`)
        } else if (notification.data?.conversation_id) {
            router.push(`/chat/${notification.data.conversation_id}`)
        }
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
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
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        🔔 Notificações
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-primary font-medium"
                        >
                            Ler tudo
                        </button>
                    )}
                    {unreadCount === 0 && <div className="w-16" />}
                </div>
            </header>
            <div className="h-[60px]" />

            {/* Lista */}
            <main className="px-4 py-4 max-w-lg mx-auto">
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
                            <button
                                key={notification.id}
                                onClick={() => handleClick(notification)}
                                className={`w-full text-left p-4 rounded-xl transition-all ${notification.read
                                        ? 'bg-white dark:bg-zinc-900'
                                        : 'bg-primary/5 border-l-4 border-primary'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl mt-0.5">{getIcon(notification.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-medium truncate ${!notification.read ? 'text-foreground' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.read && (
                                                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 ml-2" />
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-500 line-clamp-2">{notification.body}</p>
                                        <p className="text-xs text-zinc-400 mt-1" suppressHydrationWarning>
                                            {formatDistanceToNow(notification.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="text-5xl mb-4 block">🔔</span>
                        <h2 className="text-lg font-bold mb-2">Nenhuma notificação</h2>
                        <p className="text-zinc-500">
                            Suas notificações aparecerão aqui
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
