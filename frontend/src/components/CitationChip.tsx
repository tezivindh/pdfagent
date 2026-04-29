import React, { useState } from 'react'
import { Citation } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText } from 'lucide-react'

export const CitationChip: React.FC<{ citation: Citation }> = ({ citation }) => {
  const [isOpen, setIsOpen] = useState(false)

  let colorClass = 'text-warning border-warning-dim bg-warning-dim/30'
  if (citation.relevance_score > 0.7) {
    colorClass = 'text-secondary border-secondary-dim bg-secondary-dim/30'
  } else if (citation.relevance_score >= 0.5) {
    colorClass = 'text-accent border-accent-dim bg-accent-dim/30'
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`px-2 py-0.5 rounded-md text-xs font-mono border ${colorClass} hover:opacity-80 transition-opacity whitespace-nowrap`}
      >
        p.{citation.page_number}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-surface border border-glass-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-glass-border flex justify-between items-center bg-surface-2">
                <div className="flex items-center gap-2 text-text font-syne font-bold">
                  <FileText size={18} className="text-accent" />
                  Source Details
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-text-muted hover:text-text hover:bg-glass-hover transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-5 font-dmSans flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-glass-bg p-3 rounded-lg border border-glass-border">
                    <p className="text-xs text-text-muted mb-1 font-mono uppercase tracking-wider">Page</p>
                    <p className="text-text font-medium text-lg">{citation.page_number}</p>
                  </div>
                  <div className="bg-glass-bg p-3 rounded-lg border border-glass-border">
                    <p className="text-xs text-text-muted mb-1 font-mono uppercase tracking-wider">Relevance</p>
                    <p className={`font-medium text-lg ${
                      citation.relevance_score > 0.7 ? 'text-secondary' : 
                      citation.relevance_score >= 0.5 ? 'text-accent' : 'text-warning'
                    }`}>
                      {(citation.relevance_score * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {citation.section_hint && (
                  <div>
                    <p className="text-xs text-text-muted mb-1 font-mono uppercase tracking-wider">Section Hint</p>
                    <p className="text-sm text-text font-medium">{citation.section_hint}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-text-muted mb-2 font-mono uppercase tracking-wider">Excerpt</p>
                  <div className="p-4 rounded-lg bg-base border border-glass-border font-mono text-sm text-text/90 leading-relaxed max-h-48 overflow-y-auto">
                    "{citation.excerpt}"
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
