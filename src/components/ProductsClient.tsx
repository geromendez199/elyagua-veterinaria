'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Product, Category } from '@/types'
import ProductCard from './ProductCard'
import CategoryFilter from './CategoryFilter'
import { ArrowUpDown, SlidersHorizontal, X, Star } from 'lucide-react'

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
  initialCategory?: Category | null
}

export default function ProductsClient({ initialProducts, searchQuery = '', initialCategory = null }: ProductsClientProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory)
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showPriceFilter, setShowPriceFilter] = useState(false)
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock'>('all')
  const [selectedLab, setSelectedLab] = useState<string | null>(null)
  const [showYaguamillas, setShowYaguamillas] = useState(false)

  const hasPriceFilter = minPrice !== '' || maxPrice !== ''
  const hasActiveFilters = hasPriceFilter || selectedCategory || stockFilter !== 'all' || selectedLab || showYaguamillas

  const clearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setStockFilter('all')
    setSelectedCategory(null)
    setSelectedLab(null)
    setShowYaguamillas(false)
  }

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of initialProducts) {
      counts[p.categoria] = (counts[p.categoria] || 0) + 1
    }
    return counts
  }, [initialProducts])

  const labCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of initialProducts) {
      if (p.laboratorio) {
        counts[p.laboratorio] = (counts[p.laboratorio] || 0) + 1
      }
    }
    return counts
  }, [initialProducts])

  const handleCategoryChange = (cat: Category | null) => {
    setSelectedCategory(cat)
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (cat) params.set('categoria', cat)
    const qs = params.toString()
    router.replace(`/productos${qs ? '?' + qs : ''}`, { scroll: false })
  }

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

    if (stockFilter === 'in-stock') products = products.filter((p) => p.stock > 0)
    if (stockFilter === 'low-stock') products = products.filter((p) => p.stock > 0 && p.stock <= 5)

    if (selectedLab) products = products.filter((p) => p.laboratorio === selectedLab)

    if (showYaguamillas) products = products.filter((p) => (p.puntos || 0) > 0)

    switch (sortBy) {
      case 'price-asc':  products.sort((a, b) => a.precio - b.precio); break
      case 'price-desc': products.sort((a, b) => b.precio - a.precio); break
      case 'name-asc':   products.sort((a, b) => a.nombre.localeCompare(b.nombre)); break
    }

    return products
  }, [initialProducts, selectedCategory, searchQuery, sortBy, minPrice, maxPrice, stockFilter, selectedLab, showYaguamillas])

  return (
    <div>
      {/* Fila 1: Categorías + controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} counts={categoryCounts} />

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

          {/* YaguaMillas filter */}
          <button
            onClick={() => setShowYaguamillas(!showYaguamillas)}
            className={`flex items-center gap-1.5 border-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              showYaguamillas
                ? 'border-primary text-primary bg-primary/5'
                : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
            }`}
          >
            <Star size={15} className={showYaguamillas ? 'fill-primary' : ''} />
            <span className="hidden sm:inline">YaguaMillas</span>
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

      {/* Fila 2: Filtros expandibles (precio + stock) */}
      {showPriceFilter && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <SlidersHorizontal size={16} className="text-primary shrink-0" />
            <span className="text-sm font-semibold text-gray-700 shrink-0">Precio:</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Mín"
                min={0}
                className="flex-1 min-w-0 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-primary"
              />
              <span className="text-gray-400 text-sm shrink-0">—</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Máx"
                min={0}
                className="flex-1 min-w-0 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Stock filter */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-sm font-semibold text-gray-700 shrink-0">Disponibilidad:</span>
            <div className="flex items-center gap-2 flex-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="all"
                  checked={stockFilter === 'all'}
                  onChange={(e) => setStockFilter(e.target.value as 'all' | 'in-stock' | 'low-stock')}
                  className="cursor-pointer"
                />
                <span className="text-sm text-gray-700">Todos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="in-stock"
                  checked={stockFilter === 'in-stock'}
                  onChange={(e) => setStockFilter(e.target.value as 'all' | 'in-stock' | 'low-stock')}
                  className="cursor-pointer"
                />
                <span className="text-sm text-gray-700">En stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="low-stock"
                  checked={stockFilter === 'low-stock'}
                  onChange={(e) => setStockFilter(e.target.value as 'all' | 'in-stock' | 'low-stock')}
                  className="cursor-pointer"
                />
                <span className="text-sm text-gray-700">Stock limitado</span>
              </label>
            </div>
          </div>

          {Object.keys(labCounts).length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-sm font-semibold text-gray-700 shrink-0">Laboratorio:</span>
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <button
                  onClick={() => setSelectedLab(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedLab === null
                      ? 'bg-primary text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-primary'
                  }`}
                >
                  Todos
                </button>
                {Object.entries(labCounts).sort(([a], [b]) => a.localeCompare(b)).map(([lab, count]) => (
                  <button
                    key={lab}
                    onClick={() => setSelectedLab(lab)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      selectedLab === lab
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-primary'
                    }`}
                  >
                    {lab} ({count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-red-500 transition py-2 border border-gray-200 rounded-lg hover:border-red-200"
            >
              <X size={14} /> Limpiar todos los filtros
            </button>
          )}
        </div>
      )}

      {/* Contador y filtros activos */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
          {hasActiveFilters && <span className="ml-1 text-primary font-medium">· filtrado</span>}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-500 hover:text-red-600 transition flex items-center gap-1"
          >
            <X size={12} /> Limpiar filtros
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="currentColor">
            <ellipse cx="50" cy="65" rx="22" ry="18"/>
            <circle cx="27" cy="38" r="11"/>
            <circle cx="73" cy="38" r="11"/>
            <circle cx="18" cy="57" r="9"/>
            <circle cx="82" cy="57" r="9"/>
          </svg>
          <p className="text-gray-500 text-lg font-semibold">No se encontraron productos</p>
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
