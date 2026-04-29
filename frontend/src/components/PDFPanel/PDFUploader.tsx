import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, Loader2 } from 'lucide-react';
import type { PDFMetadata } from '../../types';

interface PDFUploaderProps {
  onUploadSuccess: (conversationId: string, metadata: PDFMetadata) => void;
}

export function PDFUploader({ onUploadSuccess }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    
    setError(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';
      const response = await axios.post(`${apiUrl}/pdf/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const data = response.data;
      onUploadSuccess(data.conversation_id, {
        filename: data.filename,
        page_count: data.page_count,
        chunk_count: data.chunk_count,
        loaded_at: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`glass-card p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] ${isDragging ? 'border-accent bg-glass-hover' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        accept="application/pdf" 
        className="hidden" 
        onChange={handleChange} 
      />

      {isUploading ? (
        <div className="flex flex-col items-center text-accent">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="font-syne font-semibold">Processing PDF...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-text-muted">
          <UploadCloud className="w-10 h-10 mb-3 text-text-subtle group-hover:text-accent transition-colors" />
          <p className="font-syne font-semibold text-textMain mb-1">Upload a PDF Document</p>
          <p className="text-sm">Drag and drop or click to browse</p>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
}
