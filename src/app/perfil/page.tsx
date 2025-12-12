'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
    id: string
    name: string | null
    email: string
    avatar_url: string | null
    bio: string | null
    neighborhood: string | null
    city: string | null
    rating_as_requester: number
    rating_as_helper: number
    total_requests: number
    total_helps: number
    created_at: string
}

export default function PerfilPage() {
    const router = useRouter()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        neighborhood: '',
    })

    const neighborhoods = [
        'Centro', 'Manaíra', 'Tambaú', 'Cabo Branco', 'Bessa',
        'Altiplano', 'Bancários', 'Mangabeira', 'Torre',
        'Expedicionários', 'Miramar', 'Brisamar', 'Outro'
    ]

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!error && data) {
            setProfile(data)
            setFormData({
                name: data.name || '',
                bio: data.bio || '',
                neighborhood: data.neighborhood || '',
            })
        }
        setLoading(false)
    }

    const handleSave = async () => {
        if (!profile) return
        setSaving(true)

        const supabase = createClient()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('users')
            .update({
                name: formData.name,
                bio: formData.bio,
                neighborhood: formData.neighborhood,
            })
            .eq('id', profile.id)

        if (!error) {
            setProfile({ ...profile, ...formData })
            setEditing(false)
        }

        setSaving(false)
    }

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-pulse text-2xl">⏳</div>
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg">Meu Perfil</h1>
                    <button
                        onClick={() => editing ? handleSave() : setEditing(true)}
                        disabled={saving}
                        className="text-primary font-medium"
                    >
                        {saving ? '...' : editing ? 'Salvar' : 'Editar'}
                    </button>
                </div>
            </header>
            <div className="h-[60px]" />

            <main className="px-4 py-6 max-w-lg mx-auto pb-8">
                {/* Avatar e nome */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-4xl font-bold mb-4 overflow-hidden">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            profile.name?.charAt(0).toUpperCase() || '?'
                        )}
                    </div>

                    {editing ? (
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Seu nome"
                            className="text-xl font-bold text-center bg-transparent border-b-2 border-primary outline-none"
                        />
                    ) : (
                        <h2 className="text-xl font-bold">{profile.name || 'Usuário'}</h2>
                    )}
                    <p className="text-zinc-500">{profile.email}</p>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 text-center border border-zinc-100 dark:border-zinc-800">
                        <p className="text-2xl font-bold text-primary">{profile.total_requests}</p>
                        <p className="text-sm text-zinc-500">Pedidos</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm">{profile.rating_as_requester.toFixed(1)}</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 text-center border border-zinc-100 dark:border-zinc-800">
                        <p className="text-2xl font-bold text-secondary">{profile.total_helps}</p>
                        <p className="text-sm text-zinc-500">Ajudas</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm">{profile.rating_as_helper.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Informações */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-6">
                    {/* Bairro */}
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                        <label className="text-sm text-zinc-500 block mb-1">Bairro</label>
                        {editing ? (
                            <select
                                value={formData.neighborhood}
                                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                className="w-full bg-transparent outline-none font-medium"
                            >
                                <option value="">Selecione...</option>
                                {neighborhoods.map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="font-medium">{profile.neighborhood || 'Não informado'}</p>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="p-4">
                        <label className="text-sm text-zinc-500 block mb-1">Sobre mim</label>
                        {editing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Conte um pouco sobre você..."
                                rows={3}
                                className="w-full bg-transparent outline-none resize-none"
                            />
                        ) : (
                            <p className={profile.bio ? '' : 'text-zinc-400 italic'}>
                                {profile.bio || 'Nenhuma descrição'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Links */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-6">
                    <Link href="/meus-pedidos" className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800">
                        <span className="flex items-center gap-3">
                            <span className="text-xl">📦</span>
                            <span className="font-medium">Meus Pedidos</span>
                        </span>
                        <span className="text-zinc-400">→</span>
                    </Link>
                    <Link href="/minhas-ajudas" className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800">
                        <span className="flex items-center gap-3">
                            <span className="text-xl">🤝</span>
                            <span className="font-medium">Minhas Ajudas</span>
                        </span>
                        <span className="text-zinc-400">→</span>
                    </Link>
                    <Link href="/minhas-avaliacoes" className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <span className="flex items-center gap-3">
                            <span className="text-xl">⭐</span>
                            <span className="font-medium">Minhas Avaliações</span>
                        </span>
                        <span className="text-zinc-400">→</span>
                    </Link>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full py-3 px-4 text-red-500 font-medium rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    🚪 Sair da conta
                </button>
            </main>
        </div>
    )
}
