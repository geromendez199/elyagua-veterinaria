import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: products }, { data: articulos }] = await Promise.all([
    supabase.from('productos').select('id, updated_at').eq('activo', true),
    supabase.from('articulos').select('slug, updated_at').eq('activo', true),
  ])

  const productUrls: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${SITE_URL}/productos/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const articuloUrls: MetadataRoute.Sitemap = (articulos || []).map((a) => ({
    url: `${SITE_URL}/info/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    { url: SITE_URL,                        lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/productos`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/info`,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/quienes-somos`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contacto`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/legal/shipping`,    lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${SITE_URL}/legal/terms`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/legal/privacy`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    ...productUrls,
    ...articuloUrls,
  ]
}
