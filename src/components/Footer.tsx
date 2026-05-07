export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-dark text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">El Yagua Veterinaria</h3>
            <p className="text-sm text-gray-300">
              Tu veterinaria de confianza con productos de calidad para tus mascotas.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Enlaces rápidos</h3>
            <ul className="text-sm space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-primary-light">Inicio</a></li>
              <li><a href="/productos" className="hover:text-primary-light">Productos</a></li>
              <li><a href="/contacto" className="hover:text-primary-light">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Síguenos</h3>
            <p className="text-sm text-gray-300">
              En redes sociales para las últimas novedades.
            </p>
          </div>
        </div>
        <div className="border-t border-primary-light pt-4 text-center text-sm text-gray-300">
          <p>&copy; {currentYear} El Yagua Veterinaria. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
