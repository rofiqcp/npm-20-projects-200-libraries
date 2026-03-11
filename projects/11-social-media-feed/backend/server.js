import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { initDB } from './models/db.js';
import { getAuthUser, generateToken } from './middleware/auth.js';
import { userResolvers } from './resolvers/users.js';
import { postResolvers } from './resolvers/posts.js';
import { feedResolvers } from './resolvers/feed.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const typeDefs = readFileSync(join(__dirname, 'schema/schema.graphql'), 'utf8');

// ─── In-Memory Mock Database ──────────────────────────────────────────────────
const now = () => new Date().toISOString();

const hashSync = (pw) => bcrypt.hashSync(pw, 10);

const _users = [
  { id: '1', username: 'alice', email: 'alice@example.com', passwordHash: hashSync('password'), bio: 'Software engineer 🚀 | Open source lover', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', followersCount: 1240, followingCount: 320, createdAt: '2023-01-15T10:00:00Z' },
  { id: '2', username: 'bob', email: 'bob@example.com', passwordHash: hashSync('password'), bio: 'Designer & creator ✨ | Coffee addict', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', followersCount: 890, followingCount: 210, createdAt: '2023-02-20T10:00:00Z' },
  { id: '3', username: 'carol', email: 'carol@example.com', passwordHash: hashSync('password'), bio: 'Tech lead @ StartupXYZ | Building things', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol', followersCount: 5600, followingCount: 180, createdAt: '2023-03-10T10:00:00Z' },
  { id: '4', username: 'dave', email: 'dave@example.com', passwordHash: hashSync('password'), bio: 'Full-stack dev | Node.js enthusiast 🟢', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dave', followersCount: 430, followingCount: 95, createdAt: '2023-04-05T10:00:00Z' },
  { id: '5', username: 'eva', email: 'eva@example.com', passwordHash: hashSync('password'), bio: 'AI/ML researcher 🤖 | PhD student', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eva', followersCount: 2100, followingCount: 400, createdAt: '2023-05-01T10:00:00Z' },
];

const _posts = [
  { id: 'p1', userId: '1', content: 'Just shipped a new feature using GraphQL subscriptions! Real-time data is absolutely game-changing 🚀 #GraphQL #WebDev #RealTime', likesCount: 42, commentsCount: 8, retweetsCount: 12, createdAt: '2024-01-10T09:00:00Z' },
  { id: 'p2', userId: '2', content: 'Design tip: Always start with the user journey, not the UI. Understanding what users need BEFORE designing saves hours of rework. What\'s your design process? 🎨', likesCount: 89, commentsCount: 15, retweetsCount: 31, createdAt: '2024-01-10T08:30:00Z' },
  { id: 'p3', userId: '3', content: 'Hot take: TypeScript is not optional for large codebases anymore. It\'s a requirement. Fight me. 💬 #TypeScript #Programming', likesCount: 156, commentsCount: 42, retweetsCount: 67, createdAt: '2024-01-10T08:00:00Z' },
  { id: 'p4', userId: '5', content: 'New paper alert! We achieved 94.2% accuracy on our benchmark using a novel attention mechanism. Preprint dropping next week 🤖 #MachineLearning #AI #Research', likesCount: 234, commentsCount: 28, retweetsCount: 89, createdAt: '2024-01-10T07:45:00Z' },
  { id: 'p5', userId: '4', content: 'Node.js 22 is here and the improvements to the test runner are incredible. No more Jest for simple projects? Possibly... #NodeJS #JavaScript', likesCount: 67, commentsCount: 19, retweetsCount: 23, createdAt: '2024-01-10T07:00:00Z' },
  { id: 'p6', userId: '1', content: 'Reminder: Code reviews are about the code, not the person. Be kind, be constructive, and lift each other up. 🤝 #DeveloperCulture #CodeReview', likesCount: 201, commentsCount: 14, retweetsCount: 78, createdAt: '2024-01-09T18:00:00Z' },
  { id: 'p7', userId: '2', content: 'Working on a new design system from scratch. Atomic design principles are really paying off — components are so reusable! ✨ #DesignSystem #UI', likesCount: 73, commentsCount: 9, retweetsCount: 18, createdAt: '2024-01-09T16:30:00Z' },
  { id: 'p8', userId: '3', content: 'Just did my 1000th code review. Things I\'ve learned: 1) Always explain WHY 2) Suggest, don\'t demand 3) Praise good work 4) Take breaks', likesCount: 312, commentsCount: 56, retweetsCount: 124, createdAt: '2024-01-09T14:00:00Z' },
  { id: 'p9', userId: '5', content: 'If you\'re not using virtual environments in Python, please start today. Your future self will thank you. 🐍 #Python #DevTips', likesCount: 88, commentsCount: 11, retweetsCount: 34, createdAt: '2024-01-09T12:00:00Z' },
  { id: 'p10', userId: '4', content: 'Built a small CLI tool this weekend to automate my git workflow. Open sourcing it next week. Who wants early access? ⚡ #OpenSource #CLI', likesCount: 45, commentsCount: 22, retweetsCount: 8, createdAt: '2024-01-09T10:00:00Z' },
];

const _comments = [
  { id: 'c1', postId: 'p1', userId: '2', content: 'Subscriptions are awesome! We used them for our live dashboard too.', createdAt: '2024-01-10T09:15:00Z' },
  { id: 'c2', postId: 'p1', userId: '3', content: 'Have you tried combining with Redis pub/sub? Scales much better for production.', createdAt: '2024-01-10T09:30:00Z' },
  { id: 'c3', postId: 'p3', userId: '1', content: '100% agree. Migrated our codebase to TS last year and caught so many bugs at compile time.', createdAt: '2024-01-10T08:15:00Z' },
  { id: 'c4', postId: 'p3', userId: '4', content: 'The learning curve is worth it for sure. Takes a sprint or two but then productivity skyrockets.', createdAt: '2024-01-10T08:20:00Z' },
  { id: 'c5', postId: 'p4', userId: '1', content: 'Can\'t wait to read the paper! What dataset did you use for benchmarking?', createdAt: '2024-01-10T07:50:00Z' },
  { id: 'c6', postId: 'p8', userId: '2', content: 'This is gold. Saving this for our team onboarding docs!', createdAt: '2024-01-09T14:10:00Z' },
];

const _follows = new Set(['1:3', '1:5', '2:1', '2:3', '3:5', '4:1', '4:3', '5:1']);
const _likes = new Set(['1:p2', '1:p3', '2:p1', '2:p4', '3:p1', '3:p5', '4:p3', '5:p2']);
const _retweets = new Set(['1:p4', '2:p3', '3:p2', '5:p1']);

const _notifications = [
  { id: 'n1', type: 'LIKE', toUserId: '1', fromUserId: '3', postId: 'p1', read: false, createdAt: '2024-01-10T09:05:00Z' },
  { id: 'n2', type: 'FOLLOW', toUserId: '1', fromUserId: '2', postId: null, read: false, createdAt: '2024-01-10T08:00:00Z' },
  { id: 'n3', type: 'COMMENT', toUserId: '1', fromUserId: '5', postId: 'p1', read: true, createdAt: '2024-01-09T22:00:00Z' },
];

function toUser(u) {
  return { ...u };
}

function toPost(p) {
  const author = _users.find((u) => u.id === p.userId);
  return { ...p, author: toUser(author) };
}

function toComment(c) {
  const author = _users.find((u) => u.id === c.userId);
  return { ...c, author: toUser(author) };
}

function toNotification(n) {
  const from = _users.find((u) => u.id === n.fromUserId);
  const post = n.postId ? _posts.find((p) => p.id === n.postId) : null;
  return {
    ...n,
    id: n.id,
    from: from ? toUser(from) : null,
    post: post ? toPost(post) : null,
    message: buildNotificationMessage(n, from),
  };
}

function buildNotificationMessage(n, from) {
  const name = from ? from.username : 'Someone';
  if (n.type === 'LIKE') return `${name} liked your post`;
  if (n.type === 'RETWEET') return `${name} retweeted your post`;
  if (n.type === 'COMMENT') return `${name} commented on your post`;
  if (n.type === 'FOLLOW') return `${name} started following you`;
  return 'New notification';
}

// Exported mock DB interface
export const mockDB = {
  getUserById: (id) => {
    const u = _users.find((u) => u.id === String(id));
    return u ? toUser(u) : null;
  },
  getUserByEmail: (email) => {
    const u = _users.find((u) => u.email === email);
    return u ? toUser(u) : null;
  },
  getUserByUsername: (username) => {
    const u = _users.find((u) => u.username === username);
    return u ? toUser(u) : null;
  },
  searchUsers: (query) => {
    const q = query.toLowerCase();
    return _users
      .filter((u) => u.username.toLowerCase().includes(q) || (u.bio && u.bio.toLowerCase().includes(q)))
      .map(toUser);
  },
  getSuggestedUsers: (userId) => {
    return _users
      .filter((u) => u.id !== String(userId) && !_follows.has(`${userId}:${u.id}`))
      .slice(0, 5)
      .map(toUser);
  },
  createUser: ({ username, email, passwordHash, bio }) => {
    const user = {
      id: uuidv4(),
      username,
      email,
      passwordHash,
      bio: bio || '',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      followersCount: 0,
      followingCount: 0,
      createdAt: now(),
    };
    _users.push(user);
    return toUser(user);
  },
  followUser: (followerId, followingId) => {
    const key = `${followerId}:${followingId}`;
    if (!_follows.has(key)) {
      _follows.add(key);
      const follower = _users.find((u) => u.id === String(followerId));
      const following = _users.find((u) => u.id === String(followingId));
      if (follower) follower.followingCount++;
      if (following) following.followersCount++;
    }
    return toUser(_users.find((u) => u.id === String(followingId)));
  },
  unfollowUser: (followerId, followingId) => {
    const key = `${followerId}:${followingId}`;
    if (_follows.has(key)) {
      _follows.delete(key);
      const follower = _users.find((u) => u.id === String(followerId));
      const following = _users.find((u) => u.id === String(followingId));
      if (follower) follower.followingCount = Math.max(0, follower.followingCount - 1);
      if (following) following.followersCount = Math.max(0, following.followersCount - 1);
    }
    return toUser(_users.find((u) => u.id === String(followingId)));
  },
  isFollowing: (followerId, followingId) => _follows.has(`${followerId}:${followingId}`),

  getPostById: (id) => {
    const p = _posts.find((p) => p.id === String(id));
    return p ? toPost(p) : null;
  },
  getPostsByUser: (userId) => {
    return _posts.filter((p) => p.userId === String(userId)).map(toPost).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  createPost: ({ userId, content }) => {
    const post = {
      id: uuidv4(),
      userId: String(userId),
      content,
      likesCount: 0,
      commentsCount: 0,
      retweetsCount: 0,
      createdAt: now(),
    };
    _posts.unshift(post);
    return toPost(post);
  },
  deletePost: (id) => {
    const idx = _posts.findIndex((p) => p.id === String(id));
    if (idx !== -1) {
      _posts.splice(idx, 1);
      return true;
    }
    return false;
  },
  likePost: (userId, postId) => {
    const key = `${userId}:${postId}`;
    if (!_likes.has(key)) {
      _likes.add(key);
      const post = _posts.find((p) => p.id === String(postId));
      if (post) post.likesCount++;
    }
    return toPost(_posts.find((p) => p.id === String(postId)));
  },
  unlikePost: (userId, postId) => {
    const key = `${userId}:${postId}`;
    if (_likes.has(key)) {
      _likes.delete(key);
      const post = _posts.find((p) => p.id === String(postId));
      if (post) post.likesCount = Math.max(0, post.likesCount - 1);
    }
    return toPost(_posts.find((p) => p.id === String(postId)));
  },
  isLiked: (userId, postId) => _likes.has(`${userId}:${postId}`),
  retweetPost: (userId, postId) => {
    const key = `${userId}:${postId}`;
    if (!_retweets.has(key)) {
      _retweets.add(key);
      const post = _posts.find((p) => p.id === String(postId));
      if (post) post.retweetsCount++;
    }
    return toPost(_posts.find((p) => p.id === String(postId)));
  },
  isRetweeted: (userId, postId) => _retweets.has(`${userId}:${postId}`),

  getCommentsByPost: (postId) => {
    return _comments.filter((c) => c.postId === String(postId)).map(toComment).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  addComment: ({ postId, userId, content }) => {
    const comment = {
      id: uuidv4(),
      postId: String(postId),
      userId: String(userId),
      content,
      createdAt: now(),
    };
    _comments.push(comment);
    const post = _posts.find((p) => p.id === String(postId));
    if (post) post.commentsCount++;
    return toComment(comment);
  },

  getFeed: ({ userId, cursor, limit = 10 }) => {
    let posts = [..._posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (cursor) {
      const idx = posts.findIndex((p) => p.id === cursor);
      if (idx !== -1) posts = posts.slice(idx + 1);
    }
    const page = posts.slice(0, limit);
    const hasMore = posts.length > limit;
    const nextCursor = hasMore ? page[page.length - 1].id : null;
    return { posts: page.map(toPost), hasMore, nextCursor };
  },

  getNotifications: (userId) => {
    return _notifications.filter((n) => n.toUserId === String(userId)).map(toNotification).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  createNotification: ({ type, toUserId, fromUserId, postId }) => {
    const n = {
      id: uuidv4(),
      type,
      toUserId: String(toUserId),
      fromUserId: String(fromUserId),
      postId: postId ? String(postId) : null,
      read: false,
      createdAt: now(),
    };
    _notifications.unshift(n);
    return toNotification(n);
  },
  markNotificationsRead: (userId) => {
    _notifications
      .filter((n) => n.toUserId === String(userId))
      .forEach((n) => {
        n.read = true;
      });
  },

  getTrendingHashtags: () => {
    const allContent = _posts.map((p) => p.content).join(' ');
    const matches = allContent.match(/#\w+/g) || [];
    const counts = {};
    matches.forEach((tag) => { counts[tag] = (counts[tag] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag);
  },
};

// ─── Merge resolvers ──────────────────────────────────────────────────────────
const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...feedResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...feedResolvers.Mutation,
  },
  User: userResolvers.User,
  Post: postResolvers.Post,
};

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room`);
  });
  socket.on('disconnect', () => console.log(`❌ Client disconnected: ${socket.id}`));
});

const apollo = new ApolloServer({ typeDefs, resolvers });

async function start() {
  await initDB();
  await apollo.start();

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  app.use(
    '/graphql',
    expressMiddleware(apollo, {
      context: async ({ req }) => {
        const userId = getAuthUser(req);
        return { userId, io };
      },
    })
  );

  app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🔗 Health check at http://localhost:${PORT}/health`);
    console.log(`🔌 Socket.IO ready`);
  });
}

start().catch(console.error);
