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
      <div className="bg-gradient-to-br from-primary via-primary-dark to-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Nuestros Productos</h1>
          <p className="text-xl text-primary-light">
            Amplia variedad de productos de calidad para el bienestar de tu mascota
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <SearchBar />
        </div>

        <ProductsClient initialProducts={products} searchQuery={q || ''} />
      </div>
    </div>
  )
}
