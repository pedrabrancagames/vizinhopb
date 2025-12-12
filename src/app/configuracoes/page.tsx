'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ConfiguracoesPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<{ id: string; email: string } | null>(null)
    const [settings, setSettings] = useState({
        notifications_email: true,
        notifications_push: true,
        dark_mode: false,
        show_location: true,
    })

    useEffect(() => {
        loadUser()
    }, [])

    const loadUser = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        setUser({ id: user.id, email: user.email || '' })
        setLoading(false)
    }

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <span className="animate-pulse text-2xl">⏳</span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/perfil" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg">⚙️ Configurações</h1>
                    <div className="w-10" />
                </div>
            </header>
            <div className="h-[60px]" />

            <main className="px-4 py-6 max-w-lg mx-auto pb-8">
                {/* Notificações */}
                <section className="mb-6">
                    <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">🔔 Notificações</h2>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <p className="font-medium">Notificações por e-mail</p>
                                <p className="text-sm text-zinc-500">Receber atualizações no e-mail</p>
                            </div>
                            <button
                                onClick={() => handleToggle('notifications_email')}
                                className={`w-12 h-6 rounded-full transition-colors ${settings.notifications_email ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                            >
                                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.notifications_email ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <div>
                                <p className="font-medium">Notificações push</p>
                                <p className="text-sm text-zinc-500">Receber alertas no navegador</p>
                            </div>
                            <button
                                onClick={() => handleToggle('notifications_push')}
                                className={`w-12 h-6 rounded-full transition-colors ${settings.notifications_push ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                            >
                                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.notifications_push ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Aparência */}
                <section className="mb-6">
                    <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">🎨 Aparência</h2>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                        <div className="flex items-center justify-between p-4">
                            <div>
                                <p className="font-medium">Modo escuro</p>
                                <p className="text-sm text-zinc-500">Usar tema escuro</p>
                            </div>
                            <button
                                onClick={() => handleToggle('dark_mode')}
                                className={`w-12 h-6 rounded-full transition-colors ${settings.dark_mode ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                            >
                                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.dark_mode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Privacidade */}
                <section className="mb-6">
                    <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">🔒 Privacidade</h2>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                        <div className="flex items-center justify-between p-4">
                            <div>
                                <p className="font-medium">Mostrar localização</p>
                                <p className="text-sm text-zinc-500">Exibir bairro no perfil</p>
                            </div>
                            <button
                                onClick={() => handleToggle('show_location')}
                                className={`w-12 h-6 rounded-full transition-colors ${settings.show_location ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                            >
                                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.show_location ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Conta */}
                <section className="mb-6">
                    <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">👤 Conta</h2>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                        <Link href="/recuperar-senha" className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <p className="font-medium">Alterar senha</p>
                                <p className="text-sm text-zinc-500">Atualizar sua senha</p>
                            </div>
                            <span className="text-zinc-400">→</span>
                        </Link>
                        <div className="p-4">
                            <p className="font-medium">E-mail</p>
                            <p className="text-sm text-zinc-500">{user?.email}</p>
                        </div>
                    </div>
                </section>

                {/* Sobre */}
                <section>
                    <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">ℹ️ Sobre</h2>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                            <p className="font-medium">Versão</p>
                            <p className="text-sm text-zinc-500">1.0.0 (MVP)</p>
                        </div>
                        <Link href="https://vizinhopb.vercel.app" className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                            <p className="font-medium">Termos de uso</p>
                            <span className="text-zinc-400">→</span>
                        </Link>
                        <Link href="https://vizinhopb.vercel.app" className="flex items-center justify-between p-4">
                            <p className="font-medium">Política de privacidade</p>
                            <span className="text-zinc-400">→</span>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    )
}
