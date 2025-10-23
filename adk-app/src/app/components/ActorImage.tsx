'use client'

interface ActorImageProps {
  src?: string | null
  alt: string
  className?: string
}

export function ActorImage({ src, alt, className = "" }: ActorImageProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    target.src = 'https://via.placeholder.com/200x200/e2e8f0/64748b?text=Photo'
  }

  return (
    <img
      src={src || 'https://via.placeholder.com/200x200/e2e8f0/64748b?text=Photo'}
      alt={alt}
      className={className}
      onError={handleError}
    />
  )
}
