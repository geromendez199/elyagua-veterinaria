import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/api/rate-limit'
import { requireAdminAuth } from '@/lib/api/auth'
import { incrementOfertaUsoSchema } from '@/lib/validation/schemas'
import { dbErrorResponse } from '@/lib/api/response'

async function handler(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    await requireAdminAuth(supabase)

    if (req.method !== 'PATCH') {
      return NextResponse.json({ error: 'Método no permitido' }, { status: 405 })
    }

    const body = await req.json()
    const result = incrementOfertaUsoSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 })
    }

    const { oferta_id } = result.data

    // Fetch oferta to check usage limit
    const { data: oferta, error: fetchError } = await supabase
      .from('ofertas')
      .select('cantidad_maxima_usos, usos_actuales')
      .eq('id', oferta_id)
      .single()

    if (fetchError) {
      return dbErrorResponse(fetchError, 'Error al obtener oferta')
    }

    if (!oferta) {
      return NextResponse.json({ error: 'Oferta no encontrada' }, { status: 404 })
    }

    // Check if limit reached
    if (
      oferta.cantidad_maxima_usos !== null &&
      oferta.usos_actuales >= oferta.cantidad_maxima_usos
    ) {
      return NextResponse.json(
        { error: 'Límite de usos alcanzado para esta oferta' },
        { status: 400 }
      )
    }

    // Increment usage
    const { data: updated, error: updateError } = await supabase
      .from('ofertas')
      .update({ usos_actuales: oferta.usos_actuales + 1 })
      .eq('id', oferta_id)
      .select()
      .single()

    if (updateError) {
      return dbErrorResponse(updateError, 'Error al actualizar uso de oferta')
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Error en /api/admin/ofertas/usar:', error)
    return dbErrorResponse(error, 'Error interno del servidor')
  }
}

export const PATCH = withRateLimit(handler, { maxRequests: 10, windowMs: 15 * 60 * 1000 })
