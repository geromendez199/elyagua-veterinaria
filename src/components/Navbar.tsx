'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, Search, Star } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

// Carga el drawer solo cuando se necesita — no forma parte del bundle inicial
const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false })

export default function Navbar() {
  const { itemCount } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const openSearch = () => {
    setSearchOpen(true)
    setMenuOpen(false)
    setTimeout(() => searchInputRef.current?.focus(), 30)
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    router.push(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos')
    closeSearch()
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="bg-primary text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0" onClick={() => { setMenuOpen(false); closeSearch() }}>
              <Image
                src="/logo-blanco.png"
                alt="El Yagua Veterinaria"
                width={180}
                height={45}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex gap-8 items-center">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                    placeholder="Buscar productos..."
                    className="bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg px-4 py-1.5 text-sm outline-none focus:bg-white/30 w-60 transition"
                  />
                  <button type="submit" className="hover:text-primary-light transition p-1" aria-label="Buscar">
                    <Search size={18} />
                  </button>
                  <button type="button" onClick={closeSearch} className="hover:text-primary-light transition p-1" aria-label="Cerrar búsqueda">
                    <X size={18} />
                  </button>
                </form>
              ) : (
                <>
                  <Link href="/" className="hover:text-primary-light transition font-medium">Inicio</Link>
                  <Link href="/productos" className="hover:text-primary-light transition font-medium">Productos</Link>
                  <Link href="/mis-yaguamillas" className="hover:text-primary-light transition font-medium flex items-center gap-1.5">
                    <Star size={16} className="text-amber-400" fill="currentColor" />
                    Mis YaguaMillas
                  </Link>
                  <Link href="/consejos" className="hover:text-primary-light transition font-medium">Consejos</Link>
                  <Link href="/quienes-somos" className="hover:text-primary-light transition font-medium">Quiénes Somos</Link>
                  <Link href="/contacto" className="hover:text-primary-light transition font-medium">Contacto</Link>
                  <button
                    onClick={openSearch}
                    className="hover:text-primary-light transition"
                    aria-label="Buscar productos"
                  >
                    <Search size={20} />
                  </button>
                </>
              )}
              <button
                onClick={() => setCartOpen(true)}
                className="relative hover:text-primary-light transition"
                aria-label={`Abrir carrito de compras${itemCount > 0 ? ` con ${itemCount} producto${itemCount > 1 ? 's' : ''}` : ''}`}
              >
                <ShoppingCart size={24} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile: buscar + carrito + hamburguesa */}
            <div className="flex md:hidden items-center gap-3">
              <button
                onClick={searchOpen ? closeSearch : openSearch}
                className="hover:text-primary-light transition"
                aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar productos'}
              >
                {searchOpen ? <X size={22} /> : <Search size={22} />}
              </button>
              <button
                onClick={() => setCartOpen(true)}
                className="relative hover:text-primary-light transition"
                aria-label={`Abrir carrito de compras${itemCount > 0 ? ` con ${itemCount} producto${itemCount > 1 ? 's' : ''}` : ''}`}
              >
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setMenuOpen(!menuOpen); closeSearch() }}
                className="hover:text-primary-light transition"
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {menuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>

          {/* Mobile — buscador expandido */}
          {searchOpen && (
            <form onSubmit={handleSearchSubmit} className="md:hidden mt-2 pb-1 flex items-center gap-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg px-4 py-2 text-sm outline-none focus:bg-white/30"
                autoFocus
              />
              <button type="submit" className="bg-white text-primary font-semibold px-4 py-2 rounded-lg text-sm shrink-0">
                Buscar
              </button>
            </form>
          )}

          {/* Mobile menu desplegable */}
          {menuOpen && (
            <div className="md:hidden mt-3 pb-3 border-t border-white/20 flex flex-col gap-1 pt-3">
              <Link href="/" onClick={() => setMenuOpen(false)} className="py-2 px-2 rounded hover:bg-white/10 font-medium transition">Inicio</Link>
              <Link href="/productos" onClick={() => setMenuOpen(false)} className="py-2 px-2 rounded hover:bg-white/10 font-medium transition">Productos</Link>
              <Link href="/mis-yaguamillas" onClick={() => setMenuOpen(false)} className="py-2 px-2 rounded hover:bg-white/10 font-medium transition flex items-center gap-1.5">
                <Star size={16} className="text-amber-400" fill="currentColor" />
                Mis YaguaMillas
              </Link>
              <Link href="/consejos" onClick={() => setMenuOpen(false)} className="py-2 px-2 rounded hover:bg-white/10 font-medium transition">Consejos</Link>
              <Link href="/quienes-somos" onClick={() => setMenuOpen(false)} className="py-2 px-2 rounded hover:bg-white/10 font-medium transition">Quiénes Somos</Link>
              <Link href="/contacto" onClick={() => setMenuOpen(false)} className="py-2 px-2 rounded hover:bg-white/10 font-medium transition">Contacto</Link>
            </div>
          )}
        </div>
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
