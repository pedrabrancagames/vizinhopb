'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getWhatsAppLink } from '@/lib/utils'

interface Business {
    id: string
    name: string
    description: string | null
    phone: string | null
    whatsapp: string | null
    email: string | null
    address: string | null
    neighborhood: string | null
    working_hours: string | null
    verified: boolean
    rating: number
    total_reviews: number
    category: {
        name: string
        icon: string
    }
    reviews: {
        id: string
        rating: number
        comment: string | null
        created_at: string
        user: {
            name: string | null
            avatar_url: string | null
        }
    }[]
}

export default function EmpresaPage() {
    const params = useParams()
    const router = useRouter()
    const [business, setBusiness] = useState<Business | null>(null)
    const [loading, setLoading] = useState(true)

    // Dados fake para demonstração
    const fakeBusiness: Business = {
        id: params.id as string,
        name: 'Elétrica Silva',
        description: 'Serviços elétricos residenciais e comerciais. Instalação de tomadas, disjuntores, quadros de luz, iluminação LED e muito mais. Trabalhamos com qualidade e garantia de 90 dias.',
        phone: '83999999999',
        whatsapp: '83999999999',
        email: 'contato@eletricasilva.com',
        address: 'Rua das Flores, 123 - Manaíra',
        neighborhood: 'Manaíra',
        working_hours: 'Seg-Sex 8h-18h | Sáb 8h-12h',
        verified: true,
        rating: 4.9,
        total_reviews: 45,
        category: { name: 'Eletricista', icon: '🔌' },
        reviews: [
            {
                id: '1',
                rating: 5,
                comment: 'Excelente profissional! Resolveu o problema rapidamente.',
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                user: { name: 'Maria Santos', avatar_url: null }
            },
            {
                id: '2',
                rating: 5,
                comment: 'Muito atencioso e preço justo.',
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                user: { name: 'Carlos Lima', avatar_url: null }
            },
            {
                id: '3',
                rating: 4,
                comment: null,
                created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                user: { name: 'Ana Paula', avatar_url: null }
            },
        ]
    }

    useEffect(() => {
        // Simular carregamento
        setTimeout(() => {
            setBusiness(fakeBusiness)
            setLoading(false)
        }, 300)
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-pulse text-2xl">⏳</div>
            </div>
        )
    }

    if (!business) return null

    const renderStars = (rating: number) => {
        const stars = []
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= rating ? 'text-yellow-500' : 'text-zinc-300'}>
                    ★
                </span>
            )
        }
        return stars
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/servicos" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg">Detalhes</h1>
                    <div className="w-10" />
                </div>
            </header>
            <div className="h-[60px]" />

            {/* Conteúdo */}
            <main className="px-4 py-6 max-w-lg mx-auto pb-32">
                {/* Header da empresa */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center text-4xl">
                        {business.category.icon}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold">{business.name}</h1>
                            {business.verified && (
                                <span className="text-primary text-lg" title="Verificado">✓</span>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500">{business.category.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold">{business.rating.toFixed(1)}</span>
                            <span className="text-zinc-400">({business.total_reviews} avaliações)</span>
                        </div>
                    </div>
                </div>

                {/* Descrição */}
                {business.description && (
                    <div className="mb-6">
                        <h2 className="font-semibold mb-2">Sobre</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                            {business.description}
                        </p>
                    </div>
                )}

                {/* Informações */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-6">
                    {business.neighborhood && (
                        <div className="flex items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-xl">📍</span>
                            <div>
                                <p className="text-sm text-zinc-500">Localização</p>
                                <p className="font-medium">{business.neighborhood}</p>
                                {business.address && (
                                    <p className="text-sm text-zinc-500">{business.address}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {business.working_hours && (
                        <div className="flex items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-xl">🕐</span>
                            <div>
                                <p className="text-sm text-zinc-500">Horário</p>
                                <p className="font-medium">{business.working_hours}</p>
                            </div>
                        </div>
                    )}

                    {business.email && (
                        <div className="flex items-center gap-3 p-4">
                            <span className="text-xl">📧</span>
                            <div>
                                <p className="text-sm text-zinc-500">Email</p>
                                <a href={`mailto:${business.email}`} className="font-medium text-primary">
                                    {business.email}
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Avaliações */}
                <div className="mb-6">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        ⭐ Avaliações ({business.reviews.length})
                    </h2>

                    {business.reviews.length > 0 ? (
                        <div className="space-y-4">
                            {business.reviews.map((review) => (
                                <div key={review.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold">
                                            {review.user.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{review.user.name || 'Usuário'}</p>
                                            <div className="flex items-center gap-1 text-sm">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-center py-6">Nenhuma avaliação ainda</p>
                    )}
                </div>
            </main>

            {/* Botões de contato */}
            <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-2 max-w-lg mx-auto">
                    {business.phone && (
                        <a
                            href={`tel:${business.phone}`}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            📞 Ligar
                        </a>
                    )}
                    {business.whatsapp && (
                        <a
                            href={getWhatsAppLink(business.whatsapp, `Olá! Vi sua empresa "${business.name}" no Vizinho PB.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
                        >
                            💬 WhatsApp
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
