// components/ui/FileUpload.tsx
import React, { useRef, useState } from 'react'

interface FileUploadProps {
  id: string
  label: string
  accept?: string
  required?: boolean
  value?: string | File | null
  onChange: (file: File | null, url?: string) => void
  description?: string
  maxSize?: number // en MB
  className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  accept = "*/*",
  required = false,
  value,
  onChange,
  description,
  maxSize = 10, // 10MB par défaut
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setError('')

    if (!file) {
      setFileName('')
      onChange(null)
      return
    }

    // Vérifier la taille du fichier
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Le fichier doit faire moins de ${maxSize}MB`)
      return
    }

    setFileName(file.name)
    onChange(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const hasFile = fileName || (typeof value === 'string' && value)

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={id}>
        {label} {required && <span style={{color: '#dc3545'}}>*</span>}
      </label>
      
      <div className="file-upload">
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          accept={accept}
          onChange={handleFileSelect}
          className="file-upload__input"
          required={required}
        />
        
        <button
          type="button"
          onClick={handleButtonClick}
          className={`file-upload__button ${hasFile ? 'has-file' : ''}`}
        >
          <svg className="upload-icon" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          {hasFile ? 'Fichier sélectionné' : 'Choisir un fichier'}
        </button>

        {description && (
          <div className="file-upload__info">
            {description}
          </div>
        )}

        {fileName && (
          <div className="file-upload__file-name">
            📄 {fileName}
          </div>
        )}

        {typeof value === 'string' && value && !fileName && (
          <div className="file-upload__file-name">
            📄 Fichier actuel : <a href={value} target="_blank" rel="noopener noreferrer">Voir</a>
          </div>
        )}

        {error && (
          <span className="field-error">{error}</span>
        )}
      </div>
    </div>
  )
}

export default FileUpload