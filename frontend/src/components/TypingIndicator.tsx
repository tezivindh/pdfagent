import React from 'react'
import { motion } from 'framer-motion'

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-1.5 px-4 py-3 bg-surface-2/80 border border-glass-border rounded-2xl rounded-tl-sm w-fit">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-text-muted"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}
