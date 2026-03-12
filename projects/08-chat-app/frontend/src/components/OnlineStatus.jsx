import React from 'react';

export default function OnlineStatus({ count }) {
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
      <span className="text-indigo-300 text-xs">{count} online</span>
    </div>
  );
}
