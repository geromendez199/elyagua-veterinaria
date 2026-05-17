import { supabase } from '@/lib/supabase'

interface AuthResult {
  user: any
  error: Response | null
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

  return { user, error: null }
}
