'use client'

import { useState } from 'react'

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (rating: number, comment: string) => Promise<void>
    reviewedUserName: string
    reviewType: 'requester_to_helper' | 'helper_to_requester'
}

export default function ReviewModal({
    isOpen,
    onClose,
    onSubmit,
    reviewedUserName,
    reviewType,
}: ReviewModalProps) {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [hoveredRating, setHoveredRating] = useState(0)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        await onSubmit(rating, comment)
        setSubmitting(false)
        setRating(5)
        setComment('')
    }

    const title = reviewType === 'requester_to_helper'
        ? `Avalie ${reviewedUserName}`
        : `Avalie ${reviewedUserName}`

    const subtitle = reviewType === 'requester_to_helper'
        ? 'Como foi a experiência com quem te ajudou?'
        : 'Como foi a experiência com quem pediu?'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 animate-slide-up">
                {/* Header */}
                <div className="text-center mb-6">
                    <span className="text-4xl mb-3 block">⭐</span>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Stars */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="text-4xl transition-transform hover:scale-110"
                            >
                                {star <= (hoveredRating || rating) ? '⭐' : '☆'}
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-sm text-zinc-500">
                        {rating === 1 && 'Muito ruim'}
                        {rating === 2 && 'Ruim'}
                        {rating === 3 && 'Regular'}
                        {rating === 4 && 'Bom'}
                        {rating === 5 && 'Excelente!'}
                    </p>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Comentário (opcional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Conte como foi a experiência..."
                            rows={3}
                            className="input-field resize-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-zinc-300 dark:border-zinc-700 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 btn-primary"
                        >
                            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
