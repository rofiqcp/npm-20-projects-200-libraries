# Project 11: Social Media Feed (Twitter-like)

**Complexity:** ⭐⭐⭐⭐  
**Duration:** 3-4 weeks  
**Database:** PostgreSQL + GraphQL  
**Level:** Sedang (Intermediate)

## Overview
Build a Twitter-like social media feed with GraphQL API, complex relational queries, and real-time updates.

## Tech Stack
- **Frontend:** React
- **Backend:** Express.js + Apollo Server
- **API:** GraphQL
- **Database:** PostgreSQL (relational)
- **Real-time:** Socket.IO
- **Authentication:** JWT
- **Styling:** Tailwind CSS

## Key Features
- ✅ Create/Delete posts
- ✅ Like & comment posts
- ✅ Follow/Unfollow users
- ✅ Feed timeline
- ✅ User profiles
- ✅ Search users/hashtags
- ✅ Real-time notifications
- ✅ Retweet functionality
- ✅ User recommendations

## Tech Dependencies
```bash
# Backend
npm install express apollo-server-express graphql pg socket.io jsonwebtoken

# Frontend
npm install react @apollo/client graphql socket.io-client tailwindcss
```

## Database Schema
```javascript
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(255),
  followersCount INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  userId INT REFERENCES users(id),
  content TEXT,
  likesCount INT DEFAULT 0,
  commentsCount INT DEFAULT 0,
  retweetsCount INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE follows (
  follower_id INT REFERENCES users(id),
  following_id INT REFERENCES users(id),
  created_at TIMESTAMP,
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE likes (
  user_id INT REFERENCES users(id),
  post_id INT REFERENCES posts(id),
  created_at TIMESTAMP,
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id),
  user_id INT REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_follows_user ON follows(following_id);
```

## Learning Outcomes
- GraphQL schema design
- Complex relational queries
- Apollo Server integration
- GraphQL mutations
- Real-time subscriptions
- Feed algorithm basics
- User relationships
- Notification systems

## Project Structure
```
social-feed/
├── backend/
│   ├── schema/
│   │   └── schema.graphql
│   ├── resolvers/
│   │   ├── users.js
│   │   ├── posts.js
│   │   └── feed.js
│   ├── models/
│   │   └── User.js, Post.js, etc
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Feed.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   └── Recommendations.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── package.json
```

## GraphQL Queries Example
```graphql
query GetFeed($userId: ID!) {
  feed(userId: $userId) {
    id
    content
    author { username, avatar }
    likes { count }
    comments { content, author { username } }
  }
}

mutation CreatePost($content: String!) {
  createPost(content: $content) {
    id
    content
    createdAt
  }
}
```

## Features to Add
- Trending hashtags
- Direct messaging
- Notifications preferences
- Mute/Block users
- Pinned posts
- Stories feature
- Moments/Collections
- Analytics dashboard

## Resources
- Apollo Server documentation
- GraphQL guide
- PostgreSQL documentation
