import { Link } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext.jsx';

const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) { id username followersCount isFollowing }
  }
`;
const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) { id username followersCount isFollowing }
  }
`;

function formatNumber(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function UserProfile({ user, compact = false }) {
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === user?.id || currentUser?.username === user?.username;

  const [followUser] = useMutation(FOLLOW_USER);
  const [unfollowUser] = useMutation(UNFOLLOW_USER);

  const handleFollow = () => {
    if (user.isFollowing) {
      unfollowUser({ variables: { userId: user.id } });
    } else {
      followUser({ variables: { userId: user.id } });
    }
  };

  if (!user) return null;

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3">
        <Link to={`/profile/${user.username}`} className="flex items-center gap-3 min-w-0">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.username}
            className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold truncate hover:underline">{user.username}</p>
            {user.bio && <p className="text-[#536471] text-sm truncate">{user.bio}</p>}
          </div>
        </Link>
        {!isOwnProfile && (
          <button
            onClick={handleFollow}
            className={user.isFollowing ? 'btn-ghost text-sm py-1.5 px-4' : 'btn-primary text-sm py-1.5 px-4'}
          >
            {user.isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Cover */}
      <div className="h-36 bg-gradient-to-br from-[#1d9bf0] to-purple-600" />

      <div className="px-4">
        <div className="flex justify-between items-start -mt-12 mb-3">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.username}
            className="w-24 h-24 rounded-full border-4 border-black bg-gray-700"
          />
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              className={`mt-14 ${user.isFollowing ? 'btn-ghost' : 'btn-primary'}`}
            >
              {user.isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <h1 className="text-xl font-extrabold">{user.username}</h1>
        <p className="text-[#536471]">@{user.username}</p>

        {user.bio && <p className="mt-2 text-[15px]">{user.bio}</p>}

        {user.createdAt && (
          <p className="text-[#536471] text-sm mt-2">
            📅 Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </p>
        )}

        <div className="flex gap-6 mt-3">
          <div>
            <span className="font-bold">{formatNumber(user.followingCount)}</span>
            <span className="text-[#536471] ml-1">Following</span>
          </div>
          <div>
            <span className="font-bold">{formatNumber(user.followersCount)}</span>
            <span className="text-[#536471] ml-1">Followers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
