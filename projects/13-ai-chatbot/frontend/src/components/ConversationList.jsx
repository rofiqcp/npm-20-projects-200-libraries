import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';

export default function ConversationList({ collapsed, onToggle }) {
  const {
    conversations,
    activeConversationId,
    createConversation,
    selectConversation,
    deleteConversation,
    updateConversation,
    messages,
  } = useChat();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  async function handleNew() {
    await createConversation();
  }

  function startEdit(conv, e) {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  }

  async function saveEdit(id, e) {
    e?.stopPropagation();
    if (editTitle.trim()) {
      await updateConversation(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  }

  function cancelEdit(e) {
    e?.stopPropagation();
    setEditingId(null);
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      await deleteConversation(id);
    }
  }

  function exportConversation(e) {
    e.stopPropagation();
    const text = messages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${activeConversationId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <aside
      className={`flex flex-col bg-gray-900/60 border-r border-gray-800 transition-all duration-300 ${
        collapsed ? 'w-0 overflow-hidden' : 'w-64'
      } shrink-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <span className="text-gray-300 text-sm font-medium">Conversations</span>
        <div className="flex items-center gap-1">
          {activeConversationId && messages.length > 0 && (
            <button
              onClick={exportConversation}
              className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              title="Export conversation"
            >
              <Download size={14} />
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>

      {/* New conversation button */}
      <div className="p-2">
        <button
          onClick={handleNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-sm transition-colors"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-xs">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`group relative flex flex-col px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 text-sm ${
                conv.id === activeConversationId
                  ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-200'
                  : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
              }`}
            >
              {editingId === conv.id ? (
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(conv.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 bg-gray-800 border border-indigo-500 rounded px-2 py-0.5 text-xs text-white outline-none min-w-0"
                    autoFocus
                  />
                  <button
                    onClick={(e) => saveEdit(conv.id, e)}
                    className="text-emerald-400 hover:text-emerald-300 shrink-0"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-gray-500 hover:text-gray-300 shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <MessageSquare
                        size={13}
                        className={
                          conv.id === activeConversationId ? 'text-indigo-400 shrink-0' : 'text-gray-600 shrink-0'
                        }
                      />
                      <span className="truncate text-xs font-medium">{conv.title}</span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity">
                      <button
                        onClick={(e) => startEdit(conv, e)}
                        className="p-0.5 rounded text-gray-600 hover:text-indigo-400 transition-colors"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(conv.id, e)}
                        className="p-0.5 rounded text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-0.5 pl-5">
                    <span className="text-gray-600 text-xs">
                      {conv.messages?.length || 0} msgs
                    </span>
                    <span className="text-gray-700 text-xs">
                      {formatDate(conv.updatedAt || conv.createdAt)}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export function CollapsedSidebar({ onToggle }) {
  return (
    <div className="flex flex-col items-center w-12 bg-gray-900/60 border-r border-gray-800 py-3 gap-3">
      <button
        onClick={onToggle}
        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
        title="Show sidebar"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
