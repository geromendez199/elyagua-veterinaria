'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useFetchData } from '@/hooks'
import { BookOpen } from 'lucide-react'

interface Articulo {
  id: string
  titulo: string
  slug: string
  contenido: string
  imagen_url?: string
  categoria: string
  activo: boolean
  created_at: string
}

export default function ArticulosPage() {
  const { data: articulos, loading } = useFetchData<Articulo>('/api/articulos?activo=true')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredArticulos = articulos.filter((a) => {
    const matchesCategory = !selectedCategory || a.categoria === selectedCategory
    const matchesSearch =
      a.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.contenido.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const uniqueCategories = Array.from(new Set(articulos.map(a => a.categoria)))

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-primary text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Artículos de Interés</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Lee nuestros artículos sobre cuidado de mascotas, nutrición y salud veterinaria
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-primary text-gray-900"
            />
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-600 mb-3">Filtrar por categoría:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  selectedCategory === null
                    ? 'bg-primary text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary'
                }`}
              >
                Todos
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-gray-600 font-semibold">Cargando artículos...</p>
            </div>
          ) : filteredArticulos.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay artículos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticulos.map((articulo) => (
                <Link
                  key={articulo.id}
                  href={`/articulos/${articulo.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition border-l-4 border-primary block"
                >
                  <div className="relative w-full h-48 bg-gray-100">
                    {articulo.imagen_url ? (
                      <Image
                        src={articulo.imagen_url}
                        alt={articulo.titulo}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <BookOpen size={40} className="text-primary/30" />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">
                      {articulo.categoria}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2 mb-3 line-clamp-2">
                      {articulo.titulo}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {articulo.contenido}
                    </p>
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
