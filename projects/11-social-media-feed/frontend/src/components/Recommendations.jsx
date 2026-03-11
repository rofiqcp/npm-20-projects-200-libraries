import { useQuery, gql } from '@apollo/client';
import UserProfile from './UserProfile.jsx';
import { MOCK_SUGGESTED_USERS, MOCK_TRENDING } from '../mockData.js';

const GET_SUGGESTIONS = gql`
  query GetSuggestions {
    suggestedUsers {
      id username bio avatarUrl followersCount isFollowing
    }
    trendingHashtags
  }
`;

export default function Recommendations() {
  const { data, error } = useQuery(GET_SUGGESTIONS);

  const users = data?.suggestedUsers ?? (error ? MOCK_SUGGESTED_USERS : []);
  const hashtags = data?.trendingHashtags ?? (error ? MOCK_TRENDING : []);

  return (
    <div className="space-y-4">
      {/* Trending */}
      <div className="bg-[#16181c] rounded-2xl overflow-hidden">
        <h2 className="text-xl font-extrabold px-4 py-3">Trends for you</h2>
        <div>
          {hashtags.slice(0, 6).map((tag, i) => (
            <button
              key={tag}
              className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-[#2f3336] last:border-0"
            >
              <p className="text-[#536471] text-xs">Trending · #{i + 1}</p>
              <p className="font-bold mt-0.5">{tag}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Who to follow */}
      {users.length > 0 && (
        <div className="bg-[#16181c] rounded-2xl overflow-hidden">
          <h2 className="text-xl font-extrabold px-4 py-3">Who to follow</h2>
          <div>
            {users.slice(0, 4).map((user) => (
              <div key={user.id} className="px-4 py-3 hover:bg-white/5 transition-colors border-b border-[#2f3336] last:border-0">
                <UserProfile user={user} compact />
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[#536471] text-xs px-2">
        Social Feed Demo · Built with React + GraphQL
      </p>
    </div>
  );
}
