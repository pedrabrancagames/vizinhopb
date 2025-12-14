'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Message {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    read: boolean
    created_at: string
}

interface UseRealtimeMessagesOptions {
    conversationId: string
    onNewMessage: (message: Message) => void
    enabled?: boolean
}

/**
 * Hook para subscrição em tempo real de novas mensagens de uma conversa.
 * Utiliza Supabase Realtime para receber INSERTs na tabela `messages`.
 */
export function useRealtimeMessages({
    conversationId,
    onNewMessage,
    enabled = true,
}: UseRealtimeMessagesOptions) {
    const channelRef = useRef<RealtimeChannel | null>(null)

    const cleanup = useCallback(() => {
        if (channelRef.current) {
            channelRef.current.unsubscribe()
            channelRef.current = null
        }
    }, [])

    useEffect(() => {
        if (!enabled || !conversationId) {
            cleanup()
            return
        }

        const supabase = createClient()

        // Criar canal com nome único para esta conversa
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message
                    onNewMessage(newMessage)
                }
            )
            .subscribe()

        channelRef.current = channel

        return cleanup
    }, [conversationId, onNewMessage, enabled, cleanup])

    return { cleanup }
}
