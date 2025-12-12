'use client'

import Link from 'next/link'
import { URGENCY_LEVELS, REQUEST_CATEGORIES } from '@/lib/constants'
import { formatDistanceToNow } from '@/lib/utils'

interface RequestCardProps {
    request: {
        id: string
        title: string
        category: string
        urgency: 'low' | 'medium' | 'high'
        neighborhood?: string
        created_at: string
        offers_count?: number
        user?: {
            name?: string
            avatar_url?: string
        }
    }
}

export default function RequestCard({ request }: RequestCardProps) {
    const urgency = URGENCY_LEVELS[request.urgency]
    const category = REQUEST_CATEGORIES.find(c => c.id === request.category)

    return (
        <Link href={`/pedido/${request.id}`}>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                {/* Header com urgência */}
                <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${request.urgency === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : request.urgency === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                        {urgency.icon} {urgency.label.toUpperCase()}
                    </span>
                    {category && (
                        <span className="text-lg" title={category.name}>{category.icon}</span>
                    )}
                </div>

                {/* Título */}
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {request.title}
                </h3>

                {/* Info */}
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                    {request.neighborhood && (
                        <span className="flex items-center gap-1">
                            📍 {request.neighborhood}
                        </span>
                    )}
                    <span>•</span>
                    <span>{formatDistanceToNow(request.created_at)}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    {/* Avatar do usuário */}
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                            {request.user?.avatar_url ? (
                                <img src={request.user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                request.user?.name?.charAt(0).toUpperCase() || '?'
                            )}
                        </div>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {request.user?.name || 'Anônimo'}
                        </span>
                    </div>

                    {/* Ofertas */}
                    <span className="flex items-center gap-1 text-sm text-zinc-500">
                        💬 {request.offers_count || 0} {(request.offers_count || 0) === 1 ? 'oferta' : 'ofertas'}
                    </span>
                </div>
            </div>
        </Link>
    )
}
