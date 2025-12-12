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
    blocked: boolean
    created_at: string
    total_requests: number
    total_helps: number
    rating_as_requester: number
    rating_as_helper: number
}

export default function AdminUsuariosPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'all' | 'blocked' | 'active'>('all')
    const [updating, setUpdating] = useState<string | null>(null)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [editForm, setEditForm] = useState({ name: '', neighborhood: '' })

    const neighborhoods = [
        'Centro', 'Manaíra', 'Tambaú', 'Cabo Branco', 'Bessa',
        'Altiplano', 'Bancários', 'Mangabeira', 'Torre',
        'Expedicionários', 'Miramar', 'Brisamar', 'Outro'
    ]

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

    const handleBlock = async (userId: string) => {
        setUpdating(userId)
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('users')
            .update({ blocked: true })
            .eq('id', userId)

        if (!error) {
            setUsers(users.map(u => u.id === userId ? { ...u, blocked: true } : u))
        }
        setUpdating(null)
    }

    const handleUnblock = async (userId: string) => {
        setUpdating(userId)
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('users')
            .update({ blocked: false })
            .eq('id', userId)

        if (!error) {
            setUsers(users.map(u => u.id === userId ? { ...u, blocked: false } : u))
        }
        setUpdating(null)
    }

    const handleDelete = async (userId: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return
        setUpdating(userId)
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('users')
            .delete()
            .eq('id', userId)

        if (!error) {
            setUsers(users.filter(u => u.id !== userId))
        }
        setUpdating(null)
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setEditForm({ name: user.name || '', neighborhood: user.neighborhood || '' })
    }

    const handleSaveEdit = async () => {
        if (!editingUser) return
        setUpdating(editingUser.id)
        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('users')
            .update({
                name: editForm.name || null,
                neighborhood: editForm.neighborhood || null
            })
            .eq('id', editingUser.id)

        if (!error) {
            setUsers(users.map(u => u.id === editingUser.id
                ? { ...u, name: editForm.name, neighborhood: editForm.neighborhood }
                : u
            ))
        }
        setEditingUser(null)
        setUpdating(null)
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = searchQuery === '' ||
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filter === 'all' ||
            (filter === 'blocked' && user.blocked) ||
            (filter === 'active' && !user.blocked)

        return matchesSearch && matchesFilter
    })

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/admin" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg">👥 Gerenciar Usuários</h1>
                    <div className="w-10" />
                </div>
            </header>
            <div className="h-[60px]" />

            <main className="px-4 py-6 max-w-4xl mx-auto pb-8">
                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 text-center border border-zinc-100 dark:border-zinc-800">
                        <p className="text-2xl font-bold text-primary">{users.length}</p>
                        <p className="text-xs text-zinc-500">Total</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 text-center border border-zinc-100 dark:border-zinc-800">
                        <p className="text-2xl font-bold text-green-600">{users.filter(u => !u.blocked).length}</p>
                        <p className="text-xs text-zinc-500">Ativos</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 text-center border border-zinc-100 dark:border-zinc-800">
                        <p className="text-2xl font-bold text-red-600">{users.filter(u => u.blocked).length}</p>
                        <p className="text-xs text-zinc-500">Bloqueados</p>
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
                <div className="flex gap-2 mb-4">
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'active', label: '✅ Ativos' },
                        { key: 'blocked', label: '🚫 Bloqueados' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as 'all' | 'blocked' | 'active')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f.key
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
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className={`bg-white dark:bg-zinc-900 rounded-xl p-4 border ${user.blocked
                                    ? 'border-red-200 dark:border-red-900/50'
                                    : 'border-zinc-100 dark:border-zinc-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden ${user.blocked
                                        ? 'bg-red-400'
                                        : 'bg-gradient-to-br from-primary to-primary-light'
                                        }`}>
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            user.name?.charAt(0).toUpperCase() || '?'
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold truncate">{user.name || 'Usuário'}</h3>
                                            {user.blocked && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">
                                                    🚫 Bloqueado
                                                </span>
                                            )}
                                            {user.role !== 'user' && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">
                                                    {user.role === 'admin' ? '👑' : '🛡️'} {user.role}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 text-center text-sm mb-3">
                                    <div>
                                        <p className="font-semibold">{user.total_requests || 0}</p>
                                        <p className="text-xs text-zinc-500">Pedidos</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">{user.total_helps || 0}</p>
                                        <p className="text-xs text-zinc-500">Ajudas</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">⭐ {(user.rating_as_requester || 5).toFixed(1)}</p>
                                        <p className="text-xs text-zinc-500">Solicitante</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">⭐ {(user.rating_as_helper || 5).toFixed(1)}</p>
                                        <p className="text-xs text-zinc-500">Ajudante</p>
                                    </div>
                                </div>

                                <div className="text-xs text-zinc-500 mb-3" suppressHydrationWarning>
                                    📍 {user.neighborhood || 'N/I'} • Cadastrado {formatDistanceToNow(user.created_at)}
                                </div>

                                {/* Ações */}
                                <div className="flex gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="flex-1 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
                                    >
                                        ✏️ Editar
                                    </button>
                                    {user.blocked ? (
                                        <button
                                            onClick={() => handleUnblock(user.id)}
                                            disabled={updating === user.id}
                                            className="flex-1 py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                                        >
                                            {updating === user.id ? '...' : '✅ Desbloquear'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleBlock(user.id)}
                                            disabled={updating === user.id}
                                            className="flex-1 py-2 px-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50"
                                        >
                                            {updating === user.id ? '...' : '🚫 Bloquear'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        disabled={updating === user.id}
                                        className="py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
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

            {/* Modal de edição */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">✏️ Editar Usuário</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nome</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Bairro</label>
                                <select
                                    value={editForm.neighborhood}
                                    onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none"
                                >
                                    <option value="">Selecione...</option>
                                    {neighborhoods.map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 py-3 px-4 border border-zinc-300 dark:border-zinc-700 rounded-xl font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={updating === editingUser.id}
                                className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl disabled:opacity-50"
                            >
                                {updating === editingUser.id ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
