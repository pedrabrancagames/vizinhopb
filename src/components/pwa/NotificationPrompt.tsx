'use client'

import { useState, useEffect } from 'react'
import {
    isPushSupported,
    requestNotificationPermission,
    registerServiceWorker,
    subscribeToPush,
    getCurrentSubscription,
    showLocalNotification
} from '@/lib/push-notifications'

// VAPID public key - você precisa gerar suas próprias chaves
// Use: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

export default function NotificationPrompt() {
    const [isSupported, setIsSupported] = useState(false)
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [showPrompt, setShowPrompt] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        checkSupport()
    }, [])

    const checkSupport = async () => {
        if (!isPushSupported()) {
            setIsSupported(false)
            return
        }

        setIsSupported(true)
        setPermission(Notification.permission)

        // Verificar se já tem subscription
        const registration = await navigator.serviceWorker.ready
        const subscription = await getCurrentSubscription(registration)
        setIsSubscribed(!!subscription)

        // Mostrar prompt se não tiver permissão e não tiver visto ainda
        if (Notification.permission === 'default') {
            const hasSeenPrompt = localStorage.getItem('notification-prompt-seen')
            if (!hasSeenPrompt) {
                // Aguardar um pouco antes de mostrar
                setTimeout(() => setShowPrompt(true), 10000)
            }
        }
    }

    const handleEnableNotifications = async () => {
        setLoading(true)

        try {
            // Solicitar permissão
            const perm = await requestNotificationPermission()
            setPermission(perm)

            if (perm === 'granted') {
                // Registrar e subscrever
                const registration = await registerServiceWorker()
                if (registration && VAPID_PUBLIC_KEY) {
                    const subscription = await subscribeToPush(registration, VAPID_PUBLIC_KEY)
                    if (subscription) {
                        setIsSubscribed(true)

                        // Mostrar notificação de teste
                        await showLocalNotification('Notificações ativadas! 🎉', {
                            body: 'Você receberá alertas sobre novos pedidos e ofertas.',
                            tag: 'welcome-notification'
                        })

                        // TODO: Enviar subscription para o backend
                        // await saveSubscriptionToServer(subscription)
                    }
                }
            }
        } catch (error) {
            console.error('[Notifications] Error:', error)
        }

        setLoading(false)
        setShowPrompt(false)
        localStorage.setItem('notification-prompt-seen', 'true')
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('notification-prompt-seen', 'true')
    }

    // Não mostrar se não suportado, já tem permissão, ou já foi dispensado
    if (!isSupported || permission === 'granted' || permission === 'denied' || !showPrompt) {
        return null
    }

    return (
        <div className="fixed top-20 left-4 right-4 z-50 animate-slide-in">
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl shadow-2xl p-4">
                <div className="flex items-start gap-3">
                    {/* Ícone */}
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                        🔔
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1">Ative as notificações</h3>
                        <p className="text-sm opacity-90 mb-3">
                            Seja avisado quando alguém oferecer ajuda ou pedir algo próximo!
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleEnableNotifications}
                                disabled={loading}
                                className="flex-1 py-2.5 px-4 bg-white text-primary font-semibold rounded-xl hover:bg-zinc-100 transition-all disabled:opacity-50"
                            >
                                {loading ? '...' : '✓ Ativar'}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="py-2.5 px-4 text-white/80 hover:text-white font-medium"
                            >
                                Agora não
                            </button>
                        </div>
                    </div>

                    {/* Botão fechar */}
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    )
}
