'use client'

import { useState, useMemo } from 'react'
import { Product, Category } from '@/types'
import ProductCard from './ProductCard'
import CategoryFilter from './CategoryFilter'
import { ArrowUpDown, SlidersHorizontal, X } from 'lucide-react'

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

export default function ProductsClient({ initialProducts, searchQuery = '' }: ProductsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showPriceFilter, setShowPriceFilter] = useState(false)

  const maxPossible = useMemo(
    () => Math.ceil(Math.max(...initialProducts.map((p) => p.precio), 0) / 1000) * 1000,
    [initialProducts]
  )

  const hasPriceFilter = minPrice !== '' || maxPrice !== ''

  const clearPriceFilter = () => { setMinPrice(''); setMaxPrice('') }

  const filteredProducts = useMemo(() => {
    let products = [...initialProducts]

    if (selectedCategory) products = products.filter((p) => p.categoria === selectedCategory)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      products = products.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion?.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q)
      )
    }

    if (minPrice !== '') products = products.filter((p) => p.precio >= parseFloat(minPrice))
    if (maxPrice !== '') products = products.filter((p) => p.precio <= parseFloat(maxPrice))

    switch (sortBy) {
      case 'price-asc':  products.sort((a, b) => a.precio - b.precio); break
      case 'price-desc': products.sort((a, b) => b.precio - a.precio); break
      case 'name-asc':   products.sort((a, b) => a.nombre.localeCompare(b.nombre)); break
    }

    return products
  }, [initialProducts, selectedCategory, searchQuery, sortBy, minPrice, maxPrice])

  return (
    <div>
      {/* Fila 1: Categorías + controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

        <div className="flex items-center gap-2 shrink-0">
          {/* Botón filtro precio */}
          <button
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            className={`flex items-center gap-1.5 border-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              hasPriceFilter || showPriceFilter
                ? 'border-primary text-primary bg-primary/5'
                : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
            }`}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Precio</span>
            {hasPriceFilter && <span className="w-2 h-2 bg-primary rounded-full" />}
          </button>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={15} className="text-primary shrink-0" />
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
      </div>

      {/* Fila 2: Filtro de precio (expandible) */}
      {showPriceFilter && (
        <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <SlidersHorizontal size={16} className="text-primary shrink-0" />
          <span className="text-sm font-semibold text-gray-700 shrink-0">Precio:</span>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Mín"
              min={0}
              className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-primary"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={`Máx (${maxPossible.toLocaleString('es-AR')})`}
              min={0}
              className="w-36 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-primary"
            />
            {hasPriceFilter && (
              <button onClick={clearPriceFilter} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition">
                <X size={14} /> Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contador */}
      <p className="text-sm text-gray-400 mb-4">
        {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
        {hasPriceFilter && <span className="ml-1 text-primary font-medium">· filtrado por precio</span>}
      </p>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos.</p>
          <p className="text-sm text-gray-400 mt-1">Probá con otra búsqueda, categoría o rango de precio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
