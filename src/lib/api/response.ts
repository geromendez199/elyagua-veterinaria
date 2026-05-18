type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export function successResponse<T>(data: T): Response {
  return Response.json({ success: true, data })
}

export function errorResponse(error: string, status = 400): Response {
  return Response.json({ success: false, error }, { status })
}

/**
 * Logs the real error server-side but returns a generic message to the client.
 * Use this to avoid leaking DB error details, schema info, or stack traces.
 */
export function dbErrorResponse(
  context: string,
  error: unknown,
  publicMessage = 'Error procesando la solicitud',
  status = 500
): Response {
  console.error(`[${context}]`, error)
  return errorResponse(publicMessage, status)
}
