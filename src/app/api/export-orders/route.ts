import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })

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
