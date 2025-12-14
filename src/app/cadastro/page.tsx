'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CadastroPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [neighborhood, setNeighborhood] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const neighborhoods = [
        'Centro',
        'Manaíra',
        'Tambaú',
        'Cabo Branco',
        'Bessa',
        'Altiplano',
        'Bancários',
        'Mangabeira',
        'Torre',
        'Expedicionários',
        'Miramar',
        'Brisamar',
        'Outro',
    ]

    const handleCadastro = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validações
        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        neighborhood: neighborhood,
                    },
                },
            })

            if (error) {
                if (error.message.includes('already registered')) {
                    setError('Este email já está cadastrado')
                } else {
                    setError(error.message)
                }
                return
            }

            setSuccess(true)
        } catch (err) {
            setError('Erro ao criar conta. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        setLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                setError(error.message)
            }
        } catch (err) {
            setError('Erro ao conectar com Google. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-primary/5 via-white to-secondary/5 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <div className="px-6 py-12 max-w-md mx-auto w-full text-center">
                    <span className="text-6xl mb-6 block">✉️</span>
                    <h1 className="text-2xl font-bold mb-4">Verifique seu email</h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        Enviamos um link de confirmação para <strong>{email}</strong>.
                        Clique no link para ativar sua conta.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block py-3 px-6 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all"
                    >
                        Ir para o Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
            <div className="glass w-full max-w-md p-8 rounded-2xl shadow-xl animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-6">
                    <span className="text-6xl mb-4 block animate-bounce">🏘️</span>
                    <h1 className="text-3xl font-bold text-gradient">
                        Vizinho PB
                    </h1>
                    <p className="text-zinc-500 mt-2">Crie sua conta</p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleCadastro} className="space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm animate-shake">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2 pl-1">
                            Nome completo
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome"
                            required
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2 pl-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label htmlFor="neighborhood" className="block text-sm font-medium mb-2 pl-1">
                            Bairro
                        </label>
                        <div className="relative">
                            <select
                                id="neighborhood"
                                value={neighborhood}
                                onChange={(e) => setNeighborhood(e.target.value)}
                                required
                                className="input-field appearance-none"
                            >
                                <option value="">Selecione seu bairro</option>
                                {neighborhoods.map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                                ▼
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2 pl-1">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                            minLength={6}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 pl-1">
                            Confirmar senha
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Digite a senha novamente"
                            required
                            minLength={6}
                            className="input-field"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? 'Criando conta...' : 'Criar conta'}
                    </button>
                </form>

                {/* Divisor */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                    <span className="text-sm text-zinc-500">ou</span>
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                </div>

                {/* Cadastro social */}
                <button
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar com Google
                </button>

                {/* Link para login */}
                <p className="text-center mt-6 text-zinc-600 dark:text-zinc-400">
                    Já tem conta?{' '}
                    <Link href="/login" className="text-primary font-bold hover:text-primary-light transition-colors hover:underline">
                        Entrar
                    </Link>
                </p>
            </div>
        </div>
    )
}
