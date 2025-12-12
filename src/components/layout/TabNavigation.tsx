'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
    { href: '/', icon: '🏠', label: 'HOME' },
    { href: '/chat', icon: '💬', label: 'CHAT' },
    { href: '/servicos', icon: '🏢', label: 'SERVIÇOS' },
]

export default function TabNavigation() {
    const pathname = usePathname()

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    return (
        <nav className="flex items-center justify-around bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-2">
            {tabs.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 px-4 transition-all ${isActive(tab.href)
                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="text-xs font-semibold tracking-wide">{tab.label}</span>
                </Link>
            ))}
        </nav>
    )
}
