'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Category {
    id: string
    name: string
    icon: string
}

export default function NovaEmpresaPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])

    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        description: '',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        neighborhood: '',
        working_hours: '',
        verified: false,
    })

    const neighborhoods = [
        'Centro', 'Manaíra', 'Tambaú', 'Cabo Branco', 'Bessa',
        'Altiplano', 'Bancários', 'Mangabeira', 'Torre',
        'Expedicionários', 'Miramar', 'Brisamar', 'Outro'
    ]

    // Carregar categorias
    useEffect(() => {
        const fakeCategories: Category[] = [
            { id: '1', name: 'Manutenção/Reparos', icon: '🔧' },
            { id: '2', name: 'Eletricista', icon: '🔌' },
            { id: '3', name: 'Encanador', icon: '🚿' },
            { id: '4', name: 'Limpeza', icon: '🧹' },
            { id: '5', name: 'Pintor', icon: '🎨' },
            { id: '6', name: 'Pedreiro', icon: '🏗️' },
            { id: '7', name: 'Mecânico', icon: '🚗' },
            { id: '8', name: 'Pet/Veterinário', icon: '🐕' },
            { id: '9', name: 'Alimentação', icon: '🍕' },
            { id: '10', name: 'Beleza/Estética', icon: '💇' },
            { id: '11', name: 'Outros', icon: '📦' },
        ]
        setCategories(fakeCategories)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            // Em produção, inserir no banco
            // const { error } = await supabase.from('businesses').insert({...})

            // Por enquanto, apenas redireciona
            alert('Empresa cadastrada com sucesso!')
            router.push('/admin')
        } catch (err) {
            alert('Erro ao cadastrar empresa')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/admin" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="font-bold text-lg">Adicionar Empresa</h1>
                    <div className="w-10" />
                </div>
            </header>
            <div className="h-[60px]" />

            {/* Formulário */}
            <main className="px-4 py-6 max-w-lg mx-auto pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Nome da empresa <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Ex: Elétrica Silva"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Categoria */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Categoria <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                            <option value="">Selecione...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Descrição</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Descreva os serviços oferecidos..."
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                        />
                    </div>

                    {/* Telefone e WhatsApp */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Telefone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(83) 99999-9999"
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">WhatsApp</label>
                            <input
                                type="tel"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                placeholder="(83) 99999-9999"
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="contato@empresa.com"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Endereço */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Endereço</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Rua, número, complemento"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Bairro */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Bairro <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.neighborhood}
                            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                            <option value="">Selecione...</option>
                            {neighborhoods.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>

                    {/* Horário de funcionamento */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Horário de funcionamento</label>
                        <input
                            type="text"
                            value={formData.working_hours}
                            onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                            placeholder="Ex: Seg-Sex 8h-18h"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Verificado */}
                    <label className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.verified}
                            onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                            className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary"
                        />
                        <div>
                            <p className="font-medium">Empresa verificada ✓</p>
                            <p className="text-sm text-zinc-500">Exibe selo de verificação no perfil</p>
                        </div>
                    </label>

                    {/* Botão */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary/25"
                    >
                        {loading ? 'Salvando...' : '💾 Salvar Empresa'}
                    </button>
                </form>
            </main>
        </div>
    )
}
