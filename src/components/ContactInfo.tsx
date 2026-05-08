import { ContactInfo as ContactInfoType } from '@/types'
import { MapPin, MessageCircle, Clock } from 'lucide-react'

interface ContactInfoProps {
  info: ContactInfoType
}

export default function ContactInfo({ info }: ContactInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Ubicación */}
      <a
        href="https://maps.app.goo.gl/YAZoosPFCgGu6nvB9"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-4 items-start bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:border-primary hover:shadow-md transition min-h-[80px]"
      >
        <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition">
          <MapPin size={22} className="text-primary group-hover:text-white transition" />
        </div>
        <div>
          <p className="font-bold text-gray-900 mb-1">Ubicación</p>
          <p className="text-sm text-gray-600 leading-relaxed">{info.direccion}</p>
          <p className="text-xs text-primary font-medium mt-2 group-hover:underline">Ver en Google Maps →</p>
        </div>
      </a>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/${info.whatsapp.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-4 items-start bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:border-primary hover:shadow-md transition min-h-[80px]"
      >
        <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary transition">
          <MessageCircle size={22} className="text-primary group-hover:text-white transition" />
        </div>
        <div>
          <p className="font-bold text-gray-900 mb-1">WhatsApp</p>
          <p className="text-sm text-gray-600">{info.whatsapp}</p>
          <p className="text-xs text-primary font-medium mt-2 group-hover:underline">Escribinos →</p>
        </div>
      </a>

      {/* Horarios */}
      <div className="flex gap-4 items-start bg-white border border-gray-100 rounded-xl p-5 shadow-sm min-h-[80px]">
        <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
          <Clock size={22} className="text-primary" />
        </div>
        <div>
          <p className="font-bold text-gray-900 mb-2">Horarios</p>
          <div className="text-sm space-y-1">
            <div>
              <span className="font-semibold text-gray-800">Lun–Vie: </span>
              <span className="text-gray-600">7:30 – 21:00 hs</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Sábado: </span>
              <span className="text-gray-600">9:00–12:00 / 16:00–20:00 hs</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Domingo: </span>
              <span className="text-gray-600">10:00–12:00 / 16:00–20:00 hs</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
