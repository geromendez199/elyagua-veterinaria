import { MapPin, Phone, PhoneCall, AtSign } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Sobre nosotros */}
          <div>
            <h3 className="font-bold mb-4 text-lg text-primary-light">Sobre Nosotros</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Tu veterinaria de confianza con productos y servicios de calidad para el bienestar de tus mascotas.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold mb-4 text-lg text-primary-light">Contacto</h3>
            <ul className="text-sm space-y-3 text-gray-300">
              <li>
                <a
                  href="https://maps.app.goo.gl/YAZoosPFCgGu6nvB9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:text-primary transition"
                >
                  <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>Bv Lehmann 609, Rafaela, Santa Fe</span>
                </a>
              </li>
              <li>
                <a href="tel:+5493492730010" className="flex items-center gap-2 hover:text-primary transition">
                  <Phone size={16} className="text-primary shrink-0" />
                  <span>+54 9 3492 730010 (Ventas)</span>
                </a>
              </li>
              <li>
                <a href="tel:+5493492665978" className="flex items-center gap-2 hover:text-primary transition">
                  <PhoneCall size={16} className="text-primary shrink-0" />
                  <span>+54 9 3492 665978 (Urgencias)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/vet.elyagua"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition"
                >
                  <AtSign size={16} className="text-primary shrink-0" />
                  <span>vet.elyagua</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="font-bold mb-4 text-lg text-primary-light">Horarios</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div>
                <p className="font-semibold text-white">Lun-Vie:</p>
                <p>7:30 - 21:00</p>
              </div>
              <div>
                <p className="font-semibold text-white">Sábado:</p>
                <p className="text-xs">Integral: 9:00-12:00 | Vet: 16:00-20:00</p>
              </div>
              <div>
                <p className="font-semibold text-white">Domingo:</p>
                <p className="text-xs">10:00-12:00 / 16:00-20:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary/30 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} El Yagua Veterinaria. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
