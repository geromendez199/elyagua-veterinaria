import { NextRequest, NextResponse } from 'next/server'
import { createRateLimiter } from '@/lib/rate-limit'

const rateLimiter = createRateLimiter(60000, 20)

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimiter(request)
  if (rateLimitResponse) return rateLimitResponse

  const { phoneNumber, message } = await request.json()

  if (!phoneNumber || !message) {
    return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 })
  }

  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
  const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    console.log('WhatsApp config not set, skipping send')
    return NextResponse.json({ skipped: true })
  }

  try {
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
          To: `whatsapp:${phoneNumber}`,
          Body: message,
        }).toString(),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error('Twilio error:', data)
      return NextResponse.json({ error: 'Failed to send WhatsApp' }, { status: 500 })
    }

    return NextResponse.json({ messageSid: data.sid })
  } catch (err) {
    console.error('WhatsApp send error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
