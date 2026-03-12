import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext.jsx';

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      content
      likesCount
      commentsCount
      retweetsCount
      createdAt
      author {
        id
        username
        avatarUrl
      }
      isLiked
      isRetweeted
    }
  }
`;

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [focused, setFocused] = useState(false);
  const maxChars = 280;

  const [createPost, { loading }] = useMutation(CREATE_POST, {
    onCompleted: (data) => {
      setContent('');
      setFocused(false);
      onPostCreated?.(data.createPost);
    },
    onError: (err) => console.error('Create post error:', err),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || content.length > maxChars) return;
    createPost({ variables: { input: { content: content.trim() } } });
  };

  const remaining = maxChars - content.length;
  const isOverLimit = remaining < 0;
  const isNearLimit = remaining < 20 && remaining >= 0;

  return (
    <div className="border-b border-[#2f3336] px-4 py-3">
      <div className="flex gap-3">
        <img
          src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
          alt={user?.username}
          className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="What's happening?!"
            className="w-full bg-transparent text-xl placeholder-[#536471] outline-none resize-none min-h-[56px] text-white"
            rows={focused ? 4 : 2}
            maxLength={maxChars + 10}
          />

          {focused && (
            <div className="mt-3 pt-3 border-t border-[#2f3336] flex items-center justify-between animate-fadeIn">
              <div className="flex gap-3 text-[#1d9bf0]">
                <button className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition-colors" title="Add image">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition-colors" title="Add emoji">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="12" fill="none" stroke="#2f3336" strokeWidth="3" />
                      <circle
                        cx="16" cy="16" r="12" fill="none"
                        stroke={isOverLimit ? '#f4212e' : isNearLimit ? '#ffd400' : '#1d9bf0'}
                        strokeWidth="3"
                        strokeDasharray={`${Math.min(100, (content.length / maxChars) * 75.4)} 75.4`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={`text-sm ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-400' : 'text-[#536471]'}`}>
                      {remaining}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isOverLimit || loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
