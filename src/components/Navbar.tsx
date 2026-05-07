'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const { itemCount } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <nav className="bg-primary text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo-blanco.png"
                alt="El Yagua Veterinaria"
                width={180}
                height={45}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Links */}
            <div className="flex gap-12 items-center">
              <Link
                href="/"
                className="hover:text-primary-light transition font-medium"
              >
                Inicio
              </Link>
              <Link
                href="/productos"
                className="hover:text-primary-light transition font-medium"
              >
                Productos
              </Link>
              <Link
                href="/contacto"
                className="hover:text-primary-light transition font-medium"
              >
                Contacto
              </Link>

              {/* Carrito */}
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="relative hover:text-primary-light transition"
                title="Carrito de compras"
              >
                <ShoppingCart size={24} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
