import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center gap-6">
            <div>
              <Image
                src="/logo-blanco-vertical.png"
                alt="El Yagua Veterinaria"
                width={200}
                height={250}
                className="h-36 md:h-48 w-auto mx-auto"
              />
            </div>
            <div>
              <p className="text-lg md:text-3xl text-white max-w-2xl mx-auto px-2">
                Tu veterinaria de confianza con productos de calidad y atención profesional para tus mascotas
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
              <Link
                href="/productos"
                className="bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-primary-light hover:text-white transition text-base md:text-lg text-center"
              >
                Ver Productos
              </Link>
              <Link
                href="/contacto"
                className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-primary transition text-base md:text-lg text-center"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-16 text-primary">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 md:p-10 rounded-lg shadow-md hover:shadow-xl transition border-b-4 border-primary">
              <div className="text-4xl mb-3">🐾</div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-primary">Productos Premium</h3>
              <p className="text-gray-700 leading-relaxed">
                Seleccionamos cuidadosamente cada producto para el bienestar de tu mascota.
              </p>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-lg shadow-md hover:shadow-xl transition border-b-4 border-primary-light">
              <div className="text-4xl mb-3">💪</div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-primary">Equipo Experto</h3>
              <p className="text-gray-700 leading-relaxed">
                Nuestro equipo profesional te asesora en la mejor solución.
              </p>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-lg shadow-md hover:shadow-xl transition border-b-4 border-primary-dark">
              <div className="text-4xl mb-3">⏱️</div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-primary-dark">Siempre Disponible</h3>
              <p className="text-gray-700 leading-relaxed">
                Atención integral de lunes a domingo. Urgencias 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">¿Listo para cuidar a tu mascota?</h2>
          <p className="text-base md:text-xl text-white mb-8">
            Explora nuestro catálogo o contáctanos ahora
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
            <Link
              href="/productos"
              className="bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-primary-light hover:text-white transition text-base md:text-lg text-center"
            >
              Explorar Productos
            </Link>
            <a
              href="https://wa.me/5493492730010"
              target="_blank"
              className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition text-base md:text-lg text-center"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
