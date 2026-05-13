import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { WA_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso del sitio de El Yagua Veterinaria',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ChevronLeft size={18} />
          Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Términos y Condiciones</h1>
        <p className="text-gray-500 text-sm mb-8">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de Términos</h2>
            <p>
              Al acceder y utilizar este sitio web (elyagua-veterinaria.vercel.app), aceptas estar vinculado por estos
              términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes usar este sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Uso del Sitio</h2>
            <p>
              El contenido de este sitio es para uso personal y no comercial. No debes reproducir, distribuir, transmitir,
              mostrar, ejecutar, publicar o transmitir ningún contenido sin el consentimiento previo escrito de El Yagua Veterinaria.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Productos y Precios</h2>
            <p>
              Los precios están sujetos a cambios sin previo aviso. Las imágenes de productos son ilustrativas y pueden no
              reflejar exactamente el producto final. Nos reservamos el derecho de rechazar cualquier pedido.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Pedidos y Compras</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los pedidos se realizan a través de WhatsApp y deben ser confirmados por El Yagua Veterinaria</li>
              <li>Al realizar un pedido, confirmas que todos los datos proporcionados son correctos</li>
              <li>Nos reservamos el derecho de cancelar cualquier pedido que consideremos fraudulento</li>
              <li>La disponibilidad de productos está limitada al stock disponible en el momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Pagos</h2>
            <p>
              Aceptamos efectivo, débito y crédito. Los precios mostrados en el sitio son válidos al momento de la compra.
              Para transacciones con tarjeta de crédito puede aplicarse un recargo según corresponda.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Entregas y Envíos</h2>
            <p>
              Ofrecemos dos opciones de entrega:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Retiro en tienda</strong>: Gratuito en Bv Lehmann 609, Rafaela. Horario: Lunes a Viernes 7:30 - 21:00</li>
              <li><strong>Envío a domicilio</strong>: El costo se coordina según la zona. Se debe acordar con el cliente antes de confirmar</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Devoluciones y Reembolsos</h2>
            <p>
              Ver nuestra política de devoluciones en la página dedicada. En general:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Se aceptan devoluciones dentro de 7 días de la compra</li>
              <li>El producto debe estar sin abrir y en perfectas condiciones</li>
              <li>Los productos perecederos no son retornables</li>
              <li>Los costos de envío para devoluciones corren por cuenta del cliente</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitación de Responsabilidad</h2>
            <p>
              El Yagua Veterinaria no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados
              del uso o la imposibilidad de usar este sitio web, incluso si hemos sido advertidos de la posibilidad de tales daños.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Propiedad Intelectual</h2>
            <p>
              Todos los derechos de autor, marcas registradas y otros derechos de propiedad intelectual en este sitio pertenecen
              a El Yagua Veterinaria. No puedes usar nuestro contenido sin autorización explícita por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Enlaces Externos</h2>
            <p>
              Este sitio puede contener enlaces a sitios web de terceros. No somos responsables del contenido, precisión o
              prácticas de privacidad de sitios web externos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Cambios en los Términos</h2>
            <p>
              Nos reservamos el derecho de cambiar estos términos en cualquier momento. Los cambios entran en vigencia inmediatamente
              al ser publicados. El uso continuado del sitio constituye aceptación de los cambios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Ley Aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa se resolverá en los tribunales
              competentes de Santa Fe, Argentina.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contacto</h2>
            <p>
              Si tienes preguntas sobre estos términos, contáctanos a través de WhatsApp:
            </p>
            <a href={WA_URL} className="text-primary hover:underline font-semibold">
              +54 9 3492 730010
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
