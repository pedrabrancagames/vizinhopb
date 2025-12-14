'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getWhatsAppLink, formatPhoneNumber, formatDistanceToNow } from '@/lib/utils'
import { BUSINESS_CATEGORIES } from '@/lib/constants'

interface Business {
    id: string
    name: string
    description: string | null
    phone: string | null
    whatsapp: string | null
    address: string | null
    neighborhood: string | null
    city: string | null
    category: string
    rating: number
    total_reviews: number
    verified: boolean
    opening_hours: string | null
}

interface Review {
    id: string
    rating: number
    comment: string | null
    created_at: string
    user_name?: string
    user_id?: string
}

export default function EmpresaDetalhePage() {
    const params = useParams()
    const router = useRouter()
    const [business, setBusiness] = useState<Business | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)
    const [hoveredStar, setHoveredStar] = useState(0)

    useEffect(() => {
        loadBusiness()
        checkUser()
    }, [params.id])

    const checkUser = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)
    }

    const loadBusiness = async () => {
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('businesses')
            .select('*')
            .eq('id', params.id)
            .single()

        if (!error && data) {
            setBusiness(data)

            // Buscar avaliações da empresa
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: reviewsData } = await (supabase as any)
                .from('business_reviews')
                .select('*')
                .eq('business_id', params.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (reviewsData && reviewsData.length > 0) {
                // Buscar nomes dos usuários
                const userIds = [...new Set(reviewsData.map((r: { user_id: string }) => r.user_id))]

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: usersData } = await (supabase as any)
                    .from('users')
                    .select('id, name')
                    .in('id', userIds)

                const usersMap = new Map(usersData?.map((u: { id: string; name: string }) => [u.id, u.name]) || [])

                const reviewsWithNames = reviewsData.map((r: { id: string; rating: number; comment: string; created_at: string; user_id: string }) => ({
                    ...r,
                    user_name: usersMap.get(r.user_id) || 'Usuário'
                }))

                setReviews(reviewsWithNames)
            }
        }
        setLoading(false)
    }

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentUserId) {
            router.push('/login')
            return
        }

        setSubmittingReview(true)
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('business_reviews')
            .insert({
                business_id: params.id,
                user_id: currentUserId,
                rating: reviewRating,
                comment: reviewComment.trim() || null
            })

        if (!error) {
            // Recalcular rating da empresa
            const newTotalReviews = (business?.total_reviews || 0) + 1
            const newRating = ((business?.rating || 0) * (business?.total_reviews || 0) + reviewRating) / newTotalReviews

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
                .from('businesses')
                .update({ rating: newRating, total_reviews: newTotalReviews })
                .eq('id', params.id)

            setShowReviewForm(false)
            setReviewRating(5)
            setReviewComment('')
            loadBusiness()
        }

        setSubmittingReview(false)
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

    const getCategoryInfo = (categoryId: string) => {
        const cat = BUSINESS_CATEGORIES.find(c => c.id === categoryId)
        return cat || { name: categoryId, icon: '🏢' }
    }

    const hasUserReviewed = reviews.some(r => r.user_id === currentUserId)

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-pulse text-2xl">⏳</div>
            </div>
        )
    }

    if (!business) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <span className="text-4xl mb-4 block">🏢</span>
                    <h1 className="text-xl font-bold mb-2">Empresa não encontrada</h1>
                    <Link href="/servicos" className="text-primary font-medium">
                        Voltar para Serviços
                    </Link>
                </div>
            </div>
        )
    }

    const categoryInfo = getCategoryInfo(business.category)

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/servicos" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg truncate max-w-[200px]">{business.name}</h1>
                    <div className="w-10" />
                </div>
            </header>
            <div className="h-[60px]" />

            <main className="px-4 py-6 max-w-lg mx-auto pb-8">
                {/* Cabeçalho da empresa */}
                <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl mx-auto mb-4">
                        {categoryInfo.icon}
                    </div>
                    <h1 className="text-2xl font-bold mb-1 flex items-center justify-center gap-2">
                        {business.name}
                        {business.verified && <span className="text-primary">✓</span>}
                    </h1>
                    <p className="text-zinc-500">{categoryInfo.name}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="flex">{renderStars(Math.round(business.rating))}</span>
                        <span className="font-medium">{business.rating.toFixed(1)}</span>
                        <span className="text-sm text-zinc-400">({business.total_reviews} avaliações)</span>
                    </div>
                </div>

                {/* Botões de contato */}
                <div className="flex gap-2 mb-6">
                    {business.phone && (
                        <a
                            href={`tel:${business.phone}`}
                            className="flex-1 py-3 px-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl font-medium text-center hover:bg-blue-200 transition-colors"
                        >
                            📞 Ligar
                        </a>
                    )}
                    {business.whatsapp && (
                        <a
                            href={getWhatsAppLink(business.whatsapp, `Olá! Vi seu serviço no Vizinho PB`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 px-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium text-center hover:bg-green-200 transition-colors"
                        >
                            💬 WhatsApp
                        </a>
                    )}
                </div>

                {/* Descrição */}
                {business.description && (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 mb-4">
                        <h2 className="font-semibold mb-2">Sobre</h2>
                        <p className="text-zinc-600 dark:text-zinc-400">{business.description}</p>
                    </div>
                )}

                {/* Informações */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-6 overflow-hidden">
                    {business.address && (
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                            <p className="text-sm text-zinc-500">📍 Endereço</p>
                            <p className="font-medium">{business.address}</p>
                            <p className="text-sm text-zinc-500">{business.neighborhood}, {business.city}</p>
                        </div>
                    )}
                    {business.opening_hours && (
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                            <p className="text-sm text-zinc-500">🕐 Horário</p>
                            <p className="font-medium">{business.opening_hours}</p>
                        </div>
                    )}
                    {(business.phone || business.whatsapp) && (
                        <div className="p-4">
                            <p className="text-sm text-zinc-500">📱 Contato</p>
                            <p className="font-medium">{formatPhoneNumber(business.phone || business.whatsapp || '')}</p>
                        </div>
                    )}
                </div>

                {/* Avaliações */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">⭐ Avaliações</h2>
                        {currentUserId && !hasUserReviewed && !showReviewForm && (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="text-sm text-primary font-medium hover:underline"
                            >
                                + Avaliar
                            </button>
                        )}
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                        <form onSubmit={handleSubmitReview} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 mb-4">
                            <h3 className="font-medium mb-3">Sua avaliação</h3>

                            {/* Stars */}
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        className="text-2xl transition-transform hover:scale-110"
                                    >
                                        {star <= (hoveredStar || reviewRating) ? '⭐' : '☆'}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Comentário (opcional)"
                                rows={2}
                                className="input-field resize-none mb-3"
                            />

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="flex-1 py-2 px-4 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="flex-1 btn-primary"
                                >
                                    {submittingReview ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </form>
                    )}

                    {reviews.length > 0 ? (
                        <div className="space-y-3">
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm">
                                                {review.user_name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span className="font-medium text-sm">{review.user_name}</span>
                                        </div>
                                        <span className="text-xs text-zinc-400" suppressHydrationWarning>
                                            {formatDistanceToNow(review.created_at)}
                                        </span>
                                    </div>
                                    <div className="flex mb-2">{renderStars(review.rating)}</div>
                                    {review.comment && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <span className="text-3xl mb-2 block">⭐</span>
                            <p className="text-zinc-500">Nenhuma avaliação ainda</p>
                            {currentUserId && !showReviewForm && (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="mt-2 text-primary font-medium hover:underline"
                                >
                                    Seja o primeiro a avaliar!
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
