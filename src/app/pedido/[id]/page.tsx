'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { URGENCY_LEVELS, REQUEST_CATEGORIES, OFFER_STATUS } from '@/lib/constants'
import { formatDistanceToNow, formatDate } from '@/lib/utils'

interface Offer {
    id: string
    status: 'pending' | 'accepted' | 'rejected' | 'borrowed' | 'returned' | 'cancelled'
    message: string | null
    created_at: string
    helper: {
        id: string
        name: string | null
        avatar_url: string | null
        rating_as_helper: number
    }
}

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
    offers: Offer[]
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
    const [processingOffer, setProcessingOffer] = useState<string | null>(null)

    useEffect(() => {
        loadRequest()
        checkUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])

    const checkUser = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user?.id || null)
    }

    const loadRequest = async () => {
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('requests')
            .select(`
        *,
        user:users!requests_user_id_fkey(id, name, avatar_url, neighborhood, rating_as_requester),
        offers(id, status, message, created_at, helper:users!offers_helper_id_fkey(id, name, avatar_url, rating_as_helper))
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

    const handleAcceptOffer = async (offerId: string) => {
        setProcessingOffer(offerId)
        const supabase = createClient()

        // Aceitar a oferta selecionada
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('offers')
            .update({ status: 'accepted', accepted_at: new Date().toISOString() })
            .eq('id', offerId)

        // Rejeitar as outras ofertas
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('offers')
            .update({ status: 'rejected' })
            .eq('request_id', params.id)
            .neq('id', offerId)
            .eq('status', 'pending')

        // Atualizar status do pedido
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('requests')
            .update({ status: 'in_progress' })
            .eq('id', params.id)

        loadRequest()
        setProcessingOffer(null)
    }

    const handleRejectOffer = async (offerId: string) => {
        setProcessingOffer(offerId)
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('offers')
            .update({ status: 'rejected' })
            .eq('id', offerId)

        loadRequest()
        setProcessingOffer(null)
    }

    const handleMarkBorrowed = async (offerId: string) => {
        setProcessingOffer(offerId)
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('offers')
            .update({ status: 'borrowed', borrowed_at: new Date().toISOString() })
            .eq('id', offerId)

        loadRequest()
        setProcessingOffer(null)
    }

    const handleMarkReturned = async (offerId: string) => {
        setProcessingOffer(offerId)
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('offers')
            .update({ status: 'returned', returned_at: new Date().toISOString() })
            .eq('id', offerId)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('requests')
            .update({ status: 'completed', closed_at: new Date().toISOString() })
            .eq('id', params.id)

        loadRequest()
        setProcessingOffer(null)
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
    const acceptedOffer = request.offers.find(o => o.status === 'accepted' || o.status === 'borrowed')

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
                    <p className="flex items-center gap-2" suppressHydrationWarning>
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

                {/* Ofertas - Versão para o dono */}
                {isOwner && request.offers.length > 0 && (
                    <div className="mb-6">
                        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            💬 {request.offers.length} {request.offers.length === 1 ? 'pessoa ofereceu' : 'pessoas ofereceram'} ajuda
                        </h2>

                        <div className="space-y-3">
                            {request.offers.map((offer) => {
                                const statusInfo = OFFER_STATUS[offer.status]
                                return (
                                    <div
                                        key={offer.id}
                                        className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-green-400 flex items-center justify-center text-white font-bold overflow-hidden">
                                                {offer.helper.avatar_url ? (
                                                    <img src={offer.helper.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    offer.helper.name?.charAt(0).toUpperCase() || '?'
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{offer.helper.name || 'Usuário'}</h4>
                                                <p className="text-xs text-zinc-500 flex items-center gap-2">
                                                    ⭐ {offer.helper.rating_as_helper.toFixed(1)}
                                                    <span suppressHydrationWarning>• {formatDistanceToNow(offer.created_at)}</span>
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color === 'green'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : statusInfo.color === 'blue'
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : statusInfo.color === 'red'
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'
                                                }`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        {offer.message && (
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 italic">
                                                "{offer.message}"
                                            </p>
                                        )}

                                        {/* Ações para o dono */}
                                        {offer.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAcceptOffer(offer.id)}
                                                    disabled={processingOffer === offer.id}
                                                    className="flex-1 py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                                                >
                                                    ✅ Aceitar
                                                </button>
                                                <button
                                                    onClick={() => handleRejectOffer(offer.id)}
                                                    disabled={processingOffer === offer.id}
                                                    className="flex-1 py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                                                >
                                                    ❌ Recusar
                                                </button>
                                            </div>
                                        )}

                                        {offer.status === 'accepted' && (
                                            <button
                                                onClick={() => handleMarkBorrowed(offer.id)}
                                                disabled={processingOffer === offer.id}
                                                className="w-full py-2 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                                            >
                                                📦 Marcar como Emprestado
                                            </button>
                                        )}

                                        {offer.status === 'borrowed' && (
                                            <button
                                                onClick={() => handleMarkReturned(offer.id)}
                                                disabled={processingOffer === offer.id}
                                                className="w-full py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                                            >
                                                ✅ Marcar como Devolvido
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Ofertas - Versão para visitantes */}
                {!isOwner && request.offers.length > 0 && (
                    <div className="mb-6">
                        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            💬 {request.offers.length} {request.offers.length === 1 ? 'pessoa ofereceu' : 'pessoas ofereceram'} ajuda
                        </h2>

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
                    </div>
                )}
            </main>

            {/* Botão fixo para visitantes */}
            {!isOwner && !hasOffered && request.status === 'open' && (
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

            {request.status === 'completed' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-zinc-200 dark:border-zinc-800">
                    <div className="w-full py-4 px-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded-xl text-center">
                        ✅ Pedido concluído
                    </div>
                </div>
            )}
        </div>
    )
}
