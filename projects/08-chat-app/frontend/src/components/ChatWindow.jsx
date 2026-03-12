import React, { useEffect, useRef } from 'react';

export default function ChatWindow({ messages, currentUser }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 py-10">No messages yet. Say hello! 👋</div>
      )}
      {messages.map((msg, i) => {
        const isOwn = msg.user_id === currentUser?.id || msg.username === currentUser?.username;
        return (
          <div key={msg.id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
              {!isOwn && (
                <span className="text-xs text-gray-500 mb-1 ml-2">{msg.username}</span>
              )}
              <div className={`px-4 py-2 rounded-2xl shadow-sm ${
                isOwn
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
              }`}>
                <p className="text-sm">{msg.content}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1 mx-2">
                {formatTime(msg.created_at)}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
