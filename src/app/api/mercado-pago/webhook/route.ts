import { NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/api/rate-limit'

async function handler(request: Request) {
  try {
    const body = await request.json()

    if (body.action === 'payment.created' || body.action === 'payment.updated') {
      console.log('MP Webhook received:', body)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false }, { status: 400 })
  } catch (error) {
    console.error('POST /api/mercado-pago/webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

export const POST = withRateLimit(handler, { limit: 100, windowMs: 15 * 60 * 1000 }, 'mp-webhook')

/**
 * Helper function to initiate Mercado Pago payment (checkout preference)
 *
 * Usage in CartDrawer:
 * const mpPreference = await createMercadoPagoPreference(total, items, customer)
 * window.location.href = mpPreference.init_point // Redirect to MP checkout
 */
export async function createMercadoPagoPreference(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _total: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _items: Array<{ product: { id: string; nombre: string; precio: number }; quantity: number }>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _customer: { nombre: string; email: string; telefono: string }
) {
  // TODO: Implement when ready
  // const preference = {
  //   items: items.map(i => ({
  //     id: i.product.id,
  //     title: i.product.nombre,
  //     quantity: i.quantity,
  //     unit_price: i.product.precio
  //   })),
  //   payer: {
  //     name: customer.nombre,
  //     email: customer.email,
  //     phone: { number: customer.telefono }
  //   },
  //   back_urls: {
  //     success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
  //     pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/pending`,
  //     failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/failure`
  //   },
  //   auto_return: 'approved',
  //   notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercado-pago/webhook`
  // }

  // return await fetch('https://api.mercadopago.com/checkout/preferences', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  //   body: JSON.stringify(preference)
  // }).then(r => r.json())
}
