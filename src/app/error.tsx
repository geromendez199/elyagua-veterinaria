'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl mb-4">🐾</p>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
      <p className="text-gray-500 mb-6">Ocurrió un error inesperado. Podés intentar de nuevo.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-dark transition"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="border-2 border-primary text-primary font-bold px-6 py-2.5 rounded-xl hover:bg-primary hover:text-white transition"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
