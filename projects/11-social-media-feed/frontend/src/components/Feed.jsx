import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import PostCard from './PostCard.jsx';
import CreatePost from './CreatePost.jsx';
import { MOCK_FEED } from '../mockData.js';

const GET_FEED = gql`
  query GetFeed($cursor: String, $limit: Int) {
    feed(cursor: $cursor, limit: $limit) {
      posts {
        id content likesCount commentsCount retweetsCount createdAt
        isLiked isRetweeted
        author { id username avatarUrl }
        comments {
          id content createdAt
          author { id username avatarUrl }
        }
      }
      hasMore
      nextCursor
    }
  }
`;

export default function Feed() {
  const [posts, setPosts] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);

  const { loading, error, fetchMore } = useQuery(GET_FEED, {
    variables: { limit: 10 },
    onCompleted: (data) => {
      setPosts(data.feed.posts);
      setHasMore(data.feed.hasMore);
      setCursor(data.feed.nextCursor);
    },
    fetchPolicy: 'network-only',
  });

  const displayPosts = posts ?? (error ? MOCK_FEED : null);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => (prev ? [newPost, ...prev] : [newPost]));
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev?.filter((p) => p.id !== postId) ?? []);
  };

  const loadMore = () => {
    if (!hasMore || !cursor) return;
    fetchMore({
      variables: { cursor, limit: 10 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const newPosts = fetchMoreResult.feed.posts;
        setPosts((p) => [...(p || []), ...newPosts]);
        setHasMore(fetchMoreResult.feed.hasMore);
        setCursor(fetchMoreResult.feed.nextCursor);
        return prev;
      },
    });
  };

  if (loading && !displayPosts) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-[#1d9bf0] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <CreatePost onPostCreated={handlePostCreated} />

      {error && (
        <div className="px-4 py-2 text-sm text-yellow-400 bg-yellow-400/10 border-b border-[#2f3336]">
          ⚠️ Using demo data (backend not connected)
        </div>
      )}

      <div>
        {(displayPosts || []).map((post) => (
          <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={loadMore}
            className="btn-ghost text-sm"
          >
            Load more posts
          </button>
        </div>
      )}

      {displayPosts?.length === 0 && (
        <div className="text-center py-16 text-[#536471]">
          <p className="text-xl font-bold">No posts yet</p>
          <p className="mt-1">Be the first to post!</p>
        </div>
      )}
    </div>
  );
}
