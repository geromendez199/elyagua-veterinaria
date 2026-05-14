import { Star } from 'lucide-react'

interface PointsBadgeProps {
  puntos: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark'
  showIcon?: boolean
  className?: string
}

export default function PointsBadge({
  puntos,
  size = 'md',
  variant = 'light',
  showIcon = true,
  className = '',
}: PointsBadgeProps) {
  if (!puntos) return null

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2',
  }

  const variants = {
    light: 'bg-amber-100 text-amber-700 border border-amber-200',
    dark: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 font-semibold',
  }

  const iconSizes = {
    sm: 16,
    md: 16,
    lg: 18,
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {showIcon && <Star size={iconSizes[size]} className="fill-current" />}
      <span>{puntos} puntos</span>
    </span>
  )
}
