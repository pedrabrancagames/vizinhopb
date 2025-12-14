// Service Worker - Vizinho PB
const CACHE_NAME = 'vizinho-pb-v1'
const STATIC_CACHE = 'vizinho-static-v1'
const DYNAMIC_CACHE = 'vizinho-dynamic-v1'

// Assets estáticos para pré-cache
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/offline.html'
]

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...')

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Pre-caching static assets')
                return cache.addAll(STATIC_ASSETS)
            })
            .then(() => self.skipWaiting())
    )
})

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...')

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name)
                            return caches.delete(name)
                        })
                )
            })
            .then(() => self.clients.claim())
    )
})

// Estratégia de cache: Network First para APIs, Cache First para assets
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Ignorar requisições não-GET
    if (request.method !== 'GET') return

    // Ignorar requisições para Supabase e APIs externas
    if (url.origin !== self.location.origin) return
    if (url.pathname.startsWith('/api/')) return

    // Estratégia de cache baseada no tipo de recurso
    if (isStaticAsset(url)) {
        // Cache First para assets estáticos
        event.respondWith(cacheFirst(request))
    } else {
        // Network First para páginas
        event.respondWith(networkFirst(request))
    }
})

// Verifica se é um asset estático
function isStaticAsset(url) {
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.woff', '.woff2']
    return staticExtensions.some(ext => url.pathname.endsWith(ext))
}

// Cache First strategy
async function cacheFirst(request) {
    const cached = await caches.match(request)
    if (cached) return cached

    try {
        const response = await fetch(request)
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE)
            cache.put(request, response.clone())
        }
        return response
    } catch (error) {
        return new Response('Offline', { status: 503 })
    }
}

// Network First strategy
async function networkFirst(request) {
    try {
        const response = await fetch(request)
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE)
            cache.put(request, response.clone())
        }
        return response
    } catch (error) {
        const cached = await caches.match(request)
        if (cached) return cached

        // Retornar página offline se disponível
        const offlinePage = await caches.match('/offline.html')
        if (offlinePage) return offlinePage

        return new Response('Offline', { status: 503 })
    }
}

// =====================================================
// PUSH NOTIFICATIONS
// =====================================================

self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event)

    let data = {
        title: 'Vizinho PB',
        body: 'Você tem uma nova notificação!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'vizinho-notification',
        data: { url: '/' }
    }

    if (event.data) {
        try {
            const payload = event.data.json()
            data = { ...data, ...payload }
        } catch (e) {
            data.body = event.data.text()
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        vibrate: [200, 100, 200],
        data: data.data,
        actions: [
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Fechar' }
        ],
        requireInteraction: true
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event.action)

    event.notification.close()

    if (event.action === 'close') return

    const urlToOpen = event.notification.data?.url || '/'

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Tentar focar em uma janela existente
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.navigate(urlToOpen)
                        return client.focus()
                    }
                }
                // Abrir nova janela se não houver nenhuma
                return clients.openWindow(urlToOpen)
            })
    )
})

// Fechamento da notificação
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed:', event)
})

// =====================================================
// BACKGROUND SYNC (para enviar mensagens offline)
// =====================================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag)

    if (event.tag === 'send-message') {
        event.waitUntil(
            // Implementar lógica de sincronização de mensagens offline
            Promise.resolve()
        )
    }
})
