import Link from 'next/link'
import LazyImage from '@/components/LazyImage'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md">
        <div className="w-20 h-20 mx-auto mb-4 opacity-20">
          <LazyImage
            src="/logo-color.png"
            alt="El Yagua Veterinaria"
            width={80}
            height={80}
            className="w-full h-full"
            objectFit="contain"
          />
        </div>
        <p className="text-8xl font-black text-primary/15 leading-none mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Página no encontrada</h1>
        <p className="text-gray-500 leading-relaxed mb-8">
          La página que buscás no existe o fue eliminada.<br />
          Pero tenemos todo lo que tu mascota necesita.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/productos"
            className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-dark transition"
          >
            Ver Productos
          </Link>
          <Link
            href="/"
            className="border-2 border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:border-primary hover:text-primary transition"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
