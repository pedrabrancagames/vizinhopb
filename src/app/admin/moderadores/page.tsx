'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from '@/lib/utils'

interface User {
    id: string
    name: string | null
    email: string
    avatar_url: string | null
    role: 'user' | 'moderator' | 'admin'
    neighborhood: string | null
    created_at: string
    total_requests: number
    total_helps: number
}

export default function ModeradoresPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'all' | 'moderator' | 'admin'>('all')
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setUsers(data)
        }
        setLoading(false)
    }

    const handlePromote = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
        setUpdating(userId)
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('users')
            .update({ role: newRole })
            .eq('id', userId)

        if (!error) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        }
        setUpdating(null)
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = searchQuery === '' ||
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filter === 'all' || user.role === filter

        return matchesSearch && matchesFilter
    })

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return { label: 'Admin', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '👑' }
            case 'moderator':
                return { label: 'Moderador', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '🛡️' }
            default:
                return { label: 'Usuário', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400', icon: '👤' }
        }
    }

    const moderatorsCount = users.filter(u => u.role === 'moderator').length
    const adminsCount = users.filter(u => u.role === 'admin').length

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/admin" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg">Gerenciar Equipe</h1>
                    <div className="w-10" />
                </div>
            </header>
            <div className="h-[60px]" />

            <main className="px-4 py-6 max-w-4xl mx-auto pb-8">
                {/* Resumo */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-900/50">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{adminsCount}</p>
                        <p className="text-sm text-red-600/70 dark:text-red-400/70">👑 Admins</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{moderatorsCount}</p>
                        <p className="text-sm text-blue-600/70 dark:text-blue-400/70">🛡️ Moderadores</p>
                    </div>
                </div>

                {/* Busca */}
                <div className="mb-4">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nome ou email..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mb-4 overflow-x-auto">
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'admin', label: '👑 Admins' },
                        { key: 'moderator', label: '🛡️ Moderadores' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as 'all' | 'moderator' | 'admin')}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f.key
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                }`}
                        >
                            {f.label}
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
                ) : filteredUsers.length > 0 ? (
                    <div className="space-y-3">
                        {filteredUsers.map((user) => {
                            const roleBadge = getRoleBadge(user.role)
                            return (
                                <div
                                    key={user.id}
                                    className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                user.name?.charAt(0).toUpperCase() || '?'
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold truncate">{user.name || 'Usuário'}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}>
                                                    {roleBadge.icon} {roleBadge.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-zinc-500 mb-3">
                                        <span>📍 {user.neighborhood || 'N/I'}</span>
                                        <span>📦 {user.total_requests || 0} pedidos • 🤝 {user.total_helps || 0} ajudas</span>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                        {user.role === 'user' && (
                                            <button
                                                onClick={() => handlePromote(user.id, 'moderator')}
                                                disabled={updating === user.id}
                                                className="flex-1 py-2 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                                            >
                                                {updating === user.id ? '...' : '🛡️ Promover a Moderador'}
                                            </button>
                                        )}
                                        {user.role === 'moderator' && (
                                            <>
                                                <button
                                                    onClick={() => handlePromote(user.id, 'admin')}
                                                    disabled={updating === user.id}
                                                    className="flex-1 py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                                                >
                                                    {updating === user.id ? '...' : '👑 Promover a Admin'}
                                                </button>
                                                <button
                                                    onClick={() => handlePromote(user.id, 'user')}
                                                    disabled={updating === user.id}
                                                    className="flex-1 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                                >
                                                    {updating === user.id ? '...' : '👤 Remover Moderador'}
                                                </button>
                                            </>
                                        )}
                                        {user.role === 'admin' && (
                                            <div className="flex-1 py-2 px-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-lg text-sm text-center">
                                                Administrador do sistema
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="text-4xl mb-4 block">👥</span>
                        <p className="text-zinc-500">
                            {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado ainda'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
