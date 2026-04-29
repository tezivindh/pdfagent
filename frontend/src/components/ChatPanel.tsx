import React, { useRef, useEffect, useState } from 'react'
import { ChatMessage } from '../types'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { SendHorizontal } from 'lucide-react'

interface ChatPanelProps {
  messages: ChatMessage[]
  isSending: boolean
  onSendMessage: (text: string) => Promise<void>
  disabled: boolean
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  isSending, 
  onSendMessage, 
  disabled 
}) => {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (disabled || isSending) return
      
      const activeEl = document.activeElement
      if (
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement).isContentEditable
      ) {
        return
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Shift' || e.key === 'Escape' || e.key === 'Tab' || e.key === 'Enter') return

      inputRef.current?.focus()
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [disabled, isSending])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isSending])

  const handleSend = async () => {
    if (!input.trim() || disabled || isSending) return
    const text = input
    setInput('')
    await onSendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col bg-base relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth z-10"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-glass-border flex items-center justify-center rotate-3 shadow-xl">
              <span className="text-2xl">👋</span>
            </div>
            <p className="font-dmSans text-lg max-w-sm text-center">
              {disabled 
                ? "Upload a PDF document to start analyzing its contents."
                : "PDF loaded. Ask me anything about the document!"}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full pt-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isSending && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 lg:p-6 bg-linear-to-t from-base via-base to-transparent z-10 shrink-0">
        <div className="max-w-4xl mx-auto relative group">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            placeholder={disabled ? "Upload a PDF to start chatting..." : "Ask a question about the document..."}
            className="w-full bg-surface-2/80 backdrop-blur-xl border border-glass-border rounded-2xl py-3 pl-4 pr-14 lg:py-4 lg:pl-5 lg:pr-16 text-text placeholder:text-text-muted/50 focus:outline-hidden focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[60px] max-h-48 font-dmSans"
            rows={1}
            style={{ 
              height: 'auto', 
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' 
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-xs font-mono text-text-muted/40">
              {input.length}/1000
            </span>
            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled || isSending}
              className="p-2 rounded-xl bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:hover:bg-accent transition-colors shadow-lg"
            >
              <SendHorizontal size={18} />
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto text-center mt-2 lg:mt-3 text-[10px] lg:text-xs font-mono text-text-muted/40">
          Agent uses strictly extracted content. Zero external hallucination.
        </div>
      </div>
    </div>
  )
}
