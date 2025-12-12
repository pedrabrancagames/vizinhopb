'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import TabNavigation from '@/components/layout/TabNavigation'
import CategoryFilter from '@/components/requests/CategoryFilter'
import RequestCard from '@/components/requests/RequestCard'
import { createClient } from '@/lib/supabase/client'

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

export default function HomePage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [requests, setRequests] = useState<Request[]>([])
    const [loading, setLoading] = useState(true)
    const [notificationCount, setNotificationCount] = useState(0)

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
            .limit(20)

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

    // Filtra pedidos por categoria
    const filteredRequests = selectedCategory
        ? requests.filter(r => r.category === selectedCategory)
        : requests

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <Header user={null} notificationCount={notificationCount} />

            {/* Navegação por abas */}
            <TabNavigation />

            {/* Conteúdo principal */}
            <main className="pb-24">
                {/* Mapa de vizinhos */}
                <div className="px-4 py-4">
                    <NeighborsMap className="h-48" />
                </div>

                {/* Filtro de categorias */}
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                {/* Feed de pedidos */}
                <section className="px-4 py-4">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        📢 Pedidos perto de você
                    </h2>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-4 animate-pulse">
                                    <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : filteredRequests.length > 0 ? (
                        <div className="space-y-3">
                            {filteredRequests.map((request) => (
                                <RequestCard key={request.id} request={request} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <span className="text-4xl mb-4 block">📭</span>
                            <p className="text-zinc-500 mb-2">
                                {selectedCategory
                                    ? 'Nenhum pedido encontrado nesta categoria'
                                    : 'Nenhum pedido aberto no momento'}
                            </p>
                            <p className="text-sm text-zinc-400">
                                Seja o primeiro a pedir algo!
                            </p>
                        </div>
                    )}
                </section>
            </main>

            {/* Botão flutuante para novo pedido */}
            <Link
                href="/novo-pedido"
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 z-20"
                aria-label="Criar novo pedido"
            >
                ➕
            </Link>
        </div>
    )
}
