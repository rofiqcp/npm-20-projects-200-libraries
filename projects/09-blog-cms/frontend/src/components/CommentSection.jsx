import React, { useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../App.jsx';

export default function CommentSection({ postId, comments: initialComments }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments || []);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content: text });
      setComments((prev) => [...prev, { ...data, authorName: user.username }]);
      setText('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Comments ({comments.length})</h3>

      <ul className="space-y-4 mb-6">
        {comments.map((c, i) => (
          <li key={c._id || i} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {(c.authorName || 'U')[0].toUpperCase()}
              </div>
              <span className="font-medium text-gray-800">{c.authorName || 'Unknown'}</span>
              <span className="text-gray-400 text-xs ml-auto">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{c.content}</p>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-gray-400 text-center py-4">No comments yet. Be the first!</li>
        )}
      </ul>

      {user ? (
        <form onSubmit={submit} className="flex gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            Post
          </button>
        </form>
      ) : (
        <p className="text-gray-500 text-sm">
          <a href="/login" className="text-indigo-600 hover:underline">Log in</a> to comment.
        </p>
      )}
    </div>
  );
}
