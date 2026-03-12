import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PostCard from '../components/PostCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import api from '../services/api.js';
import { useAuth } from '../App.jsx';

export default function Blog() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('search');

  useEffect(() => {
    setLoading(true);
    const fetch = async () => {
      try {
        if (searchQuery) {
          const { data } = await api.get(`/posts/search?q=${encodeURIComponent(searchQuery)}`);
          setPosts(Array.isArray(data) ? data : []);
          setTotal(data.length);
        } else {
          const { data } = await api.get(`/posts?page=${page}&limit=9`);
          setPosts(data.posts || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error(err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-indigo-600">📝 Blog CMS</Link>
          <div className="flex items-center gap-4">
            <SearchBar />
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/editor" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                  + New Post
                </Link>
                <button onClick={logout} className="text-gray-500 text-sm hover:text-gray-700">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="text-indigo-600 hover:underline text-sm font-medium">Login</Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {searchQuery && (
          <div className="mb-6">
            <h2 className="text-lg text-gray-600">
              Search results for: <strong>"{searchQuery}"</strong>
              <Link to="/" className="ml-3 text-indigo-600 text-sm hover:underline">Clear</Link>
            </h2>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📄</p>
            <p className="text-xl">No posts found</p>
            {user && <Link to="/editor" className="mt-4 inline-block text-indigo-600 hover:underline">Create your first post</Link>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => <PostCard key={p._id} post={p} />)}
          </div>
        )}

        {!searchQuery && total > 9 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-gray-600">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 9 >= total}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
