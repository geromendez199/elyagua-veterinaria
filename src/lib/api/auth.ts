import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthResult {
  user: User | null
  error: Response | null
}

function getAdminEmails(): string[] {
  const list = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ''
  return list
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export async function requireAuth(): Promise<AuthResult> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      user: null,
      error: Response.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
  }

  const adminEmails = getAdminEmails()
  if (adminEmails.length > 0) {
    const email = user.email?.toLowerCase()
    if (!email || !adminEmails.includes(email)) {
      return {
        user: null,
        error: Response.json(
          { success: false, error: 'Permisos insuficientes' },
          { status: 403 }
        )
      }
    }
  }

  return { user, error: null }
}
