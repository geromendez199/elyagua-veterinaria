import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OfertasManager from '@/components/admin/OfertasManager'

export const metadata: Metadata = {
  title: 'Gestionar Ofertas - Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminOfertasPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <OfertasManager />
    </div>
  )
}
