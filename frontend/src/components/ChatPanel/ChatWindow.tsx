import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage } from '../../types';
import { CitationChip } from './CitationChip';
import { ShieldAlert, User, Bot, Loader2 } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  isWaiting: boolean;
}

export function ChatWindow({ messages, isWaiting }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWaiting]);

  if (messages.length === 0 && !isWaiting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-subtle opacity-50">
        <Bot className="w-16 h-16 mb-4" />
        <p className="font-syne text-lg">No messages yet</p>
        <p className="text-sm">Ask a question to begin.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col space-y-6 pb-4">
      {messages.map((msg, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.role === 'user' ? (
            <div className="flex items-end flex-row-reverse max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center ml-3 shrink-0 border border-accent/30">
                <User className="w-4 h-4 text-accent" />
              </div>
              <div className="bg-accent text-white px-5 py-3 rounded-2xl rounded-br-sm shadow-2xs whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start max-w-[85%]">
              <div className="flex items-end">
                <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center mr-3 shrink-0 border border-glass-border shadow-2xs">
                  <Bot className="w-4 h-4 text-secondary" />
                </div>
                <div className={`glass-card px-5 py-4 rounded-2xl rounded-bl-sm ${msg.is_refusal ? 'border-warning/50 bg-warning/5' : ''}`}>
                  {msg.is_refusal && (
                    <div className="flex items-center text-warning text-xs font-bold mb-2">
                      <ShieldAlert className="w-4 h-4 mr-1" />
                      OUT OF SCOPE
                    </div>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              </div>
              
              {/* Citations below the bubble */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="ml-11 mt-1 flex flex-wrap">
                  {msg.citations.map((cit, cidx) => (
                    <CitationChip key={cidx} citation={cit} />
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      ))}

      {isWaiting && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex justify-start"
        >
          <div className="flex items-end">
             <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center mr-3 shrink-0 border border-glass-border">
                <Bot className="w-4 h-4 text-secondary" />
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-sm flex space-x-2 items-center">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span className="text-sm text-text-muted font-medium">Generating answer...</span>
              </div>
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
