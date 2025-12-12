'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MAP_CONFIG } from '@/lib/constants'
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
    neighbors?: Neighbor[]
    userLocation?: [number, number]
    className?: string
}

export default function NeighborsMap({
    neighbors = [],
    userLocation,
    className = ''
}: NeighborsMapProps) {
    const [isMounted, setIsMounted] = useState(false)
    const center = userLocation || MAP_CONFIG.defaultCenter

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Gera vizinhos fake para demonstração se não houver dados
    const displayNeighbors = neighbors.length > 0 ? neighbors : generateFakeNeighbors(center, 30)

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
                {displayNeighbors.map((neighbor, index) => (
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
                    <span className="text-primary font-bold">{displayNeighbors.length}</span> vizinhos ativos por perto
                </span>
            </div>
        </div>
    )
}

// Gera vizinhos fake para demonstração
function generateFakeNeighbors(center: [number, number], count: number): Neighbor[] {
    const neighbors: Neighbor[] = []
    for (let i = 0; i < count; i++) {
        // Adiciona variação aleatória de ~3km ao redor do centro
        const latOffset = (Math.random() - 0.5) * 0.05
        const lngOffset = (Math.random() - 0.5) * 0.05
        neighbors.push({
            id: `fake-${i}`,
            latitude: center[0] + latOffset,
            longitude: center[1] + lngOffset,
        })
    }
    return neighbors
}
