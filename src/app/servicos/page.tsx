'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import TabNavigation from '@/components/layout/TabNavigation'
import { createClient } from '@/lib/supabase/client'

interface BusinessCategory {
    id: string
    name: string
    icon: string
    slug: string
}

interface Business {
    id: string
    name: string
    description: string | null
    phone: string | null
    whatsapp: string | null
    neighborhood: string | null
    verified: boolean
    rating: number
    total_reviews: number
    category: BusinessCategory
}

export default function ServicosPage() {
    const [categories, setCategories] = useState<BusinessCategory[]>([])
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Dados fake para demonstração
    const fakeCategories: BusinessCategory[] = [
        { id: '1', name: 'Manutenção', icon: '🔧', slug: 'manutencao' },
        { id: '2', name: 'Eletricista', icon: '🔌', slug: 'eletricista' },
        { id: '3', name: 'Encanador', icon: '🚿', slug: 'encanador' },
        { id: '4', name: 'Limpeza', icon: '🧹', slug: 'limpeza' },
        { id: '5', name: 'Pintor', icon: '🎨', slug: 'pintor' },
        { id: '6', name: 'Pet', icon: '🐕', slug: 'pet' },
        { id: '7', name: 'Alimentação', icon: '🍕', slug: 'alimentacao' },
        { id: '8', name: 'Beleza', icon: '💇', slug: 'beleza' },
    ]

    const fakeBusinesses: Business[] = [
        {
            id: '1',
            name: 'Elétrica Silva',
            description: 'Serviços elétricos residenciais e comerciais',
            phone: '83999999999',
            whatsapp: '83999999999',
            neighborhood: 'Manaíra',
            verified: true,
            rating: 4.9,
            total_reviews: 45,
            category: fakeCategories[1],
        },
        {
            id: '2',
            name: 'Pet Shop Amigo',
            description: 'Banho, tosa e produtos para seu pet',
            phone: '83988888888',
            whatsapp: '83988888888',
            neighborhood: 'Centro',
            verified: true,
            rating: 4.7,
            total_reviews: 32,
            category: fakeCategories[5],
        },
        {
            id: '3',
            name: 'Encanador José',
            description: 'Reparos hidráulicos em geral',
            phone: '83977777777',
            whatsapp: '83977777777',
            neighborhood: 'Tambaú',
            verified: false,
            rating: 4.5,
            total_reviews: 18,
            category: fakeCategories[2],
        },
        {
            id: '4',
            name: 'Pizzaria do Bairro',
            description: 'As melhores pizzas da região',
            phone: '83966666666',
            whatsapp: '83966666666',
            neighborhood: 'Cabo Branco',
            verified: true,
            rating: 4.8,
            total_reviews: 120,
            category: fakeCategories[6],
        },
    ]

    useEffect(() => {
        // Simular carregamento
        setTimeout(() => {
            setCategories(fakeCategories)
            setBusinesses(fakeBusinesses)
            setLoading(false)
        }, 500)
    }, [])

    const filteredBusinesses = selectedCategory
        ? businesses.filter(b => b.category.id === selectedCategory)
        : businesses

    const getWhatsAppLink = (phone: string) => {
        const numbers = phone.replace(/\D/g, '')
        const fullNumber = numbers.startsWith('55') ? numbers : `55${numbers}`
        return `https://wa.me/${fullNumber}`
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header user={null} notificationCount={0} />
            <TabNavigation />

            <main className="pb-8">
                {/* Busca */}
                <div className="px-4 py-4">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar serviço..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Categorias */}
                <div className="px-4 mb-4">
                    <h2 className="text-sm font-semibold text-zinc-500 mb-3">Categorias</h2>
                    <div className="grid grid-cols-4 gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${selectedCategory === cat.id
                                        ? 'bg-primary text-white'
                                        : 'bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                <span className="text-2xl">{cat.icon}</span>
                                <span className="text-xs font-medium truncate w-full text-center">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de empresas */}
                <div className="px-4">
                    <h2 className="text-sm font-semibold text-zinc-500 mb-3">
                        {selectedCategory
                            ? `${categories.find(c => c.id === selectedCategory)?.name || 'Categoria'}`
                            : 'Empresas verificadas'
                        }
                    </h2>

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
                            {filteredBusinesses.map((business) => (
                                <Link
                                    key={business.id}
                                    href={`/servicos/${business.id}`}
                                    className="block bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Ícone/Logo */}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center text-2xl flex-shrink-0">
                                            {business.category.icon}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold truncate">{business.name}</h3>
                                                {business.verified && (
                                                    <span className="text-primary text-sm" title="Verificado">✓</span>
                                                )}
                                            </div>

                                            <p className="text-sm text-zinc-500 flex items-center gap-2 mb-2">
                                                ⭐ {business.rating.toFixed(1)} ({business.total_reviews})
                                                <span>•</span>
                                                📍 {business.neighborhood}
                                            </p>

                                            {business.description && (
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                                    {business.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botões de ação */}
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                        {business.phone && (
                                            <a
                                                href={`tel:${business.phone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                            >
                                                📞 Ligar
                                            </a>
                                        )}
                                        {business.whatsapp && (
                                            <a
                                                href={getWhatsAppLink(business.whatsapp)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                            >
                                                💬 WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <span className="text-4xl mb-4 block">🔍</span>
                            <p className="text-zinc-500">Nenhuma empresa encontrada nesta categoria</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
