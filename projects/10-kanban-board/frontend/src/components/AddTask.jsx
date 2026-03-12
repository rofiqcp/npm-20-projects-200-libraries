import React, { useState } from 'react';

export default function AddTask({ columnId, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(columnId, title.trim());
      setTitle('');
      setAdding(false);
    }
  };

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="w-full text-left text-gray-400 hover:text-gray-600 text-sm py-1 hover:bg-gray-200 rounded px-2 transition-colors"
      >
        + Add task
      </button>
    );
  }

  return (
    <form onSubmit={submit}>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => { if (!title.trim()) setAdding(false); }}
        placeholder="Task title..."
        className="w-full border border-violet-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 mb-2"
      />
      <div className="flex gap-2">
        <button type="submit" className="bg-violet-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-violet-700">
          Add
        </button>
        <button type="button" onClick={() => setAdding(false)} className="text-gray-400 text-xs hover:text-gray-600">
          Cancel
        </button>
      </div>
    </form>
  );
}
