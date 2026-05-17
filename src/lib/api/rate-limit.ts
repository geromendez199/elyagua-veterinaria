import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

const store: RateLimitStore = {}

interface RateLimitOptions {
  limit: number
  windowMs: number
}

export function createRateLimiter(options: RateLimitOptions) {
  return (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    const now = Date.now()
    const key = `${ip}:${request.nextUrl.pathname}`

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

    if (record.count > options.limit) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Try again later.' },
        { status: 429 }
      )
    }

    return null
  }
}

export function rateLimit(handler: Function, options: RateLimitOptions) {
  return async (request: NextRequest) => {
    const rateLimiter = createRateLimiter(options)
    const limitResponse = rateLimiter(request)

    if (limitResponse) {
      return limitResponse
    }

    return handler(request)
  }
}
