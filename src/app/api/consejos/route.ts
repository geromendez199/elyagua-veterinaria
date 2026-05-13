import { supabase } from '@/lib/supabase'
import { Consejo, ConsejoCategoria, CONSEJO_CATEGORIES } from '@/types'

type ConsejoGrouped = Partial<Record<ConsejoCategoria, Consejo[]>>

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const edadStr = searchParams.get('edad')
    const tipo = searchParams.get('tipo')

    // Validation
    if (!edadStr || !tipo) {
      return Response.json(
        { error: 'Missing edad or tipo parameter' },
        { status: 400 }
      )
    }

    const edad = parseInt(edadStr, 10)
    if (isNaN(edad) || edad < 0 || edad > 120) {
      return Response.json(
        { error: 'Invalid edad (must be 0-120)' },
        { status: 400 }
      )
    }

    if (tipo !== 'perro' && tipo !== 'gato') {
      return Response.json(
        { error: 'Invalid tipo (must be perro or gato)' },
        { status: 400 }
      )
    }

    // Query Supabase
    const { data, error } = await supabase
      .from('consejos')
      .select('*')
      .eq('activo', true)
      .or(`tipo_mascota.eq.${tipo},tipo_mascota.eq.ambos`)
      .lte('edad_minima', edad)
      .order('categoria')
      .order('orden')

    if (error) throw error

    // Filter by edad_maxima on client (Supabase doesn't support conditional nulls in filtering)
    const filtered = (data || []).filter(
      (consejo) => consejo.edad_maxima === null || consejo.edad_maxima >= edad
    )

    // Group by categoria
    const grouped: ConsejoGrouped = {}
    filtered.forEach((consejo) => {
      const categoria = consejo.categoria as ConsejoCategoria
      if (!grouped[categoria]) grouped[categoria] = []
      grouped[categoria]?.push(consejo)
    })

    return Response.json({
      edad,
      tipo,
      consejos: filtered,
      grouped,
      categories: Object.keys(CONSEJO_CATEGORIES),
    })
  } catch (err) {
    console.error('Error fetching consejos:', err)
    return Response.json(
      { error: 'Failed to fetch consejos' },
      { status: 500 }
    )
  }
}
