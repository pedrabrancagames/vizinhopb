'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { REQUEST_CATEGORIES, URGENCY_LEVELS } from '@/lib/constants'

export default function NovoPedidoPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium')
    const [neededUntil, setNeededUntil] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const supabase = createClient()

            // Verificar autenticação
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Criar pedido
            const { error: insertError } = await supabase
                .from('requests')
                .insert({
                    user_id: user.id,
                    title,
                    description,
                    category,
                    urgency,
                    needed_until: neededUntil || null,
                })

            if (insertError) {
                setError(insertError.message)
                return
            }

            // Redirecionar para home
            router.push('/')
            router.refresh()
        } catch (err) {
            setError('Erro ao criar pedido. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header simples */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg">Novo Pedido</h1>
                    <div className="w-10" />
                </div>
            </header>
            <div className="h-[60px]" />

            {/* Formulário */}
            <main className="px-4 py-6 max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Título */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-2">
                            O que você precisa? <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Furadeira, escada, forma de bolo..."
                            required
                            maxLength={100}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Categoria */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-2">
                            Categoria <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {REQUEST_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${category === cat.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                                        }`}
                                >
                                    <span className="text-2xl">{cat.icon}</span>
                                    <span className="text-xs text-center">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-2">
                            Descrição
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva melhor o que você precisa, para que vai usar, etc."
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                        />
                        <p className="text-xs text-zinc-500 mt-1">{description.length}/500</p>
                    </div>

                    {/* Urgência */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Urgência <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['low', 'medium', 'high'] as const).map((level) => {
                                const info = URGENCY_LEVELS[level]
                                return (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setUrgency(level)}
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${urgency === level
                                                ? level === 'high'
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                    : level === 'medium'
                                                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                                        : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                                            }`}
                                    >
                                        <span>{info.icon}</span>
                                        <span className="font-medium">{info.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Data limite */}
                    <div>
                        <label htmlFor="neededUntil" className="block text-sm font-medium mb-2">
                            Preciso até (opcional)
                        </label>
                        <input
                            id="neededUntil"
                            type="date"
                            value={neededUntil}
                            onChange={(e) => setNeededUntil(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Botão de envio */}
                    <button
                        type="submit"
                        disabled={loading || !title || !category}
                        className="w-full py-4 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Publicando...
                            </>
                        ) : (
                            <>
                                📢 Publicar Pedido
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    )
}
