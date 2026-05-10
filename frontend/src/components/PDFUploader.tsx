import React, { useState, useRef } from 'react'
import { UploadCloud } from 'lucide-react'

interface PDFUploaderProps {
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onUpload, isUploading }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const isAcceptedFile = (file: File) => {
    const name = file.name.toLowerCase()
    return name.endsWith('.pdf') || name.endsWith('.txt')
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && isAcceptedFile(files[0])) {
      await onUpload(files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && isAcceptedFile(files[0])) {
      await onUpload(files[0])
    }
  }

  return (
    <div
      className={`relative w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all duration-300 cursor-pointer ${
        isDragOver
          ? 'border-accent bg-accent-dim'
          : 'border-glass-border bg-glass-bg hover:bg-glass-hover hover:border-text-muted'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        accept=".pdf,.txt"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      {isUploading ? (
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-text font-medium">Processing document...</p>
        </div>
      ) : (
        <>
          <div className="p-4 bg-surface-2 rounded-full mb-4 shadow-lg border border-glass-border">
            <UploadCloud size={28} className="text-accent" />
          </div>
          <p className="text-text font-medium mb-1">Drop PDF or TXT here, or click to upload</p>
          <p className="text-text-muted text-sm text-center">
            Supported: .pdf, .txt &nbsp;·&nbsp; Max size: 50MB
          </p>
        </>
      )}
    </div>
  )
}
