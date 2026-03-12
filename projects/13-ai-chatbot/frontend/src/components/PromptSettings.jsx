import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X, Save, RotateCcw, Sparkles } from 'lucide-react';

const PRESET_PROMPTS = [
  {
    label: 'Helpful Assistant',
    prompt: 'You are a helpful, knowledgeable, and friendly AI assistant. Answer questions clearly and concisely.',
  },
  {
    label: 'Code Expert',
    prompt:
      'You are an expert software engineer. Provide detailed code examples with explanations. Always follow best practices and include error handling.',
  },
  {
    label: 'Creative Writer',
    prompt:
      'You are a creative writing assistant. Help craft engaging stories, poems, and creative content with vivid descriptions and compelling narratives.',
  },
  {
    label: 'Tutor',
    prompt:
      'You are a patient and encouraging tutor. Explain concepts step-by-step, use analogies to simplify complex ideas, and check for understanding.',
  },
  {
    label: 'Concise',
    prompt:
      'You are a concise assistant. Give short, direct answers. No fluff or unnecessary explanations unless specifically asked.',
  },
];

export default function PromptSettings({ onClose }) {
  const { activeConversation, updateConversation, updateSystemPrompt, clearMessages, activeConversationId } =
    useChat();

  const [systemPrompt, setSystemPrompt] = useState(
    activeConversation?.systemPrompt ||
      'You are a helpful, knowledgeable, and friendly AI assistant.'
  );
  const [model, setModel] = useState(activeConversation?.model || 'gpt-3.5-turbo');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!activeConversationId) return;
    setSaving(true);
    try {
      await updateConversation(activeConversationId, { systemPrompt, model });
      updateSystemPrompt(activeConversationId, systemPrompt);
    } finally {
      setSaving(false);
      onClose();
    }
  }

  async function handleClear() {
    if (!activeConversationId) return;
    if (window.confirm('Clear all messages in this conversation?')) {
      await clearMessages(activeConversationId);
      onClose();
    }
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-400" />
            <h2 className="text-white font-semibold">Conversation Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none leading-relaxed"
              placeholder="Describe the AI's role and behavior..."
            />
          </div>

          {/* Preset buttons */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
              Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_PROMPTS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setSystemPrompt(preset.prompt)}
                  className="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-indigo-600/20 border border-gray-700 hover:border-indigo-500/50 text-gray-400 hover:text-indigo-300 text-xs transition-all duration-150"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none cursor-pointer"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</option>
              <option value="gpt-4">GPT-4 (Smarter)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo (Latest)</option>
              <option value="gpt-4o">GPT-4o (Omni)</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Model selection applies when using a real OpenAI API key.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors"
          >
            <RotateCcw size={14} />
            Clear Messages
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
