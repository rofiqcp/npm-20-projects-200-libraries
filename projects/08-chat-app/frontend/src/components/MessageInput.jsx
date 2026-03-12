import React, { useState, useRef, useEffect } from 'react';
import TypingIndicator from './TypingIndicator.jsx';

export default function MessageInput({ onSend, onTyping, onStopTyping, typingUsers }) {
  const [text, setText] = useState('');
  const typingTimer = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping();
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(onStopTyping, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      clearTimeout(typingTimer.current);
      onStopTyping();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t p-4">
      <TypingIndicator users={typingUsers} />
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
