import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'
import ProductsClient from '@/components/ProductsClient'
import { Product } from '@/types'

export const revalidate = 60

async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function ProductosPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-primary text-white py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Nuestros Productos</h1>
          <p className="text-white text-sm md:text-base">
            Amplia variedad de productos de calidad para el bienestar de tu mascota
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="mb-12">
          <SearchBar products={products} />
        </div>

        <ProductsClient initialProducts={products} searchQuery={q || ''} />
      </div>
    </div>
  )
}
