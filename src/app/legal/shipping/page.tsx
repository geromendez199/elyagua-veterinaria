import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Truck, MapPin, RotateCcw } from 'lucide-react'
import { WA_URL, PHONE_DISPLAY } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Política de Envíos y Devoluciones',
  description: 'Información sobre envíos, entregas y política de devoluciones de El Yagua Veterinaria',
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ChevronLeft size={18} />
          Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Envíos y Devoluciones</h1>
        <p className="text-gray-500 text-sm mb-12">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>

        {/* Opciones de Entrega */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Truck size={28} className="text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">Opciones de Entrega</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Retiro en Tienda */}
            <div className="bg-primary/5 border-2 border-primary rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={24} className="text-primary" />
                <h3 className="text-xl font-bold text-gray-900">Retiro en Tienda</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Costo:</strong> Gratuito</li>
                <li><strong>Dirección:</strong> Bv Lehmann 609, Rafaela, Santa Fe</li>
                <li><strong>Horario:</strong></li>
              </ul>
              <ul className="list-disc pl-6 text-gray-700 mt-2 space-y-1">
                <li>Lun - Vie: 7:30 - 21:00</li>
                <li>Sáb: 9:00 - 12:00 | 16:00 - 20:00</li>
                <li>Dom: 10:00 - 12:00 | 16:00 - 20:00</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                ✓ La forma más económica<br/>
                ✓ Entrega inmediata<br/>
                ✓ Consulta disponibilidad
              </p>
            </div>

            {/* Envío a Domicilio */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Envío a Domicilio</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Costo:</strong> Gratis</li>
                <li><strong>Cobertura:</strong> Rafaela únicamente</li>
                <li><strong>Tiempo:</strong> A convenir entre las partes</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                ✓ Entrega sin salir de casa<br/>
                ✓ Cobertura en zona<br/>
                ✓ Coordina antes de confirmar
              </p>
            </div>
          </div>
        </section>

        {/* Proceso de Compra */}
        <section className="mb-12 bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Proceso de Compra</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold shrink-0">1</div>
              <div>
                <h3 className="font-bold text-gray-900">Selecciona productos y elige tipo de entrega</h3>
                <p className="text-gray-600 text-sm">Retiro en tienda o envío a domicilio</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold shrink-0">2</div>
              <div>
                <h3 className="font-bold text-gray-900">Completa tus datos y dirección (si aplica)</h3>
                <p className="text-gray-600 text-sm">Nombre, teléfono, dirección (envío) o datos de retiro</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold shrink-0">3</div>
              <div>
                <h3 className="font-bold text-gray-900">Confirma por WhatsApp</h3>
                <p className="text-gray-600 text-sm">Recibe resumen del pedido, acordamos costo de envío si aplica</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold shrink-0">4</div>
              <div>
                <h3 className="font-bold text-gray-900">Realiza el pago</h3>
                <p className="text-gray-600 text-sm">Efectivo, débito o crédito (con recargo)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold shrink-0">5</div>
              <div>
                <h3 className="font-bold text-gray-900">Recibe tu pedido</h3>
                <p className="text-gray-600 text-sm">En tienda o en tu domicilio según lo acordado</p>
              </div>
            </div>
          </div>
        </section>

        {/* Política de Devoluciones */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <RotateCcw size={28} className="text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">Devoluciones y Cambios</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
              <h3 className="font-bold text-gray-900 mb-2">✓ SE ACEPTAN DEVOLUCIONES</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Dentro de <strong>7 días hábiles</strong> de la compra</li>
                <li>Producto <strong>sin abrir</strong> y en perfecto estado</li>
                <li>Con <strong>empaque original</strong> intacto</li>
                <li>Comprobante de compra disponible</li>
              </ul>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
              <h3 className="font-bold text-gray-900 mb-2">✗ NO SE ACEPTAN DEVOLUCIONES</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Alimentos, golosinas y productos <strong>perecederos</strong></li>
                <li>Medicamentos (por regulación sanitaria)</li>
                <li>Productos abiertos, dañados o usados</li>
                <li>Después de <strong>7 días hábiles</strong> de la compra</li>
                <li>Sin empaque original o comprobante</li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
              <h3 className="font-bold text-gray-900 mb-2">⚠ PROCESO DE DEVOLUCIÓN</h3>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                <li>Contacta por WhatsApp: <a href={WA_URL} className="text-primary hover:underline">{PHONE_DISPLAY}</a></li>
                <li>Fotograía del producto en su empaque original</li>
                <li>Describe el motivo de la devolución</li>
                <li>Acordamos cómo proceder (reembolso o cambio)</li>
                <li>Los gastos de envío corren por tu cuenta</li>
                <li>Reembolso dentro de 5-10 días hábiles (una vez recibido)</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Cambios */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cambios por Error</h2>
          <div className="bg-primary/5 border-2 border-primary rounded-xl p-6">
            <p className="text-gray-700 mb-4">
              Si recibiste un producto incorrecto o defectuoso, nosotros cubrimos los gastos de cambio.
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Contacta en <strong>24 horas</strong> con fotos del producto</li>
              <li>Enviaremos el producto correcto <strong>sin costo adicional</strong></li>
              <li>Puedes retornar el defectuoso por envío prepago</li>
              <li>Reembolso total si prefieres no realizar el cambio</li>
            </ul>
          </div>
        </section>

        {/* Preguntas Frecuentes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
              <summary className="font-bold text-gray-900">¿Puedo cancelar mi pedido?</summary>
              <p className="text-gray-700 mt-2 text-sm">
                Sí, siempre y cuando contactes dentro de 2 horas de haber colocado el pedido. Después de ese tiempo, el pedido
                ya está siendo preparado. Contáctanos por WhatsApp inmediatamente.
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
              <summary className="font-bold text-gray-900">¿Realizan envíos fuera de Rafaela?</summary>
              <p className="text-gray-700 mt-2 text-sm">
                Actualmente cubrimos únicamente Rafaela. Para otras zonas, contáctanos y veremos si podemos coordinarlo.
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
              <summary className="font-bold text-gray-900">¿Cuál es el costo de envío?</summary>
              <p className="text-gray-700 mt-2 text-sm">
                El costo depende de tu zona y lo coordinamos contigo antes de confirmar el pedido. Retiro en tienda es siempre
                gratuito.
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
              <summary className="font-bold text-gray-900">¿Reciben pagos con tarjeta?</summary>
              <p className="text-gray-700 mt-2 text-sm">
                Sí, aceptamos débito y crédito (el crédito puede tener un pequeño recargo). También efectivo en retiro.
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-lg cursor-pointer">
              <summary className="font-bold text-gray-900">¿Qué pasa si mi producto llega dañado?</summary>
              <p className="text-gray-700 mt-2 text-sm">
                Contáctanos inmediatamente con fotos. Si es responsabilidad nuestra (daño en envío), no pagarás costo de cambio.
                Enviaremos el producto correcto sin cargo.
              </p>
            </details>
          </div>
        </section>

        {/* Contacto */}
        <section className="bg-primary text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">¿Dudas sobre tu pedido?</h2>
          <p className="mb-6 text-lg">Contáctanos directamente por WhatsApp</p>
          <a
            href={WA_URL}
            className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition"
          >
            Escribir por WhatsApp
          </a>
        </section>
      </div>
    </div>
  )
}
