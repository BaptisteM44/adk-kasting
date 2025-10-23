// components/ui/Button.tsx
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'header'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseClass = 'btn'
  const variantClass = `btn--${variant}`
  const sizeClass = size !== 'md' ? `btn--${size}` : ''
  const classes = [baseClass, variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="loading" />}
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  )
}
