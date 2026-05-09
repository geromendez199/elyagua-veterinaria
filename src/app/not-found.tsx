import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl mb-4">🐾</p>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h2>
      <p className="text-gray-500 mb-6">La página que buscás no existe o fue eliminada.</p>
      <Link
        href="/"
        className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-dark transition"
      >
        Ir al inicio
      </Link>
    </div>
  )
}
