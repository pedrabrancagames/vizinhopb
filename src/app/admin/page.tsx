'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { APPROVAL_STATUS, BUSINESS_CATEGORIES } from '@/lib/constants'

interface Business {
    id: string
    name: string
    neighborhood: string | null
    approval_status: 'pending' | 'approved' | 'rejected'
    verified: boolean
    rating: number
    total_reviews: number
    category: string
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

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const supabase = createClient()

        // Buscar estatísticas reais
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count: usersCount } = await (supabase as any)
            .from('users')
            .select('*', { count: 'exact', head: true })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count: requestsCount } = await (supabase as any)
            .from('requests')
            .select('*', { count: 'exact', head: true })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: businessesData, error } = await (supabase as any)
            .from('businesses')
            .select('*')
            .order('created_at', { ascending: false })

        const businessesList = businessesData || []
        const pendingCount = businessesList.filter((b: Business) => b.approval_status === 'pending').length

        setStats({
            totalUsers: usersCount || 0,
            totalRequests: requestsCount || 0,
            totalBusinesses: businessesList.length,
            pendingBusinesses: pendingCount,
        })

        setBusinesses(businessesList)
        setLoading(false)
    }

    const filteredBusinesses = filterStatus === 'all'
        ? businesses
        : businesses.filter(b => b.approval_status === filterStatus)

    const handleApprove = async (id: string) => {
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('businesses')
            .update({ approval_status: 'approved', verified: true })
            .eq('id', id)

        if (!error) {
            setBusinesses(businesses.map(b =>
                b.id === id ? { ...b, approval_status: 'approved' as const, verified: true } : b
            ))
            setStats(s => ({ ...s, pendingBusinesses: s.pendingBusinesses - 1 }))
        }
    }

    const handleReject = async (id: string) => {
        const reason = prompt('Motivo da rejeição:')
        if (!reason) return

        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('businesses')
            .update({ approval_status: 'rejected' })
            .eq('id', id)

        if (!error) {
            setBusinesses(businesses.map(b =>
                b.id === id ? { ...b, approval_status: 'rejected' as const } : b
            ))
            setStats(s => ({ ...s, pendingBusinesses: s.pendingBusinesses - 1 }))
        }
    }

    const getCategoryInfo = (categoryId: string) => {
        const cat = BUSINESS_CATEGORIES.find(c => c.id === categoryId)
        return cat || { name: categoryId, icon: '🏢' }
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

                {/* Atalhos */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-4">⚡ Atalhos</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/admin/usuarios"
                            className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md hover:border-primary/30 transition-all"
                        >
                            <span className="text-2xl mb-2 block">👥</span>
                            <h3 className="font-semibold">Gerenciar Usuários</h3>
                            <p className="text-sm text-zinc-500">Editar, bloquear, excluir</p>
                        </Link>
                        <Link
                            href="/admin/pedidos"
                            className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md hover:border-primary/30 transition-all"
                        >
                            <span className="text-2xl mb-2 block">📦</span>
                            <h3 className="font-semibold">Gerenciar Pedidos</h3>
                            <p className="text-sm text-zinc-500">Editar e excluir</p>
                        </Link>
                        <Link
                            href="/admin/moderadores"
                            className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md hover:border-primary/30 transition-all"
                        >
                            <span className="text-2xl mb-2 block">🛡️</span>
                            <h3 className="font-semibold">Gerenciar Equipe</h3>
                            <p className="text-sm text-zinc-500">Moderadores e admins</p>
                        </Link>
                        <Link
                            href="/admin/empresas/nova"
                            className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md hover:border-primary/30 transition-all"
                        >
                            <span className="text-2xl mb-2 block">🏢</span>
                            <h3 className="font-semibold">Nova Empresa</h3>
                            <p className="text-sm text-zinc-500">Cadastrar serviço</p>
                        </Link>
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
                    ) : filteredBusinesses.length > 0 ? (
                        <div className="space-y-3">
                            {filteredBusinesses.map((business) => {
                                const categoryInfo = getCategoryInfo(business.category)
                                return (
                                    <div
                                        key={business.id}
                                        className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                                                    {categoryInfo.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        {business.name}
                                                        {business.verified && <span className="text-primary text-sm">✓</span>}
                                                    </h3>
                                                    <p className="text-sm text-zinc-500">
                                                        {categoryInfo.name} • {business.neighborhood || 'N/I'}
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
                                                        href={`/servicos/${business.id}`}
                                                        className="flex-1 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium text-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                    >
                                                        👁️ Ver
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
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <span className="text-4xl mb-4 block">🏢</span>
                            <p className="text-zinc-500">
                                {filterStatus === 'all'
                                    ? 'Nenhuma empresa cadastrada ainda'
                                    : 'Nenhuma empresa neste status'}
                            </p>
                            <Link
                                href="/admin/empresas/nova"
                                className="inline-block mt-4 py-2 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg"
                            >
                                ➕ Cadastrar Empresa
                            </Link>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
