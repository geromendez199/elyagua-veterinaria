import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consejo Veterinario',
  description: 'Consejo veterinario escrito por nuestro equipo profesional de El Yagua Veterinaria.',
  openGraph: {
    title: 'Consejo Veterinario | El Yagua Veterinaria',
    description: 'Consejos profesionales para el cuidado de tu mascota.',
    type: 'article',
  },
}

export default function ConsejoDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
