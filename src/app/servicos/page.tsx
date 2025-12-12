'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import TabNavigation from '@/components/layout/TabNavigation'
import { BUSINESS_CATEGORIES } from '@/lib/constants'
import { getWhatsAppLink, formatPhoneNumber } from '@/lib/utils'

interface Business {
    id: string
    name: string
    description: string | null
    phone: string | null
    whatsapp: string | null
    neighborhood: string | null
    category: string
    rating: number
    total_reviews: number
    verified: boolean
}

export default function ServicosPage() {
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadBusinesses()
    }, [])

    const loadBusinesses = async () => {
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('businesses')
            .select('*')
            .eq('approval_status', 'approved')
            .order('rating', { ascending: false })

        if (!error && data) {
            setBusinesses(data)
        }
        setLoading(false)
    }

    const filteredBusinesses = selectedCategory
        ? businesses.filter(b => b.category === selectedCategory)
        : businesses

    const getCategoryInfo = (categoryId: string) => {
        const cat = BUSINESS_CATEGORIES.find(c => c.id === categoryId)
        return cat || { name: categoryId, icon: '🏢' }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header user={null} notificationCount={0} />
            <TabNavigation />

            <main className="px-4 py-4 max-w-lg mx-auto pb-8">
                <h1 className="text-xl font-bold mb-4">🏢 Serviços Locais</h1>

                {/* Filtro de categorias */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === null
                            ? 'bg-primary text-white'
                            : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100'
                            }`}
                    >
                        Todos
                    </button>
                    {BUSINESS_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${selectedCategory === cat.id
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Lista de empresas */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-4 animate-pulse">
                                <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredBusinesses.length > 0 ? (
                    <div className="space-y-3">
                        {filteredBusinesses.map((business) => {
                            const categoryInfo = getCategoryInfo(business.category)
                            return (
                                <div
                                    key={business.id}
                                    className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                                            {categoryInfo.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold truncate">{business.name}</h3>
                                                {business.verified && (
                                                    <span className="text-primary text-sm">✓</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-500">{categoryInfo.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-yellow-500">⭐</span>
                                                <span className="text-sm font-medium">{business.rating.toFixed(1)}</span>
                                                <span className="text-xs text-zinc-400">({business.total_reviews} avaliações)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {business.description && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                                            {business.description}
                                        </p>
                                    )}

                                    <div className="text-xs text-zinc-500 mb-3">
                                        📍 {business.neighborhood || 'Local não informado'}
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                        <Link
                                            href={`/servicos/${business.id}`}
                                            className="flex-1 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium text-center hover:bg-zinc-200 transition-colors"
                                        >
                                            👁️ Ver mais
                                        </Link>
                                        {business.phone && (
                                            <a
                                                href={`tel:${business.phone}`}
                                                className="py-2 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                            >
                                                📞
                                            </a>
                                        )}
                                        {business.whatsapp && (
                                            <a
                                                href={getWhatsAppLink(business.whatsapp, `Olá! Vi seu serviço no Vizinho PB`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                                            >
                                                💬
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="text-4xl mb-4 block">🏢</span>
                        <p className="text-zinc-500 mb-2">
                            {selectedCategory
                                ? 'Nenhum serviço encontrado nesta categoria'
                                : 'Nenhum serviço cadastrado ainda'}
                        </p>
                        <p className="text-sm text-zinc-400">
                            Em breve teremos mais opções!
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
