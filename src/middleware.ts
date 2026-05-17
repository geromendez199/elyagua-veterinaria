import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Proteger rutas sensibles de debug/setup - solo redirigir estas rutas específicas
  const { pathname } = request.nextUrl

  // Solo redirigir las rutas de debug/setup que no deben ser accesibles
  if (pathname === '/admin/setup-db' ||
      pathname === '/admin/debug-dni' ||
      pathname === '/admin/fix-rls' ||
      pathname === '/admin/fix-consejos') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
