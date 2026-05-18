import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artículos Veterinarios',
  description: 'Artículos veterinarios escritos por nuestro equipo profesional sobre el cuidado, salud y bienestar de tu mascota.',
  openGraph: {
    title: 'Artículos Veterinarios | El Yagua Veterinaria',
    description: 'Artículos profesionales sobre el cuidado de tu mascota.',
    type: 'website',
  },
}

export default function ArticulosLayout({ children }: { children: React.ReactNode }) {
  return children
}
