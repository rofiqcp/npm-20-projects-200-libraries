import { useChat } from '../context/ChatContext';
import { Bot, Wifi, WifiOff, LogOut, Zap } from 'lucide-react';

export default function Navbar() {
  const { user, isConnected, logout, mode } = useChat();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur border-b border-gray-800 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-semibold text-sm leading-none">AI Chatbot</h1>
          <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
            <Zap size={10} className={mode === 'openai' ? 'text-yellow-400' : 'text-indigo-400'} />
            {mode === 'openai' ? 'OpenAI GPT' : 'Mock LLM'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Connection indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          {isConnected ? (
            <>
              <Wifi size={14} className="text-emerald-400" />
              <span className="text-emerald-400 hidden sm:inline">Live</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-red-400" />
              <span className="text-red-400 hidden sm:inline">Offline</span>
            </>
          )}
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-500/30 border border-indigo-500/50 flex items-center justify-center">
              <span className="text-indigo-300 text-xs font-semibold">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-gray-400 text-sm hidden sm:inline max-w-[120px] truncate">
              {user.username}
            </span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
