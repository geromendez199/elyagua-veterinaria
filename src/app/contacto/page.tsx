import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Encontranos en Bv Lehmann 609, Rafaela. Escribinos por WhatsApp o visitanos en nuestro local.',
}
import ContactInfo from '@/components/ContactInfo'
import { ContactInfo as ContactInfoType } from '@/types'
import Link from 'next/link'
import { ClipboardList, CheckCircle2 } from 'lucide-react'
import InstagramIcon from '@/components/InstagramIcon'
import FacebookIcon from '@/components/FacebookIcon'
import { PHONE, WA_URL, INSTAGRAM_URL, FACEBOOK_URL } from '@/lib/constants'

const contactData: ContactInfoType = {
  direccion: 'Bv Lehmann 609, Rafaela, Santa Fe, Argentina',
  whatsapp: PHONE,
  horario_semana: 'Lun-Vie: 07:30 - 21:00',
  horario_sabado: 'Sáb atención integral: 09:00 - 12:00 | Veterinaria: 16:00 - 20:00',
  horario_domingo: 'Dom: 10:00 - 12:00 y 16:00 - 20:00',
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Contacto</h1>
          <p className="text-white text-sm md:text-base">
            Te esperamos en nuestro local o ponete en contacto por WhatsApp
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">

        {/* Info cards */}
        <div className="mb-8">
          <ContactInfo info={contactData} />
        </div>

        {/* Servicios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ClipboardList size={22} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Servicios</h2>
          </div>
          <p className="text-gray-600 mb-5 text-sm leading-relaxed">
            Atención integral de lunes a viernes en horario extendido. Contamos con un equipo profesional.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Atención veterinaria', 'Venta de productos', 'Asesoramiento profesional', 'Servicios especializados'].map((s) => (
              <li key={s} className="flex items-center gap-2 text-gray-700 font-medium">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Redes sociales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <InstagramIcon size={20} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Seguinos</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 w-full sm:w-auto bg-dark text-white font-bold py-3 px-5 rounded-xl hover:bg-primary transition group"
            >
              <div className="w-8 h-8 bg-primary group-hover:bg-white/20 rounded-lg flex items-center justify-center transition shrink-0">
                <InstagramIcon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 group-hover:text-white/70 transition">Instagram</p>
                <p className="text-sm font-bold">@vet.elyagua</p>
              </div>
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 w-full sm:w-auto bg-dark text-white font-bold py-3 px-5 rounded-xl hover:bg-primary transition group"
            >
              <div className="w-8 h-8 bg-primary group-hover:bg-white/20 rounded-lg flex items-center justify-center transition shrink-0">
                <FacebookIcon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 group-hover:text-white/70 transition">Facebook</p>
                <p className="text-sm font-bold">veterinaria.elyagua</p>
              </div>
            </a>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center">
          <Link
            href="/productos"
            className="inline-block border-2 border-primary text-primary font-bold py-3 px-8 rounded-xl hover:bg-primary hover:text-white transition"
          >
            ← Ver Productos
          </Link>
        </div>

      </div>
    </div>
  )
}
