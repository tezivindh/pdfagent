import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const maxLength = 1000;

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="pt-4 border-t border-glass-border relative">
      <div className="relative flex items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value.substring(0, maxLength))}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Upload a PDF to start chatting" : "Ask a question about the document..."}
          className="input-field resize-none min-h-[50px] max-h-[150px] pr-12 custom-scrollbar"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors ${
            disabled || !input.trim() ? 'text-text-subtle bg-transparent' : 'text-white bg-accent hover:bg-accent/90'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <div className="text-right mt-1">
        <span className={`text-xs ${input.length >= maxLength ? 'text-warning' : 'text-text-subtle'}`}>
          {input.length} / {maxLength}
        </span>
      </div>
    </div>
  );
}
