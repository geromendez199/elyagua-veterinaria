'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import LazyImage from '@/components/LazyImage'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface Articulo {
  id: string
  titulo: string
  contenido: string
  categoria: string
  tipo_mascota?: string | null
  veterinario_autor?: string | null
  imagen_url?: string
  created_at?: string
}

export default function ConsejoDetail() {
  const params = useParams()
  const router = useRouter()
  const [consejo, setConsejo] = useState<Articulo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchConsejo = async () => {
      try {
        const res = await fetch(`/api/articulos/${params.id}`)
        const result = await res.json()
        if (result.success && result.data) {
          setConsejo(result.data)
        } else {
          setError('Consejo no encontrado')
        }
      } catch (err) {
        console.error('Error fetching consejo:', err)
        setError('Error al cargar el consejo')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchConsejo()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-semibold">Cargando consejo...</p>
        </div>
      </div>
    )
  }

  if (error || !consejo) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-8">{error || 'Consejo no encontrado'}</p>
            <Link
              href="/consejos"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              <ArrowLeft size={20} />
              Volver a consejos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const categoryEmojis: Record<string, string> = {
    'Nutrición': '🍖',
    'Salud': '💊',
    'Prevención': '🛡️',
    'Cuidados': '✨',
    'General': '📚'
  }
  const categoryEmoji = categoryEmojis[consejo?.categoria || ''] || '📖'

  const tipoMascota = consejo?.tipo_mascota === 'ambos'
    ? 'Perros y Gatos'
    : consejo?.tipo_mascota === 'perro'
    ? 'Perros'
    : consejo?.tipo_mascota === 'gato'
    ? 'Gatos'
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-4">
          <Link
            href="/consejos"
            className="p-2 hover:bg-primary-dark rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <p className="text-primary-light text-sm font-semibold">{categoryEmoji} {consejo.categoria}</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">{consejo.titulo}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Featured Image */}
        {consejo.imagen_url && (
          <div className="mb-8 rounded-2xl overflow-hidden bg-gray-200 h-96">
            <LazyImage
              src={consejo.imagen_url}
              alt={consejo.titulo}
              width={800}
              height={400}
              className="w-full h-full"
              objectFit="cover"
            />
          </div>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-gray-200 text-sm text-gray-600">
          {tipoMascota && (
            <div>
              <span className="font-semibold text-gray-700">Para: </span>
              {tipoMascota}
            </div>
          )}
          {consejo?.veterinario_autor && (
            <div>
              <span className="font-semibold text-gray-700">Autor: </span>
              {consejo.veterinario_autor}
            </div>
          )}
          {consejo.created_at && (
            <div>
              <span className="font-semibold text-gray-700">Publicado: </span>
              {new Date(consejo.created_at).toLocaleDateString('es-AR')}
            </div>
          )}
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {consejo.contenido}
          </div>
        </article>

        {/* Back Button */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/consejos"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            <ArrowLeft size={20} />
            Volver a consejos
          </Link>
        </div>
      </div>
    </div>
  )
}
