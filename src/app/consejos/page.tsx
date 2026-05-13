'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Articulo, ArticuloCategoria, Consejo, CONSEJO_CATEGORIES } from '@/types'
import VaccinationCalendar from '@/components/VaccinationCalendar'
import SimplifiedAgeSlider from '@/components/SimplifiedAgeSlider'
import { BookOpen, Calendar, User } from 'lucide-react'
import type { Metadata } from 'next'

interface ConsejoGrouped {
  [key: string]: Consejo[] | undefined
}

const CATEGORIA_COLORS: Record<ArticuloCategoria, string> = {
  Nutrición: 'bg-amber-100 text-amber-700',
  Salud: 'bg-blue-100 text-blue-700',
  Prevención: 'bg-green-100 text-green-700',
  Cuidados: 'bg-purple-100 text-purple-700',
  General: 'bg-gray-100 text-gray-600',
}

// Convert weeks to decimal years for API
const weeksToDecimalYears = (weeks: number): number => {
  return weeks / 52
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ConsejoPage() {
  // Articles state
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loadingArticles, setLoadingArticles] = useState(true)

  // Interactive section state
  const [ageInYears, setAgeInYears] = useState(1.5) // Default: 1.5 years
  const [tipo, setTipo] = useState<'perro' | 'gato'>('perro')
  const [consejos, setConsejos] = useState<Consejo[]>([])
  const [grouped, setGrouped] = useState<ConsejoGrouped>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Fetch articles on mount
  useEffect(() => {
    const fetchArticulos = async () => {
      try {
        const { data, error } = await supabase
          .from('articulos')
          .select('*')
          .eq('activo', true)
          .order('created_at', { ascending: false })
        if (error) throw error
        setArticulos(data || [])
      } catch (err) {
        console.error('Error fetching articles:', err)
        setArticulos([])
      } finally {
        setLoadingArticles(false)
      }
    }
    fetchArticulos()
  }, [])

  const handleBuscar = async () => {
    setLoading(true)
    setSubmitted(true)
    try {
      const res = await fetch(`/api/consejos?edad=${ageInYears}&tipo=${tipo}`)
      if (!res.ok) throw new Error('Error fetching consejos')
      const data = await res.json()
      setConsejos(data.consejos || [])
      setGrouped(data.grouped || {})
    } catch (err) {
      console.error('Error:', err)
      setConsejos([])
      setGrouped({})
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* SECTION 1: Consejos Veterinarios (Articles) */}
      <section className="bg-primary text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Consejos Veterinarios</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Tips, tablas y artículos escritos por nuestro equipo para el bienestar de tu mascota
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          {loadingArticles ? (
            <div className="text-center py-20">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-gray-600 font-semibold">Cargando artículos...</p>
            </div>
          ) : articulos.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Próximamente publicaremos consejos y artículos veterinarios.</p>
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
                  <div className="relative w-full h-52 bg-gray-50">
                    {art.imagen_url ? (
                      <Image
                        src={art.imagen_url}
                        alt={art.titulo}
                        fill
                        className="object-contain p-4 group-hover:scale-[1.03] transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <BookOpen size={40} className="text-primary/30" />
                      </div>
                    )}
                    {/* Categoría badge */}
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

      {/* Divider */}
      <div className="border-t-2 border-gray-100" />

      {/* SECTION 2: Consejos Personalizados (Interactive) */}
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Consejos Personalizados
          </h1>
          <p className="text-base md:text-lg text-primary-light mb-8">
            Descubre recomendaciones específicas según la edad y tipo de tu mascota
          </p>

          {/* Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-10 space-y-6 max-w-2xl mx-auto">
            {/* Age Slider */}
            <SimplifiedAgeSlider value={ageInYears} onChange={setAgeInYears} />

            {/* Tipo Mascota */}
            <div>
              <span className="block text-left text-lg font-bold mb-4">¿Qué tipo de mascota tienes?</span>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value="perro"
                    checked={tipo === 'perro'}
                    onChange={(e) => setTipo(e.target.value as 'perro' | 'gato')}
                    className="sr-only"
                  />
                  <div
                    className={`p-4 rounded-xl border-2 transition-all text-center font-bold ${
                      tipo === 'perro'
                        ? 'border-white bg-white text-primary'
                        : 'border-white/30 bg-white/10 text-white hover:border-white/50'
                    }`}
                  >
                    Perro
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value="gato"
                    checked={tipo === 'gato'}
                    onChange={(e) => setTipo(e.target.value as 'perro' | 'gato')}
                    className="sr-only"
                  />
                  <div
                    className={`p-4 rounded-xl border-2 transition-all text-center font-bold ${
                      tipo === 'gato'
                        ? 'border-white bg-white text-primary'
                        : 'border-white/30 bg-white/10 text-white hover:border-white/50'
                    }`}
                  >
                    Gato
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleBuscar}
              disabled={loading}
              className="w-full bg-white text-primary font-bold py-4 px-6 rounded-xl hover:bg-primary-light hover:text-white transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Buscando...' : 'Ver Consejos'}
            </button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {submitted && (
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
                <p className="mt-4 text-gray-600 font-semibold">Cargando consejos personalizados...</p>
              </div>
            ) : consejos.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
                <p className="text-2xl mb-2">😔</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No hay consejos disponibles</h3>
                <p className="text-gray-600">
                  Intenta cambiar la edad o tipo de mascota para obtener recomendaciones.
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Vaccination Calendar - Always show first */}
                {tipo && (
                  <div>
                    <VaccinationCalendar tipoMascota={tipo} edadActual={ageInYears} />
                  </div>
                )}

                {/* Grouped Consejos by Category */}
                {Object.entries(grouped).map(([categoria, items]) => {
                  if (!items || items.length === 0) return null

                  const categoryInfo = CONSEJO_CATEGORIES[categoria as keyof typeof CONSEJO_CATEGORIES]
                  if (!categoryInfo) return null

                  return (
                    <div key={categoria}>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">{categoryInfo.icon}</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{categoryInfo.label}</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {items.map((consejo) => (
                          <div
                            key={consejo.id}
                            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border-l-4 border-primary"
                          >
                            {/* Image */}
                            {consejo.imagen_url && (
                              <div className="relative h-48 w-full bg-gray-100">
                                <Image
                                  src={consejo.imagen_url}
                                  alt={consejo.titulo}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
                                />
                              </div>
                            )}

                            {/* Content */}
                            <div className="p-5">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{consejo.titulo}</h3>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{consejo.contenido}</p>

                              {/* Age Range Badge */}
                              <div className="flex items-center gap-2 text-xs text-primary font-semibold">
                                <span>📅 Edad:</span>
                                <span>
                                  {consejo.edad_minima}
                                  {consejo.edad_maxima ? ` - ${consejo.edad_maxima}` : '+'} años
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* CTA Section */}
            {submitted && consejos.length > 0 && (
              <div className="mt-16 bg-primary text-white rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-3">¿Tenés más preguntas?</h3>
                <p className="mb-6">Contacta con nuestro equipo veterinario para asesoramiento personalizado</p>
                <a
                  href="https://wa.me/5493492730010"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold py-3 px-8 rounded-xl hover:bg-primary-light hover:text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  Escribinos por WhatsApp
                </a>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
