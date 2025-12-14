'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
    }>
    prompt(): Promise<void>
}

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallBanner, setShowInstallBanner] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Verificar se já está instalado
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        // Capturar o evento de instalação
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)

            // Mostrar banner após 3 segundos na primeira visita
            const hasSeenBanner = localStorage.getItem('pwa-banner-seen')
            if (!hasSeenBanner) {
                setTimeout(() => {
                    setShowInstallBanner(true)
                }, 3000)
            }
        }

        // Detectar quando foi instalado
        const handleAppInstalled = () => {
            setIsInstalled(true)
            setShowInstallBanner(false)
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        try {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            if (outcome === 'accepted') {
                console.log('[PWA] User accepted the install prompt')
            } else {
                console.log('[PWA] User dismissed the install prompt')
            }
        } catch (error) {
            console.error('[PWA] Install prompt error:', error)
        }

        setDeferredPrompt(null)
        setShowInstallBanner(false)
    }

    const handleDismiss = () => {
        setShowInstallBanner(false)
        localStorage.setItem('pwa-banner-seen', 'true')
    }

    // Não mostrar nada se já estiver instalado ou não tiver prompt
    if (isInstalled || !showInstallBanner) {
        return null
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-in">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 p-4">
                <div className="flex items-start gap-4">
                    {/* Ícone */}
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white text-2xl">
                        🏘️
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1">Instale o Vizinho PB</h3>
                        <p className="text-sm text-zinc-500 mb-3">
                            Acesse mais rápido e receba notificações de novos pedidos!
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleInstallClick}
                                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                            >
                                📲 Instalar App
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="py-2.5 px-4 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium"
                            >
                                Depois
                            </button>
                        </div>
                    </div>

                    {/* Botão fechar */}
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    )
}
