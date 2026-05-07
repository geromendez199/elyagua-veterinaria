export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4 text-lg">El Yagua Veterinaria</h3>
            <p className="text-sm text-gray-300">
              Tu veterinaria de confianza con productos y servicios de calidad para tus mascotas.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-lg">Contacto</h3>
            <ul className="text-sm space-y-2 text-gray-300">
              <li>📍 Bv Lehmann 609, Rafaela, Santa Fe</li>
              <li>📱 <a href="tel:+5493492730010" className="hover:text-primary-light">+54 9 3492 730010</a> (Ventas)</li>
              <li>🚨 <a href="tel:+5493492665978" className="hover:text-primary-light">+54 9 3492 665978</a> (Urgencias)</li>
              <li>📸 <a href="https://instagram.com/vet.elyagua" target="_blank" className="hover:text-primary-light">@vet.elyagua</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-lg">Horarios</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong>Lun-Vie:</strong> 7:30 - 21:00</p>
              <p><strong>Sáb (Integral):</strong> 9:00 - 12:00</p>
              <p><strong>Sáb (Veterinaria):</strong> 16:00 - 20:00</p>
              <p><strong>Dom:</strong> 10:00 - 12:00 / 16:00 - 20:00</p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary pt-4 text-center text-sm text-gray-300">
          <p>&copy; {currentYear} El Yagua Veterinaria. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
