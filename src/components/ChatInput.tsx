'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onStop, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900 px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 bg-gray-800 rounded-2xl px-4 py-3 border border-gray-700 focus-within:border-indigo-500 transition-colors">
          <button
            className="text-gray-400 hover:text-white transition-colors p-1 mb-0.5"
            title="Attach file (coming soon)"
          >
            <Paperclip size={18} />
          </button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask anything..."
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm leading-relaxed max-h-[200px]"
          />
          {isLoading ? (
            <button
              onClick={onStop}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              title="Stop generation"
            >
              <Square size={18} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`p-2 rounded-xl transition-all ${
                message.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'text-gray-500'
              }`}
              title="Send message"
            >
              <Send size={18} />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 text-center mt-2">
          Powered by <span className="text-indigo-500">Mimo v2.5 Pro</span> · Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
