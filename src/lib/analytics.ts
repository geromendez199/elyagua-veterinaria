export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

export const pageview = (url: string) => {
  if (!GA_ID) return
  window.gtag?.('config', GA_ID, {
    page_path: url,
  })
}

export const event = (action: string, params?: Record<string, string | number | boolean | undefined>) => {
  if (!GA_ID) return
  window.gtag?.('event', action, params)
}

export const purchaseEvent = (value: number, currency: string = 'ARS', transaction_id?: string) => {
  event('purchase', {
    value,
    currency,
    transaction_id: transaction_id || `txn_${Date.now()}`,
  })
}

declare global {
  function gtag(...args: (string | number | boolean | object | undefined)[]): void
}
