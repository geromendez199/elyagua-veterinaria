import { NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

const store: RateLimitStore = {}

export interface RateLimitOptions {
  limit: number
  windowMs: number
}

// Get IP from request headers
function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIp || 'unknown'
}

// Check if request exceeds rate limit
function checkRateLimit(ip: string, endpoint: string, options: RateLimitOptions): boolean {
  const now = Date.now()
  const key = `${ip}:${endpoint}`

  if (!store[key]) {
    store[key] = { count: 0, resetTime: now + options.windowMs }
  }

  const record = store[key]

  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + options.windowMs
  }

  record.count++

  return record.count > options.limit
}

// Middleware wrapper for route handlers
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  options: RateLimitOptions,
  endpoint: string
) {
  return async (request: Request): Promise<Response> => {
    const ip = getClientIp(request)

    if (checkRateLimit(ip, endpoint, options)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Try again later.' },
        { status: 429 }
      )
    }

    return handler(request)
  }
}

// Legacy function for backwards compatibility
export function createRateLimiter(options: RateLimitOptions) {
  return (request: Request) => {
    const ip = getClientIp(request)
    const now = Date.now()
    const pathname = new URL(request.url).pathname
    const key = `${ip}:${pathname}`

    if (!store[key]) {
      store[key] = { count: 0, resetTime: now + options.windowMs }
    }

    const record = store[key]

    if (now > record.resetTime) {
      record.count = 0
      record.resetTime = now + options.windowMs
    }

    record.count++

    if (record.count > options.limit) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Try again later.' },
        { status: 429 }
      )
    }

    return null
  }
}
