# Project 6: Markdown Note App (MySQL Database)

**Complexity:** ⭐⭐⭐  
**Duration:** 1-2 weeks  
**Database:** MySQL  
**Level:** Sedang (Intermediate)

## Overview
Build a markdown note-taking app with Express.js and MySQL. Learn relational database design, multi-user support basics, and markdown rendering.

## Tech Stack
- **Frontend:** React + Hooks
- **Backend:** Express.js
- **Database:** MySQL (relational)
- **HTTP Client:** Axios
- **Markdown:** react-markdown
- **Code Highlighting:** Prism.js
- **Authentication:** Basic JWT
- **Styling:** Tailwind CSS

## Key Features
- ✅ Create/Edit/Delete notes
- ✅ Live markdown preview
- ✅ Code syntax highlighting (100+ languages)
- ✅ Full-text search notes
- ✅ Export as HTML/PDF
- ✅ Folder/collection organization
- ✅ Basic user authentication
- ✅ Created/updated timestamps
- ✅ Responsive editor

## Tech Dependencies
```bash
# Backend
npm install express mysql2 cors jsonwebtoken dotenv

# Frontend
npm install react axios react-markdown prism.js
npm install -D tailwindcss
```

## Database Schema
```javascript
// MySQL - Relational database with users & notes
const mysql = require('mysql2/promise');

// Users table for authentication
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// Notes table with user relationship
CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  content LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_created (user_id, created_at)
);
```

## Learning Outcomes
- MySQL relational database design
- FOREIGN KEY relationships
- User authentication with JWT
- Password hashing (bcrypt)
- Markdown parsing and rendering
- Syntax highlighting in code blocks
- Search functionality
- Database indexing basics

## Project Structure
```
markdown-notes/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── notes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.jsx
│   │   │   ├── Preview.jsx
│   │   │   ├── NotesList.jsx
│   │   │   └── LoginForm.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
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

# Setup MySQL database
mysql -u root -p < schema.sql

# Backend
npm run server

# Frontend (new terminal)
npm run client
```

## API Endpoints
```javascript
POST   /api/auth/register         // Register new user
POST   /api/auth/login            // Login user
GET    /api/notes                 // Get user's notes
POST   /api/notes                 // Create note
PUT    /api/notes/:id             // Update note
DELETE /api/notes/:id             // Delete note
GET    /api/notes/search?q=...    // Search notes
```

## Features to Add
- Markdown table support
- Syntax highlighting for more languages
- Note sharing/collaboration
- Tags and categorization
- Note versioning/history
- Rich text editor alternative
- Dark mode for editor
- Cloud storage integration

## Resources
- See `docs/20_PROJECTS_RECOMMENDED_STACK.md` for tech stack
- MySQL documentation
- react-markdown guide
- Prism.js documentation
- JWT authentication guide
