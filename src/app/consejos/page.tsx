'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Articulo, ArticuloCategoria } from '@/types'
import VaccinationTable from '@/components/VaccinationTable'
import { BookOpen, Calendar, User } from 'lucide-react'

const CATEGORIA_COLORS: Record<ArticuloCategoria, string> = {
  Nutrición: 'bg-amber-100 text-amber-700',
  Salud: 'bg-blue-100 text-blue-700',
  Prevención: 'bg-green-100 text-green-700',
  Cuidados: 'bg-purple-100 text-purple-700',
  General: 'bg-gray-100 text-gray-600',
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ConsejoPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loadingArticles, setLoadingArticles] = useState(true)

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
      <section className="py-12 md:py-20 bg-primary text-white">
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
                  className="group flex flex-col border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition bg-white hover:bg-gray-50"
                >
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
                    <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORIA_COLORS[art.categoria]}`}>
                      {art.categoria}
                    </span>
                  </div>
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

      {/* SECTION 2: Tabla de Vacunación */}
      <section className="bg-gradient-to-b from-primary to-primary-dark py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <VaccinationTable showTitle darkBg />
        </div>

        {/* CTA */}
        <div className="max-w-5xl mx-auto px-4 mt-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">¿Tenés más preguntas?</h3>
            <p className="text-white/80 mb-6">
              Contactá con nuestro equipo veterinario para asesoramiento personalizado
            </p>
            <a
              href="https://wa.me/5493492730010"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold py-3 px-8 rounded-xl hover:bg-primary-light hover:text-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
