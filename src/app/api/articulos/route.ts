import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const activo = searchParams.get('activo') !== 'false'
    const categoria = searchParams.get('categoria')

    let query = supabase
      .from('articulos')
      .select('*')
      .eq('activo', activo)
      .order('created_at', { ascending: false })

    if (categoria) {
      query = query.eq('categoria', categoria)
    }

    const { data, error } = await query

    if (error) {
      console.error('Articulos query error:', error)
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data: data || [] })
  } catch (err) {
    console.error('Error fetching articulos:', err)
    return Response.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    )
  }
}
