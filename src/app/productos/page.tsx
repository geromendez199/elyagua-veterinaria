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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-2">Nuestros Productos</h1>
        <p className="text-gray-600 mb-8">
          Descubre nuestra amplia variedad de productos para tus mascotas
        </p>

        <div className="mb-8">
          <SearchBar />
        </div>

        <ProductsClient initialProducts={products} searchQuery={q || ''} />
      </div>
    </div>
  )
}
