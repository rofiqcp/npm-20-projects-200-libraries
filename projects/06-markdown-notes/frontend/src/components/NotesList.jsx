import React from 'react';

export default function NotesList({ notes, selectedId, onSelect, onNew, onDelete }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNew}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + New Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            No notes yet. Create your first!
          </div>
        ) : (
          <ul>
            {notes.map(note => (
              <li
                key={note.id}
                className={`border-b border-gray-100 cursor-pointer group ${
                  selectedId === note.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className="p-4"
                  onClick={() => onSelect(note.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-medium text-sm truncate flex-1 ${
                      selectedId === note.id ? 'text-indigo-700' : 'text-gray-800'
                    }`}>
                      {note.is_pinned && <span className="mr-1">📌</span>}
                      {note.title || 'Untitled'}
                    </h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1"
                      title="Delete note"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(note.updated_at)}</p>
                  {note.preview && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{note.preview}</p>
                  )}
                  {note.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.split(',').filter(Boolean).map(tag => (
                        <span key={tag.trim()} className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
