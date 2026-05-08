import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import AddToCartButton from '@/components/AddToCartButton'
import ProductCard from '@/components/ProductCard'
import { ChevronRight, Share2, MapPin } from 'lucide-react'

export const revalidate = 60

interface PageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await supabase.from('productos').select('*').eq('id', id).eq('activo', true).single()
  return data || null
}

async function getRelated(categoria: string, excludeId: string): Promise<Product[]> {
  const { data } = await supabase
    .from('productos')
    .select('*')
    .eq('categoria', categoria)
    .eq('activo', true)
    .neq('id', excludeId)
    .limit(4)
  return data || []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Producto no encontrado' }
  return {
    title: product.nombre,
    description: product.descripcion || `${product.nombre} — $${product.precio.toLocaleString('es-AR')}`,
    openGraph: {
      title: product.nombre,
      description: product.descripcion || '',
      images: product.imagen_url ? [{ url: product.imagen_url }] : [],
    },
  }
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const related = await getRelated(product.categoria, product.id)

  const shareText = `🐾 *${product.nombre}*\n$${product.precio.toLocaleString('es-AR')}\n\nhttps://elyagua-veterinaria.vercel.app/productos/${product.id}`
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary transition">Inicio</Link>
          <ChevronRight size={14} />
          <Link href="/productos" className="hover:text-primary transition">Productos</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium truncate">{product.nombre}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Producto principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Imagen */}
            <div className="relative aspect-square bg-gray-100">
              {product.imagen_url ? (
                <Image
                  src={product.imagen_url}
                  alt={product.nombre}
                  fill
                  className="object-contain p-6"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                  Sin imagen
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 md:p-10 flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="text-xs bg-primary text-white px-3 py-1 rounded-full capitalize font-semibold">
                  {product.categoria}
                </span>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Compartir por WhatsApp"
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition"
                >
                  <Share2 size={15} />
                  <span className="hidden sm:inline">Compartir</span>
                </a>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {product.nombre}
              </h1>

              {product.descripcion && (
                <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                  {product.descripcion}
                </p>
              )}

              <div className="mt-auto">
                {/* Precio */}
                <div className="mb-4">
                  <p className="text-4xl font-bold text-primary">
                    ${product.precio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </p>
                  <p className={`text-sm font-semibold mt-1 ${
                    product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-orange-500' : 'text-green-600'
                  }`}>
                    {product.stock === 0
                      ? '✕ Sin stock'
                      : product.stock < 5
                      ? `⚠ Últimas ${product.stock} unidades`
                      : `✓ En stock (${product.stock} disponibles)`}
                  </p>
                </div>

                {/* Botón agregar al carrito */}
                <AddToCartButton product={product} />

                {/* Info de entrega */}
                <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={15} className="text-primary shrink-0" />
                    <span>Retiro gratuito · Bv Lehmann 609, Rafaela</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-primary font-bold shrink-0">🚚</span>
                    <span>Envío a domicilio · coordinar por WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Más productos de <span className="text-primary capitalize">{product.categoria}</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/productos"
            className="inline-block border-2 border-primary text-primary font-bold py-3 px-8 rounded-xl hover:bg-primary hover:text-white transition"
          >
            ← Ver todos los productos
          </Link>
        </div>
      </div>
    </div>
  )
}
