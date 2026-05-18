import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consejos Veterinarios',
  description: 'Tips y consejos profesionales escritos por nuestro equipo veterinario para el bienestar de tu mascota. Nutrición, salud, prevención y cuidados.',
  openGraph: {
    title: 'Consejos Veterinarios | El Yagua Veterinaria',
    description: 'Tips y consejos profesionales para el bienestar de tu mascota.',
    type: 'website',
  },
}

export default function ConsejosLayout({ children }: { children: React.ReactNode }) {
  return children
}
