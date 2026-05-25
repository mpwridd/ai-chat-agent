'use client';

import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Message } from '@/lib/store';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex justify-between items-center bg-gray-800 rounded-t-lg px-4 py-1.5 text-xs text-gray-400">
        <span>{match?.[1] || 'code'}</span>
        <button
          onClick={copy}
          className="hover:text-white transition-colors"
        >
          {copied ? '✅ Copied' : '📋 Copy'}
        </button>
      </div>
      <pre className={`${className} !rounded-t-none`}>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl mb-6">
          🤖
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">AI Chat Agent</h2>
        <p className="text-center max-w-md mb-8">
          Powered by <span className="text-indigo-400 font-semibold">Mimo v2.5 Pro</span> — 
          your intelligent assistant for coding, writing, analysis, and more.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {[
            { icon: '💻', label: 'Help me debug this code', desc: 'Coding assistance' },
            { icon: '📝', label: 'Write a blog post about AI', desc: 'Content creation' },
            { icon: '🔬', label: 'Explain quantum computing', desc: 'Research & learning' },
            { icon: '📊', label: 'Analyze this data trend', desc: 'Data analysis' },
          ].map((suggestion) => (
            <button
              key={suggestion.label}
              className="text-left p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all group"
            >
              <span className="text-2xl mb-2 block">{suggestion.icon}</span>
              <span className="text-sm text-gray-200 group-hover:text-white">{suggestion.label}</span>
              <span className="text-xs text-gray-500 block mt-1">{suggestion.desc}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                🤖
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code({ className, children, ...props }) {
                        const isInline = !className;
                        if (isInline) {
                          return (
                            <code className="bg-gray-700 rounded px-1.5 py-0.5 text-sm" {...props}>
                              {children}
                            </code>
                          );
                        }
                        return (
                          <CodeBlock className={className}>
                            {String(children)}
                          </CodeBlock>
                        );
                      },
                      a({ href, children }) {
                        return (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                            {children}
                          </a>
                        );
                      },
                      table({ children }) {
                        return (
                          <div className="overflow-x-auto">
                            <table className="border-collapse border border-gray-700">{children}</table>
                          </div>
                        );
                      },
                      th({ children }) {
                        return <th className="border border-gray-700 px-3 py-1 bg-gray-700/50">{children}</th>;
                      },
                      td({ children }) {
                        return <td className="border border-gray-700 px-3 py-1">{children}</td>;
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                👤
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0">
              🤖
            </div>
            <div className="bg-gray-800 rounded-2xl px-5 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
