'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import TabNavigation from '@/components/layout/TabNavigation'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from '@/lib/utils'

interface Review {
    id: string
    rating: number
    comment: string | null
    role: 'requester' | 'helper'
    created_at: string
    reviewer_id: string
    reviewer_name?: string
    request_title?: string
}

export default function MinhasAvaliacoesPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'received' | 'given'>('received')

    useEffect(() => {
        loadReviews()
    }, [])

    const loadReviews = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setLoading(false)
            return
        }

        // Buscar avaliações recebidas
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('reviews')
            .select('*')
            .eq('reviewed_id', user.id)
            .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
            // Buscar nomes dos revisores
            const reviewerIds = [...new Set(data.map((r: Review) => r.reviewer_id))]

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: usersData } = await (supabase as any)
                .from('users')
                .select('id, name')
                .in('id', reviewerIds)

            const usersMap = new Map(usersData?.map((u: { id: string; name: string }) => [u.id, u.name]) || [])

            const reviewsWithNames = data.map((r: Review) => ({
                ...r,
                reviewer_name: usersMap.get(r.reviewer_id) || 'Usuário'
            }))

            setReviews(reviewsWithNames)
        }
        setLoading(false)
    }

    const renderStars = (rating: number) => {
        const stars = []
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-zinc-300'}>
                    ★
                </span>
            )
        }
        return stars
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0'

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header user={null} notificationCount={0} />
            <TabNavigation />

            <main className="px-4 py-6 max-w-lg mx-auto pb-8">
                {/* Resumo */}
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 mb-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-4xl font-bold">{averageRating}</p>
                            <div className="flex gap-0.5 mt-1">
                                {renderStars(Math.round(parseFloat(averageRating)))}
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{reviews.length} avaliações</p>
                            <p className="text-sm text-white/70">
                                {reviews.filter(r => r.role === 'helper').length} como ajudante •{' '}
                                {reviews.filter(r => r.role === 'requester').length} como solicitante
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setFilter('received')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${filter === 'received'
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        📥 Recebidas
                    </button>
                    <button
                        onClick={() => setFilter('given')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${filter === 'given'
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        📤 Enviadas
                    </button>
                </div>

                {/* Lista */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-4 animate-pulse">
                                <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="space-y-3">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold">
                                        {review.reviewer_name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{review.reviewer_name || 'Usuário'}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="flex">{renderStars(review.rating)}</span>
                                            <span className="text-xs text-zinc-500" suppressHydrationWarning>
                                                {formatDistanceToNow(review.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-zinc-500 mb-2">
                                    {review.role === 'helper' ? '🤝 Como ajudante' : '📋 Como solicitante'}
                                </p>

                                {review.comment && (
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        "{review.comment}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="text-5xl mb-4 block">⭐</span>
                        <h2 className="text-lg font-bold mb-2">Nenhuma avaliação</h2>
                        <p className="text-zinc-500">
                            Suas avaliações aparecerão aqui depois que você ajudar ou receber ajuda.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
