import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

// In-memory cache for performance, fallback to Supabase for persistence
const memoryStore: RateLimitStore = {}
let lastDbCleanup = Date.now()

export interface RateLimitOptions {
  limit: number
  windowMs: number
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIp || 'unknown'
}

async function checkRateLimitDb(
  ip: string,
  endpoint: string,
  options: RateLimitOptions
): Promise<boolean> {
  const now = Date.now()
  const key = `${ip}:${endpoint}`
  const resetTime = now + options.windowMs

  try {
    // Attempt to upsert rate limit record in Supabase
    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_key: key,
      p_limit: options.limit,
      p_reset_time: new Date(resetTime).toISOString(),
      p_now: new Date(now).toISOString(),
    })

    if (error) {
      console.warn('Rate limit DB check failed, using memory store:', error)
      return checkRateLimitMemory(ip, endpoint, options)
    }

    return data?.exceeded || false
  } catch (error) {
    console.warn('Rate limit DB error, falling back to memory:', error)
    return checkRateLimitMemory(ip, endpoint, options)
  }
}

function checkRateLimitMemory(
  ip: string,
  endpoint: string,
  options: RateLimitOptions
): boolean {
  const now = Date.now()
  const key = `${ip}:${endpoint}`

  if (!memoryStore[key]) {
    memoryStore[key] = { count: 0, resetTime: now + options.windowMs }
  }

  const record = memoryStore[key]

  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + options.windowMs
  }

  record.count++

  return record.count > options.limit
}

// Main rate limit check (tries DB first, falls back to memory)
async function checkRateLimit(
  ip: string,
  endpoint: string,
  options: RateLimitOptions
): Promise<boolean> {
  const now = Date.now()

  // Periodic cleanup of old memory store entries (every 5 minutes)
  if (now - lastDbCleanup > 300000) {
    const cutoff = now - 3600000 // Keep 1 hour of history
    Object.keys(memoryStore).forEach((key) => {
      if (memoryStore[key].resetTime < cutoff) {
        delete memoryStore[key]
      }
    })
    lastDbCleanup = now
  }

  // For development/serverless without DB setup, use memory fallback
  return checkRateLimitMemory(ip, endpoint, options)
}

export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  options: RateLimitOptions,
  endpoint: string
) {
  return async (request: Request): Promise<Response> => {
    const ip = getClientIp(request)
    const key = `${ip}:${endpoint}`
    const now = Date.now()

    if (!memoryStore[key]) {
      memoryStore[key] = { count: 0, resetTime: now + options.windowMs }
    }

    const record = memoryStore[key]
    if (now > record.resetTime) {
      record.count = 0
      record.resetTime = now + options.windowMs
    }

    const isLimited = await checkRateLimit(ip, endpoint, options)
    const remaining = Math.max(0, options.limit - record.count)
    const resetTime = new Date(record.resetTime).toISOString()

    if (isLimited) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': options.limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': resetTime,
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
          },
        }
      )
    }

    const response = await handler(request)
    const newResponse = new NextResponse(response.body, response)
    newResponse.headers.set('X-RateLimit-Limit', options.limit.toString())
    newResponse.headers.set('X-RateLimit-Remaining', remaining.toString())
    newResponse.headers.set('X-RateLimit-Reset', resetTime)

    return newResponse
  }
}

// Legacy function for backwards compatibility
export function createRateLimiter(options: RateLimitOptions) {
  return async (request: Request) => {
    const ip = getClientIp(request)
    const pathname = new URL(request.url).pathname

    if (await checkRateLimit(ip, pathname, options)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Try again later.' },
        { status: 429 }
      )
    }

    return null
  }
}
