// Push Notifications - Vizinho PB

// =====================================================
// TIPOS
// =====================================================

export interface PushSubscriptionData {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

export interface NotificationPayload {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    data?: {
        url?: string
        type?: string
        id?: string
    }
}

// =====================================================
// VERIFICAÇÃO DE SUPORTE
// =====================================================

export function isPushSupported(): boolean {
    return (
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    )
}

export function isNotificationPermissionGranted(): boolean {
    return Notification.permission === 'granted'
}

export function isNotificationPermissionDenied(): boolean {
    return Notification.permission === 'denied'
}

// =====================================================
// REGISTRO DO SERVICE WORKER
// =====================================================

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
        console.log('[Push] Service Worker not supported')
        return null
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        })
        console.log('[Push] Service Worker registered:', registration.scope)
        return registration
    } catch (error) {
        console.error('[Push] Service Worker registration failed:', error)
        return null
    }
}

// =====================================================
// SOLICITAR PERMISSÃO
// =====================================================

export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.log('[Push] Notifications not supported')
        return 'denied'
    }

    if (Notification.permission === 'granted') {
        return 'granted'
    }

    const permission = await Notification.requestPermission()
    console.log('[Push] Permission:', permission)
    return permission
}

// =====================================================
// SUBSCRIBE TO PUSH
// =====================================================

export async function subscribeToPush(
    registration: ServiceWorkerRegistration,
    vapidPublicKey: string
): Promise<PushSubscription | null> {
    try {
        // Converter VAPID key para Uint8Array
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey as BufferSource
        })

        console.log('[Push] Subscribed:', subscription.endpoint)
        return subscription
    } catch (error) {
        console.error('[Push] Subscription failed:', error)
        return null
    }
}

// =====================================================
// UNSUBSCRIBE
// =====================================================

export async function unsubscribeFromPush(
    registration: ServiceWorkerRegistration
): Promise<boolean> {
    try {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
            await subscription.unsubscribe()
            console.log('[Push] Unsubscribed')
            return true
        }
        return false
    } catch (error) {
        console.error('[Push] Unsubscribe failed:', error)
        return false
    }
}

// =====================================================
// OBTER SUBSCRIPTION ATUAL
// =====================================================

export async function getCurrentSubscription(
    registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
    return registration.pushManager.getSubscription()
}

// =====================================================
// CONVERTER SUBSCRIPTION PARA JSON
// =====================================================

export function subscriptionToJSON(subscription: PushSubscription): PushSubscriptionData {
    const json = subscription.toJSON()
    return {
        endpoint: subscription.endpoint,
        keys: {
            p256dh: json.keys?.p256dh || '',
            auth: json.keys?.auth || ''
        }
    }
}

// =====================================================
// MOSTRAR NOTIFICAÇÃO LOCAL
// =====================================================

export async function showLocalNotification(
    title: string,
    options: NotificationOptions = {}
): Promise<void> {
    if (!isNotificationPermissionGranted()) {
        console.log('[Push] Permission not granted')
        return
    }

    const registration = await navigator.serviceWorker.ready

    await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
    })
}

// =====================================================
// UTILITÁRIOS
// =====================================================

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
}

// =====================================================
// HOOK DE INICIALIZAÇÃO COMPLETA
// =====================================================

export async function initializePushNotifications(): Promise<{
    supported: boolean
    permission: NotificationPermission
    subscription: PushSubscription | null
}> {
    if (!isPushSupported()) {
        return { supported: false, permission: 'denied', subscription: null }
    }

    const registration = await registerServiceWorker()
    if (!registration) {
        return { supported: true, permission: 'default', subscription: null }
    }

    const permission = Notification.permission
    let subscription: PushSubscription | null = null

    if (permission === 'granted') {
        subscription = await getCurrentSubscription(registration)
    }

    return { supported: true, permission, subscription }
}
