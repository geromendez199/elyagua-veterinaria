import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data, error } = await supabase
      .from('articulos')
      .select('id, titulo, activo, categoria')
      .order('created_at', { ascending: false })

    return Response.json({
      success: true,
      total: data?.length || 0,
      data: data || [],
      error: error?.message
    })
  } catch (err: any) {
    return Response.json({
      success: false,
      error: err.message
    })
  }
}
