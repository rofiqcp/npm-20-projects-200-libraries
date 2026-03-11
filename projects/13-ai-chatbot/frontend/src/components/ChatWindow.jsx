import { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatContext';
import Message from './Message';
import PromptSettings from './PromptSettings';
import {
  Send,
  Settings,
  MessageSquarePlus,
  Bot,
  AlertCircle,
  Coins,
  ChevronDown,
  Mic,
} from 'lucide-react';

export default function ChatWindow() {
  const {
    messages,
    isTyping,
    streamingContent,
    error,
    tokenUsage,
    activeConversationId,
    activeConversation,
    createConversation,
    sendMessage,
    mode,
  } = useChat();

  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent]);

  // Track scroll position for "scroll to bottom" button
  function handleScroll() {
    const el = messagesRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;

    let convId = activeConversationId;
    if (!convId) {
      const conv = await createConversation();
      convId = conv.id;
    }

    setInput('');
    sendMessage(text);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Empty state ────────────────────────────────────────────────────────────

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/10">
          <Bot size={36} className="text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">AI Chat Assistant</h2>
        <p className="text-gray-400 max-w-md mb-2 leading-relaxed text-sm">
          Start a new conversation to chat with your AI assistant. Ask questions, get code help,
          or explore any topic.
        </p>
        <p className="text-gray-600 text-xs mb-8">
          Running in <span className="text-indigo-400">{mode === 'openai' ? 'OpenAI' : 'Mock LLM'}</span> mode
        </p>

        <button
          onClick={() => createConversation()}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          <MessageSquarePlus size={20} />
          Start New Chat
        </button>

        {/* Suggestion pills */}
        <div className="mt-10 w-full max-w-lg">
          <p className="text-gray-600 text-xs uppercase tracking-wider mb-3">Try asking…</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              'Explain React hooks',
              'How does async/await work?',
              'What is machine learning?',
              'Write a Python script',
              'Best practices for JWT auth',
            ].map((s) => (
              <button
                key={s}
                onClick={async () => {
                  const conv = await createConversation();
                  if (conv) {
                    setTimeout(() => sendMessage(s), 100);
                  }
                }}
                className="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500/50 text-gray-400 hover:text-indigo-300 text-xs transition-all duration-150"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Chat view ──────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Conversation header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900/40">
        <div className="min-w-0">
          <h2 className="text-white text-sm font-medium truncate">
            {activeConversation?.title || 'Conversation'}
          </h2>
          <p className="text-gray-500 text-xs truncate">
            {activeConversation?.systemPrompt?.substring(0, 60)}
            {(activeConversation?.systemPrompt?.length || 0) > 60 ? '…' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Token usage */}
          {tokenUsage.conversationTokens > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400">
              <Coins size={12} className="text-yellow-500" />
              {tokenUsage.conversationTokens.toLocaleString()} tokens
            </div>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            title="Conversation settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-5 min-h-0"
      >
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center mb-3">
              <Bot size={20} className="text-indigo-400" />
            </div>
            <p className="text-gray-500 text-sm">Send a message to start the conversation</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={i} message={msg} />
        ))}

        {/* Streaming message */}
        {isTyping && (
          <Message
            message={{ role: 'assistant', content: streamingContent }}
            isStreaming={true}
            streamingContent={streamingContent}
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 p-2.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white shadow-lg transition-all hover:bg-gray-700 z-10"
        >
          <ChevronDown size={18} />
        </button>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-3 flex items-center gap-2 px-4 py-2.5 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/40">
        {/* Last response token info */}
        {tokenUsage.totalTokens > 0 && (
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2 px-1">
            <span>↑ {tokenUsage.promptTokens} prompt</span>
            <span>↓ {tokenUsage.completionTokens} completion</span>
            <span className="text-gray-500">= {tokenUsage.totalTokens} total</span>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message the AI… (Enter to send, Shift+Enter for newline)"
              rows={1}
              disabled={isTyping}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none leading-relaxed transition-colors disabled:opacity-50 max-h-40 overflow-y-auto"
              style={{
                height: 'auto',
                minHeight: '48px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white transition-colors shrink-0 shadow-lg shadow-indigo-500/10"
          >
            <Send size={18} className={isTyping ? 'opacity-50' : ''} />
          </button>
        </div>

        <p className="text-center text-gray-700 text-xs mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>

      {/* Settings modal */}
      {showSettings && <PromptSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
