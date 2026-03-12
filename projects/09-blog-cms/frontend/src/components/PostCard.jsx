import React from 'react';
import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      {post.featuredImage && (
        <img src={post.featuredImage} alt={post.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.categories?.map((cat) => (
            <span key={cat} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">{cat}</span>
          ))}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600">
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.excerpt && <p className="text-gray-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>By {post.author?.username || 'Unknown'}</span>
          <div className="flex items-center gap-3">
            <span>❤️ {post.likes}</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
