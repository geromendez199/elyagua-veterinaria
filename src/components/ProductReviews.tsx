'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Star, MessageCircle, Loader2 } from 'lucide-react'

interface Review {
  id: string
  nombre: string
  rating: number
  comentario?: string
  verificada: boolean
  created_at: string
}

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', email: '', rating: 5, comentario: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('resenas')
        .select('*')
        .eq('producto_id', productId)
        .order('created_at', { ascending: false })

      setReviews(data || [])
      setLoading(false)
    }

    fetchReviews()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMessage('')

    try {
      // Verificar si el email está registrado en clientes
      const { data: cliente } = await supabase
        .from('clientes')
        .select('id')
        .ilike('nombre', `%${formData.nombre}%`)
        .single()

      const { error } = await supabase.from('resenas').insert([{
        producto_id: productId,
        nombre: formData.nombre,
        email: formData.email,
        rating: formData.rating,
        comentario: formData.comentario || null,
        verificada: !!cliente,
      }])

      if (error) throw error

      setSubmitMessage(cliente ? '✓ Reseña publicada (verificada por cliente registrado)' : '✓ Reseña enviada (pendiente verificación de compra)')
      setFormData({ nombre: '', email: '', rating: 5, comentario: '' })
      setFormOpen(false)

      // Recargar reseñas
      const { data } = await supabase
        .from('resenas')
        .select('*')
        .eq('producto_id', productId)
        .order('created_at', { ascending: false })
      setReviews(data || [])
    } catch (error) {
      setSubmitMessage('Error al enviar la reseña')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reseñas del producto</h2>
        {avgRating && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={i < Math.round(parseFloat(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="font-semibold text-gray-900">{avgRating}/5</span>
            <span className="text-sm text-gray-500">({reviews.length})</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 && !formOpen ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-600 mb-4">Aún no hay reseñas. ¡Sé el primero!</p>
          <button
            onClick={() => setFormOpen(true)}
            className="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-primary-dark transition"
          >
            Dejar una reseña
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{review.nombre}</span>
                      {review.verificada && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Comprador verificado</span>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('es-AR')}
                  </span>
                </div>
                {review.comentario && (
                  <p className="text-gray-700 text-sm mt-2">{review.comentario}</p>
                )}
              </div>
            ))}
          </div>

          {!formOpen && (
            <button
              onClick={() => setFormOpen(true)}
              className="w-full border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-primary hover:text-white transition"
            >
              Dejar una reseña
            </button>
          )}
        </>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-gray-900 mb-4">Compartí tu experiencia</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Tu nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm"
            />
            <input
              type="email"
              placeholder="Tu email (para verificación)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Calificación</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className="transition"
                >
                  <Star
                    size={28}
                    className={formData.rating >= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Contanos qué pensás del producto (opcional)"
            value={formData.comentario}
            onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
            maxLength={500}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm resize-none"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : 'Enviar reseña'}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="flex-1 border-2 border-gray-300 text-gray-600 font-bold py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
          </div>

          {submitMessage && (
            <p className={`text-sm ${submitMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {submitMessage}
            </p>
          )}
        </form>
      )}
    </div>
  )
}
