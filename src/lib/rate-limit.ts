import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

const store: RateLimitStore = {}

export function createRateLimiter(
  windowMs: number = 60000,
  maxRequests: number = 30
) {
  return function rateLimit(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()

    if (!store[ip]) {
      store[ip] = { count: 1, resetTime: now + windowMs }
      return null
    }

    if (now > store[ip].resetTime) {
      store[ip] = { count: 1, resetTime: now + windowMs }
      return null
    }

    store[ip].count++

    if (store[ip].count > maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((store[ip].resetTime - now) / 1000)) } }
      )
    }

    return null
  }
}
