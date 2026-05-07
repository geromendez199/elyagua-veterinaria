import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            🐾 El Yagua Veterinaria
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-primary-light transition">
              Inicio
            </Link>
            <Link href="/productos" className="hover:text-primary-light transition">
              Productos
            </Link>
            <Link href="/contacto" className="hover:text-primary-light transition">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
