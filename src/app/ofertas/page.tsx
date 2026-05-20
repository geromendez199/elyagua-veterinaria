import { Metadata } from 'next'
import OfertaCard from '@/components/OfertaCard'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Ofertas - El Yagua Veterinaria',
  description: 'Descubre nuestras ofertas especiales en productos y combos para tu mascota',
  openGraph: {
    title: 'Ofertas - El Yagua Veterinaria',
    description: 'Descubre nuestras ofertas especiales en productos y combos para tu mascota',
    url: `${SITE_URL}/ofertas`,
    type: 'website',
  },
}

async function getOfertas() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || SITE_URL
    const response = await fetch(`${baseUrl}/api/ofertas`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error('Error fetching ofertas:', response.statusText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching ofertas:', error)
    return null
  }
}

export default async function OfertasPage() {
  const result = await getOfertas()
  const ofertas = result?.data || []

  const porcentajeOfertas = ofertas.filter((o: any) => o.tipo === 'porcentaje')
  const comboOfertas = ofertas.filter((o: any) => o.tipo === 'combo')

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold">Ofertas Especiales</h1>
          <p className="text-green-100 mt-2 text-lg">
            Descubre los mejores precios en productos y combos para tu mascota
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {ofertas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No hay ofertas activas en este momento</p>
          </div>
        ) : (
          <>
            {/* Descuentos por Porcentaje */}
            {porcentajeOfertas.length > 0 && (
              <section className="mb-16">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Descuentos</h2>
                  <p className="text-gray-600">Productos con descuento porcentual</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {porcentajeOfertas.map((oferta: any) => (
                    <OfertaCard key={oferta.id} oferta={oferta} />
                  ))}
                </div>
              </section>
            )}

            {/* Combos */}
            {comboOfertas.length > 0 && (
              <section>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Combos Especiales</h2>
                  <p className="text-gray-600">Paquetes de productos a precio especial</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {comboOfertas.map((oferta: any) => (
                    <OfertaCard key={oferta.id} oferta={oferta} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
