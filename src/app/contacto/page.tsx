import ContactInfo from '@/components/ContactInfo'
import { ContactInfo as ContactInfoType } from '@/types'
import Link from 'next/link'

const contactData: ContactInfoType = {
  direccion: 'Bv Lehmann 609, Rafaela, Santa Fe, Argentina',
  whatsapp: '+5493492730010',
  horario_semana: 'Lun-Vie: 07:30 - 21:00',
  horario_sabado: 'Sáb atención integral: 09:00 - 12:00 | Veterinaria: 16:00 - 20:00',
  horario_domingo: 'Dom: 10:00 - 12:00 y 16:00 - 20:00',
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Contacto</h1>
          <p className="text-white">
            Te esperamos en nuestro local o ponete en contacto por WhatsApp
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
          <ContactInfo info={contactData} />
        </div>

        {/* Secciones de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">📋 Servicios</h2>
            <p className="text-gray-600 mb-6">
              Atención integral de lunes a viernes en horario extendido. Contamos con un equipo profesional.
            </p>
            <ul className="space-y-3 text-gray-700 font-medium">
              <li>✓ Atención veterinaria</li>
              <li>✓ Venta de productos</li>
              <li>✓ Asesoramiento profesional</li>
              <li>✓ Servicios especializados</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">🚨 ¿Emergencia?</h2>
            <p className="text-gray-600 mb-6">
              Disponibles fuera de horario para atender situaciones urgentes de tu mascota.
            </p>
            <div className="space-y-3">
              <a
                href="tel:+5493492665978"
                className="block w-full bg-red-500 text-white font-bold py-3 rounded-lg text-center hover:bg-red-600 transition"
              >
                📞 +54 9 3492 665978
              </a>
              <a
                href="https://wa.me/5493492730010"
                target="_blank"
                className="block w-full bg-green-500 text-white font-bold py-3 rounded-lg text-center hover:bg-green-600 transition"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-bold text-primary mb-4">📸 Síguenos</h2>
          <a
            href="https://instagram.com/vet.elyagua"
            target="_blank"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition"
          >
            <span>Instagram: @vet.elyagua</span>
          </a>
        </div>

        {/* Botón para volver a productos */}
        <div className="text-center">
          <Link
            href="/productos"
            className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition"
          >
            ← Volver a Productos
          </Link>
        </div>
      </div>
    </div>
  )
}
