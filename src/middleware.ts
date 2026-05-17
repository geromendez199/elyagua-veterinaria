import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Proteger rutas sensibles de debug/setup
  const { pathname } = request.nextUrl
  const debugRoutes = ['/admin/setup-db', '/admin/debug-dni', '/admin/fix-rls', '/admin/fix-consejos']

  if (debugRoutes.some(route => pathname.startsWith(route))) {
    // Redirigir a login - estas rutas no deben ser accesibles desde el navegador
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
