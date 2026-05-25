'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useChatStore, Message } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';

export default function ChatApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    chats,
    currentChatId,
    mode,
    isLoading,
    createChat,
    addMessage,
    updateLastMessage,
    setIsLoading,
    updateChatTitle,
  } = useChatStore();

  const abortRef = useRef<AbortController | null>(null);
  const currentChat = chats.find((c) => c.id === currentChatId);

  // Auto-create first chat
  useEffect(() => {
    if (chats.length === 0) {
      createChat();
    }
  }, [chats.length, createChat]);

  const handleSend = useCallback(async (content: string) => {
    let chatId = currentChatId;
    if (!chatId) {
      chatId = createChat(mode);
    }

    const chat = chats.find(c => c.id === chatId);
    const isFirstMessage = !chat || chat.messages.length === 0;

    // Add user message
    addMessage(chatId, { role: 'user', content });
    setIsLoading(true);

    // Generate title for first message
    if (isFirstMessage) {
      fetch('/api/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: content }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.title) updateChatTitle(chatId!, data.title);
        })
        .catch(() => {});
    }

    // Add empty assistant message for streaming
    addMessage(chatId, { role: 'assistant', content: '' });

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const updatedChat = useChatStore.getState().chats.find(c => c.id === chatId);
      const messagesForAPI = updatedChat?.messages
        .filter((_, i) => i < updatedChat.messages.length - 1) // exclude the empty assistant msg
        .map(({ role, content }) => ({ role, content })) || [];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesForAPI,
          mode,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      let accumulated = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulated += parsed.content;
                updateLastMessage(chatId!, accumulated);
              }
            } catch {}
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        updateLastMessage(chatId!, `❌ Error: ${error.message}. Please try again.`);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [currentChatId, mode, chats, createChat, addMessage, updateLastMessage, setIsLoading, updateChatTitle]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, [setIsLoading]);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-sm">
              {currentChat?.title || 'New Chat'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              mode === 'coding' ? 'bg-green-900/30 text-green-400' :
              mode === 'writing' ? 'bg-blue-900/30 text-blue-400' :
              mode === 'analysis' ? 'bg-yellow-900/30 text-yellow-400' :
              'bg-purple-900/30 text-purple-400'
            }`}>
              {mode}
            </span>
            <span className="text-xs text-gray-500">
              {currentChat?.messages.length || 0} msgs
            </span>
          </div>
        </header>

        {/* Messages */}
        <ChatMessages
          messages={currentChat?.messages || []}
          isLoading={isLoading}
        />

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
