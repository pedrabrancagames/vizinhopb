'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import TabNavigation from '@/components/layout/TabNavigation'
import CategoryFilter from '@/components/requests/CategoryFilter'
import RequestCard from '@/components/requests/RequestCard'

// Importa o mapa dinamicamente para evitar SSR
const NeighborsMap = dynamic(
    () => import('@/components/map/NeighborsMap'),
    {
        ssr: false,
        loading: () => (
            <div className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-zinc-400">🗺️ Carregando mapa...</span>
            </div>
        )
    }
)

// Dados fake para demonstração
const fakeRequests = [
    {
        id: '1',
        title: 'Preciso de uma furadeira para fazer uns furos na parede',
        category: 'ferramentas',
        urgency: 'high' as const,
        neighborhood: 'Centro',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        offers_count: 3,
        user: { name: 'João Silva' }
    },
    {
        id: '2',
        title: 'Alguém tem uma escada de pelo menos 4 degraus?',
        category: 'ferramentas',
        urgency: 'medium' as const,
        neighborhood: 'Manaíra',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
        offers_count: 1,
        user: { name: 'Maria Santos' }
    },
    {
        id: '3',
        title: 'Preciso de uma forma de bolo grande para festa de aniversário',
        category: 'cozinha',
        urgency: 'low' as const,
        neighborhood: 'Tambaú',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
        offers_count: 0,
        user: { name: 'Carlos' }
    },
    {
        id: '4',
        title: 'Procuro bola de vôlei ou futevôlei para jogar na praia',
        category: 'esportes',
        urgency: 'low' as const,
        neighborhood: 'Cabo Branco',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
        offers_count: 2,
        user: { name: 'Ana Paula' }
    },
]

export default function HomePage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Filtra pedidos por categoria
    const filteredRequests = selectedCategory
        ? fakeRequests.filter(r => r.category === selectedCategory)
        : fakeRequests

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <Header user={null} notificationCount={2} />

            {/* Navegação por abas */}
            <TabNavigation />

            {/* Conteúdo principal */}
            <main className="pb-24">
                {/* Mapa de vizinhos */}
                <div className="px-4 py-4">
                    <NeighborsMap className="h-48" />
                </div>

                {/* Filtro de categorias */}
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                {/* Feed de pedidos */}
                <section className="px-4 py-4">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        📢 Pedidos perto de você
                    </h2>

                    {filteredRequests.length > 0 ? (
                        <div className="space-y-3">
                            {filteredRequests.map((request) => (
                                <RequestCard key={request.id} request={request} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <span className="text-4xl mb-4 block">🔍</span>
                            <p className="text-zinc-500">Nenhum pedido encontrado nesta categoria</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Botão flutuante para novo pedido */}
            <Link
                href="/novo-pedido"
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 z-20"
                aria-label="Criar novo pedido"
            >
                ➕
            </Link>
        </div>
    )
}
