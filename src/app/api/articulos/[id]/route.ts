import { createServerSupabaseClient } from '@/lib/api/server-client'
import { successResponse, errorResponse } from '@/lib/api/response'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!UUID_REGEX.test(id)) {
      return errorResponse('ID inválido', 400)
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('articulos')
      .select('*')
      .eq('id', id)
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
