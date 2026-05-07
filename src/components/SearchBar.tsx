'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      router.push(`/productos?q=${encodeURIComponent(value)}`)
    } else {
      router.push('/productos')
    }
  }

  const handleClear = () => {
    router.push('/productos')
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 bg-white border-2 border-primary rounded-xl px-4 py-3 shadow-lg">
        <Search size={22} className="text-primary" />
        <input
          type="text"
          placeholder="Buscar productos..."
          defaultValue={q}
          onChange={handleSearch}
          className="flex-1 outline-none text-gray-700 font-medium"
        />
        {q && (
          <button
            onClick={handleClear}
            className="text-primary hover:text-primary-dark transition"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
