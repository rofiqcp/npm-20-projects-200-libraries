import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import CommentSection from '../components/CommentSection.jsx';
import api from '../services/api.js';
import { useAuth } from '../App.jsx';

export default function Post() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    api.get(`/posts/${slug}`)
      .then(({ data }) => { setPost(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    if (!user) return alert('Please login to like posts');
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setPost((prev) => ({ ...prev, likes: data.likes }));
      setLiked(data.liked);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!post) return (
    <div className="text-center py-20">
      <p className="text-xl text-gray-500 mb-4">Post not found</p>
      <Link to="/" className="text-indigo-600 hover:underline">← Back to Blog</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="text-indigo-600 hover:underline text-sm">← Back to Blog</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <article className="bg-white rounded-xl shadow-sm p-8">
          {post.featuredImage && (
            <img src={post.featuredImage} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-8" />
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories?.map((cat) => (
              <span key={cat} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">{cat}</span>
            ))}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b">
            <span>By <strong>{post.author?.username}</strong></span>
            {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            <button onClick={handleLike} className={`flex items-center gap-1 ml-auto px-3 py-1 rounded-full border transition-colors ${liked ? 'bg-red-50 border-red-200 text-red-500' : 'hover:bg-gray-50'}`}>
              ❤️ {post.likes}
            </button>
          </div>

          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
              {post.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </article>

        <CommentSection postId={post._id} comments={post.comments || []} />
      </main>
    </div>
  );
}
