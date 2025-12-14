'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SideMenuProps {
    isOpen: boolean
    onClose: () => void
    user?: {
        name: string
        email: string
        avatar_url?: string
        rating?: number
        neighborhood?: string
        role?: string
    } | null
}

export default function SideMenu({ isOpen, onClose, user }: SideMenuProps) {
    const pathname = usePathname()

    const menuItems = [
        { href: '/perfil', icon: '👤', label: 'Meu Perfil' },
        { href: '/meus-pedidos', icon: '📦', label: 'Meus Pedidos' },
        { href: '/minhas-ajudas', icon: '🤝', label: 'Minhas Ajudas' },
        { href: '/avaliacoes', icon: '⭐', label: 'Minhas Avaliações' },
        { href: '/configuracoes', icon: '⚙️', label: 'Configurações' },
    ]

    const adminItems = [
        { href: '/admin', icon: '🛡️', label: 'Painel Admin' },
    ]

    const isAdmin = user?.role === 'admin'
    const isModerator = user?.role === 'moderator'

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                    onClick={onClose}
                />
            )}

            {/* Menu lateral */}
            <div
                className={`fixed top-0 left-0 h-full w-72 glass border-r pointer-events-auto transform transition-transform duration-300 ease-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header do menu */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xl font-bold text-primary">Vizinho PB</span>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="text-2xl">✕</span>
                    </button>
                </div>

                {/* Perfil do usuário */}
                {user ? (
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name?.charAt(0).toUpperCase() || '?'
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{user.name || 'Usuário'}</h3>
                                <div className="flex items-center gap-2 text-sm text-zinc-500">
                                    {user.rating && <span>⭐ {user.rating.toFixed(1)}</span>}
                                    {user.neighborhood && <span>• {user.neighborhood}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                        <Link
                            href="/login"
                            className="block w-full py-3 px-4 bg-primary text-white text-center rounded-lg font-medium hover:bg-primary-dark transition-colors"
                        >
                            Entrar
                        </Link>
                    </div>
                )}

                {/* Items do menu */}
                <nav className="p-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === item.href
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}

                    {/* Items de admin/moderador */}
                    {(isAdmin || isModerator) && (
                        <>
                            <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />
                            {adminItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.startsWith(item.href)
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}
                        </>
                    )}
                </nav>

                {/* Footer do menu */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-200 dark:border-zinc-800">
                    {user ? (
                        <button
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <span className="text-xl">🚪</span>
                            <span className="font-medium">Sair</span>
                        </button>
                    ) : (
                        <Link
                            href="/cadastro"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
                        >
                            Criar conta
                        </Link>
                    )}
                </div>
            </div>
        </>
    )
}
