import { NextRequest, NextResponse } from 'next/server'
import { createRateLimiter } from '@/lib/rate-limit'

const rateLimiter = createRateLimiter(60000, 30)

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimiter(request)
  if (rateLimitResponse) return rateLimitResponse

  const { address } = await request.json()

  if (!address || address.trim().length < 5) {
    return NextResponse.json({ valid: false, error: 'Dirección muy corta' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://apis.datos.gob.ar/georef/api/direcciones?direccion=${encodeURIComponent(
        address
      )}&provincia=santa+fe&max=1`,
      { cache: 'no-store' }
    )

    const data = await res.json()
    const found = data.direcciones?.[0]

    if (!found) {
      return NextResponse.json({
        valid: false,
        error: 'Dirección no encontrada en Rafaela/Santa Fe',
      })
    }

    const { lat, lon, nomenclatura } = found

    return NextResponse.json({
      valid: true,
      address: nomenclatura,
      latitude: lat,
      longitude: lon,
      zone: calculateZone(lat, lon),
    })
  } catch (err) {
    console.error('Geocoding error:', err)
    return NextResponse.json(
      { valid: false, error: 'Error al validar dirección' },
      { status: 500 }
    )
  }
}

function calculateZone(lat: number, lon: number): 'centro' | 'norte' | 'sur' | 'este' | 'oeste' {
  const centerLat = -31.739
  const centerLon = -61.503

  const latDiff = lat - centerLat
  const lonDiff = lon - centerLon

  if (Math.abs(latDiff) > Math.abs(lonDiff)) {
    return latDiff > 0 ? 'norte' : 'sur'
  } else {
    return lonDiff > 0 ? 'este' : 'oeste'
  }
}
