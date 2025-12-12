'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import TabNavigation from '@/components/layout/TabNavigation'
import { createClient } from '@/lib/supabase/client'
import { OFFER_STATUS, REQUEST_CATEGORIES } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'

interface Offer {
    id: string
    status: keyof typeof OFFER_STATUS
    created_at: string
    message: string | null
    request: {
        id: string
        title: string
        category: string
        user: {
            name: string | null
            neighborhood: string | null
        }
    }
}

export default function MinhasAjudasPage() {
    const router = useRouter()
    const [offers, setOffers] = useState<Offer[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        loadOffers()
    }, [])

    const loadOffers = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('offers')
            .select(`
        *,
        request:requests(
          id,
          title,
          category,
          user:users!requests_user_id_fkey(name, neighborhood)
        )
      `)
            .eq('helper_id', user.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setOffers(data)
        }
        setLoading(false)
    }

    const filteredOffers = filter === 'all'
        ? offers
        : offers.filter(o => o.status === filter)

    const getStatusInfo = (status: keyof typeof OFFER_STATUS) => {
        return OFFER_STATUS[status] || { label: status, color: 'gray' }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header user={null} notificationCount={0} />
            <TabNavigation />

            <main className="px-4 py-6 max-w-lg mx-auto pb-8">
                <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
                    🤝 Minhas Ajudas
                </h1>

                {/* Filtros */}
                <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
                    {[
                        { key: 'all', label: 'Todas' },
                        { key: 'pending', label: 'Pendentes' },
                        { key: 'accepted', label: 'Aceitas' },
                        { key: 'borrowed', label: 'Emprestado' },
                        { key: 'returned', label: 'Devolvido' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f.key
                                    ? 'bg-secondary text-white'
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
                ) : filteredOffers.length > 0 ? (
                    <div className="space-y-3">
                        {filteredOffers.map((offer) => {
                            const statusInfo = getStatusInfo(offer.status)
                            const category = REQUEST_CATEGORIES.find(c => c.id === offer.request.category)

                            return (
                                <Link key={offer.id} href={`/pedido/${offer.request.id}`}>
                                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusInfo.color === 'green'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : statusInfo.color === 'blue'
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : statusInfo.color === 'red'
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                                                }`}>
                                                {statusInfo.label}
                                            </span>
                                            <span className="text-lg">{category?.icon}</span>
                                        </div>

                                        <h3 className="font-semibold mb-2 line-clamp-2">{offer.request.title}</h3>

                                        <div className="flex items-center justify-between text-sm text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                👤 {offer.request.user.name || 'Usuário'}
                                                {offer.request.user.neighborhood && (
                                                    <span> • 📍 {offer.request.user.neighborhood}</span>
                                                )}
                                            </span>
                                        </div>

                                        <div className="mt-2 text-xs text-zinc-400" suppressHydrationWarning>
                                            Oferecido {formatDistanceToNow(offer.created_at)}
                                        </div>

                                        {offer.message && (
                                            <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 italic">
                                                "{offer.message}"
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="text-5xl mb-4 block">🤝</span>
                        <h2 className="text-lg font-bold mb-2">Nenhuma ajuda encontrada</h2>
                        <p className="text-zinc-500 mb-6">
                            {filter === 'all'
                                ? 'Você ainda não ofereceu ajuda em nenhum pedido'
                                : 'Nenhuma ajuda com esse status'}
                        </p>
                        <Link
                            href="/"
                            className="inline-block py-3 px-6 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-xl transition-all"
                        >
                            🔍 Ver Pedidos
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
