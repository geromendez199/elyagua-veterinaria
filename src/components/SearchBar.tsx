'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Product } from '@/types'
import Image from 'next/image'
import { formatPrice } from '@/lib/formatPrice'

interface SearchBarProps {
  products?: Product[]
}

export default function SearchBar({ products = [] }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  const [inputValue, setInputValue] = useState(q)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isOpen = showSuggestions && suggestions.length > 0

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setShowSuggestions(true)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length >= 2) {
      setLoading(true)
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
          const data = await res.json()
          setSuggestions(data)
        } catch {
          setSuggestions([])
        } finally {
          setLoading(false)
        }
      }, 300)
      router.push(`/productos?q=${encodeURIComponent(value)}`)
    } else {
      setSuggestions([])
      router.push('/productos')
    }
  }

  const handleSuggestionClick = (product: Product) => {
    setInputValue(product.nombre)
    setShowSuggestions(false)
    router.push(`/productos?q=${encodeURIComponent(product.nombre)}`)
  }

  const handleClear = () => {
    setInputValue('')
    setShowSuggestions(false)
    router.push('/productos')
    inputRef.current?.focus()
  }

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Input */}
      <div
        className={`flex items-center gap-3 bg-white border-2 border-primary px-4 py-3 shadow-lg transition-all ${
          isOpen ? 'rounded-t-xl shadow-none' : 'rounded-xl'
        }`}
      >
        <Search size={22} className="text-primary shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar productos..."
          value={inputValue}
          onChange={handleChange}
          onFocus={() => inputValue.trim().length >= 2 && setShowSuggestions(true)}
          className="flex-1 outline-none text-gray-700 font-medium placeholder-gray-400 bg-transparent"
        />
        {inputValue && (
          <button onClick={handleClear} className="text-gray-400 hover:text-primary transition">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-2 border-t-0 border-primary rounded-b-xl shadow-xl z-50 overflow-hidden">
          {loading && (
            <div className="px-4 py-8 text-center">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              <p className="text-xs text-gray-400 mt-2">Buscando...</p>
            </div>
          )}
          {!loading && suggestions.length === 0 && inputValue.trim().length >= 2 && (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">No se encontraron productos</div>
          )}
          {suggestions.map((product, i) => (
            <button
              key={product.id}
              onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(product) }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition text-left ${
                i < suggestions.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              {product.imagen_url ? (
                <Image
                  src={product.imagen_url}
                  alt={product.nombre}
                  width={40}
                  height={40}
                  className="w-10 h-10 object-cover rounded-lg shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center">
                  <Search size={14} className="text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-semibold text-sm truncate">{product.nombre}</p>
                <p className="text-primary font-bold text-sm">
                  {formatPrice(product.precio)}
                </p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded capitalize shrink-0">
                {product.categoria}
              </span>
            </button>
          ))}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            {suggestions.length} resultado{suggestions.length !== 1 ? 's' : ''} — Enter para ver todos
          </div>
        </div>
      )}
    </div>
  )
}
