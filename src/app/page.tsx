import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-center text-center gap-8">
            <div>
              <Image
                src="/logo-blanco-vertical.png"
                alt="El Yagua Veterinaria"
                width={200}
                height={250}
                className="h-48 w-auto mx-auto"
              />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                El Yagua Veterinaria
              </h1>
              <p className="text-xl text-primary-light max-w-2xl mx-auto">
                Tu veterinaria de confianza con productos de calidad y atención profesional para tus mascotas
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-6">
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
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-primary">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-lg shadow-md hover:shadow-xl transition border-b-4 border-primary">
              <div className="text-5xl mb-4">🐾</div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Productos Premium</h3>
              <p className="text-gray-700 leading-relaxed">
                Seleccionamos cuidadosamente cada producto para el bienestar de tu mascota.
              </p>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-md hover:shadow-xl transition border-b-4 border-primary-light">
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-2xl font-bold mb-4 text-primary">Equipo Experto</h3>
              <p className="text-gray-700 leading-relaxed">
                Nuestro equipo profesional te asesora en la mejor solución.
              </p>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-md hover:shadow-xl transition border-b-4 border-primary-dark">
              <div className="text-5xl mb-4">⏱️</div>
              <h3 className="text-2xl font-bold mb-4 text-primary-dark">Siempre Disponible</h3>
              <p className="text-gray-700 leading-relaxed">
                Atención integral de lunes a domingo. Urgencias 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">¿Listo para cuidar a tu mascota?</h2>
          <p className="text-xl text-primary-light mb-10">
            Explora nuestro catálogo o contáctanos ahora
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="bg-white text-primary font-bold py-3 px-10 rounded-lg hover:bg-primary-light hover:text-white transition text-lg"
            >
              Explorar Productos
            </Link>
            <a
              href="https://wa.me/5493492730010"
              target="_blank"
              className="bg-green-500 text-white font-bold py-3 px-10 rounded-lg hover:bg-green-600 transition text-lg"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
