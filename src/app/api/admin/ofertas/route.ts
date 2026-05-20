import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/api/rate-limit'
import { requireAuth } from '@/lib/api/auth'
import { createOfertaSchema, updateOfertaSchema } from '@/lib/validation/schemas'
import { dbErrorResponse } from '@/lib/api/response'

async function handler(req: Request) {
  try {
    const authResult = await requireAuth()
    if (authResult.error) return authResult.error

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

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const searchQuery = url.searchParams.get('search') || ''
      const tipo = url.searchParams.get('tipo')
      const activo = url.searchParams.get('activo')

      let query = supabase
        .from('ofertas')
        .select(`
          *,
          oferta_productos (
            id,
            producto_id,
            cantidad,
            productos:producto_id (nombre, precio)
          )
        `)

      if (searchQuery) {
        query = query.ilike('titulo', `%${searchQuery}%`)
      }

      if (tipo) {
        query = query.eq('tipo', tipo)
      }

      if (activo !== null) {
        query = query.eq('activo', activo === 'true')
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        return dbErrorResponse(error, 'Error al obtener ofertas')
      }

      return NextResponse.json({ data })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const result = createOfertaSchema.safeParse(body)

      if (!result.success) {
        return NextResponse.json({ error: result.error.format() }, { status: 400 })
      }

      const { productos, ...ofertaData } = result.data

      const { data: oferta, error: createError } = await supabase
        .from('ofertas')
        .insert([ofertaData])
        .select()
        .single()

      if (createError) {
        return dbErrorResponse(createError, 'Error al crear oferta')
      }

      // Insert productos
      if (productos && productos.length > 0) {
        const productosData = productos.map((p) => ({
          oferta_id: oferta.id,
          producto_id: p.producto_id,
          cantidad: p.cantidad || null,
        }))

        const { error: productoError } = await supabase
          .from('oferta_productos')
          .insert(productosData)

        if (productoError) {
          return dbErrorResponse(productoError, 'Error al agregar productos a oferta')
        }
      }

      return NextResponse.json({ data: oferta }, { status: 201 })
    }

    if (req.method === 'PUT') {
      const url = new URL(req.url)
      const ofertaId = url.searchParams.get('id')

      if (!ofertaId) {
        return NextResponse.json({ error: 'ID de oferta requerido' }, { status: 400 })
      }

      const body = await req.json()
      const result = updateOfertaSchema.safeParse({ ...body, id: ofertaId })

      if (!result.success) {
        return NextResponse.json({ error: result.error.format() }, { status: 400 })
      }

      const { id, productos, ...updateData } = result.data

      const { data: oferta, error: updateError } = await supabase
        .from('ofertas')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        return dbErrorResponse(updateError, 'Error al actualizar oferta')
      }

      // Update productos if provided
      if (productos) {
        // Delete existing productos
        const { error: deleteError } = await supabase
          .from('oferta_productos')
          .delete()
          .eq('oferta_id', id)

        if (deleteError) {
          return dbErrorResponse(deleteError, 'Error al eliminar productos anteriores')
        }

        // Insert new productos
        if (productos.length > 0) {
          const productosData = productos.map((p) => ({
            oferta_id: id,
            producto_id: p.producto_id,
            cantidad: p.cantidad || null,
          }))

          const { error: productoError } = await supabase
            .from('oferta_productos')
            .insert(productosData)

          if (productoError) {
            return dbErrorResponse(productoError, 'Error al agregar productos')
          }
        }
      }

      return NextResponse.json({ data: oferta })
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url)
      const ofertaId = url.searchParams.get('id')

      if (!ofertaId) {
        return NextResponse.json({ error: 'ID de oferta requerido' }, { status: 400 })
      }

      const { error } = await supabase
        .from('ofertas')
        .update({ activo: false })
        .eq('id', ofertaId)

      if (error) {
        return dbErrorResponse(error, 'Error al eliminar oferta')
      }

      return NextResponse.json({ message: 'Oferta eliminada' })
    }

    return NextResponse.json({ error: 'Método no permitido' }, { status: 405 })
  } catch (error) {
    console.error('Error en /api/admin/ofertas:', error)
    return dbErrorResponse(error, 'Error interno del servidor')
  }
}

export const GET = withRateLimit(handler, { maxRequests: 20, windowMs: 15 * 60 * 1000 })
export const POST = withRateLimit(handler, { maxRequests: 5, windowMs: 15 * 60 * 1000 })
export const PUT = withRateLimit(handler, { maxRequests: 5, windowMs: 15 * 60 * 1000 })
export const DELETE = withRateLimit(handler, { maxRequests: 5, windowMs: 15 * 60 * 1000 })
