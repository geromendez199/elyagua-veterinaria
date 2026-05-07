import { ContactInfo as ContactInfoType } from '@/types'
import { MapPin, Phone, Clock } from 'lucide-react'

interface ContactInfoProps {
  info: ContactInfoType
}

export default function ContactInfo({ info }: ContactInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
      <div className="bg-primary-light bg-opacity-10 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <MapPin className="text-primary" size={24} />
          <h3 className="font-bold text-lg">Ubicación</h3>
        </div>
        <p className="text-gray-700">{info.direccion}</p>
      </div>

      <div className="bg-primary-light bg-opacity-10 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Phone className="text-primary" size={24} />
          <h3 className="font-bold text-lg">WhatsApp</h3>
        </div>
        <a
          href={`https://wa.me/${info.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-dark font-semibold"
        >
          {info.whatsapp}
        </a>
      </div>

      <div className="bg-primary-light bg-opacity-10 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="text-primary" size={24} />
          <h3 className="font-bold text-lg">Horarios</h3>
        </div>
        <div className="text-gray-700 text-sm space-y-1">
          <p><strong>Lun-Vie:</strong> {info.horario_semana}</p>
          <p><strong>Sábado:</strong> {info.horario_sabado}</p>
          <p><strong>Domingo:</strong> {info.horario_domingo}</p>
        </div>
      </div>
    </div>
  )
}
