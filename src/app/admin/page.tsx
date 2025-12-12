'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { APPROVAL_STATUS } from '@/lib/constants'

interface Business {
    id: string
    name: string
    neighborhood: string | null
    approval_status: 'pending' | 'approved' | 'rejected'
    verified: boolean
    rating: number
    total_reviews: number
    category: {
        name: string
        icon: string
    }
}

interface Stats {
    totalUsers: number
    totalRequests: number
    totalBusinesses: number
    pendingBusinesses: number
}

export default function AdminPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalRequests: 0,
        totalBusinesses: 0,
        pendingBusinesses: 0,
    })

    // Dados fake para demonstração
    const fakeStats: Stats = {
        totalUsers: 156,
        totalRequests: 342,
        totalBusinesses: 28,
        pendingBusinesses: 3,
    }

    const fakeBusinesses: Business[] = [
        {
            id: '1',
            name: 'Elétrica Silva',
            neighborhood: 'Manaíra',
            approval_status: 'approved',
            verified: true,
            rating: 4.9,
            total_reviews: 45,
            category: { name: 'Eletricista', icon: '🔌' },
        },
        {
            id: '2',
            name: 'Pet Shop Amigo',
            neighborhood: 'Centro',
            approval_status: 'approved',
            verified: true,
            rating: 4.7,
            total_reviews: 32,
            category: { name: 'Pet/Veterinário', icon: '🐕' },
        },
        {
            id: '3',
            name: 'Encanador José',
            neighborhood: 'Tambaú',
            approval_status: 'pending',
            verified: false,
            rating: 0,
            total_reviews: 0,
            category: { name: 'Encanador', icon: '🚿' },
        },
        {
            id: '4',
            name: 'Limpeza Express',
            neighborhood: 'Bessa',
            approval_status: 'pending',
            verified: false,
            rating: 0,
            total_reviews: 0,
            category: { name: 'Limpeza', icon: '🧹' },
        },
        {
            id: '5',
            name: 'Pintura Total',
            neighborhood: 'Cabo Branco',
            approval_status: 'rejected',
            verified: false,
            rating: 0,
            total_reviews: 0,
            category: { name: 'Pintor', icon: '🎨' },
        },
    ]

    useEffect(() => {
        // Simular carregamento
        setTimeout(() => {
            setStats(fakeStats)
            setBusinesses(fakeBusinesses)
            setLoading(false)
        }, 500)
    }, [])

    const filteredBusinesses = filterStatus === 'all'
        ? businesses
        : businesses.filter(b => b.approval_status === filterStatus)

    const handleApprove = async (id: string) => {
        setBusinesses(businesses.map(b =>
            b.id === id ? { ...b, approval_status: 'approved' as const } : b
        ))
        setStats(s => ({ ...s, pendingBusinesses: s.pendingBusinesses - 1 }))
    }

    const handleReject = async (id: string) => {
        const reason = prompt('Motivo da rejeição:')
        if (!reason) return

        setBusinesses(businesses.map(b =>
            b.id === id ? { ...b, approval_status: 'rejected' as const } : b
        ))
        setStats(s => ({ ...s, pendingBusinesses: s.pendingBusinesses - 1 }))
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        🛡️ Painel Admin
                    </h1>
                    <div className="w-10" />
                </div>
            </header>
            <div className="h-[60px]" />

            <main className="px-4 py-6 max-w-4xl mx-auto">
                {/* Dashboard */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-4">📊 Dashboard</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800">
                            <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
                            <p className="text-sm text-zinc-500">Usuários</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800">
                            <p className="text-2xl font-bold text-secondary">{stats.totalRequests}</p>
                            <p className="text-sm text-zinc-500">Pedidos</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800">
                            <p className="text-2xl font-bold text-blue-600">{stats.totalBusinesses}</p>
                            <p className="text-sm text-zinc-500">Empresas</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800">
                            <p className="text-2xl font-bold text-yellow-600">{stats.pendingBusinesses}</p>
                            <p className="text-sm text-zinc-500">Pendentes</p>
                        </div>
                    </div>
                </section>

                {/* Gerenciar Empresas */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">🏢 Gerenciar Empresas</h2>
                        <Link
                            href="/admin/empresas/nova"
                            className="py-2 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-all"
                        >
                            ➕ Adicionar
                        </Link>
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                        {['all', 'pending', 'approved', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterStatus === status
                                        ? 'bg-primary text-white'
                                        : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                {status === 'all' ? 'Todos' : APPROVAL_STATUS[status as keyof typeof APPROVAL_STATUS]?.label || status}
                                {status === 'pending' && stats.pendingBusinesses > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                                        {stats.pendingBusinesses}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Lista */}
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-4 animate-pulse">
                                    <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-2" />
                                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredBusinesses.map((business) => (
                                <div
                                    key={business.id}
                                    className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                                                {business.category.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    {business.name}
                                                    {business.verified && <span className="text-primary text-sm">✓</span>}
                                                </h3>
                                                <p className="text-sm text-zinc-500">
                                                    {business.category.name} • {business.neighborhood}
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${business.approval_status === 'approved'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : business.approval_status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {APPROVAL_STATUS[business.approval_status]?.icon} {APPROVAL_STATUS[business.approval_status]?.label}
                                        </span>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                        {business.approval_status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(business.id)}
                                                    className="flex-1 py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                >
                                                    ✅ Aprovar
                                                </button>
                                                <button
                                                    onClick={() => handleReject(business.id)}
                                                    className="flex-1 py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                >
                                                    ❌ Reprovar
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href={`/admin/empresas/${business.id}`}
                                                    className="flex-1 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium text-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                >
                                                    ✏️ Editar
                                                </Link>
                                                <button
                                                    className="py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {filteredBusinesses.length === 0 && (
                                <div className="text-center py-12">
                                    <span className="text-4xl mb-4 block">📭</span>
                                    <p className="text-zinc-500">Nenhuma empresa neste status</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
