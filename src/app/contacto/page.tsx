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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-2">Contacto</h1>
        <p className="text-gray-600 mb-12">
          Te esperamos en nuestro local o ponte en contacto por WhatsApp
        </p>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <ContactInfo info={contactData} />
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">Atención integral</h2>
            <p className="text-gray-600 mb-4">
              Disponible de lunes a viernes en horario extendido. Contamos con un equipo profesional para atender a tu mascota.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Atención de mascotas</li>
              <li>✓ Venta de productos</li>
              <li>✓ Asesoramiento veterinario</li>
              <li>✓ Servicios especializados</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">¿Urgencia?</h2>
            <p className="text-gray-600 mb-4">
              Llamá a nuestro número de urgencias si necesitas atención inmediata fuera de horario.
            </p>
            <a
              href="tel:+5493492665978"
              className="block w-full bg-red-500 text-white font-bold py-3 rounded-lg text-center hover:bg-red-600 transition mb-4"
            >
              📞 Urgencias: +54 9 3492 665978
            </a>
            <a
              href="https://wa.me/5493492730010"
              target="_blank"
              className="block w-full bg-green-500 text-white font-bold py-3 rounded-lg text-center hover:bg-green-600 transition"
            >
              💬 WhatsApp: +54 9 3492 730010
            </a>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Síguenos en redes</h2>
          <div className="flex gap-4">
            <a
              href="https://instagram.com/vet.elyagua"
              target="_blank"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition"
            >
              📸 Instagram: @vet.elyagua
            </a>
          </div>
        </div>

        {/* Botón para volver a productos */}
        <div className="text-center mt-12">
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
