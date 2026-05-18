import { createServerSupabaseClient } from '@/lib/api/server-client'
import { successResponse, errorResponse } from '@/lib/api/response'
import { withRateLimit } from '@/lib/api/rate-limit'

async function handler(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const activo = searchParams.get('activo') !== 'false'
    const categoria = searchParams.get('categoria')

    let query = supabase
      .from('consejos')
      .select('*')
      .eq('activo', activo)
      .order('categoria')
      .order('orden')

    if (categoria) {
      query = query.eq('categoria', categoria)
    }

    const { data, error } = await query

    if (error) {
      console.error('Consejos query error:', error)
      return errorResponse(error.message, 500)
    }

    return successResponse(data || [])
  } catch (err) {
    console.error('Error fetching consejos:', err)
    return errorResponse('Error interno', 500)
  }
}

export const GET = withRateLimit(handler, { limit: 60, windowMs: 15 * 60 * 1000 }, 'consejos-get')
