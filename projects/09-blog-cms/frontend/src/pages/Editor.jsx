import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../App.jsx';

export default function Editor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const autoSaveRef = useRef(null);

  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', categories: '', tags: '', published: false,
  });
  const [saving, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id) {
      api.get(`/posts/${id}`).then(({ data }) => {
        setForm({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || '',
          categories: data.categories?.join(', ') || '',
          tags: data.tags?.join(', ') || '',
          published: data.published,
        });
      }).catch(console.error);
    }
  }, [id]);

  // Auto-save draft every 3 seconds
  useEffect(() => {
    if (!form.title) return;
    clearTimeout(autoSaveRef.current);
    setSaved(false);
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem('blog_draft', JSON.stringify(form));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 3000);
    return () => clearTimeout(autoSaveRef.current);
  }, [form]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('content', form.content);
      payload.append('excerpt', form.excerpt);
      payload.append('categories', JSON.stringify(form.categories.split(',').map((s) => s.trim()).filter(Boolean)));
      payload.append('tags', JSON.stringify(form.tags.split(',').map((s) => s.trim()).filter(Boolean)));
      payload.append('published', String(form.published));

      if (id) {
        await api.put(`/posts/${id}`, payload);
      } else {
        await api.post('/posts', payload);
      }
      localStorage.removeItem('blog_draft');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-indigo-600 hover:underline text-sm">← Back</Link>
          <h1 className="font-bold text-gray-800">{id ? 'Edit Post' : 'New Post'}</h1>
          {saved && <span className="text-green-500 text-sm">✓ Draft saved</span>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={submit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <input
              name="title"
              value={form.title}
              onChange={handle}
              placeholder="Post title..."
              required
              className="w-full text-2xl font-bold border-0 border-b border-gray-200 pb-2 focus:outline-none focus:border-indigo-400"
            />
            <input
              name="excerpt"
              value={form.excerpt}
              onChange={handle}
              placeholder="Short excerpt (optional)..."
              className="w-full text-gray-500 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <textarea
              name="content"
              value={form.content}
              onChange={handle}
              placeholder="Write your post content in Markdown..."
              rows={16}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma-separated)</label>
              <input
                name="categories"
                value={form.categories}
                onChange={handle}
                placeholder="Tech, Tutorial, News"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handle}
                placeholder="javascript, react, nodejs"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="published" checked={form.published} onChange={handle} className="w-4 h-4 accent-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Publish immediately</span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Link to="/" className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : id ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
