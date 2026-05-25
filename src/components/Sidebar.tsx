'use client';

import { MessageSquare, Plus, Trash2, ChevronLeft, ChevronRight, Code, PenTool, BarChart3, Sparkles } from 'lucide-react';
import { useChatStore, Chat } from '@/lib/store';
import { formatTimestamp, truncate } from '@/lib/utils';

const MODES = [
  { id: 'default', label: 'General', icon: Sparkles, color: 'text-purple-400' },
  { id: 'coding', label: 'Coding', icon: Code, color: 'text-green-400' },
  { id: 'writing', label: 'Writing', icon: PenTool, color: 'text-blue-400' },
  { id: 'analysis', label: 'Analysis', icon: BarChart3, color: 'text-yellow-400' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { chats, currentChatId, mode, setCurrentChat, createChat, deleteChat, setMode } = useChatStore();

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-72'
      } bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 flex-shrink-0`}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI Chat
            </h1>
          )}
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => createChat(mode)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="New Chat"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Modes */}
      {!collapsed && (
        <div className="p-3 border-b border-gray-800">
          <p className="text-xs text-gray-500 mb-2 font-medium">MODE</p>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                  mode === m.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
                }`}
              >
                <m.icon size={14} className={m.color} />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {!collapsed && chats.length > 0 && (
          <p className="text-xs text-gray-500 px-3 pt-3 pb-1 font-medium">CHATS</p>
        )}
        {chats.map((chat: Chat) => (
          <div key={chat.id} className="px-2 py-0.5">
            <button
              onClick={() => setCurrentChat(chat.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-2 group ${
                currentChatId === chat.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
              }`}
            >
              <MessageSquare size={16} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{truncate(chat.title, 25)}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(chat.updatedAt)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </>
              )}
            </button>
          </div>
        ))}
        
        {chats.length === 0 && !collapsed && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No chats yet. Click + to start.
          </div>
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-600">
            Mimo v2.5 Pro · Xiaomi
          </p>
        </div>
      )}
    </aside>
  );
}
