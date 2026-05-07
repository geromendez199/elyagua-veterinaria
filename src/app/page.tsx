import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-dark text-white py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center gap-8">
            <div className="mb-4">
              <Image
                src="/logo-blanco-vertical.png"
                alt="El Yagua Veterinaria"
                width={200}
                height={250}
                className="h-40 w-auto mx-auto"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold">
              El Yagua Veterinaria
            </h1>
            <p className="text-xl md:text-2xl text-primary-light max-w-2xl leading-relaxed">
              Tu veterinaria de confianza con productos de calidad y atención profesional para tus mascotas
            </p>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Link
                href="/productos"
                className="bg-white text-primary font-bold py-4 px-12 rounded-xl hover:bg-primary-light hover:text-white transition text-lg shadow-lg"
              >
                🛍️ Ver Productos
              </Link>
              <Link
                href="/contacto"
                className="bg-primary-light text-white font-bold py-4 px-12 rounded-xl hover:bg-white hover:text-primary transition text-lg shadow-lg"
              >
                📞 Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white via-primary via-opacity-5 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-primary">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-2xl font-bold mb-4">Productos Premium</h3>
              <p className="text-primary-light leading-relaxed">
                Seleccionamos cada producto con cuidado para el bienestar y comodidad de tu mascota.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-primary-light to-primary text-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="text-6xl mb-4">💪</div>
              <h3 className="text-2xl font-bold mb-4">Equipo Experto</h3>
              <p className="text-opacity-90 text-white leading-relaxed">
                Nuestro equipo profesional te asesora para encontrar la mejor solución.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-dark to-primary-dark text-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="text-6xl mb-4">⏱️</div>
              <h3 className="text-2xl font-bold mb-4">Siempre Disponible</h3>
              <p className="text-primary-light leading-relaxed">
                Atención integral de lunes a domingo. Urgencias disponibles 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-dark text-white py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">¿Listo para cuidar a tu mascota?</h2>
            <p className="text-xl text-primary-light">
              Es muy fácil explorar nuestros productos o contactarnos
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link
              href="/productos"
              className="bg-white text-primary font-bold py-4 px-12 rounded-xl hover:bg-primary-light hover:text-white transition text-lg shadow-lg"
            >
              🛍️ Explorar Catálogo
            </Link>
            <a
              href="https://wa.me/5493492730010"
              target="_blank"
              className="bg-green-500 text-white font-bold py-4 px-12 rounded-xl hover:bg-green-600 transition text-lg shadow-lg"
            >
              💬 WhatsApp
            </a>
            <Link
              href="/contacto"
              className="bg-primary-light text-white font-bold py-4 px-12 rounded-xl hover:bg-white hover:text-primary transition text-lg shadow-lg"
            >
              📍 Visitarnos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
