import { ZodSchema } from 'zod'
import { errorResponse } from '@/lib/api/response'

export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema
): Promise<{ data: T | null; error: Response | null }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
      return {
        data: null,
        error: errorResponse(`Validación fallida: ${errors}`),
      }
    }

    return { data: result.data as T, error: null }
  } catch (err) {
    return {
      data: null,
      error: errorResponse('JSON inválido', 400),
    }
  }
}
