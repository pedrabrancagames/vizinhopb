// Sistema de Gamificação - Vizinho PB

// =====================================================
// CONSTANTES DE PONTOS
// =====================================================

export const POINTS_CONFIG = {
    // Ações básicas
    CREATE_REQUEST: 10,        // Criar um pedido
    OFFER_HELP: 5,             // Oferecer ajuda (pendente)
    HELP_ACCEPTED: 15,         // Ajuda aceita
    COMPLETE_LOAN: 25,         // Empréstimo concluído

    // Avaliações recebidas
    REVIEW_5_STARS: 20,
    REVIEW_4_STARS: 15,
    REVIEW_3_STARS: 10,
    REVIEW_2_STARS: 5,
    REVIEW_1_STAR: 2,

    // Bônus
    FIRST_REQUEST_BONUS: 20,   // Primeiro pedido
    FIRST_HELP_BONUS: 30,      // Primeira ajuda
} as const

// =====================================================
// NÍVEIS
// =====================================================

export const LEVELS = [
    {
        level: 1,
        name: 'Novato',
        minPoints: 0,
        icon: '🌱',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100'
    },
    {
        level: 2,
        name: 'Vizinho',
        minPoints: 100,
        icon: '🏠',
        color: 'text-blue-500',
        bgColor: 'bg-blue-100'
    },
    {
        level: 3,
        name: 'Super Vizinho',
        minPoints: 300,
        icon: '⭐',
        color: 'text-purple-500',
        bgColor: 'bg-purple-100'
    },
    {
        level: 4,
        name: 'Embaixador',
        minPoints: 500,
        icon: '👑',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100'
    },
    {
        level: 5,
        name: 'Lenda',
        minPoints: 1000,
        icon: '💎',
        color: 'text-cyan-500',
        bgColor: 'bg-gradient-to-r from-cyan-100 to-purple-100'
    },
] as const

// =====================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================

export function getLevelFromPoints(points: number): typeof LEVELS[number] {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (points >= LEVELS[i].minPoints) {
            return LEVELS[i]
        }
    }
    return LEVELS[0]
}

export function getNextLevel(currentLevel: number): typeof LEVELS[number] | null {
    const nextIndex = LEVELS.findIndex(l => l.level === currentLevel) + 1
    return nextIndex < LEVELS.length ? LEVELS[nextIndex] : null
}

export function getProgressToNextLevel(points: number): {
    progress: number
    pointsToNext: number
    nextLevel: typeof LEVELS[number] | null
} {
    const currentLevel = getLevelFromPoints(points)
    const nextLevel = getNextLevel(currentLevel.level)

    if (!nextLevel) {
        return { progress: 100, pointsToNext: 0, nextLevel: null }
    }

    const pointsInCurrentLevel = points - currentLevel.minPoints
    const pointsNeededForNextLevel = nextLevel.minPoints - currentLevel.minPoints
    const progress = Math.min(100, (pointsInCurrentLevel / pointsNeededForNextLevel) * 100)
    const pointsToNext = nextLevel.minPoints - points

    return { progress, pointsToNext, nextLevel }
}

// =====================================================
// CATEGORIAS DE BADGES
// =====================================================

export const BADGE_CATEGORIES = {
    inicio: { name: 'Primeiros Passos', icon: '🎯', color: 'text-green-500' },
    pedidos: { name: 'Pedidos', icon: '📋', color: 'text-blue-500' },
    ajudas: { name: 'Ajudas', icon: '🤝', color: 'text-purple-500' },
    nivel: { name: 'Nível', icon: '🏆', color: 'text-yellow-500' },
    avaliacoes: { name: 'Avaliações', icon: '⭐', color: 'text-orange-500' },
    geral: { name: 'Geral', icon: '🎭', color: 'text-gray-500' },
} as const

// =====================================================
// TIPOS
// =====================================================

export interface Badge {
    id: string
    slug: string
    name: string
    description: string | null
    icon: string
    category: string
    points_required: number
    condition_type: string | null
    condition_value: number
}

export interface UserBadge {
    id: string
    user_id: string
    badge_id: string
    earned_at: string
    badge?: Badge
}

export interface UserGamificationStats {
    points: number
    level: number
    totalRequests: number
    totalHelps: number
    badges: UserBadge[]
}
