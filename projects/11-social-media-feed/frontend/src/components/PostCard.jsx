import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext.jsx';

const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) { id likesCount isLiked }
  }
`;
const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) { id likesCount isLiked }
  }
`;
const RETWEET_POST = gql`
  mutation RetweetPost($postId: ID!) {
    retweetPost(postId: $postId) { id retweetsCount isRetweeted }
  }
`;
const COMMENT_ON_POST = gql`
  mutation CommentOnPost($postId: ID!, $content: String!) {
    commentOnPost(postId: $postId, content: $content) {
      id content createdAt
      author { id username avatarUrl }
    }
  }
`;
const DELETE_POST = gql`
  mutation DeletePost($id: ID!) { deletePost(id: $id) }
`;

function formatTime(dateStr) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

function formatNumber(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function renderContent(content) {
  const parts = content.split(/(#\w+|@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('#') || part.startsWith('@')) {
      return <span key={i} className="text-[#1d9bf0] hover:underline cursor-pointer">{part}</span>;
    }
    return part;
  });
}

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState(post.comments || []);
  const [likeAnimation, setLikeAnimation] = useState(false);

  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);
  const [retweetPost] = useMutation(RETWEET_POST);
  const [commentOnPost, { loading: commenting }] = useMutation(COMMENT_ON_POST);
  const [deletePost] = useMutation(DELETE_POST);

  const handleLike = () => {
    if (post.isLiked) {
      unlikePost({ variables: { postId: post.id } });
    } else {
      setLikeAnimation(true);
      setTimeout(() => setLikeAnimation(false), 300);
      likePost({ variables: { postId: post.id } });
    }
  };

  const handleRetweet = () => {
    retweetPost({ variables: { postId: post.id } });
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentOnPost({
      variables: { postId: post.id, content: commentText.trim() },
      onCompleted: (data) => {
        setLocalComments((prev) => [data.commentOnPost, ...prev]);
        setCommentText('');
      },
    });
  };

  const handleDelete = () => {
    deletePost({
      variables: { id: post.id },
      onCompleted: () => onDelete?.(post.id),
    });
  };

  const isOwner = user?.id === post.author.id || user?.username === post.author.username;

  return (
    <article className="border-b border-[#2f3336] px-4 py-3 hover:bg-white/[0.03] transition-colors animate-fadeIn">
      <div className="flex gap-3">
        <Link to={`/profile/${post.author.username}`} className="flex-shrink-0">
          <img
            src={post.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`}
            alt={post.author.username}
            className="w-10 h-10 rounded-full bg-gray-700 hover:opacity-80 transition-opacity"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <Link to={`/profile/${post.author.username}`} className="font-bold hover:underline truncate">
                {post.author.username}
              </Link>
              <span className="text-[#536471] flex-shrink-0">·</span>
              <span className="text-[#536471] text-sm flex-shrink-0">{formatTime(post.createdAt)}</span>
            </div>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="text-[#536471] hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-400/10"
                title="Delete post"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {renderContent(post.content)}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 max-w-xs">
            {/* Comment */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="tweet-action group"
            >
              <span className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
              </span>
              <span>{post.commentsCount > 0 ? formatNumber(post.commentsCount) : ''}</span>
            </button>

            {/* Retweet */}
            <button
              onClick={handleRetweet}
              className={`tweet-action group ${post.isRetweeted ? '!text-green-400' : ''}`}
            >
              <span className="p-2 rounded-full group-hover:bg-green-400/10 transition-colors">
                <svg className="w-4 h-4" fill={post.isRetweeted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
              </span>
              <span>{post.retweetsCount > 0 ? formatNumber(post.retweetsCount) : ''}</span>
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`tweet-action group ${post.isLiked ? '!text-pink-500' : ''}`}
            >
              <span className={`p-2 rounded-full group-hover:bg-pink-500/10 transition-colors ${likeAnimation ? 'like-pulse' : ''}`}>
                <svg className="w-4 h-4" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </span>
              <span>{post.likesCount > 0 ? formatNumber(post.likesCount) : ''}</span>
            </button>

            {/* Share */}
            <button className="tweet-action group">
              <span className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-3 animate-fadeIn">
              {/* Comment Form */}
              <form onSubmit={handleComment} className="flex gap-2 mb-3">
                <img
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                  alt={user?.username}
                  className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Post your reply"
                    className="flex-1 bg-transparent border-b border-[#2f3336] focus:border-[#1d9bf0] outline-none py-1 text-sm text-white placeholder-[#536471]"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commenting}
                    className="text-sm btn-primary py-1 px-3 disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {localComments.slice(0, 3).map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Link to={`/profile/${comment.author.username}`}>
                      <img
                        src={comment.author.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.username}`}
                        alt={comment.author.username}
                        className="w-7 h-7 rounded-full bg-gray-700"
                      />
                    </Link>
                    <div className="flex-1 bg-[#1e2732] rounded-2xl px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Link to={`/profile/${comment.author.username}`} className="font-bold text-sm hover:underline">
                          {comment.author.username}
                        </Link>
                        <span className="text-[#536471] text-xs">· {formatTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm mt-0.5">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
