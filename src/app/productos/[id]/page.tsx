import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import AddToCartButton from '@/components/AddToCartButton'
import ProductCard from '@/components/ProductCard'
import StockAlert from '@/components/StockAlert'
import { ChevronRight, Share2, MapPin, XCircle, AlertTriangle, CheckCircle2, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/formatPrice'
import { WA_URL, SITE_URL, LOW_STOCK_THRESHOLD } from '@/lib/constants'

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
  const productUrl = `${SITE_URL}/productos/${id}`
  const priceText = `${formatPrice(product.precio)}`
  return {
    title: product.nombre,
    description: product.descripcion || `${product.nombre} — ${priceText}`,
    openGraph: {
      title: product.nombre,
      description: product.descripcion ? `${product.descripcion} — ${priceText}` : priceText,
      url: productUrl,
      type: 'website',
      siteName: 'El Yagua Veterinaria',
      locale: 'es_AR',
      images: product.imagen_url ? [
        {
          url: product.imagen_url,
          width: 1200,
          height: 630,
          alt: product.nombre,
          type: 'image/jpeg',
        },
      ] : [
        {
          url: `${SITE_URL}/logo-color.png`,
          width: 512,
          height: 512,
          alt: 'El Yagua Veterinaria',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.nombre,
      description: product.descripcion ? `${product.descripcion} — ${priceText}` : priceText,
      images: product.imagen_url ? [product.imagen_url] : [`${SITE_URL}/logo-color.png`],
    },
  }
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const related = await getRelated(product.categoria, product.id)

  const productUrl = `${SITE_URL}/productos/${product.id}`
  const shareText = `🐾 *${product.nombre}*\n${formatPrice(product.precio)}\n\n${productUrl}`
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
  const consultaUrl = `${WA_URL}?text=${encodeURIComponent(`Hola! Me interesa el producto *${product.nombre}* (${formatPrice(product.precio)}). ¿Está disponible?`)}`
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nombre,
    description: product.descripcion || '',
    image: product.imagen_url || '',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'ARS',
      price: product.precio,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'El Yagua Veterinaria' },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio',    item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Productos', item: `${SITE_URL}/productos` },
      { '@type': 'ListItem', position: 3, name: product.nombre, item: productUrl },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <svg viewBox="0 0 24 24" className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="m21 15-5-5L7 21"/>
                    </svg>
                    <p className="text-sm text-gray-400">Imagen no disponible</p>
                  </div>
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

              {(product.presentacion || product.laboratorio) && (
                <div className="mb-6 space-y-2 text-sm">
                  {product.presentacion && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Presentación:</span>
                      <span className="font-semibold text-gray-900">{product.presentacion}</span>
                    </div>
                  )}
                  {product.laboratorio && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Laboratorio:</span>
                      <span className="font-semibold text-gray-900">{product.laboratorio}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-auto">
                {/* Precio */}
                <div className="mb-4">
                  <p className="text-4xl font-bold text-primary">
                    {formatPrice(product.precio)}
                  </p>
                  <p className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${
                    product.stock === 0 ? 'text-red-500' : product.stock < LOW_STOCK_THRESHOLD ? 'text-orange-500' : 'text-green-600'
                  }`}>
                    {product.stock === 0
                      ? <><XCircle size={15} /> Sin stock</>
                      : product.stock < LOW_STOCK_THRESHOLD
                      ? <><AlertTriangle size={15} /> Últimas {product.stock} unidades</>
                      : <><CheckCircle2 size={15} /> En stock ({product.stock} disponibles)</> }
                  </p>
                </div>

                {/* Botón agregar al carrito */}
                <AddToCartButton product={product} />

                {/* Consultar por WhatsApp */}
                <a
                  href={consultaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full border-2 border-green-500 text-green-600 font-bold py-3 rounded-xl hover:bg-green-500 hover:text-white transition text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 0 0 .614.612l6.288-1.634A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.587-.5-5.084-1.373l-.36-.214-3.733.97.999-3.62-.235-.374A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Consultar por WhatsApp
                </a>

                {/* Notificación de stock */}
                <StockAlert productId={product.id} productName={product.nombre} inStock={product.stock > 0} />

                {/* Info de entrega */}
                <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={15} className="text-primary shrink-0" />
                    <span>Retiro gratuito · Bv Lehmann 609, Rafaela</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Truck size={15} className="text-primary shrink-0" />
                    <span>Envío a domicilio · coordinar por WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {related.length > 0 && (
          <div className="mt-12">
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
    </>
  )
}