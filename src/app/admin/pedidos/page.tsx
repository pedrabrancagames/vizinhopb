'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from '@/lib/utils'
import { REQUEST_STATUS, URGENCY_LEVELS, REQUEST_CATEGORIES } from '@/lib/constants'

interface Request {
    id: string
    title: string
    description: string | null
    category: string
    urgency: 'low' | 'medium' | 'high'
    status: keyof typeof REQUEST_STATUS
    created_at: string
    user: {
        id: string
        name: string | null
        email: string
    }
    offers_count: number
}

export default function AdminPedidosPage() {
    const [requests, setRequests] = useState<Request[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [updating, setUpdating] = useState<string | null>(null)
    const [editingRequest, setEditingRequest] = useState<Request | null>(null)
    const [editForm, setEditForm] = useState({ title: '', description: '', status: '' })

    // Dados fake
    const fakeRequests: Request[] = [
        {
            id: '1', title: 'Preciso de uma furadeira', description: 'Para fazer alguns furos na parede',
            category: 'ferramentas', urgency: 'medium', status: 'open',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: { id: '1', name: 'João Silva', email: 'joao@email.com' },
            offers_count: 3
        },
        {
            id: '2', title: 'Escada de 6 degraus', description: 'Para trocar lâmpada do teto',
            category: 'ferramentas', urgency: 'high', status: 'in_progress',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            user: { id: '2', name: 'Maria Santos', email: 'maria@email.com' },
            offers_count: 1
        },
        {
            id: '3', title: 'Forma de bolo grande', description: null,
            category: 'cozinha', urgency: 'low', status: 'completed',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            user: { id: '3', name: 'Carlos Lima', email: 'carlos@email.com' },
            offers_count: 2
        },
        {
            id: '4', title: 'Carrinho de mão', description: 'Para obra pequena',
            category: 'jardim', urgency: 'medium', status: 'cancelled',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            user: { id: '4', name: 'Ana Paula', email: 'ana@email.com' },
            offers_count: 0
        },
    ]

    useEffect(() => {
        setTimeout(() => {
            setRequests(fakeRequests)
            setLoading(false)
        }, 300)
    }, [])

    const handleDelete = async (requestId: string) => {
        if (!confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) return
        setUpdating(requestId)
        await new Promise(r => setTimeout(r, 500))
        setRequests(requests.filter(r => r.id !== requestId))
        setUpdating(null)
    }

    const handleEdit = (request: Request) => {
        setEditingRequest(request)
        setEditForm({
            title: request.title,
            description: request.description || '',
            status: request.status
        })
    }

    const handleSaveEdit = async () => {
        if (!editingRequest) return
        setUpdating(editingRequest.id)
        await new Promise(r => setTimeout(r, 500))
        setRequests(requests.map(r => r.id === editingRequest.id
            ? { ...r, title: editForm.title, description: editForm.description, status: editForm.status as keyof typeof REQUEST_STATUS }
            : r
        ))
        setEditingRequest(null)
        setUpdating(null)
    }

    const filteredRequests = requests.filter(request => {
        const matchesSearch = searchQuery === '' ||
            request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterStatus === 'all' || request.status === filterStatus

        return matchesSearch && matchesFilter
    })

    const getStatusInfo = (status: keyof typeof REQUEST_STATUS) => {
        return REQUEST_STATUS[status] || { label: status, color: 'gray' }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/admin" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg">📦 Gerenciar Pedidos</h1>
                    <div className="w-10" />
                </div>
            </header>
            <div className="h-[60px]" />

            <main className="px-4 py-6 max-w-4xl mx-auto pb-8">
                {/* Estatísticas */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 text-center border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xl font-bold text-primary">{requests.filter(r => r.status === 'open').length}</p>
                        <p className="text-xs text-zinc-500">Abertos</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 text-center border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xl font-bold text-blue-600">{requests.filter(r => r.status === 'in_progress').length}</p>
                        <p className="text-xs text-zinc-500">Em andamento</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 text-center border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xl font-bold text-green-600">{requests.filter(r => r.status === 'completed').length}</p>
                        <p className="text-xs text-zinc-500">Concluídos</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 text-center border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xl font-bold text-red-600">{requests.filter(r => r.status === 'cancelled').length}</p>
                        <p className="text-xs text-zinc-500">Cancelados</p>
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
                            placeholder="Buscar por título ou usuário..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'open', label: '🟢 Abertos' },
                        { key: 'in_progress', label: '🔵 Em andamento' },
                        { key: 'completed', label: '✅ Concluídos' },
                        { key: 'cancelled', label: '❌ Cancelados' },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilterStatus(f.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterStatus === f.key
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
                                <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredRequests.map((request) => {
                            const statusInfo = getStatusInfo(request.status)
                            const urgency = URGENCY_LEVELS[request.urgency]
                            const category = REQUEST_CATEGORIES.find(c => c.id === request.category)

                            return (
                                <div
                                    key={request.id}
                                    className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{category?.icon}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${request.urgency === 'high'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : request.urgency === 'medium'
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {urgency.icon} {urgency.label}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color === 'green'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : statusInfo.color === 'blue'
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : statusInfo.color === 'red'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'
                                            }`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    <h3 className="font-semibold mb-1">{request.title}</h3>
                                    {request.description && (
                                        <p className="text-sm text-zinc-500 mb-2 line-clamp-2">{request.description}</p>
                                    )}

                                    <div className="flex items-center justify-between text-sm text-zinc-500 mb-3">
                                        <span>👤 {request.user.name || request.user.email}</span>
                                        <span>💬 {request.offers_count} ofertas</span>
                                    </div>

                                    <div className="text-xs text-zinc-400 mb-3" suppressHydrationWarning>
                                        Criado {formatDistanceToNow(request.created_at)}
                                    </div>

                                    {/* Ações */}
                                    <div className="flex gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                        <Link
                                            href={`/pedido/${request.id}`}
                                            className="flex-1 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium text-center hover:bg-zinc-200 transition-colors"
                                        >
                                            👁️ Ver
                                        </Link>
                                        <button
                                            onClick={() => handleEdit(request)}
                                            className="flex-1 py-2 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(request.id)}
                                            disabled={updating === request.id}
                                            className="py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        {filteredRequests.length === 0 && (
                            <div className="text-center py-12">
                                <span className="text-4xl mb-4 block">🔍</span>
                                <p className="text-zinc-500">Nenhum pedido encontrado</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal de edição */}
            {editingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">✏️ Editar Pedido</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Título</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Descrição</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none"
                                >
                                    {Object.entries(REQUEST_STATUS).map(([key, value]) => (
                                        <option key={key} value={key}>{value.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setEditingRequest(null)}
                                className="flex-1 py-3 px-4 border border-zinc-300 dark:border-zinc-700 rounded-xl font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={updating === editingRequest.id}
                                className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl disabled:opacity-50"
                            >
                                {updating === editingRequest.id ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
