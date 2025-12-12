'use client'

import Header from '@/components/layout/Header'
import TabNavigation from '@/components/layout/TabNavigation'

export default function ChatPage() {
    // Dados fake para demonstração
    const conversations = [
        {
            id: '1',
            otherUser: { name: 'Maria Santos', avatar_url: null },
            lastMessage: 'Olá! Posso te emprestar a furadeira sim!',
            lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            unread: true,
            requestTitle: 'Preciso de uma furadeira',
        },
        {
            id: '2',
            otherUser: { name: 'Carlos Lima', avatar_url: null },
            lastMessage: 'Combinado, pode passar aqui amanhã',
            lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            unread: false,
            requestTitle: 'Alguém tem uma escada?',
        },
        {
            id: '3',
            otherUser: { name: 'Ana Paula', avatar_url: null },
            lastMessage: 'Obrigada pela ajuda! 🙏',
            lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            unread: false,
            requestTitle: 'Forma de bolo grande',
        },
    ]

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 60) return `${diffMins}min`
        if (diffHours < 24) return `${diffHours}h`
        return `${diffDays}d`
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header user={null} notificationCount={0} />
            <TabNavigation />

            <main className="pb-8">
                {conversations.length > 0 ? (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {conversations.map((conv) => (
                            <a
                                key={conv.id}
                                href={`/chat/${conv.id}`}
                                className="flex items-center gap-3 p-4 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                                        {conv.otherUser.avatar_url ? (
                                            <img src={conv.otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            conv.otherUser.name?.charAt(0).toUpperCase() || '?'
                                        )}
                                    </div>
                                    {conv.unread && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white dark:border-zinc-950" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-semibold truncate ${conv.unread ? 'text-foreground' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                            {conv.otherUser.name}
                                        </h3>
                                        <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">
                                            {formatTime(conv.lastMessageAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 truncate mb-1">
                                        📦 {conv.requestTitle}
                                    </p>
                                    <p className={`text-sm truncate ${conv.unread ? 'font-medium text-foreground' : 'text-zinc-500'}`}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <span className="text-6xl mb-4">💬</span>
                        <h2 className="text-xl font-bold mb-2">Nenhuma conversa ainda</h2>
                        <p className="text-zinc-500">
                            Quando você oferecer ajuda ou receber ofertas, suas conversas aparecerão aqui.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
