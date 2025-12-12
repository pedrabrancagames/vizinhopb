'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarSenhaPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) {
                setError(error.message)
                return
            }

            setSuccess(true)
        } catch (err) {
            setError('Erro ao enviar email. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <div className="px-6 py-12 max-w-md mx-auto w-full text-center">
                    <span className="text-6xl mb-6 block">✉️</span>
                    <h1 className="text-2xl font-bold mb-4">Email enviado!</h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        Enviamos um link de recuperação para <strong>{email}</strong>.
                        Verifique sua caixa de entrada.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all"
                    >
                        Voltar para o Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <div className="px-6 py-12 max-w-md mx-auto w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🔐</span>
                    <h1 className="text-2xl font-bold mb-2">Recuperar senha</h1>
                    <p className="text-zinc-500">
                        Digite seu email para receber o link de recuperação
                    </p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                    >
                        {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                    </button>
                </form>

                {/* Link para login */}
                <p className="text-center mt-8 text-zinc-600 dark:text-zinc-400">
                    Lembrou a senha?{' '}
                    <Link href="/login" className="text-primary font-semibold hover:text-primary-dark transition-colors">
                        Voltar para o login
                    </Link>
                </p>
            </div>
        </div>
    )
}
