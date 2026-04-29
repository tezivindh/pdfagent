import React from 'react'
import { PDFUploader } from './PDFUploader'
import { PDFMetadata } from '../types'
import { FileText, Layers, Hash, Calendar, RefreshCw } from 'lucide-react'

interface PDFPanelProps {
  pdfMetadata: PDFMetadata | null
  isUploading: boolean
  onUpload: (file: File) => Promise<void>
  onClear: () => void
}

export const PDFPanel: React.FC<PDFPanelProps> = ({ pdfMetadata, isUploading, onUpload, onClear }) => {
  return (
    <div className="h-full w-full bg-surface/50 backdrop-blur-md border-r border-glass-border flex flex-col p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-syne font-bold text-text flex items-center gap-2">
          <FileText className="text-accent" size={24} />
          Document Context
        </h2>
        <p className="text-text-muted text-sm mt-1 font-dmSans">
          Upload a PDF to ground the agent's knowledge.
        </p>
      </div>

      {!pdfMetadata ? (
        <PDFUploader onUpload={onUpload} isUploading={isUploading} />
      ) : (
        <div className="flex flex-col gap-6 font-dmSans animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-5 rounded-xl bg-glass-bg border border-glass-border shadow-xl">
            <h3 className="text-lg font-bold text-text truncate mb-4" title={pdfMetadata.filename}>
              {pdfMetadata.filename}
            </h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Layers size={16} className="text-secondary" />
                <span>{pdfMetadata.page_count} Pages</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Hash size={16} className="text-accent" />
                <span>{pdfMetadata.chunk_count} Vector Chunks</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <Calendar size={16} className="text-warning" />
                <span>{new Date(pdfMetadata.loaded_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClear}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-surface-2 border border-glass-border text-text hover:bg-glass-hover hover:border-text-muted transition-all text-sm font-medium"
          >
            <RefreshCw size={16} />
            Replace PDF
          </button>
        </div>
      )}
      
      <div className="mt-auto pt-8 flex items-center justify-center text-xs text-text-subtle font-mono">
        <div className="px-3 py-1 rounded-full bg-surface-2 border border-glass-border">
          Status: {pdfMetadata ? 'Ready' : 'Waiting for document'}
        </div>
      </div>
    </div>
  )
}
