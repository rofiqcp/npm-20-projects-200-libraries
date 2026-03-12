# Project 5: Expense Tracker (With SQLite Database)

**Complexity:** ⭐⭐⭐  
**Duration:** 1-2 weeks  
**Database:** SQLite  
**Level:** Sedang (Intermediate) - **First Database Project!**

## Overview
Build your first full-stack project with a Node.js backend and SQLite database. Learn CRUD operations, basic backend concepts, and data visualization.

## Tech Stack
- **Frontend:** React + Hooks
- **Backend:** Express.js
- **Database:** SQLite (file-based)
- **HTTP Client:** Axios
- **Charts:** Chart.js + react-chartjs-2
- **Styling:** Tailwind CSS
- **Validation:** Simple form validation
- **CORS:** For frontend-backend communication

## Key Features
- ✅ Add/Edit/Delete expenses
- ✅ Categorize expenses (Food, Transport, Entertainment, Health, Other)
- ✅ Monthly summary & totals
- ✅ Pie chart by category
- ✅ Date filtering
- ✅ Export data as CSV
- ✅ Category statistics
- ✅ Responsive design

## Tech Dependencies
```bash
# Backend
npm install express cors better-sqlite3 dotenv

# Frontend
npm install react axios chart.js react-chartjs-2
npm install -D tailwindcss
```

## Database Schema
```javascript
// SQLite - Simple, file-based database
const Database = require('better-sqlite3');
const db = new Database('expenses.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_date ON expenses(date);
  CREATE INDEX IF NOT EXISTS idx_category ON expenses(category);
`);
```

## Learning Outcomes
- Express.js backend basics
- SQLite database operations
- CRUD operations (Create, Read, Update, Delete)
- RESTful API design
- Frontend-backend integration
- Data validation
- Error handling
- Chart.js data visualization
- CSV export functionality

## Project Structure
```
expense-tracker/
├── backend/
│   ├── db.js
│   ├── routes/
│   │   └── expenses.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── ExpenseList.jsx
│   │   │   ├── CategoryChart.jsx
│   │   │   └── Summary.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── package.json
```

## Getting Started
```bash
# Install dependencies
npm install

# Backend setup
npm run server

# Frontend (new terminal)
npm run client

# Access at http://localhost:3000
```

## API Endpoints
```javascript
GET    /api/expenses              // Get all expenses
POST   /api/expenses              // Create expense
PUT    /api/expenses/:id          // Update expense
DELETE /api/expenses/:id          // Delete expense
GET    /api/expenses/summary      // Get monthly summary
POST   /api/expenses/export       // Export as CSV
```

## Features to Add
- User authentication (multiple users)
- Budget goals & alerts
- Recurring expenses
- Receipt photo uploads
- Upload to cloud storage
- Mobile app version
- Multi-currency support
- Advanced filtering

## Resources
- See `docs/20_PROJECTS_RECOMMENDED_STACK.md` for full details
- SQLite documentation
- Express.js guide
- Better-sqlite3 documentation
