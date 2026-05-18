import { createServerSupabaseClient } from '@/lib/api/server-client'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('articulos')
      .select('*')
      .eq('id', params.id)
      .eq('activo', true)
      .single()

    if (error || !data) {
      return errorResponse('Artículo no encontrado', 404)
    }

    return successResponse(data)
  } catch (err) {
    console.error('Error fetching articulo:', err)
    return errorResponse('Error interno', 500)
  }
}
