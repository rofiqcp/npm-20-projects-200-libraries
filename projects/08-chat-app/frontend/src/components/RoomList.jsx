import React, { useState } from 'react';

export default function RoomList({ rooms, activeRoom, onJoin, onCreate }) {
  const [newRoom, setNewRoom] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (newRoom.trim()) {
      onCreate(newRoom.trim());
      setNewRoom('');
      setShowForm(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 flex items-center justify-between">
        <span className="text-indigo-300 text-xs font-semibold uppercase tracking-wider">Rooms</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-indigo-300 hover:text-white text-lg leading-none"
          title="New room"
        >+</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="px-3 pb-3">
          <input
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            placeholder="Room name..."
            autoFocus
            className="w-full bg-indigo-800 text-white rounded-lg px-3 py-2 text-sm placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </form>
      )}

      <ul className="px-2 space-y-1">
        {rooms.map((room) => (
          <li key={room.id}>
            <button
              onClick={() => onJoin(room)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeRoom?.id === room.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`}
            >
              # {room.name}
            </button>
          </li>
        ))}
        {rooms.length === 0 && (
          <li className="text-indigo-400 text-sm px-3 py-2">No rooms yet</li>
        )}
      </ul>
    </div>
  );
}
