import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { WA_URL, PHONE_DISPLAY } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y protección de datos de El Yagua Veterinaria',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ChevronLeft size={18} />
          Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>
        <p className="text-gray-500 text-sm mb-8">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
            <p>
              El Yagua Veterinaria (&ldquo;nosotros&rdquo;, &ldquo;nuestro&rdquo;, &ldquo;la empresa&rdquo;) se compromete a proteger tu privacidad. Esta Política
              de Privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos tu información cuando utilizas nuestro
              sitio web elyagua-veterinaria.vercel.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que Recopilamos</h2>
            <p>Recopilamos información que proporcionas directamente:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Información de contacto</strong>: Nombre, teléfono, dirección, email</li>
              <li><strong>Información de documentación</strong>: DNI para registro de clientes</li>
              <li><strong>Información de pedidos</strong>: Productos comprados, cantidad, monto</li>
              <li><strong>Información de preferencias</strong>: Notas sobre mascotas, preferencias de comunicación</li>
              <li><strong>Información técnica</strong>: Dirección IP, tipo de navegador, páginas visitadas (mediante Google Analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cómo Usamos Tu Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Procesar y completar pedidos</li>
              <li>Enviar confirmaciones y actualizaciones de pedidos</li>
              <li>Proporcionar atención al cliente</li>
              <li>Mejorar nuestro sitio web y servicios</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Prevenir fraude y actividades ilegales</li>
              <li>Comprender tendencias de uso para marketing (análisis anónimos)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Seguridad de Datos</h2>
            <p>
              Utilizamos medidas de seguridad técnicas y organizacionales para proteger tu información personal contra acceso
              no autorizado, alteración, divulgación o destrucción. Esto incluye:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Encriptación de datos en tránsito (HTTPS)</li>
              <li>Almacenamiento seguro en Supabase con autenticación de dos factores</li>
              <li>Control de acceso limitado al personal autorizado</li>
            </ul>
            <p className="mt-2">
              Sin embargo, no podemos garantizar seguridad absoluta. Tu uso del sitio es bajo tu propio riesgo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Servicios de Terceros</h2>
            <p>Utilizamos los siguientes servicios de terceros que pueden procesar tu información:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Supabase</strong>: Base de datos y autenticación (Política: supabase.com/privacy)</li>
              <li><strong>Google Analytics</strong>: Análisis de tráfico anónimo (Política: policies.google.com/privacy)</li>
              <li><strong>Vercel</strong>: Hosting del sitio (Política: vercel.com/privacy)</li>
              <li><strong>WhatsApp</strong>: Comunicaciones de pedidos (Política: whatsapp.com/legal/privacy-policy)</li>
            </ul>
            <p className="mt-2">
              Estos terceros están sujetos a sus propias políticas de privacidad y pueden no estar obligados a mantener
              la confidencialidad de tu información bajo los mismos términos que nosotros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Derechos del Usuario</h2>
            <p>Tienes los siguientes derechos respecto a tu información personal:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Acceso</strong>: Solicitar copia de tus datos personales</li>
              <li><strong>Rectificación</strong>: Corregir información inexacta</li>
              <li><strong>Eliminación</strong>: Solicitar que eliminemos tu información</li>
              <li><strong>Portabilidad</strong>: Recibir tus datos en formato estructurado</li>
              <li><strong>Objeción</strong>: Objetar al procesamiento de tus datos para ciertos propósitos</li>
            </ul>
            <p className="mt-2">
              Para ejercer cualquiera de estos derechos, contáctanos a través de WhatsApp: <a href={WA_URL} className="text-primary hover:underline">{PHONE_DISPLAY}</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
            <p>
              Nuestro sitio utiliza cookies esenciales para:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Mantener tu carrito de compras (localStorage)</li>
              <li>Recordar tu sesión de administrador</li>
              <li>Analizar el tráfico del sitio (Google Analytics)</li>
            </ul>
            <p className="mt-2">
              Puedes desactivar las cookies en la configuración de tu navegador, pero esto puede afectar la funcionalidad del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Retención de Datos</h2>
            <p>
              Retenemos tu información personal durante el tiempo que sea necesario para cumplir con los fines para los que fue
              recopilada, típicamente:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Información de pedidos: 3 años (para fines contables y fiscales)</li>
              <li>Información de clientes: Mientras mantengas una relación con nosotros</li>
              <li>Logs de acceso: 30 días</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Menores de Edad</h2>
            <p>
              Nuestro sitio no está dirigido a menores de 13 años. No recopilamos intencionalmente información personal de menores.
              Si descubrimos que hemos recopilado información de un menor, la eliminaremos inmediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cambios a Esta Política</h2>
            <p>
              Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Los cambios entran en
              vigencia cuando se publica la versión actualizada. Te recomendamos revisar esta política periódicamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta Política de Privacidad o nuestras prácticas de privacidad, contáctanos:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>WhatsApp:</strong> <a href={WA_URL} className="text-primary hover:underline">{PHONE_DISPLAY}</a></li>
              <li><strong>Ubicación:</strong> Bv Lehmann 609, Rafaela, Santa Fe, Argentina</li>
              <li><strong>Horario:</strong> Lunes a Viernes 7:30 - 21:00</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
