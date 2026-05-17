import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rutas sensibles - redirigir a login
  const debugRoutes = ['/admin/setup-db', '/admin/debug-dni', '/admin/fix-rls', '/admin/fix-consejos']

  if (debugRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/setup-db',
    '/admin/debug-dni',
    '/admin/fix-rls',
    '/admin/fix-consejos',
  ],
}
