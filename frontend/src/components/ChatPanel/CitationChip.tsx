import { useState } from 'react';
import type { Citation } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

interface CitationChipProps {
  citation: Citation;
}

export function CitationChip({ citation }: CitationChipProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Color logic based on relevance
  let colorClass = "text-text-muted border-glass-border hover:border-text-muted/50";
  if (citation.relevance_score > 0.6) {
    colorClass = "text-accent border-accent/30 hover:border-accent bg-accent/5";
  } else if (citation.relevance_score >= 0.4) {
    colorClass = "text-warning border-warning/30 hover:border-warning bg-warning/5";
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center px-2.5 py-1 rounded-xs border text-xs mr-2 mt-2 transition-colors ${colorClass}`}
      >
        <Info className="w-3 h-3 mr-1" />
        p.{citation.page_number} · {citation.section_hint.substring(0, 15)}...
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-base/80 backdrop-blur-xs"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="glass-card w-full max-w-lg p-6 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-textMain"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-syne text-lg font-bold mb-1">Citation Context</h3>
              <p className="text-sm text-accent mb-4">Page {citation.page_number} • Match Score: {(citation.relevance_score * 100).toFixed(1)}%</p>
              
              <div className="bg-surface2 p-4 rounded-xs border border-glass-border mb-2 text-sm max-h-60 overflow-y-auto">
                {citation.excerpt}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
