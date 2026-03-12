// Mock data used when backend is not available
export const MOCK_USERS = [
  { id: '1', username: 'alice', email: 'alice@example.com', bio: 'Software engineer 🚀 | Open source lover', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', followersCount: 1240, followingCount: 320, createdAt: '2023-01-15T10:00:00Z', isFollowing: false },
  { id: '2', username: 'bob', email: 'bob@example.com', bio: 'Designer & creator ✨ | Coffee addict', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', followersCount: 890, followingCount: 210, createdAt: '2023-02-20T10:00:00Z', isFollowing: true },
  { id: '3', username: 'carol', email: 'carol@example.com', bio: 'Tech lead @ StartupXYZ | Building things', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol', followersCount: 5600, followingCount: 180, createdAt: '2023-03-10T10:00:00Z', isFollowing: false },
  { id: '4', username: 'dave', email: 'dave@example.com', bio: 'Full-stack dev | Node.js enthusiast 🟢', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dave', followersCount: 430, followingCount: 95, createdAt: '2023-04-05T10:00:00Z', isFollowing: false },
  { id: '5', username: 'eva', email: 'eva@example.com', bio: 'AI/ML researcher 🤖 | PhD student', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eva', followersCount: 2100, followingCount: 400, createdAt: '2023-05-01T10:00:00Z', isFollowing: true },
];

export const MOCK_FEED = [
  {
    id: 'p1', content: 'Just shipped a new feature using GraphQL subscriptions! Real-time data is absolutely game-changing 🚀 #GraphQL #WebDev #RealTime',
    likesCount: 42, commentsCount: 8, retweetsCount: 12, createdAt: new Date(Date.now() - 3600000).toISOString(),
    isLiked: false, isRetweeted: false,
    author: MOCK_USERS[0],
    comments: [{ id: 'c1', content: 'Subscriptions are awesome!', createdAt: new Date(Date.now() - 3000000).toISOString(), author: MOCK_USERS[1] }],
  },
  {
    id: 'p2', content: "Design tip: Always start with the user journey, not the UI. Understanding what users need BEFORE designing saves hours of rework. What's your design process? 🎨",
    likesCount: 89, commentsCount: 15, retweetsCount: 31, createdAt: new Date(Date.now() - 7200000).toISOString(),
    isLiked: true, isRetweeted: false,
    author: MOCK_USERS[1],
    comments: [],
  },
  {
    id: 'p3', content: "Hot take: TypeScript is not optional for large codebases anymore. It's a requirement. Fight me. 💬 #TypeScript #Programming",
    likesCount: 156, commentsCount: 42, retweetsCount: 67, createdAt: new Date(Date.now() - 10800000).toISOString(),
    isLiked: false, isRetweeted: true,
    author: MOCK_USERS[2],
    comments: [],
  },
  {
    id: 'p4', content: 'New paper alert! We achieved 94.2% accuracy on our benchmark using a novel attention mechanism. Preprint dropping next week 🤖 #MachineLearning #AI #Research',
    likesCount: 234, commentsCount: 28, retweetsCount: 89, createdAt: new Date(Date.now() - 14400000).toISOString(),
    isLiked: true, isRetweeted: false,
    author: MOCK_USERS[4],
    comments: [],
  },
  {
    id: 'p5', content: "Node.js 22 is here and the improvements to the test runner are incredible. No more Jest for simple projects? Possibly... #NodeJS #JavaScript",
    likesCount: 67, commentsCount: 19, retweetsCount: 23, createdAt: new Date(Date.now() - 18000000).toISOString(),
    isLiked: false, isRetweeted: false,
    author: MOCK_USERS[3],
    comments: [],
  },
  {
    id: 'p6', content: 'Reminder: Code reviews are about the code, not the person. Be kind, be constructive, and lift each other up. 🤝 #DeveloperCulture #CodeReview',
    likesCount: 201, commentsCount: 14, retweetsCount: 78, createdAt: new Date(Date.now() - 86400000).toISOString(),
    isLiked: false, isRetweeted: false,
    author: MOCK_USERS[0],
    comments: [],
  },
];

export const MOCK_SUGGESTED_USERS = MOCK_USERS.slice(1, 4);

export const MOCK_TRENDING = [
  '#GraphQL', '#TypeScript', '#ReactJS', '#NodeJS', '#WebDev', '#OpenSource', '#AI', '#MachineLearning',
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'LIKE', message: 'carol liked your post', read: false, createdAt: new Date(Date.now() - 3600000).toISOString(), from: MOCK_USERS[2], post: MOCK_FEED[0] },
  { id: 'n2', type: 'FOLLOW', message: 'bob started following you', read: false, createdAt: new Date(Date.now() - 7200000).toISOString(), from: MOCK_USERS[1], post: null },
  { id: 'n3', type: 'COMMENT', message: 'eva commented on your post', read: true, createdAt: new Date(Date.now() - 86400000).toISOString(), from: MOCK_USERS[4], post: MOCK_FEED[0] },
];

export const MOCK_AUTH = {
  token: 'mock-jwt-token-for-demo',
  user: MOCK_USERS[0],
};
