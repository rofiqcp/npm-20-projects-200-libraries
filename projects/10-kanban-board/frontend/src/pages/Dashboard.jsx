import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../App.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/boards')
      .then(({ data }) => setBoards(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createBoard = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post('/boards', { title: newTitle });
      setBoards((prev) => [...prev, data]);
      setNewTitle('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  const deleteBoard = async (id) => {
    if (!confirm('Delete this board?')) return;
    try {
      await api.delete(`/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert('Failed to delete board');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-violet-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <h1 className="text-xl font-bold">Kanban Board</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-violet-200 text-sm">@{user?.username}</span>
          <button onClick={logout} className="text-violet-200 hover:text-white text-sm">Logout</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">My Boards</h2>
        </div>

        <form onSubmit={createBoard} className="flex gap-3 mb-8">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New board title..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <button type="submit" disabled={creating || !newTitle.trim()}
            className="bg-violet-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50">
            {creating ? 'Creating...' : '+ Create Board'}
          </button>
        </form>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading boards...</div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-xl">No boards yet. Create one above!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div key={board._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-lg">{board.title}</h3>
                  <button onClick={() => deleteBoard(board._id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Created {new Date(board.created_at || board.createdAt).toLocaleDateString()}
                </p>
                <Link to={`/board/${board._id}`}
                  className="block w-full text-center bg-violet-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-violet-700">
                  Open Board →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
