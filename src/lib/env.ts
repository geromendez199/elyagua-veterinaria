type EnvKey = 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY' | 'NEXT_PUBLIC_SITE_URL'

const requiredPublicEnvVars: EnvKey[] = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

export function validatePublicEnv(): { ok: true } | { ok: false; missing: string[] } {
  const missing = requiredPublicEnvVars.filter((key) => !process.env[key])
  if (missing.length > 0) {
    return { ok: false, missing }
  }
  return { ok: true }
}

export function getRequiredEnv(key: EnvKey): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export function getOptionalEnv(key: string, defaultValue = ''): string {
  return process.env[key] || defaultValue
}
