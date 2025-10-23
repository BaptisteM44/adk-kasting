import React, { useState } from 'react'
import { Stars } from '../components/ui/Stars'
import { supabase } from '@/lib/supabase'

interface AdminStarsProps {
  comedienId: string
  rating: number
  isAdmin: boolean
  onRatingUpdate?: (rating: number) => void
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
}

export const AdminStars: React.FC<AdminStarsProps> = ({
  comedienId,
  rating,
  isAdmin,
  onRatingUpdate,
  size = 'medium',
  showLabel = true
}) => {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleRatingChange = async (newRating: number) => {
    if (saving) return
    try {
      setSaving(true)
      setError('')
      const { error } = await supabase
        .from('comediens')
        .update({ admin_rating: newRating })
        .eq('id', comedienId)
      if (error) throw error
      if (onRatingUpdate) onRatingUpdate(newRating)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) return null

  return (
    <div className="admin-stars">
      <Stars
        rating={rating}
        editable={!saving}
        size={size}
        onRatingChange={handleRatingChange}
      />
      {saving && <span className="saving">💾</span>}
      {error && <span className="error">❌ {error}</span>}

      <style jsx>{`
        .admin-stars {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.25rem 0;
        }
        .saving {
          font-size: 0.8rem;
          animation: pulse 1s infinite;
        }
        .error {
          font-size: 0.8rem;
          color: #dc3545;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
