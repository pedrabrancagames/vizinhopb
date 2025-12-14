'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import TabNavigation from '@/components/layout/TabNavigation'
import CategoryFilter from '@/components/requests/CategoryFilter'
import RequestCard from '@/components/requests/RequestCard'
import { createClient } from '@/lib/supabase/client'
import { URGENCY_LEVELS } from '@/lib/constants'

// Importa o mapa dinamicamente para evitar SSR
const NeighborsMap = dynamic(
    () => import('@/components/map/NeighborsMap'),
    {
        ssr: false,
        loading: () => (
            <div className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-zinc-400">🗺️ Carregando mapa...</span>
            </div>
        )
    }
)

interface Request {
    id: string
    title: string
    category: string
    urgency: 'low' | 'medium' | 'high'
    neighborhood?: string
    created_at: string
    offers_count?: number
    user?: { name: string }
    user_id?: string
}

type SortOption = 'recent' | 'urgent' | 'offers'

export default function HomePage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [requests, setRequests] = useState<Request[]>([])
    const [loading, setLoading] = useState(true)
    const [notificationCount, setNotificationCount] = useState(0)

    // New filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUrgency, setSelectedUrgency] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState<SortOption>('recent')

    useEffect(() => {
        loadRequests()
    }, [])

    const loadRequests = async () => {
        const supabase = createClient()

        // Buscar pedidos em aberto
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('requests')
            .select('*')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(50)

        if (!error && data) {
            // Buscar usuários e contar ofertas
            const userIds = [...new Set(data.map((r: Request) => r.user_id))]

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: usersData } = await (supabase as any)
                .from('users')
                .select('id, name, neighborhood')
                .in('id', userIds.length > 0 ? userIds : ['none'])

            const usersMap = new Map(usersData?.map((u: { id: string; name: string; neighborhood: string }) => [u.id, u]) || [])

            // Contar ofertas
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: offersData } = await (supabase as any)
                .from('offers')
                .select('request_id')

            const offersCounts = new Map<string, number>()
            offersData?.forEach((o: { request_id: string }) => {
                offersCounts.set(o.request_id, (offersCounts.get(o.request_id) || 0) + 1)
            })

            const requestsWithUsers = data.map((r: Request) => {
                const user = usersMap.get(r.user_id) as { name: string; neighborhood: string } | undefined
                return {
                    ...r,
                    neighborhood: user?.neighborhood || r.neighborhood,
                    user: { name: user?.name || 'Usuário' },
                    offers_count: offersCounts.get(r.id) || 0
                }
            })

            setRequests(requestsWithUsers)
        }
        setLoading(false)
    }

    // Advanced filtering and sorting
    const filteredRequests = useMemo(() => {
        let result = [...requests]

        // Filter by category
        if (selectedCategory) {
            result = result.filter(r => r.category === selectedCategory)
        }

        // Filter by urgency
        if (selectedUrgency) {
            result = result.filter(r => r.urgency === selectedUrgency)
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(r =>
                r.title.toLowerCase().includes(query) ||
                r.neighborhood?.toLowerCase().includes(query)
            )
        }

        // Sort
        switch (sortBy) {
            case 'urgent':
                const urgencyOrder = { high: 0, medium: 1, low: 2 }
                result.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
                break
            case 'offers':
                result.sort((a, b) => (b.offers_count || 0) - (a.offers_count || 0))
                break
            case 'recent':
            default:
                result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }

        return result
    }, [requests, selectedCategory, selectedUrgency, searchQuery, sortBy])

    return (
        <div className="min-h-screen">
            {/* Header */}
            <Header user={null} notificationCount={notificationCount} />

            {/* Navegação por abas */}
            <TabNavigation />

            {/* Conteúdo principal */}
            <main className="pb-24 pt-4">
                {/* Mapa de vizinhos */}
                <div className="px-4 mb-6">
                    <NeighborsMap className="h-48 glass rounded-xl overflow-hidden shadow-lg" />
                </div>

                {/* Search Bar */}
                <div className="px-4 mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="🔍 Buscar pedidos..."
                            className="input-field pl-4 pr-10"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters Row */}
                <div className="px-4 mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
                    {/* Urgency Filter */}
                    <select
                        value={selectedUrgency || ''}
                        onChange={(e) => setSelectedUrgency(e.target.value || null)}
                        className="px-3 py-2 rounded-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                        <option value="">Todas urgências</option>
                        {Object.entries(URGENCY_LEVELS).map(([key, val]) => (
                            <option key={key} value={key}>{val.icon} {val.label}</option>
                        ))}
                    </select>

                    {/* Sort Options */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-2 rounded-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                        <option value="recent">📅 Mais recentes</option>
                        <option value="urgent">🔴 Mais urgentes</option>
                        <option value="offers">💬 Mais ofertas</option>
                    </select>
                </div>

                {/* Filtro de categorias */}
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                {/* Feed de pedidos */}
                <section className="px-4">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gradient">
                        📢 Pedidos perto de você
                        {filteredRequests.length > 0 && (
                            <span className="text-sm font-normal text-zinc-500">
                                ({filteredRequests.length})
                            </span>
                        )}
                    </h2>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="glass rounded-xl p-4 animate-pulse h-32" />
                            ))}
                        </div>
                    ) : filteredRequests.length > 0 ? (
                        <div className="space-y-4 animate-fade-in">
                            {filteredRequests.map((request) => (
                                <RequestCard key={request.id} request={request} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 glass rounded-xl">
                            <span className="text-4xl mb-4 block animate-bounce">📭</span>
                            <p className="text-zinc-500 mb-2">
                                {searchQuery || selectedCategory || selectedUrgency
                                    ? 'Nenhum pedido encontrado com esses filtros'
                                    : 'Nenhum pedido aberto no momento'}
                            </p>
                            <p className="text-sm text-zinc-400">
                                {searchQuery || selectedCategory || selectedUrgency
                                    ? 'Tente ajustar os filtros'
                                    : 'Seja o primeiro a pedir algo!'}
                            </p>
                        </div>
                    )}
                </section>
            </main>

            {/* Botão flutuante para novo pedido */}
            <Link
                href="/novo-pedido"
                className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 z-20 animate-slide-in"
                aria-label="Criar novo pedido"
            >
                ➕
            </Link>
        </div>
    )
}
