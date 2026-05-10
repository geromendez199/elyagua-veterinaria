import { MapPin, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import InstagramIcon from './InstagramIcon'
import FacebookIcon from './FacebookIcon'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-white pt-12 pb-8 md:pt-16">
      <div className="max-w-7xl mx-auto px-4">

        {/* Logo + tagline */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-12">
          <Link href="/">
            <Image
              src="/logo-blanco.png"
              alt="El Yagua Veterinaria"
              width={180}
              height={50}
              className="h-12 w-auto mb-3 opacity-90 hover:opacity-100 transition"
            />
          </Link>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Tu veterinaria de confianza en Rafaela, Santa Fe. Productos de calidad y atención profesional para tus mascotas.
          </p>
        </div>

        {/* Grid de info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-10">

          {/* Navegación */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary-light">Navegación</h3>
            <ul className="text-sm space-y-2.5 text-gray-300">
              <li><Link href="/" className="hover:text-primary transition">Inicio</Link></li>
              <li><Link href="/productos" className="hover:text-primary transition">Productos</Link></li>
              <li><Link href="/contacto" className="hover:text-primary transition">Contacto</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary-light">Legal</h3>
            <ul className="text-sm space-y-2.5 text-gray-300">
              <li><Link href="/legal/terms" className="hover:text-primary transition">Términos y Condiciones</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-primary transition">Política de Privacidad</Link></li>
              <li><Link href="/legal/shipping" className="hover:text-primary transition">Envíos y Devoluciones</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary-light">Contacto</h3>
            <ul className="text-sm space-y-3 text-gray-300">
              <li>
                <a
                  href="https://maps.app.goo.gl/YAZoosPFCgGu6nvB9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:text-primary transition"
                >
                  <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                  <span>Bv Lehmann 609, Rafaela, Santa Fe</span>
                </a>
              </li>
              <li>
                <a href="tel:+5493492730010" className="flex items-center gap-2 hover:text-primary transition">
                  <Phone size={15} className="text-primary shrink-0" />
                  <span>+54 9 3492 730010</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/vet.elyagua"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition"
                >
                  <InstagramIcon size={15} className="text-primary shrink-0" />
                  <span>@vet.elyagua</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/veterinaria.elyagua/?locale=es_LA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition"
                >
                  <FacebookIcon size={15} className="text-primary shrink-0" />
                  <span>veterinaria.elyagua</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-primary-light">Horarios</h3>
            <div className="text-sm space-y-3">
              <div className="border-l-2 border-primary pl-3">
                <p className="font-semibold text-white">Lunes a Viernes</p>
                <p className="text-gray-300">7:30 – 21:00 hs</p>
                <p className="text-gray-500 text-xs">Atención integral</p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <p className="font-semibold text-white">Sábado</p>
                <p className="text-gray-300">9:00 – 12:00 · 16:00 – 20:00 hs</p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <p className="font-semibold text-white">Domingo</p>
                <p className="text-gray-300">10:00 – 12:00 · 16:00 – 20:00 hs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {currentYear} El Yagua Veterinaria. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
