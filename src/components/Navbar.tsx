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
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-blanco.png"
                alt="El Yagua Veterinaria"
                width={200}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Link>
            <div className="flex gap-8 items-center">
              <Link href="/" className="hover:text-primary-light transition font-medium">
                Inicio
              </Link>
              <Link href="/productos" className="hover:text-primary-light transition font-medium">
                Productos
              </Link>
              <Link href="/contacto" className="hover:text-primary-light transition font-medium">
                Contacto
              </Link>
              <Link href="/admin" className="text-sm hover:text-primary-light transition opacity-75">
                Admin
              </Link>
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="relative hover:text-primary-light transition"
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
