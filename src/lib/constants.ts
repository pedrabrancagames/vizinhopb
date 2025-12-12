// Categorias de pedidos
export const REQUEST_CATEGORIES = [
    { id: 'ferramentas', name: 'Ferramentas', icon: '🔧' },
    { id: 'cozinha', name: 'Cozinha', icon: '🍳' },
    { id: 'esportes', name: 'Esportes/Lazer', icon: '⚽' },
    { id: 'livros', name: 'Livros/Mídia', icon: '📚' },
    { id: 'casa', name: 'Casa/Jardim', icon: '🏠' },
    { id: 'eventos', name: 'Eventos/Festas', icon: '🎉' },
    { id: 'eletronicos', name: 'Eletrônicos', icon: '💻' },
    { id: 'outros', name: 'Outros', icon: '🎭' },
] as const

// Categorias de empresas/serviços
export const BUSINESS_CATEGORIES = [
    { id: 'eletricista', name: 'Eletricista', icon: '🔌' },
    { id: 'encanador', name: 'Encanador', icon: '🚿' },
    { id: 'pintor', name: 'Pintor', icon: '🎨' },
    { id: 'limpeza', name: 'Limpeza', icon: '🧹' },
    { id: 'jardineiro', name: 'Jardineiro', icon: '🌱' },
    { id: 'marceneiro', name: 'Marceneiro', icon: '🪵' },
    { id: 'mecanico', name: 'Mecânico', icon: '🔧' },
    { id: 'pedreiro', name: 'Pedreiro', icon: '🧱' },
    { id: 'pet', name: 'Pet/Veterinário', icon: '🐕' },
    { id: 'beleza', name: 'Beleza', icon: '💅' },
    { id: 'tecnologia', name: 'Tecnologia', icon: '💻' },
    { id: 'outros', name: 'Outros', icon: '🏢' },
] as const

// Níveis de urgência
export const URGENCY_LEVELS = {
    low: { label: 'Baixa', color: 'green', icon: '🟢' },
    medium: { label: 'Média', color: 'yellow', icon: '🟡' },
    high: { label: 'Alta', color: 'red', icon: '🔴' },
} as const

// Status de pedidos
export const REQUEST_STATUS = {
    open: { label: 'Aberto', color: 'blue' },
    negotiating: { label: 'Em negociação', color: 'yellow' },
    in_progress: { label: 'Em andamento', color: 'orange' },
    completed: { label: 'Concluído', color: 'green' },
    cancelled: { label: 'Cancelado', color: 'gray' },
    expired: { label: 'Expirado', color: 'red' },
} as const

// Status de ofertas
export const OFFER_STATUS = {
    pending: { label: 'Pendente', color: 'gray' },
    accepted: { label: 'Aceita', color: 'green' },
    rejected: { label: 'Recusada', color: 'red' },
    borrowed: { label: 'Emprestado', color: 'blue' },
    returned: { label: 'Devolvido', color: 'green' },
    cancelled: { label: 'Cancelada', color: 'gray' },
} as const

// Status de aprovação de empresas
export const APPROVAL_STATUS = {
    pending: { label: 'Pendente', color: 'yellow', icon: '⏳' },
    approved: { label: 'Aprovado', color: 'green', icon: '✅' },
    rejected: { label: 'Rejeitado', color: 'red', icon: '❌' },
} as const

// Configurações do mapa
export const MAP_CONFIG = {
    defaultCenter: [-7.1195, -34.8450] as [number, number], // João Pessoa, PB
    defaultZoom: 13,
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}

// Limites de upload
export const UPLOAD_LIMITS = {
    maxImageSize: 500 * 1024, // 500KB
    maxImagesPerRequest: 4,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
}

// Configurações de paginação
export const PAGINATION = {
    defaultPageSize: 10,
    maxPageSize: 50,
}
