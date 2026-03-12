# Project 12: Online Quiz Platform (MySQL)

**Complexity:** ⭐⭐⭐⭐  
**Duration:** 2-3 weeks  
**Database:** MySQL + Redis  
**Level:** Sedang (Intermediate)

## Overview
Build a comprehensive online quiz platform with MySQL for structured data and Redis for real-time leaderboards.

## Tech Stack
- **Frontend:** React
- **Backend:** Express.js
- **Database:** MySQL
- **Real-time Cache:** Redis
- **Authentication:** JWT
- **Charts:** Recharts
- **Styling:** Tailwind CSS

## Key Features
- ✅ Create quizzes with multiple question types
- ✅ Timer-based questions
- ✅ Auto-scoring
- ✅ Real-time leaderboard
- ✅ Performance analytics
- ✅ Attempt history
- ✅ Certificate generation
- ✅ Multiple difficulty levels

## Tech Dependencies
```bash
# Backend
npm install express mysql2 redis jsonwebtoken cors

# Frontend
npm install react axios recharts react-router-dom tailwindcss
```

## Database Schema
```javascript
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  created_by INT REFERENCES users(id),
  category VARCHAR(100),
  difficulty VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT REFERENCES quizzes(id),
  question_text TEXT,
  question_type VARCHAR(50), -- multiple_choice, true_false, short_answer
  options JSON,
  correct_answer VARCHAR(255),
  points INT DEFAULT 1,
  order_num INT
);

CREATE TABLE attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  quiz_id INT REFERENCES quizzes(id),
  score INT,
  total_points INT,
  time_spent INT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT REFERENCES attempts(id),
  question_id INT REFERENCES questions(id),
  user_answer VARCHAR(255),
  is_correct BOOLEAN
);

CREATE INDEX idx_quiz_category ON quizzes(category);
CREATE INDEX idx_attempts_user ON attempts(user_id, completed_at);
```

## Learning Outcomes
- MySQL complex queries
- Redis leaderboard caching
- Quiz engine logic
- Scoring algorithms
- Performance tracking
- Real-time updates
- Certificate generation

## Project Structure
```
quiz-platform/
├── backend/
│   ├── db/
│   │   └── schema.sql
│   ├── routes/
│   │   ├── quizzes.js
│   │   ├── attempts.js
│   │   └── leaderboard.js
│   ├── services/
│   │   └── scoringService.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuizList.jsx
│   │   │   ├── QuizTaker.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Results.jsx
│   │   │   └── Analytics.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── package.json
```

## Getting Started
```bash
npm install
npm run server
npm run client
```

## API Endpoints
```javascript
GET    /api/quizzes
POST   /api/quizzes
GET    /api/quizzes/:id
POST   /api/attempts
POST   /api/attempts/:id/submit
GET    /api/leaderboard/:quizId
GET    /api/analytics/:userId
```

## Features to Add
- Question bank reuse
- Quiz scheduling
- Group quizzes
- Custom time limits
- Proctoring features
- Branching logic
- Question shuffling
- Export results

## Resources
- MySQL documentation
- Redis documentation
- Quiz best practices
