import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-dark text-white py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center gap-6">
            <h1 className="text-5xl md:text-7xl font-bold">
              El Yagua Veterinaria
            </h1>
            <p className="text-xl md:text-2xl text-primary-light max-w-2xl">
              Tu veterinaria de confianza con productos de calidad y atención profesional para tus mascotas
            </p>
            <div className="flex gap-4 mt-8">
              <Link
                href="/productos"
                className="bg-white text-primary font-bold py-3 px-10 rounded-lg hover:bg-primary-light hover:text-white transition text-lg"
              >
                Ver Productos
              </Link>
              <Link
                href="/contacto"
                className="border-2 border-white text-white font-bold py-3 px-10 rounded-lg hover:bg-white hover:text-primary transition text-lg"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-primary">
              <div className="text-5xl mb-4">🐾</div>
              <h3 className="text-xl font-bold mb-3 text-primary">Productos Premium</h3>
              <p className="text-gray-600 leading-relaxed">
                Seleccionamos con cuidado cada producto para el bienestar y comodidad de tu mascota.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-primary-light">
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-xl font-bold mb-3 text-primary">Expertos</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestro equipo profesional te asesora para encontrar la mejor solución para tu mascota.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-primary-dark">
              <div className="text-5xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold mb-3 text-primary-dark">Disponibilidad</h3>
              <p className="text-gray-600 leading-relaxed">
                Atención integral de lunes a domingo. Siempre disponibles cuando nos necesitas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-dark to-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">¿Listo para cuidar a tu mascota?</h2>
            <p className="text-lg text-primary-light">
              Explorar nuestros productos o contactarnos es muy fácil
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="inline-block bg-white text-primary-dark font-bold py-4 px-10 rounded-lg hover:bg-primary-light hover:text-white transition text-lg text-center"
            >
              🛍️ Explorar Catálogo
            </Link>
            <a
              href="https://wa.me/5493492730010"
              target="_blank"
              className="inline-block bg-green-500 text-white font-bold py-4 px-10 rounded-lg hover:bg-green-600 transition text-lg text-center"
            >
              💬 Escribir por WhatsApp
            </a>
            <Link
              href="/contacto"
              className="inline-block border-2 border-white text-white font-bold py-4 px-10 rounded-lg hover:bg-white hover:text-primary-dark transition text-lg text-center"
            >
              📍 Visitarnos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
