export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">El Yagua Veterinaria</h1>
          <p className="text-xl text-primary-light mb-8">
            Tu veterinaria de confianza con los mejores productos para tus mascotas
          </p>
          <a
            href="/productos"
            className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-primary-light hover:text-white transition"
          >
            Ver Productos
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary-light bg-opacity-10 p-8 rounded-lg text-center">
              <div className="text-4xl mb-4">🐾</div>
              <h3 className="text-xl font-bold mb-2 text-primary">Productos de Calidad</h3>
              <p className="text-gray-600">
                Seleccionamos cuidadosamente cada producto para el bienestar de tu mascota.
              </p>
            </div>
            <div className="bg-primary-light bg-opacity-10 p-8 rounded-lg text-center">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-xl font-bold mb-2 text-primary">Expertos</h3>
              <p className="text-gray-600">
                Nuestro equipo está capacitado para asesorarte en la mejor opción.
              </p>
            </div>
            <div className="bg-primary-light bg-opacity-10 p-8 rounded-lg text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold mb-2 text-primary">Envíos Rápidos</h3>
              <p className="text-gray-600">
                Recibe tu compra en la comodidad de tu hogar en el menor tiempo posible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Preguntas?</h2>
          <p className="text-lg mb-8">
            Contáctanos a través de WhatsApp o visita nuestra tienda
          </p>
          <a
            href="/contacto"
            className="inline-block bg-white text-accent font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition"
          >
            Contactar Ahora
          </a>
        </div>
      </section>
    </div>
  );
}
