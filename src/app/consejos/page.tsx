'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import { supabase } from '@/lib/supabase'
import { Consejo, ConsejoCategoria, CONSEJO_CATEGORIES } from '@/types'
import { BookOpen } from 'lucide-react'
import VaccinationTable from '@/components/VaccinationTable'

type ConsejoOrArticulo = Consejo | any

export default function ConsejoPage() {
  const [consejos, setConsejos] = useState<ConsejoOrArticulo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<ConsejoCategoria | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchConsejos = async () => {
      try {
        const res = await fetch('/api/articulos?activo=true')
        const result = await res.json()
        if (result.success) {
          setConsejos(result.data || [])
        } else {
          console.error('Error fetching consejos:', result.error)
          setConsejos([])
        }
      } catch (err) {
        console.error('Error fetching consejos:', err)
        setConsejos([])
      } finally {
        setLoading(false)
      }
    }
    fetchConsejos()
  }, [])

  const filteredConsejos = consejos.filter((c) => {
    const matchesCategory = !selectedCategory || c.categoria === selectedCategory
    const matchesSearch =
      c.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contenido.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Get unique categories from the data
  const uniqueCategories = Array.from(new Set(consejos.map(c => c.categoria)))
  const categories = uniqueCategories.map(cat => [cat, { label: cat }])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-primary text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Consejos Veterinarios</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Tips y consejos escritos por nuestro equipo para el bienestar de tu mascota
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Buscar consejos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-primary text-gray-900"
            />
          </div>

          {/* Filter Buttons */}
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
              {categories.map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    selectedCategory === key
                      ? 'bg-primary text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary'
                  }`}
                >
                  {value.label}
                </button>
              ))}
            </div>
          </div>

          {/* Consejos Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-gray-600 font-semibold">Cargando consejos...</p>
            </div>
          ) : filteredConsejos.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay consejos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConsejos.map((consejo) => {
                const categoryInfo = CONSEJO_CATEGORIES[consejo.categoria as ConsejoCategoria]
                const categoryLabel = categoryInfo?.label || consejo.categoria
                return (
                  <Link
                    key={consejo.id}
                    href={`/consejos/${consejo.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition border-l-4 border-primary h-full group-hover:translate-y-1"
                    >
                    {/* Image */}
                    <div className="w-full h-48 bg-gray-100">
                      {consejo.imagen_url ? (
                        <LazyImage
                          src={consejo.imagen_url}
                          alt={consejo.titulo}
                          width={400}
                          height={192}
                          className="w-full h-full"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <BookOpen size={40} className="text-primary/30" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">
                        {categoryLabel}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-2 mb-3 line-clamp-2">
                        {consejo.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {consejo.contenido}
                      </p>

                      {/* Meta Info */}
                      {consejo.tipo_mascota && (
                        <div className="flex items-center text-xs text-gray-500 border-t pt-3">
                          <span>
                            {consejo.tipo_mascota === 'ambos' ? '🐕 🐱 Ambos' : consejo.tipo_mascota === 'perro' ? '🐕 Perro' : '🐱 Gato'}
                          </span>
                        </div>
                      )}
                    </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Vaccination Table Section */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4">
          <VaccinationTable showTitle={true} darkBg={true} />
        </div>
      </section>
    </div>
  )
}
