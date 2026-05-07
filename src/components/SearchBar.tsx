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
      <div className="flex items-center gap-2 bg-white border-2 border-primary rounded-lg px-3 py-2">
        <Search size={20} className="text-primary" />
        <input
          type="text"
          placeholder="Buscar productos..."
          defaultValue={q}
          onChange={handleSearch}
          className="flex-1 outline-none text-gray-700"
        />
        {q && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
