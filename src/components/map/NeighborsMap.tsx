'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MAP_CONFIG } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import 'leaflet/dist/leaflet.css'

// Importa o mapa dinamicamente para evitar SSR
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
)
const CircleMarker = dynamic(
    () => import('react-leaflet').then((mod) => mod.CircleMarker),
    { ssr: false }
)

interface Neighbor {
    id: string
    latitude: number
    longitude: number
}

interface NeighborsMapProps {
    className?: string
}

export default function NeighborsMap({
    className = ''
}: NeighborsMapProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [neighbors, setNeighbors] = useState<Neighbor[]>([])
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setIsMounted(true)
        loadNeighbors()
        requestUserLocation()
    }, [])

    const loadNeighbors = async () => {
        const supabase = createClient()

        // Buscar usuários com localização definida
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
            .from('users')
            .select('id, latitude, longitude')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null)
            .limit(100)

        if (data && data.length > 0) {
            setNeighbors(data)
        }
        setLoading(false)
    }

    const requestUserLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude])
                },
                () => {
                    // Falhou - usa localização padrão
                    console.log('Geolocalização não permitida')
                },
                { enableHighAccuracy: false, timeout: 10000 }
            )
        }
    }

    const center = userLocation || MAP_CONFIG.defaultCenter

    if (!isMounted) {
        return (
            <div className={`bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse ${className}`}>
                <div className="h-full w-full flex items-center justify-center text-zinc-400">
                    <span className="text-lg">🗺️ Carregando mapa...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative rounded-xl overflow-hidden shadow-lg ${className}`}>
            <MapContainer
                center={center}
                zoom={MAP_CONFIG.defaultZoom}
                scrollWheelZoom={false}
                className="h-full w-full"
                style={{ minHeight: '200px' }}
            >
                <TileLayer
                    attribution={MAP_CONFIG.attribution}
                    url={MAP_CONFIG.tileUrl}
                />

                {/* Marcadores dos vizinhos */}
                {neighbors.map((neighbor, index) => (
                    <CircleMarker
                        key={neighbor.id || index}
                        center={[neighbor.latitude, neighbor.longitude]}
                        radius={6}
                        pathOptions={{
                            fillColor: '#4f46e5',
                            fillOpacity: 0.7,
                            color: '#4f46e5',
                            weight: 2,
                        }}
                    />
                ))}

                {/* Marcador do usuário */}
                {userLocation && (
                    <CircleMarker
                        center={userLocation}
                        radius={10}
                        pathOptions={{
                            fillColor: '#10b981',
                            fillOpacity: 1,
                            color: '#fff',
                            weight: 3,
                        }}
                    />
                )}
            </MapContainer>

            {/* Badge com quantidade de vizinhos */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700">
                <span className="text-sm font-medium">
                    {loading ? (
                        'Carregando...'
                    ) : neighbors.length > 0 ? (
                        <>
                            <span className="text-primary font-bold">{neighbors.length}</span> vizinhos ativos
                        </>
                    ) : (
                        'Seja o primeiro vizinho!'
                    )}
                </span>
            </div>
        </div>
    )
}
