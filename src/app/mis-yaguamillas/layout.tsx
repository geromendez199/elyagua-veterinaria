import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis YaguaMillas',
  description: 'Consultá tus YaguaMillas acumuladas, tus cupones disponibles y el historial del programa de fidelidad de El Yagua Veterinaria.',
  openGraph: {
    title: 'Mis YaguaMillas | El Yagua Veterinaria',
    description: 'Consultá tus YaguaMillas y cupones del programa de fidelidad.',
    type: 'website',
  },
}

export default function MisYaguaMillasLayout({ children }: { children: React.ReactNode }) {
  return children
}
