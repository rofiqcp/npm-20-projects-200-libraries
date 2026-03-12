import { useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import Navbar from './components/Navbar';
import ConversationList, { CollapsedSidebar } from './components/ConversationList';
import ChatWindow from './components/ChatWindow';
import { Bot, Loader2 } from 'lucide-react';

function LoginScreen() {
  const { login, loginDemo } = useChat();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    try {
      await login(username);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    setError('');
    try {
      await loginDemo();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect. Make sure the backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] p-4">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30">
            <Bot size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Chatbot</h1>
          <p className="text-gray-400 text-sm">Powered by OpenAI + Socket.IO streaming</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter any username to start"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-red-900/30 border border-red-500/40 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Connecting…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 hover:text-white rounded-xl font-medium transition-colors text-sm border border-gray-700 hover:border-gray-600"
          >
            Continue as Guest
          </button>

          <div className="mt-5 p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-xl">
            <p className="text-xs text-indigo-300/70 text-center leading-relaxed">
              No registration needed. Works with mock LLM out-of-the-box.
              <br />
              Add an OpenAI key for real AI responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user } = useChat();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        {sidebarCollapsed ? (
          <CollapsedSidebar onToggle={() => setSidebarCollapsed(false)} />
        ) : (
          <ConversationList
            collapsed={false}
            onToggle={() => setSidebarCollapsed(true)}
          />
        )}
        <main className="flex-1 flex flex-col min-w-0 min-h-0">
          <ChatWindow />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}
