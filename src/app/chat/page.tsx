'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import TabNavigation from '@/components/layout/TabNavigation'
import { formatDistanceToNow } from '@/lib/utils'

interface Conversation {
    id: string
    other_user: {
        id: string
        name: string | null
        avatar_url: string | null
    }
    last_message: string | null
    last_message_at: string
    unread_count: number
    request_title?: string
}

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadConversations()
    }, [])

    const loadConversations = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setLoading(false)
            return
        }

        // Buscar conversas onde o usuário é participante
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('conversations')
            .select('*')
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .order('updated_at', { ascending: false })

        if (!error && data && data.length > 0) {
            // Buscar informações dos outros usuários
            const otherUserIds = data.map((c: { user1_id: string; user2_id: string }) =>
                c.user1_id === user.id ? c.user2_id : c.user1_id
            )

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: usersData } = await (supabase as any)
                .from('users')
                .select('id, name, avatar_url')
                .in('id', otherUserIds)

            const usersMap = new Map(usersData?.map((u: { id: string; name: string; avatar_url: string }) => [u.id, u]) || [])

            const conversationsWithUsers = data.map((c: { id: string; user1_id: string; user2_id: string; last_message: string; updated_at: string }) => {
                const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id
                const otherUser = usersMap.get(otherId) as { id: string; name: string; avatar_url: string } | undefined
                return {
                    id: c.id,
                    other_user: otherUser || { id: otherId, name: 'Usuário', avatar_url: null },
                    last_message: c.last_message,
                    last_message_at: c.updated_at,
                    unread_count: 0
                }
            })

            setConversations(conversationsWithUsers)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header user={null} notificationCount={0} />
            <TabNavigation />

            <main className="px-4 py-4 max-w-lg mx-auto">
                <h1 className="text-xl font-bold mb-4">💬 Conversas</h1>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-4 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-2" />
                                        <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : conversations.length > 0 ? (
                    <div className="space-y-2">
                        {conversations.map((conv) => (
                            <Link
                                key={conv.id}
                                href={`/chat/${conv.id}`}
                                className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-all"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold overflow-hidden">
                                        {conv.other_user.avatar_url ? (
                                            <img src={conv.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            conv.other_user.name?.charAt(0).toUpperCase() || '?'
                                        )}
                                    </div>
                                    {conv.unread_count > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold truncate">{conv.other_user.name || 'Usuário'}</h3>
                                        <span className="text-xs text-zinc-400" suppressHydrationWarning>
                                            {formatDistanceToNow(conv.last_message_at)}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-zinc-800 dark:text-zinc-200 font-medium' : 'text-zinc-500'}`}>
                                        {conv.last_message || 'Nenhuma mensagem'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="text-5xl mb-4 block">💬</span>
                        <h2 className="text-lg font-bold mb-2">Nenhuma conversa</h2>
                        <p className="text-zinc-500 mb-4">
                            Suas conversas aparecerão aqui quando você oferecer ajuda ou receber ofertas.
                        </p>
                        <Link
                            href="/"
                            className="inline-block py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all"
                        >
                            Ver pedidos
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
