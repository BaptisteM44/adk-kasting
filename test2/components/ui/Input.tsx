// components/ui/Input.tsx
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const inputClass = `input ${error ? 'input--error' : ''} ${className}`

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <input className={inputClass} {...props} />
      {error && <div className="error-message">{error}</div>}
      {helperText && !error && (
        <div className="helper-text">{helperText}</div>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  ...props
}) => {
  const selectClass = `input ${error ? 'input--error' : ''} ${className}`

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <select className={selectClass} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}
