import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET() {
  try {
    const startTime = Date.now()

    const { data: dbCheck, error: dbError } = await supabase
      .from('clientes')
      .select('count', { count: 'exact', head: true })

    const responseTime = Date.now() - startTime

    if (dbError) {
      return errorResponse(`Database unavailable: ${dbError.message}`, 503)
    }

    return successResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        database: 'ok',
        api: 'ok',
      },
    })
  } catch (error) {
    return errorResponse(`Health check failed: ${String(error)}`, 503)
  }
}
