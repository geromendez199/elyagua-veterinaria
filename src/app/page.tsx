import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                El Yagua Veterinaria
              </h1>
              <p className="text-xl text-primary-light mb-8">
                Tu veterinaria de confianza con los mejores productos y servicios para tus mascotas
              </p>
              <Link
                href="/productos"
                className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-primary-light hover:text-white transition"
              >
                Ver Productos
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <Image
                src="/logo-blanco-vertical.png"
                alt="El Yagua Veterinaria Logo"
                width={250}
                height={300}
                className="max-w-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition border-t-4 border-primary">
              <div className="text-4xl mb-4">🐾</div>
              <h3 className="text-xl font-bold mb-2 text-primary">Productos Premium</h3>
              <p className="text-gray-600">
                Seleccionamos cuidadosamente cada producto para el bienestar de tu mascota.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition border-t-4 border-primary-light">
              <div className="text-4xl mb-4">💪</div>
              <h3 className="text-xl font-bold mb-2 text-primary-dark">Asesoramiento</h3>
              <p className="text-gray-600">
                Nuestro equipo está capacitado para asesorarte en la mejor opción para tu mascota.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition border-t-4 border-dark">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-dark">Atención Rápida</h3>
              <p className="text-gray-600">
                Servicio ágil y profesional de lunes a domingo para tu comodidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Necesitas más información?</h2>
          <p className="text-lg mb-8">
            Contáctanos a través de WhatsApp o visita nuestra tienda en Rafaela
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/contacto"
              className="inline-block bg-white text-primary-dark font-bold py-3 px-8 rounded-lg hover:bg-primary-light hover:text-white transition"
            >
              📍 Información de Contacto
            </Link>
            <a
              href="https://wa.me/5493492730010"
              target="_blank"
              className="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition"
            >
              💬 WhatsApp Ventas
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
