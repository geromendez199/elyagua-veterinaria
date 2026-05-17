import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  // Middleware temporarily disabled due to conflicts with admin page rendering
  // TODO: Re-enable after investigating dynamic component issues
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
