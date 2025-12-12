'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { URGENCY_LEVELS, REQUEST_CATEGORIES, REQUEST_STATUS } from '@/lib/constants'
import { formatDistanceToNow, formatDate } from '@/lib/utils'

interface Request {
    id: string
    title: string
    description: string | null
    category: string
    urgency: 'low' | 'medium' | 'high'
    status: string
    needed_until: string | null
    created_at: string
    user: {
        id: string
        name: string | null
        avatar_url: string | null
        neighborhood: string | null
        rating_as_requester: number
    }
    offers: {
        id: string
        helper: {
            id: string
            name: string | null
            avatar_url: string | null
        }
    }[]
}

export default function PedidoPage() {
    const params = useParams()
    const router = useRouter()
    const [request, setRequest] = useState<Request | null>(null)
    const [loading, setLoading] = useState(true)
    const [offerMessage, setOfferMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [currentUser, setCurrentUser] = useState<string | null>(null)
    const [showOfferForm, setShowOfferForm] = useState(false)

    useEffect(() => {
        loadRequest()
        checkUser()
    }, [params.id])

    const checkUser = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user?.id || null)
    }

    const loadRequest = async () => {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('requests')
            .select(`
        *,
        user:users!requests_user_id_fkey(id, name, avatar_url, neighborhood, rating_as_requester),
        offers(id, helper:users!offers_helper_id_fkey(id, name, avatar_url))
      `)
            .eq('id', params.id as string)
            .single()

        if (error || !data) {
            router.push('/')
            return
        }

        setRequest(data as unknown as Request)
        setLoading(false)
    }

    const handleOffer = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('offers')
            .insert({
                request_id: params.id,
                helper_id: user.id,
                message: offerMessage || null,
            })

        if (!error) {
            setShowOfferForm(false)
            setOfferMessage('')
            loadRequest()
        }

        setSubmitting(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-pulse text-2xl">⏳</div>
            </div>
        )
    }

    if (!request) return null

    const urgency = URGENCY_LEVELS[request.urgency]
    const category = REQUEST_CATEGORIES.find(c => c.id === request.category)
    const isOwner = currentUser === request.user.id
    const hasOffered = request.offers.some(o => o.helper.id === currentUser)

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg">Pedido</h1>
                    <div className="w-10" />
                </div>
            </header>
            <div className="h-[60px]" />

            {/* Conteúdo */}
            <main className="px-4 py-6 max-w-lg mx-auto pb-32">
                {/* Badge de urgência */}
                <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${request.urgency === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : request.urgency === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                        {urgency.icon} {urgency.label.toUpperCase()}
                    </span>
                    {category && (
                        <span className="flex items-center gap-1 text-zinc-500">
                            {category.icon} {category.name}
                        </span>
                    )}
                </div>

                {/* Título */}
                <h1 className="text-2xl font-bold mb-4">{request.title}</h1>

                {/* Descrição */}
                {request.description && (
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6 whitespace-pre-wrap">
                        {request.description}
                    </p>
                )}

                {/* Info */}
                <div className="space-y-2 mb-6 text-sm text-zinc-500">
                    <p className="flex items-center gap-2">
                        📍 {request.user.neighborhood || 'Localização não informada'}
                    </p>
                    <p className="flex items-center gap-2">
                        🕐 Publicado {formatDistanceToNow(request.created_at)}
                    </p>
                    {request.needed_until && (
                        <p className="flex items-center gap-2">
                            ⏰ Preciso até {formatDate(request.needed_until)}
                        </p>
                    )}
                </div>

                {/* Usuário que pediu */}
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                        {request.user.avatar_url ? (
                            <img src={request.user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            request.user.name?.charAt(0).toUpperCase() || '?'
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold">{request.user.name || 'Usuário'}</h3>
                        <p className="text-sm text-zinc-500 flex items-center gap-2">
                            ⭐ {request.user.rating_as_requester.toFixed(1)}
                            <span>•</span>
                            {request.user.neighborhood}
                        </p>
                    </div>
                </div>

                {/* Ofertas */}
                <div className="mb-6">
                    <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        💬 {request.offers.length} {request.offers.length === 1 ? 'pessoa ofereceu' : 'pessoas ofereceram'} ajuda
                    </h2>

                    {request.offers.length > 0 && (
                        <div className="flex -space-x-2 mb-4">
                            {request.offers.slice(0, 5).map((offer) => (
                                <div
                                    key={offer.id}
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-green-400 flex items-center justify-center text-white text-sm font-bold border-2 border-white dark:border-zinc-900 overflow-hidden"
                                    title={offer.helper.name || 'Usuário'}
                                >
                                    {offer.helper.avatar_url ? (
                                        <img src={offer.helper.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        offer.helper.name?.charAt(0).toUpperCase() || '?'
                                    )}
                                </div>
                            ))}
                            {request.offers.length > 5 && (
                                <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold border-2 border-white dark:border-zinc-900">
                                    +{request.offers.length - 5}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Botão fixo */}
            {!isOwner && !hasOffered && (
                <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-zinc-200 dark:border-zinc-800">
                    {showOfferForm ? (
                        <form onSubmit={handleOffer} className="space-y-3">
                            <textarea
                                value={offerMessage}
                                onChange={(e) => setOfferMessage(e.target.value)}
                                placeholder="Escreva uma mensagem (opcional)"
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowOfferForm(false)}
                                    className="flex-1 py-3 px-4 border border-zinc-300 dark:border-zinc-700 rounded-xl font-semibold transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 px-4 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Enviando...' : 'Confirmar'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => currentUser ? setShowOfferForm(true) : router.push('/login')}
                            className="w-full py-4 px-4 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-xl transition-all shadow-lg shadow-secondary/25 flex items-center justify-center gap-2"
                        >
                            🤝 Posso Ajudar!
                        </button>
                    )}
                </div>
            )}

            {hasOffered && !isOwner && (
                <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-zinc-200 dark:border-zinc-800">
                    <div className="w-full py-4 px-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded-xl text-center">
                        ✅ Você já ofereceu ajuda neste pedido
                    </div>
                </div>
            )}
        </div>
    )
}
