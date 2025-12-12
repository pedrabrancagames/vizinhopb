'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AvaliarPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [userToRate, setUserToRate] = useState<{
        id: string
        name: string
        avatar_url: string | null
    } | null>(null)
    const [requestTitle, setRequestTitle] = useState('')

    const offerId = searchParams.get('offer')
    const asRole = searchParams.get('as') as 'requester' | 'helper' || 'requester'

    useEffect(() => {
        if (offerId) {
            loadOfferData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offerId])

    const loadOfferData = async () => {
        // Em produção, buscar dados reais
        // Por enquanto, usar mock
        setUserToRate({
            id: 'user-1',
            name: asRole === 'requester' ? 'Maria Santos' : 'João Silva',
            avatar_url: null
        })
        setRequestTitle('Furadeira para fazer uns furos')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        // Em produção, inserir a avaliação no banco
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // await (supabase as any)
        //   .from('reviews')
        //   .insert({
        //     reviewer_id: user.id,
        //     reviewed_id: userToRate?.id,
        //     offer_id: offerId,
        //     rating,
        //     comment: comment || null,
        //     role: asRole,
        //   })

        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 500))

        setSubmitted(true)
        setSubmitting(false)
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Avaliação enviada!</h1>
                    <p className="text-zinc-500 mb-6">
                        Obrigado por ajudar a comunidade com seu feedback.
                    </p>
                    <Link
                        href="/"
                        className="inline-block py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all"
                    >
                        Voltar ao início
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg">Avaliar</h1>
                    <div className="w-10" />
                </div>
            </header>
            <div className="h-[60px]" />

            {/* Conteúdo */}
            <main className="px-4 py-6 max-w-lg mx-auto">
                {/* Usuário a ser avaliado */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 overflow-hidden">
                        {userToRate?.avatar_url ? (
                            <img src={userToRate.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            userToRate?.name?.charAt(0).toUpperCase() || '?'
                        )}
                    </div>
                    <h2 className="text-xl font-bold mb-1">{userToRate?.name || 'Usuário'}</h2>
                    <p className="text-sm text-zinc-500">
                        {asRole === 'requester'
                            ? 'Ajudou você com:'
                            : 'Você ajudou com:'}
                    </p>
                    <p className="text-sm font-medium text-primary">{requestTitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Estrelas */}
                    <div>
                        <label className="block text-sm font-medium mb-3 text-center">
                            Como foi a experiência?
                        </label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-4xl transition-all transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'
                                        }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-sm text-zinc-500 mt-2">
                            {rating === 1 && 'Muito ruim'}
                            {rating === 2 && 'Ruim'}
                            {rating === 3 && 'Regular'}
                            {rating === 4 && 'Bom'}
                            {rating === 5 && 'Excelente'}
                        </p>
                    </div>

                    {/* Comentário */}
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium mb-2">
                            Deixe um comentário (opcional)
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Conte como foi a experiência..."
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                        />
                        <p className="text-xs text-zinc-500 mt-1">{comment.length}/500</p>
                    </div>

                    {/* Botão */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                ⭐ Enviar Avaliação
                            </>
                        )}
                    </button>

                    {/* Pular */}
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="w-full py-3 text-zinc-500 font-medium hover:text-zinc-700 transition-colors"
                    >
                        Avaliar depois
                    </button>
                </form>
            </main>
        </div>
    )
}
