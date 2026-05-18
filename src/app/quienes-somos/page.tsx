import LazyImage from '@/components/LazyImage'
import Link from 'next/link'
import { Heart, Target, Award } from 'lucide-react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiénes Somos',
  description: 'Conoce al equipo profesional de El Yagua Veterinaria dedicado al cuidado de tus mascotas.',
}

export default function QuienesSomosPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Quiénes Somos</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Un equipo profesional dedicado al bienestar y cuidado de tus mascotas
          </p>
        </div>
      </section>

      {/* Equipo Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nuestro Equipo</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Profesionales con experiencia y pasión por cuidar a tus mascotas como si fueran parte de la familia
            </p>
          </div>

          {/* Foto del Equipo */}
          <div className="rounded-2xl overflow-hidden shadow-xl mb-12" style={{ height: '420px' }}>
            <img
              src="/team.jpg"
              alt="Equipo de El Yagua Veterinaria"
              className="w-full h-full"
              style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
            />
          </div>

          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Amor por los Animales</h3>
              <p className="text-gray-600">
                Tratamos a cada mascota con el cuidado y cariño que se merece, como si fuera parte de nuestra familia
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Profesionalismo</h3>
              <p className="text-gray-600">
                Nuestro equipo está constantemente actualizado con las últimas técnicas y conocimientos veterinarios
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Compromiso</h3>
              <p className="text-gray-600">
                Nos comprometemos a brindar la mejor atención y cuidado integral para la salud de tus mascotas
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Nuestra Historia</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              El Yagua Veterinaria nace de la pasión de un equipo de profesionales veterinarios que buscaban crear un espacio donde el cuidado de las mascotas fuera lo primero.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ubicados en Bv. Lehmann 609, Rafaela, nos especializamos en ofrecer productos de calidad premium y atención profesional personalizada para cada uno de tus compañeros peludos.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Desde nuestro comienzo, hemos estado comprometidos con la excelencia en el cuidado veterinario, brindando soluciones integrales para la salud y bienestar de tus mascotas.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Necesitas nuestra ayuda?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Contáctanos o visita nuestro catálogo de productos para conocer todo lo que ofrecemos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/productos"
                className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition"
              >
                Ver Productos
              </Link>
              <Link
                href="/contacto"
                className="border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary/5 transition"
              >
                Contactanos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
