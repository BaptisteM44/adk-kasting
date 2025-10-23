// /components/ui/Stars.tsx
import React from 'react'

interface StarsProps {
  rating: number
  editable?: boolean
  size?: 'small' | 'medium' | 'large'
  onRatingChange?: (rating: number) => void
}

export const Stars: React.FC<StarsProps> = ({ 
  rating, 
  editable = false, 
  size = 'medium',
  onRatingChange 
}) => {
  const sizes = {
    small: '1rem',
    medium: '1.2rem', 
    large: '1.5rem'
  }

  const handleClick = (newRating: number) => {
    if (editable && onRatingChange) {
      onRatingChange(newRating)
    }
  }

  return (
    <div className={`stars-container ${size}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : ''} ${editable ? 'editable' : ''}`}
          onClick={() => handleClick(i)}
        >
          ★
        </span>
      ))}
      
      <style jsx>{`
        .stars-container {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .star {
          font-size: ${sizes[size]};
          color: rgba(255, 255, 255, 0.3);
          transition: all 0.2s;
          cursor: default;
          user-select: none;
        }

        .star.filled {
          color: white;
        }

        .star.editable {
          cursor: pointer;
        }

        .star.editable:hover {
          color: rgba(255, 255, 255, 0.8);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}
