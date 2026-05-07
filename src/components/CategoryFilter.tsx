'use client'

import { Category } from '@/types'

interface CategoryFilterProps {
  selectedCategory: Category | null
  onCategoryChange: (category: Category | null) => void
}

const categories: { value: Category; label: string }[] = [
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'juguetes', label: 'Juguetes' },
  { value: 'remedios', label: 'Remedios' },
  { value: 'accesorios', label: 'Accesorios' },
]

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-4 py-2 rounded-lg transition ${
          selectedCategory === null
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onCategoryChange(cat.value)}
          className={`px-4 py-2 rounded-lg transition ${
            selectedCategory === cat.value
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
