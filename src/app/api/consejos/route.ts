import { createServerSupabaseClient } from '@/lib/api/server-client'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: Request) {
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
