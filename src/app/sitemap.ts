import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE = 'https://elyagua-veterinaria.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: products } = await supabase
    .from('productos')
    .select('id, updated_at')
    .eq('activo', true)

  const productUrls: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${BASE}/productos/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    { url: BASE,                  lastModified: new Date(), changeFrequency: 'daily',   priority: 1   },
    { url: `${BASE}/productos`,   lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/contacto`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...productUrls,
  ]
}
