'use client'

import { REQUEST_CATEGORIES } from '@/lib/constants'

interface CategoryFilterProps {
    selectedCategory?: string | null
    onSelect: (categoryId: string | null) => void
}

export default function CategoryFilter({ selectedCategory, onSelect }: CategoryFilterProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto py-3 px-4 scrollbar-hide">
            {/* Botão "Todos" */}
            <button
                onClick={() => onSelect(null)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${!selectedCategory
                        ? 'bg-primary text-white shadow-lg scale-105'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
            >
                <span>📋</span>
                <span className="text-sm font-medium">Todos</span>
            </button>

            {/* Categorias */}
            {REQUEST_CATEGORIES.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onSelect(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === category.id
                            ? 'bg-primary text-white shadow-lg scale-105'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                >
                    <span>{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                </button>
            ))}
        </div>
    )
}
