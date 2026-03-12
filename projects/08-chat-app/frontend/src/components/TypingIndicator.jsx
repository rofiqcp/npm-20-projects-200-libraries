import React from 'react';

export default function TypingIndicator({ users }) {
  if (!users || users.length === 0) return <div className="h-5" />;
  const text = users.length === 1
    ? `${users[0]} is typing...`
    : `${users.slice(0, 2).join(', ')} are typing...`;
  return (
    <div className="text-xs text-gray-400 italic mb-1 px-1">{text}</div>
  );
}
