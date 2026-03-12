# Project 10: Kanban Board (Drag-Drop)

**Complexity:** ⭐⭐⭐⭐  
**Duration:** 2-3 weeks  
**Database:** MongoDB  
**Level:** Sedang (Intermediate)

## Overview
Build a Kanban board application with drag-and-drop functionality. Learn real-time updates, nested data structures, and complex UI interactions.

## Tech Stack
- **Frontend:** React + react-beautiful-dnd
- **Backend:** Express.js + Socket.IO
- **Database:** MongoDB
- **Real-time:** Socket.IO
- **Authentication:** JWT
- **Styling:** Tailwind CSS

## Key Features
- ✅ Drag-drop tasks between columns
- ✅ Create/Edit/Delete tasks
- ✅ Real-time sync (multiple users)
- ✅ User assignments
- ✅ Due dates & priority
- ✅ Comments on tasks
- ✅ Labels/tags
- ✅ Progress tracking

## Tech Dependencies
```bash
# Backend
npm install express mongoose socket.io jsonwebtoken cors

# Frontend
npm install react react-beautiful-dnd socket.io-client tailwindcss
```

## Database Schema
```javascript
// MongoDB - Perfect for nested task structure
const boardSchema = new mongoose.Schema({
  title: String,
  owner: mongoose.Schema.Types.ObjectId,
  created_at: { type: Date, default: Date.now }
});

const columnSchema = new mongoose.Schema({
  boardId: mongoose.Schema.Types.ObjectId,
  title: String,
  order: Number,
  created_at: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  boardId: mongoose.Schema.Types.ObjectId,
  columnId: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  order: Number,
  assignees: [mongoose.Schema.Types.ObjectId],
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  labels: [String],
  comments: [{
    author: mongoose.Schema.Types.ObjectId,
    content: String,
    createdAt: Date
  }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
```

## Learning Outcomes
- Drag-and-drop implementation
- Socket.IO for real-time task updates
- Nested MongoDB structures
- Order management (task sequencing)
- Multi-user collaboration
- Complex UI state management
- Comment systems

## Project Structure
```
kanban-board/
├── backend/
│   ├── models/
│   │   ├── Board.js
│   │   ├── Column.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── boards.js
│   │   └── tasks.js
│   ├── socket/
│   │   └── handlers.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.jsx
│   │   │   ├── Column.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   └── AddTask.jsx
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

## Live Updates with Socket.IO
```javascript
socket.on('task_moved', (data) => {
  updateTaskPosition(data);
});

socket.emit('update_task', {
  taskId, columnId, order
});
```

## Features to Add
- Board templates
- Archived tasks
- Attachment support
- Activity log
- Multiple boards
- Team collaboration
- Notifications
- Mobile app

## Resources
- See `docs/200_POPULAR_LIBRARIES.md`
- react-beautiful-dnd documentation
- MongoDB documentation
- Socket.IO guide
