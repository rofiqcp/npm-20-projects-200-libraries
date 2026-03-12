# Project 2: Todo List App (Browser Local Storage)

**Complexity:** ⭐⭐  
**Duration:** 1 week  
**Database:** Browser localStorage (No Backend)  
**Level:** Mudah (Beginner)

## Overview
Build a modern todo list application with React that stores data in browser localStorage. Perfect for learning React hooks and state management without needing a backend.

## Tech Stack
- **Frontend:** React + Hooks
- **State Management:** useState + useEffect
- **Storage:** Browser localStorage (no database needed)
- **Styling:** Tailwind CSS
- **Validation:** Simple form validation

## Key Features
- ✅ Add/Edit/Delete todos
- ✅ Mark todos as completed
- ✅ Filter (All/Active/Completed)
- ✅ Data persists in localStorage
- ✅ Export todos as JSON
- ✅ Empty state handling
- ✅ Responsive design

## Tech Dependencies
```bash
npm install react react-dom
npm install -D tailwindcss postcss autoprefixer
```

## Database Strategy
**NO BACKEND NEEDED** - Everything stored in browser localStorage
```javascript
// Todos are stored in localStorage as JSON
const saveTodos = (todos) => {
  localStorage.setItem('todos', JSON.stringify(todos));
};

const loadTodos = () => {
  const saved = localStorage.getItem('todos');
  return saved ? JSON.parse(saved) : [];
};
```

## Learning Outcomes
- React hooks (useState, useEffect)
- Browser localStorage API
- Form handling in React
- Component state management
- Array operations (filter, map, etc)
- Responsive design with Tailwind

## Project Structure
```
src/
├── components/
│   ├── TodoList.jsx
│   ├── TodoItem.jsx
│   └── TodoForm.jsx
├── hooks/
│   └── useTodos.js
├── App.jsx
└── index.css
```

## Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Next Steps
- Add localStorage sync across multiple tabs
- Implement undo/redo functionality
- Add priority levels or tags
- Create recurring todos

## Resources
- See `docs/20_PROJECTS_RECOMMENDED_STACK.md` for tech stack details
- React Hooks documentation
- localStorage API guide
