import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mejores Productos para Acumular YaguaMillas',
  description: 'Descubrí los productos que más YaguaMillas te dan por compra. Sumá puntos en cada pedido y canjealos por descuentos.',
  openGraph: {
    title: 'Mejores Productos YaguaMillas | El Yagua Veterinaria',
    description: 'Los productos que más YaguaMillas te dan en El Yagua Veterinaria.',
    type: 'website',
  },
}

export default function MejoresYaguaMillasLayout({ children }: { children: React.ReactNode }) {
  return children
}
