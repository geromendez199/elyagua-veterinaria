type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export function successResponse<T>(data: T): Response {
  return Response.json({ success: true, data })
}

export function errorResponse(error: string, status = 400): Response {
  return Response.json({ success: false, error }, { status })
}
