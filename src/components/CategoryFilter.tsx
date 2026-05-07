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
    <div className="flex flex-wrap gap-3 mb-8">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-6 py-2 rounded-lg font-semibold transition ${
          selectedCategory === null
            ? 'bg-primary text-white shadow-lg'
            : 'bg-primary-light bg-opacity-20 text-primary hover:bg-opacity-40'
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onCategoryChange(cat.value)}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            selectedCategory === cat.value
              ? 'bg-primary-dark text-white shadow-lg'
              : 'bg-primary-light bg-opacity-20 text-primary hover:bg-opacity-40'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
