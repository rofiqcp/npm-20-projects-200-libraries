# Project 9: Blog Platform CMS (MongoDB)

**Complexity:** ⭐⭐⭐⭐  
**Duration:** 2-3 weeks  
**Database:** MongoDB  
**Level:** Sedang (Intermediate)

## Overview
Build a full Content Management System with MongoDB for flexible schema design. Learn NoSQL database design, rich text editing, and file uploads.

## Tech Stack
- **Frontend:** React
- **Backend:** Express.js
- **Database:** MongoDB (NoSQL)
- **Rich Editor:** TipTap or Draft.js
- **File Upload:** Multer
- **Authentication:** JWT
- **Styling:** Tailwind CSS
- **Rate Limiting:** express-rate-limit

## Key Features
- ✅ Create/Edit/Delete blog posts
- ✅ Rich text editor with formatting
- ✅ Categories & tags
- ✅ Comments system
- ✅ Like/Rating posts
- ✅ Full-text search
- ✅ Featured posts
- ✅ Author profiles
- ✅ Auto-save drafts

## Tech Dependencies
```bash
# Backend
npm install express mongoose multer jsonwebtoken cors dotenv express-rate-limit

# Frontend
npm install react axios tiptap react-router-dom tailwindcss
```

## Database Schema
```javascript
// MongoDB - Flexible schema for content
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: 'text'
  },
  slug: {
    type: String,
    unique: true
  },
  content: String,
  excerpt: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  categories: [String],
  tags: [String],
  featuredImage: String,
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    author: mongoose.Schema.Types.ObjectId,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

postSchema.index({title: 'text', content: 'text'});
```

## Learning Outcomes
- MongoDB document model
- Mongoose schema design
- Nested documents & arrays
- Full-text search
- File upload handling
- Rich text editor integration
- Author-post relationships
- Comment systems

## Project Structure
```
blog-cms/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── posts.js
│   │   ├── comments.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── CommentSection.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── pages/
│   │   │   ├── Blog.jsx
│   │   │   ├── Post.jsx
│   │   │   ├── Editor.jsx
│   │   │   └── Admin.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── package.json
```

## Getting Started
```bash
# Install dependencies
npm install

# Setup MongoDB
# Connection string in .env: MONGODB_URI=mongodb://localhost/blog_cms

# Backend
npm run server

# Frontend (new terminal)
npm run client
```

## API Endpoints
```javascript
GET    /api/posts                 // All published posts
POST   /api/posts                 // Create post (admin)
GET    /api/posts/:id             // Get single post
PUT    /api/posts/:id             // Update post (admin)
DELETE /api/posts/:id             // Delete post (admin)
POST   /api/posts/:id/comments    // Add comment
GET    /api/posts/search?q=...    // Search posts
POST   /api/posts/:id/like        // Like post
```

## Features to Add
- Multi-author support
- Scheduled publishing
- Post versioning/history
- Social sharing
- Email subscriptions
- Markdown vs rich text toggle
- SEO optimization
- Sitemap & RSS feed
- Analytics dashboard

## Resources
- See `docs/200_POPULAR_LIBRARIES.md` for alternatives
- MongoDB documentation
- Mongoose guide
- TipTap editor documentation
- Multer file upload guide
