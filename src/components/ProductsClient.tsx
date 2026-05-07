'use client'

import { useState, useMemo } from 'react'
import { Product, Category } from '@/types'
import ProductCard from './ProductCard'
import CategoryFilter from './CategoryFilter'

interface ProductsClientProps {
  initialProducts: Product[]
  searchQuery?: string
}

export default function ProductsClient({
  initialProducts,
  searchQuery = '',
}: ProductsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const filteredProducts = useMemo(() => {
    let products = initialProducts

    // Filtrar por categoría
    if (selectedCategory) {
      products = products.filter((p) => p.categoria === selectedCategory)
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      products = products.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q)
      )
    }

    return products
  }, [initialProducts, selectedCategory, searchQuery])

  return (
    <div>
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No se encontraron productos. Intenta con otra búsqueda o categoría.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
