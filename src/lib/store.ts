'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  mode: string;
  createdAt: number;
  updatedAt: number;
}

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  mode: string;
  isLoading: boolean;
  
  createChat: (mode?: string) => string;
  deleteChat: (id: string) => void;
  setCurrentChat: (id: string) => void;
  setMode: (mode: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (chatId: string, content: string) => void;
  setIsLoading: (loading: boolean) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  getCurrentChat: () => Chat | undefined;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChatId: null,
  mode: 'default',
  isLoading: false,

  createChat: (mode = 'default') => {
    const id = uuidv4();
    const chat: Chat = {
      id,
      title: 'New Chat',
      messages: [],
      mode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({
      chats: [chat, ...state.chats],
      currentChatId: id,
    }));
    return id;
  },

  deleteChat: (id) => {
    set((state) => {
      const chats = state.chats.filter((c) => c.id !== id);
      let currentChatId = state.currentChatId;
      if (currentChatId === id) {
        currentChatId = chats.length > 0 ? chats[0].id : null;
      }
      return { chats, currentChatId };
    });
  },

  setCurrentChat: (id) => set({ currentChatId: id }),
  
  setMode: (mode) => set({ mode }),

  addMessage: (chatId, message) => {
    const msg: Message = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    };
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, msg], updatedAt: Date.now() }
          : c
      ),
    }));
  },

  updateLastMessage: (chatId, content) => {
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: c.messages.map((m, i) =>
                i === c.messages.length - 1 ? { ...m, content } : m
              ),
              updatedAt: Date.now(),
            }
          : c
      ),
    }));
  },

  setIsLoading: (loading) => set({ isLoading: loading }),

  updateChatTitle: (chatId, title) => {
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, title } : c
      ),
    }));
  },

  getCurrentChat: () => {
    const state = get();
    return state.chats.find((c) => c.id === state.currentChatId);
  },
}));
