import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Articulo, ArticuloCategoria } from '@/types'
import { BookOpen, Calendar, User } from 'lucide-react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Info y Consejos',
  description: 'Artículos e información útil sobre salud, nutrición y cuidado de mascotas, escritos por nuestro equipo veterinario.',
}

export const revalidate = 60

const CATEGORIA_COLORS: Record<ArticuloCategoria, string> = {
  Nutrición:  'bg-amber-100 text-amber-700',
  Salud:      'bg-blue-100 text-blue-700',
  Prevención: 'bg-green-100 text-green-700',
  Cuidados:   'bg-purple-100 text-purple-700',
  General:    'bg-gray-100 text-gray-600',
}

async function getArticulos(): Promise<Articulo[]> {
  try {
    const { data, error } = await supabase
      .from('articulos')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function InfoPage() {
  const articulos = await getArticulos()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-primary text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Info y Consejos</h1>
          <p className="text-lg md:text-xl text-primary-light max-w-2xl mx-auto">
            Artículos escritos por nuestro equipo veterinario para el bienestar de tu mascota
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          {articulos.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Próximamente publicaremos artículos y consejos veterinarios.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articulos.map((art) => (
                <Link
                  key={art.id}
                  href={`/info/${art.slug}`}
                  className="group flex flex-col border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white"
                >
                  {/* Imagen */}
                  <div className="relative w-full h-48 bg-gray-100">
                    {art.imagen_url ? (
                      <Image
                        src={art.imagen_url}
                        alt={art.titulo}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <BookOpen size={40} className="text-primary/30" />
                      </div>
                    )}
                    {/* Categoría badge sobre la imagen */}
                    <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORIA_COLORS[art.categoria]}`}>
                      {art.categoria}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex flex-col flex-1 p-5">
                    <h2 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-primary transition line-clamp-2">
                      {art.titulo}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                      {art.resumen}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <User size={13} />
                        {art.autor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {formatDate(art.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
