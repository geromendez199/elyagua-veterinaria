'use client'

import { Category } from '@/types'

interface CategoryFilterProps {
  selectedCategory: Category | null
  onCategoryChange: (category: Category | null) => void
  counts?: Record<string, number>
}

const categories: { value: Category; label: string }[] = [
  { value: 'alimentos',    label: 'Alimentos' },
  { value: 'juguetes',     label: 'Juguetes' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'accesorios',   label: 'Accesorios' },
]

export default function CategoryFilter({ selectedCategory, onCategoryChange, counts }: CategoryFilterProps) {
  const totalCount = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : undefined

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-4 py-1.5 rounded-lg font-semibold transition text-sm flex items-center gap-1.5 ${
          selectedCategory === null
            ? 'bg-primary text-white shadow'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Todos
        {totalCount !== undefined && (
          <span className={`text-xs font-normal ${selectedCategory === null ? 'opacity-75' : 'opacity-60'}`}>
            ({totalCount})
          </span>
        )}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onCategoryChange(cat.value)}
          className={`px-4 py-1.5 rounded-lg font-semibold transition text-sm flex items-center gap-1.5 ${
            selectedCategory === cat.value
              ? 'bg-primary text-white shadow'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat.label}
          {counts?.[cat.value] !== undefined && (
            <span className={`text-xs font-normal ${selectedCategory === cat.value ? 'opacity-75' : 'opacity-60'}`}>
              ({counts[cat.value]})
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
