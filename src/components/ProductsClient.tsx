'use client'

import { useState, useMemo } from 'react'
import { Product, Category } from '@/types'
import ProductCard from './ProductCard'
import CategoryFilter from './CategoryFilter'
import { ArrowUpDown } from 'lucide-react'

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default',    label: 'Relevancia' },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name-asc',   label: 'Nombre: A–Z' },
]

interface ProductsClientProps {
  initialProducts: Product[]
  searchQuery?: string
}

export default function ProductsClient({
  initialProducts,
  searchQuery = '',
}: ProductsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('default')

  const filteredProducts = useMemo(() => {
    let products = [...initialProducts]

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

    // Ordenar
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.precio - b.precio)
        break
      case 'price-desc':
        products.sort((a, b) => b.precio - a.precio)
        break
      case 'name-asc':
        products.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
    }

    return products
  }, [initialProducts, selectedCategory, searchQuery, sortBy])

  return (
    <div>
      {/* Categorías + Ordenar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown size={16} className="text-primary shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-primary bg-white cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No se encontraron productos. Intenta con otra búsqueda o categoría.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">{filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
