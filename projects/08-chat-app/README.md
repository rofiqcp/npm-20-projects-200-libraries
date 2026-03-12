# Project 8: Real-Time Chat Application

**Complexity:** ⭐⭐⭐⭐  
**Duration:** 2-3 weeks  
**Database:** PostgreSQL + Redis  
**Level:** Sedang (Intermediate)

## Overview
Build a real-time chat application with PostgreSQL for persistent data and Redis for session management and real-time state. Learn Socket.IO, authentication, and message broadcasting.

## Tech Stack
- **Frontend:** React + Hooks
- **Backend:** Express.js + Socket.IO
- **Database:** PostgreSQL (persistent)
- **Cache/Session:** Redis
- **Authentication:** JWT
- **Real-time:** Socket.IO with rooms
- **Styling:** Tailwind CSS

## Key Features
- ✅ Real-time messaging via Socket.IO
- ✅ Multiple chat rooms
- ✅ User authentication (JWT)
- ✅ Online status tracking
- ✅ Typing indicator
- ✅ Message history
- ✅ User profiles
- ✅ Last read message tracking
- ✅ User mentions (@user)

## Tech Dependencies
```bash
# Backend
npm install express socket.io pg redis jsonwebtoken cors bcrypt

# Frontend
npm install react socket.io-client axios tailwindcss
```

## Database Schema
```javascript
// PostgreSQL - Persistent storage
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  room_name VARCHAR(100) NOT NULL,
  created_by INTEGER REFERENCES users(id),
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE room_members (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_room_messages ON messages(room_id, created_at DESC);
CREATE INDEX idx_user_messages ON messages(user_id, created_at DESC);
```

## Learning Outcomes
- Socket.IO for real-time communication
- Redis for session & cache management
- User authentication flows
- JWT token management
- Password hashing with bcrypt
- Message broadcasting
- Room management
- Online status tracking
- Typing indicators

## Project Structure
```
chat-app/
├── backend/
│   ├── db/
│   │   └── schema.sql
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── rooms.js
│   ├── socket/
│   │   └── handlers.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── RoomList.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── OnlineStatus.jsx
│   │   ├── pages/
│   │   │   ├── Chat.jsx
│   │   │   └── Login.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── package.json
```

## Getting Started
```bash
# Install dependencies
npm install

# Setup PostgreSQL
psql -U postgres -d chat_app -f backend/db/schema.sql

# Setup Redis
redis-server

# Backend
npm run server

# Frontend (new terminal)
npm run client
```

## Socket.IO Events
```javascript
// Client to Server
socket.emit('join_room', {roomId, username});
socket.emit('send_message', {roomId, content});
socket.emit('typing', {roomId});

// Server to Client
socket.on('message', (data) => {...});
socket.on('user_joined', (username) => {...});
socket.on('user_typing', (username) => {...});
socket.on('online_users', (users) => {...});
```

## Features to Add
- Direct messaging (1-to-1 chats)
- Message reactions/emojis
- File sharing
- Message search & filters
- User blocking
- Message encryption
- Voice/video calls
- Message pinning

## Resources
- See `docs/200_POPULAR_LIBRARIES.md` for alternatives
- Socket.IO documentation
- Redis documentation
- JWT authentication guide
- PostgreSQL guide
