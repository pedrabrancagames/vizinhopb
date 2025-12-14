'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import TabNavigation from '@/components/layout/TabNavigation'
import { getLevelFromPoints, LEVELS, BADGE_CATEGORIES } from '@/lib/gamification'

interface RankedUser {
    id: string
    name: string | null
    avatar_url: string | null
    neighborhood: string | null
    points: number
    level: number
    total_helps: number
    total_requests: number
}

interface Badge {
    id: string
    slug: string
    name: string
    description: string | null
    icon: string
    category: string
}

type TimeFilter = 'all' | 'month' | 'week'

export default function RankingPage() {
    const [users, setUsers] = useState<RankedUser[]>([])
    const [badges, setBadges] = useState<Badge[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState<'ranking' | 'badges'>('ranking')
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const supabase = createClient()

        // Verificar usuário atual
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setCurrentUserId(user.id)
        }

        // Buscar top usuários por pontos
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: usersData } = await (supabase as any)
            .from('users')
            .select('id, name, avatar_url, neighborhood, points, level, total_helps, total_requests')
            .order('points', { ascending: false })
            .limit(50)

        if (usersData) {
            setUsers(usersData)

            // Encontrar posição do usuário atual
            if (user) {
                const rank = usersData.findIndex((u: RankedUser) => u.id === user.id)
                if (rank !== -1) {
                    setCurrentUserRank(rank + 1)
                }
            }
        }

        // Buscar todos os badges disponíveis
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: badgesData } = await (supabase as any)
            .from('badges')
            .select('*')
            .order('condition_value', { ascending: true })

        if (badgesData) {
            setBadges(badgesData)
        }

        setLoading(false)
    }

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return '🥇'
            case 2: return '🥈'
            case 3: return '🥉'
            default: return `#${rank}`
        }
    }

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-200'
            case 2: return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
            case 3: return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
            default: return 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700'
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header user={null} notificationCount={0} />
            <TabNavigation />

            <main className="px-4 py-4 max-w-lg mx-auto pb-24">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">🏆 Ranking de Vizinhos</h1>
                    <p className="text-zinc-500 text-sm">
                        Os vizinhos mais ativos da comunidade
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('ranking')}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === 'ranking'
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                            }`}
                    >
                        🏅 Ranking
                    </button>
                    <button
                        onClick={() => setActiveTab('badges')}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === 'badges'
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                            }`}
                    >
                        🎖️ Conquistas
                    </button>
                </div>

                {activeTab === 'ranking' && (
                    <>
                        {/* Sua posição */}
                        {currentUserRank && (
                            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 rounded-xl mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm opacity-80">Sua posição</p>
                                        <p className="text-3xl font-bold">#{currentUserRank}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm opacity-80">Pontos</p>
                                        <p className="text-2xl font-bold">
                                            {users.find(u => u.id === currentUserId)?.points || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Níveis */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3 text-zinc-700 dark:text-zinc-300">Níveis</h3>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {LEVELS.map((level) => (
                                    <div
                                        key={level.level}
                                        className={`flex-shrink-0 ${level.bgColor} px-3 py-2 rounded-lg text-center min-w-[80px]`}
                                    >
                                        <span className="text-2xl">{level.icon}</span>
                                        <p className={`text-xs font-medium ${level.color}`}>{level.name}</p>
                                        <p className="text-[10px] text-zinc-500">{level.minPoints}+ pts</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lista de ranking */}
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl p-4 animate-pulse h-20" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {users.map((user, index) => {
                                    const rank = index + 1
                                    const levelInfo = getLevelFromPoints(user.points)
                                    const isCurrentUser = user.id === currentUserId

                                    return (
                                        <Link
                                            key={user.id}
                                            href={`/perfil/${user.id}`}
                                            className={`flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02] ${getRankStyle(rank)} ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : ''
                                                }`}
                                        >
                                            {/* Posição */}
                                            <div className={`w-10 h-10 flex items-center justify-center font-bold ${rank <= 3 ? 'text-2xl' : 'text-lg text-zinc-500'
                                                }`}>
                                                {getRankIcon(rank)}
                                            </div>

                                            {/* Avatar */}
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    user.name?.charAt(0).toUpperCase() || '?'
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`font-semibold truncate ${rank <= 3 ? '' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                                        {user.name || 'Vizinho'}
                                                    </h3>
                                                    <span title={levelInfo.name}>{levelInfo.icon}</span>
                                                </div>
                                                <p className={`text-sm ${rank <= 3 ? 'opacity-80' : 'text-zinc-500'}`}>
                                                    {user.total_helps} ajudas • {user.total_requests} pedidos
                                                </p>
                                            </div>

                                            {/* Pontos */}
                                            <div className="text-right">
                                                <p className={`font-bold text-lg ${rank <= 3 ? '' : 'text-primary'}`}>
                                                    {user.points}
                                                </p>
                                                <p className={`text-xs ${rank <= 3 ? 'opacity-70' : 'text-zinc-400'}`}>pontos</p>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'badges' && (
                    <div>
                        <p className="text-zinc-500 text-sm mb-4 text-center">
                            Conquiste badges ao interagir com a comunidade!
                        </p>

                        {Object.entries(BADGE_CATEGORIES).map(([key, category]) => {
                            const categoryBadges = badges.filter(b => b.category === key)
                            if (categoryBadges.length === 0) return null

                            return (
                                <div key={key} className="mb-6">
                                    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${category.color}`}>
                                        <span>{category.icon}</span>
                                        {category.name}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {categoryBadges.map((badge) => (
                                            <div
                                                key={badge.id}
                                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl text-center"
                                            >
                                                <span className="text-3xl mb-2 block">{badge.icon}</span>
                                                <h4 className="font-semibold text-sm">{badge.name}</h4>
                                                <p className="text-xs text-zinc-500 mt-1">{badge.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
