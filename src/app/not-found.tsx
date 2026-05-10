import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md">
        <svg viewBox="0 0 100 100" className="w-20 h-20 mx-auto mb-4 text-primary/20" fill="currentColor">
          <ellipse cx="50" cy="65" rx="22" ry="18"/>
          <circle cx="27" cy="38" r="11"/>
          <circle cx="73" cy="38" r="11"/>
          <circle cx="18" cy="57" r="9"/>
          <circle cx="82" cy="57" r="9"/>
        </svg>
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
