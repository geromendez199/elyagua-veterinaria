import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Stethoscope, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ProductCarousel from '@/components/ProductCarousel'
import SearchBar from '@/components/SearchBar'
import { Product } from '@/types'
import { Suspense } from 'react'
import { WA_URL } from '@/lib/constants'

export const revalidate = 60

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .gt('stock', 0)
      .order('updated_at', { ascending: false })
      .limit(9)
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export default async function Home() {
  const products = await getFeaturedProducts()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center gap-6">
            <Image
              src="/logo-blanco-vertical.png"
              alt="El Yagua Veterinaria"
              width={200}
              height={250}
              className="h-36 md:h-48 w-auto mx-auto"
            />
            <div className="max-w-2xl mx-auto px-2 space-y-1">
              <p className="text-xl md:text-3xl font-bold text-white">En qué podemos ayudarte?</p>
              <p className="text-base md:text-lg text-white/85">Ingresa para conocer nuestro catálogo.</p>
              <p className="text-base md:text-lg text-white/85">Contactanos ahora para que te asesoremos.</p>
            </div>
            {/* Buscador en home */}
            <div className="w-full max-w-xl px-4 sm:px-0">
              <Suspense fallback={<div className="h-14 bg-white/20 rounded-xl animate-pulse" />}>
                <SearchBar products={products} />
              </Suspense>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
              <Link
                href="/productos"
                className="bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-primary-light hover:text-white transition text-base md:text-lg text-center"
              >
                Ver Productos
              </Link>
              <Link
                href="/contacto"
                className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-primary transition text-base md:text-lg text-center"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="py-8 md:py-12 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-xs md:text-sm text-gray-800 leading-tight">Productos Premium</p>
                <p className="text-xs text-gray-500 mt-0.5 hidden md:block">Seleccionamos cada producto para el bienestar de tu mascota.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Stethoscope size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-xs md:text-sm text-gray-800 leading-tight">Equipo Experto</p>
                <p className="text-xs text-gray-500 mt-0.5 hidden md:block">Nuestro equipo profesional te asesora en la mejor solución.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Clock size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-xs md:text-sm text-gray-800 leading-tight">Horario Extendido</p>
                <p className="text-xs text-gray-500 mt-0.5 hidden md:block">Lun–Vie 7:30–21:00 · Sábado y domingo abiertos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrusel de productos */}
      <ProductCarousel products={products} />

      {/* Institucional Section */}
      <section className="py-14 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          {/* Encabezado */}
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Quiénes somos</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Más que una veterinaria,<br className="hidden md:block" /> un equipo comprometido
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Somos un equipo de profesionales que trabajamos todos los días de manera interdisciplinaria para brindar un servicio a la altura de quienes confían en nosotros. Cada consulta, cada producto y cada diagnóstico es el resultado de años de formación, dedicación y amor genuino por los animales.
            </p>
          </div>

          {/* Pilares */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Vocación y pasión</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Elegimos esta profesión porque creemos que el bienestar animal es un compromiso que se ejerce con el corazón y con rigor científico a partes iguales.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Trabajo en equipo</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Veterinarios, especialistas y asesores trabajan de forma coordinada para que cada caso tenga la mejor respuesta posible, sin importar su complejidad.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Confianza y transparencia</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Informamos con claridad, recomendamos con honestidad y construimos vínculos duraderos con cada familia que elige El Yagua para cuidar a sus mascotas.</p>
            </div>
          </div>

          {/* Servicios */}
          <div className="mb-10">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">Nuestros servicios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Atención clínica completa
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">·</span>Consultas y atención integral de animales de compañía</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">·</span>Estudios complementarios de diagnóstico</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">·</span>Radiografías y ecografías</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">·</span>Cirugías programadas y de urgencia</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">·</span>Internación con monitoreo continuo</li>
                </ul>
              </div>
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Tienda y farmacia
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">·</span>Farmacia veterinaria completa con medicamentos de primera línea</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">·</span>Alimentos balanceados para todas las etapas</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">·</span>Accesorios, juguetes y productos de higiene y cuidado</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">·</span>Asesoramiento personalizado en cada compra</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Equipo */}
          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-10 border border-gray-100">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">Un equipo altamente capacitado</h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Contamos con un equipo de profesionales altamente capacitado en distintas especializaciones, lo que nos permite abordar cada caso desde múltiples perspectivas clínicas. Esta mirada interdisciplinaria es lo que distingue a El Yagua: no derivamos lo que podemos resolver, y cuando la complejidad lo exige, trabajamos en red con especialistas de referencia para garantizar el mejor resultado posible.
            </p>
          </div>

          {/* Frase destacada */}
          <div className="bg-primary rounded-2xl p-8 md:p-10 text-center text-white">
            <p className="text-xl md:text-2xl font-semibold leading-relaxed max-w-2xl mx-auto">
              &ldquo;Tu mascota no es solo un animal — es parte de tu familia. Y nosotros la tratamos como tal.&rdquo;
            </p>
            <p className="mt-4 text-white/70 text-sm font-medium">— El equipo de El Yagua Veterinaria</p>
          </div>
        </div>
      </section>

      {/* Horarios Section */}
      <section className="py-10 md:py-14 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Nuestro Horario</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lunes a Viernes */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-6 md:p-8 text-center">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Atención Completa</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Lun — Vie</p>
              <p className="text-lg font-semibold text-primary mb-3">7:30 — 21:00 h</p>
              <p className="text-xs text-gray-600">Atención veterinaria, venta de productos y asesoramiento</p>
            </div>

            {/* Sábado */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200 p-6 md:p-8 text-center">
              <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">Fin de Semana</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Sábado</p>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Atención integral</p>
                  <p className="text-lg font-semibold text-orange-600">9:00 — 12:00 h</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Veterinaria</p>
                  <p className="text-lg font-semibold text-orange-600">16:00 — 20:00 h</p>
                </div>
              </div>
            </div>

            {/* Domingo */}
            <div className="bg-gradient-to-br from-primary-light/5 to-primary-light/10 rounded-xl border border-primary-light/20 p-6 md:p-8 text-center">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Fin de Semana</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Domingo</p>
              <div className="space-y-2">
                <div>
                  <p className="text-lg font-semibold text-primary">10:00 — 12:00 h</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">16:00 — 20:00 h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 border-t border-gray-100 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">¿Tenés alguna consulta?</h2>
          <p className="text-sm md:text-base text-gray-500 mb-6">
            Escribinos por WhatsApp y te respondemos a la brevedad
          </p>
          <a
            href="https://wa.me/5493492730010"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#1ebe5d] transition text-base shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 0 0 .614.612l6.288-1.634A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.587-.5-5.084-1.373l-.36-.214-3.733.97.999-3.62-.235-.374A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Escribinos por WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}
