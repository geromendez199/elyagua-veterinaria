'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Calendar, User } from 'lucide-react'

interface Articulo {
  id: string
  titulo: string
  slug: string
  contenido: string
  imagen_url?: string
  categoria: string
  created_at: string
  updated_at: string
}

export default function ArticuloDetailPage() {
  const params = useParams()
  const [articulo, setArticulo] = useState<Articulo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticulo = async () => {
      try {
        const { data, error } = await supabase
          .from('articulos')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        setArticulo(data)
      } catch (err) {
        console.error('Error fetching articulo:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticulo()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-semibold">Cargando artículo...</p>
        </div>
      </div>
    )
  }

  if (!articulo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-semibold mb-4">Artículo no encontrado</p>
          <Link href="/articulos" className="text-primary hover:text-primary-dark font-semibold">
            ← Volver a artículos
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = articulo.created_at
    ? new Date(articulo.created_at).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Fecha no disponible'

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-primary text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/articulos" className="flex items-center gap-2 text-white/80 hover:text-white transition mb-6">
            <ArrowLeft size={20} />
            Volver a artículos
          </Link>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-4">
            {articulo.categoria}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{articulo.titulo}</h1>

          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>El Yagua Veterinaria</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {articulo.imagen_url && (
            <div className="relative w-full h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
              <Image
                src={articulo.imagen_url}
                alt={articulo.titulo}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none mb-12">
            <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
              {articulo.contenido}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <Link
              href="/articulos"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition"
            >
              <ArrowLeft size={20} />
              Volver a todos los artículos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
