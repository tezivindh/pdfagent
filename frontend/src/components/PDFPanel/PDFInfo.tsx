import type { PDFMetadata } from '../../types';
import { FileText, Layers } from 'lucide-react';

interface PDFInfoProps {
  metadata: PDFMetadata;
  onClear: () => void;
}

export function PDFInfo({ metadata, onClear }: PDFInfoProps) {
  return (
    <div className="glass-card p-5 mt-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-syne font-bold text-accent drop-shadow-xs mb-1">{metadata.filename}</h3>
          <p className="text-xs text-secondary">Document successfully loaded</p>
        </div>
        <button 
          onClick={onClear}
          className="text-xs btn-secondary py-1 px-3"
        >
          Replace PDF
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center text-text-muted bg-surface rounded-xs p-2 border border-glass-border">
          <FileText className="w-4 h-4 mr-2 text-text-subtle" />
          <span>{metadata.page_count} Pages</span>
        </div>
        <div className="flex items-center text-text-muted bg-surface rounded-xs p-2 border border-glass-border">
          <Layers className="w-4 h-4 mr-2 text-text-subtle" />
          <span>{metadata.chunk_count} Chunks Indexed</span>
        </div>
      </div>
    </div>
  );
}
