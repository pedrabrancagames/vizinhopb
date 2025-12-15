'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from '@/lib/utils'
import { useRealtimeMessages, Message } from '@/lib/hooks/useRealtimeMessages'

// Message type is now imported from the hook

interface Conversation {
    id: string
    request_id: string
    requester_id: string
    helper_id: string
    request: {
        title: string
    }
    requester: {
        id: string
        name: string | null
        avatar_url: string | null
    }
    helper: {
        id: string
        name: string | null
        avatar_url: string | null
    }
}

export default function ChatConversationPage() {
    const params = useParams()
    const router = useRouter()
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadConversation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // Callback para lidar com novas mensagens em tempo real
    const handleNewMessage = useCallback((newMsg: Message) => {
        setMessages((prev) => {
            // Evitar duplicatas (a mensagem enviada pelo próprio usuário já foi adicionada)
            if (prev.some((m) => m.id === newMsg.id)) {
                return prev
            }
            return [...prev, newMsg]
        })
    }, [])

    // Subscrição em tempo real para novas mensagens
    useRealtimeMessages({
        conversationId: params.id as string,
        onNewMessage: handleNewMessage,
        enabled: !loading && !!conversation,
    })

    const loadConversation = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()



        if (!user) {
            router.push('/login')
            return
        }

        setCurrentUserId(user.id)

        // Carregar conversa
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: convData, error: convError } = await (supabase as any)
            .from('conversations')
            .select(`
        *,
        request:requests(title),
        requester:users!conversations_requester_id_fkey(id, name, avatar_url),
        helper:users!conversations_helper_id_fkey(id, name, avatar_url)
      `)
            .eq('id', params.id)
            .single()



        if (convError || !convData) {

            router.push('/chat')
            return
        }

        setConversation(convData)

        // Carregar mensagens
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: msgData, error: msgError } = await (supabase as any)
            .from('messages')
            .select('*')
            .eq('conversation_id', params.id)
            .order('created_at', { ascending: true })



        if (msgData) {
            setMessages(msgData)
        }

        setLoading(false)

        // Marcar mensagens como lidas
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('messages')
            .update({ read: true })
            .eq('conversation_id', params.id)
            .neq('sender_id', user.id)
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        setSending(true)
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('messages')
            .insert({
                conversation_id: params.id,
                sender_id: currentUserId,
                content: newMessage.trim(),
            })
            .select()
            .single()

        if (!error && data) {
            setMessages([...messages, data])
            setNewMessage('')

            // Atualizar last_message_at
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('conversations')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', params.id)
        }

        setSending(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-pulse text-2xl">⏳</div>
            </div>
        )
    }

    if (!conversation) return null

    const otherUser = currentUserId === conversation.requester_id
        ? conversation.helper
        : conversation.requester

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3 px-4 py-3">
                    <Link href="/chat" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-xl">←</span>
                    </Link>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold overflow-hidden">
                        {otherUser.avatar_url ? (
                            <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            otherUser.name?.charAt(0).toUpperCase() || '?'
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="font-semibold truncate">{otherUser.name || 'Usuário'}</h1>
                        <p className="text-xs text-zinc-500 truncate">
                            📦 {conversation.request.title}
                        </p>
                    </div>
                </div>
            </header>
            <div className="h-[72px]" />

            {/* Mensagens */}
            <main className="flex-1 px-4 py-4 overflow-y-auto pb-24">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-4xl mb-4 block">💬</span>
                        <p className="text-zinc-500">Nenhuma mensagem ainda</p>
                        <p className="text-sm text-zinc-400">Envie a primeira mensagem!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((msg) => {
                            const isMine = msg.sender_id === currentUserId
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${isMine
                                            ? 'bg-primary text-white rounded-br-md'
                                            : 'bg-white dark:bg-zinc-800 rounded-bl-md'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                        <p
                                            className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-zinc-500'
                                                }`}
                                            suppressHydrationWarning
                                        >
                                            {formatDistanceToNow(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* Input de mensagem */}
            <form
                onSubmit={handleSend}
                className="fixed bottom-0 left-0 right-0 glass border-t border-zinc-200 dark:border-zinc-800 p-4"
            >
                <div className="flex gap-2 max-w-lg mx-auto">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-4 py-3 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="w-12 h-12 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        {sending ? '⏳' : '➤'}
                    </button>
                </div>
            </form>
        </div>
    )
}
