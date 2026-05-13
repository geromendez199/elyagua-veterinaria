import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Articulo, ArticuloCategoria } from '@/types'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import type { Metadata } from 'next'

export const revalidate = 3600

// Pre-render all published articles at build time → served from CDN, zero DB reads per visit
export async function generateStaticParams() {
  const { data } = await supabase.from('articulos').select('slug').eq('activo', true)
  return (data || []).map((a) => ({ slug: a.slug }))
}

const CATEGORIA_COLORS: Record<ArticuloCategoria, string> = {
  Nutrición:  'bg-amber-100 text-amber-700',
  Salud:      'bg-blue-100 text-blue-700',
  Prevención: 'bg-green-100 text-green-700',
  Cuidados:   'bg-purple-100 text-purple-700',
  General:    'bg-gray-100 text-gray-600',
}

async function getArticulo(slug: string): Promise<Articulo | null> {
  try {
    const { data, error } = await supabase
      .from('articulos')
      .select('*')
      .eq('slug', slug)
      .eq('activo', true)
      .single()
    if (error) return null
    return data
  } catch {
    return null
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const art = await getArticulo(slug)
  if (!art) return { title: 'Artículo no encontrado' }
  return {
    title: art.titulo,
    description: art.resumen,
  }
}

export default async function ArticuloPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const art = await getArticulo(slug)
  if (!art) notFound()

  const paragraphs = art.contenido.split('\n\n').filter(Boolean)
  const hasImage = !!art.imagen_url

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Back */}
        <Link
          href="/info"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition mb-8"
        >
          <ArrowLeft size={16} />
          Volver a Consejos Veterinarios
        </Link>

        {/* Categoría */}
        <div className="flex items-center gap-2 mb-4">
          <Tag size={14} className="text-gray-400" />
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORIA_COLORS[art.categoria]}`}>
            {art.categoria}
          </span>
        </div>

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {art.titulo}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <User size={15} />
            {art.autor}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={15} />
            {formatDate(art.created_at)}
          </span>
        </div>

        {/* Resumen destacado */}
        <p className="text-lg text-gray-600 leading-relaxed font-medium border-l-4 border-primary pl-4 mb-8 italic">
          {art.resumen}
        </p>

        {/* Contenido — 2 columnas si hay imagen, 1 columna si no */}
        {hasImage ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">

            {/* Texto — columna izquierda (3/5) */}
            <div className="md:col-span-3 prose prose-gray max-w-none">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-5 text-base">
                  {p}
                </p>
              ))}
            </div>

            {/* Imagen — columna derecha (2/5), sticky al hacer scroll */}
            <div className="md:col-span-2 md:sticky md:top-24">
              <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
                <Image
                  src={art.imagen_url!}
                  alt={art.titulo}
                  width={600}
                  height={600}
                  className="w-full h-auto object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="prose prose-gray max-w-none">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-5 text-base">
                {p}
              </p>
            ))}
          </div>
        )}

        {/* Footer del artículo */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">{art.autor}</p>
            <p className="text-xs text-gray-400">El Yagua Veterinaria</p>
          </div>
          <Link
            href="/info"
            className="text-sm font-semibold text-primary hover:text-primary-dark transition"
          >
            ← Ver más consejos
          </Link>
        </div>
      </div>
    </div>
  )
}
