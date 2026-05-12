import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Obtener token de autenticación del header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado. Debes estar logueado como admin.' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Crear cliente con el token para verificar autenticación
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    )

    // Verificar que el usuario autenticado existe
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado. Token inválido o expirado.' },
        { status: 401 }
      )
    }

    // Obtener pedidos desde la BD
    const { data: pedidos, error: dbError } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })

    if (dbError) throw dbError

    if (!pedidos || pedidos.length === 0) {
      return NextResponse.json({ error: 'Sin pedidos' }, { status: 404 })
    }

    const headers = ['ID', 'Nombre', 'Teléfono', 'DNI', 'Dirección', 'Tipo Entrega', 'Total', 'Estado', 'Método Pago', 'Fecha']

    let csv = headers.join(',') + '\n'

    for (const pedido of pedidos) {
      const row = [
        pedido.id,
        `"${pedido.nombre}"`,
        pedido.telefono,
        pedido.cliente_dni || '',
        `"${pedido.direccion || ''}"`,
        pedido.tipo_entrega,
        pedido.total,
        pedido.estado || 'pendiente',
        pedido.metodo_pago || '',
        new Date(pedido.created_at).toLocaleDateString('es-AR'),
      ]
      csv += row.join(',') + '\n'
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pedidos-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (err) {
    console.error('Export error:', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
