import React from 'react'
import { ChatMessage } from '../types'
import { CitationChip } from './CitationChip'
import { RefusalBadge } from './RefusalBadge'

export const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div 
        className={`max-w-[95%] lg:max-w-[85%] flex flex-col gap-2 ${
          isUser 
            ? 'items-end' 
            : 'items-start'
        }`}
      >
        <div 
          className={`px-5 py-4 rounded-2xl shadow-md ${
            isUser 
              ? 'bg-accent/20 border border-accent/30 rounded-tr-sm text-text' 
              : `bg-surface-2 border ${message.is_refusal ? 'border-warning/50' : 'border-glass-border'} rounded-tl-sm text-text/90`
          }`}
        >
          {message.is_refusal && <RefusalBadge reason={message.refusal_reason} />}
          
          <div className="whitespace-pre-wrap font-dmSans text-[15px] leading-relaxed">
            {message.content}
          </div>

        </div>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1 px-1">
            {message.citations.map((cit, idx) => (
              <CitationChip key={`${cit.chunk_id}-${idx}`} citation={cit} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
