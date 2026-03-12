import { useParams, Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import Navbar from '../components/Navbar.jsx';
import UserProfile from '../components/UserProfile.jsx';
import PostCard from '../components/PostCard.jsx';
import { MOCK_USERS, MOCK_FEED } from '../mockData.js';

const GET_USER_PROFILE = gql`
  query GetUserProfile($username: String!) {
    user(username: $username) {
      id username bio avatarUrl followersCount followingCount createdAt isFollowing
      posts {
        id content likesCount commentsCount retweetsCount createdAt
        isLiked isRetweeted
        author { id username avatarUrl }
        comments {
          id content createdAt
          author { id username avatarUrl }
        }
      }
    }
  }
`;

export default function Profile() {
  const { username } = useParams();

  const { data, loading, error } = useQuery(GET_USER_PROFILE, {
    variables: { username },
    fetchPolicy: 'network-only',
  });

  const user = data?.user ?? (error ? MOCK_USERS.find((u) => u.username === username) ?? MOCK_USERS[0] : null);
  const posts = user?.posts ?? (error ? MOCK_FEED.filter((p) => p.author.username === username) : []);

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="flex w-full max-w-6xl">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Navbar />
        </aside>

        <main className="flex-1 min-w-0 border-x border-[#2f3336] max-w-[600px]">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-[#2f3336] px-4 py-3 flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="font-extrabold text-xl">{username}</h1>
              <p className="text-[#536471] text-sm">{posts.length} posts</p>
            </div>
          </div>

          {loading && !user ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[#1d9bf0] border-t-transparent rounded-full" />
            </div>
          ) : user ? (
            <>
              <div className="border-b border-[#2f3336] pb-4">
                <UserProfile user={user} />
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#2f3336]">
                {['Posts', 'Replies', 'Media', 'Likes'].map((tab) => (
                  <button
                    key={tab}
                    className={`flex-1 py-4 text-sm font-medium hover:bg-white/5 transition-colors relative ${tab === 'Posts' ? 'text-white' : 'text-[#536471]'}`}
                  >
                    {tab}
                    {tab === 'Posts' && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#1d9bf0] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Posts */}
              {posts.length === 0 ? (
                <div className="text-center py-16 text-[#536471]">
                  <p className="text-xl font-bold">No posts yet</p>
                  <p className="mt-1">@{username} hasn't posted anything yet.</p>
                </div>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </>
          ) : (
            <div className="text-center py-16 text-[#536471]">
              <p className="text-xl font-bold">User not found</p>
              <p className="mt-1">The account @{username} doesn't exist.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
