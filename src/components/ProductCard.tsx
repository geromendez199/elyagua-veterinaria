import { Product } from '@/types'
import { ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="aspect-square bg-gray-200 relative">
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800">{product.nombre}</h3>
          <span className="text-xs bg-primary text-white px-2 py-1 rounded">
            {product.categoria}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.descripcion}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-primary">
              ${product.precio.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
            </p>
          </div>
          <button
            disabled={product.stock === 0}
            className="bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white p-2 rounded-lg transition disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
