import Image from 'next/image'
import { useState } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  objectFit?: 'cover' | 'contain' | 'fill'
  priority?: boolean
}

export default function LazyImage({
  src,
  alt,
  width = 500,
  height = 500,
  className = '',
  objectFit = 'cover',
  priority = false,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`
          w-full h-full transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        style={{ objectFit }}
        onLoadingComplete={() => setIsLoading(false)}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gray-300" />
      )}
    </div>
  )
}
