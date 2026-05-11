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
            <p className="text-lg md:text-3xl text-white max-w-2xl mx-auto px-2">
              Tu veterinaria de confianza con productos de calidad y atención profesional para tus mascotas
            </p>
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
                <p className="font-bold text-xs md:text-sm text-gray-800 leading-tight">Lun–Dom</p>
                <p className="text-xs text-gray-500 mt-0.5 hidden md:block">Atención integral de lunes a domingo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrusel de productos */}
      <ProductCarousel products={products} />

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
