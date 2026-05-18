import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mis Favoritos',
  description: 'Tus productos favoritos guardados para encontrarlos más rápido en tu próxima compra en El Yagua Veterinaria.',
  robots: { index: false, follow: true },
}

export default function FavoritosLayout({ children }: { children: React.ReactNode }) {
  return children
}
