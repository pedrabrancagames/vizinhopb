'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import TabNavigation from '@/components/layout/TabNavigation'
import { createClient } from '@/lib/supabase/client'
import { REQUEST_STATUS, URGENCY_LEVELS, REQUEST_CATEGORIES } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'

interface Request {
    id: string
    title: string
    category: string
    urgency: 'low' | 'medium' | 'high'
    status: keyof typeof REQUEST_STATUS
    created_at: string
    offers: { id: string }[]
}

export default function MeusPedidosPage() {
    const router = useRouter()
    const [requests, setRequests] = useState<Request[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        loadRequests()
    }, [])

    const loadRequests = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('requests')
            .select('*, offers(id)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setRequests(data)
        }
        setLoading(false)
    }

    const filteredRequests = filter === 'all'
        ? requests
        : requests.filter(r => r.status === filter)

    const getStatusInfo = (status: keyof typeof REQUEST_STATUS) => {
        return REQUEST_STATUS[status] || { label: status, color: 'gray' }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header user={null} notificationCount={0} />
            <TabNavigation />

            <main className="px-4 py-6 max-w-lg mx-auto pb-24">
                <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
                    📦 Meus Pedidos
                </h1>

                {/* Filtros */}
                <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'open', label: 'Abertos' },
                        { key: 'in_progress', label: 'Em andamento' },
                        { key: 'completed', label: 'Concluídos' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f.key
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

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
                        {filteredRequests.map((request) => {
                            const statusInfo = getStatusInfo(request.status)
                            const urgency = URGENCY_LEVELS[request.urgency]
                            const category = REQUEST_CATEGORIES.find(c => c.id === request.category)

                            return (
                                <Link key={request.id} href={`/pedido/${request.id}`}>
                                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusInfo.color === 'green'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : statusInfo.color === 'blue'
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : statusInfo.color === 'yellow'
                                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            : statusInfo.color === 'orange'
                                                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                                                }`}>
                                                {statusInfo.label}
                                            </span>
                                            <span className="text-lg">{category?.icon}</span>
                                        </div>

                                        <h3 className="font-semibold mb-2 line-clamp-2">{request.title}</h3>

                                        <div className="flex items-center justify-between text-sm text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                {urgency.icon} {urgency.label}
                                            </span>
                                            <span suppressHydrationWarning>
                                                {formatDistanceToNow(request.created_at)}
                                            </span>
                                        </div>

                                        {request.offers?.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                                <span className="text-sm text-primary font-medium">
                                                    💬 {request.offers.length} {request.offers.length === 1 ? 'oferta' : 'ofertas'} de ajuda
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="text-5xl mb-4 block">📭</span>
                        <h2 className="text-lg font-bold mb-2">Nenhum pedido encontrado</h2>
                        <p className="text-zinc-500 mb-6">
                            {filter === 'all'
                                ? 'Você ainda não criou nenhum pedido'
                                : 'Nenhum pedido com esse status'}
                        </p>
                        <Link
                            href="/novo-pedido"
                            className="inline-block py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all"
                        >
                            ➕ Criar Pedido
                        </Link>
                    </div>
                )}
            </main>

            {/* Botão flutuante */}
            <Link
                href="/novo-pedido"
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 z-20"
            >
                ➕
            </Link>
        </div>
    )
}
