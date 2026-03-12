import { useState, useEffect } from 'react'
import { useTodos } from './hooks/useTodos'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'

export default function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('todo-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [editingTodo, setEditingTodo] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('todo-theme', dark ? 'dark' : 'light')
  }, [dark])

  const {
    filteredTodos,
    filter,
    setFilter,
    addTodo,
    editTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    exportTodos,
    activeCount,
    completedCount,
  } = useTodos()

  function handleAdd(text, priority) {
    addTodo(text, priority)
  }

  function handleEdit(text, priority) {
    if (editingTodo) {
      editTodo(editingTodo.id, text, priority)
      setEditingTodo(null)
    }
  }

  function handleCancelEdit() {
    setEditingTodo(null)
  }

  const filters = ['all', 'active', 'completed']

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
              ✅ Todo List
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {activeCount} task{activeCount !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportTodos}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-400 transition-colors text-sm font-medium flex items-center gap-1"
              title="Export todos as JSON"
            >
              <span>📥</span>
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-400 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-6">
          <TodoForm
            onAdd={handleAdd}
            onEdit={handleEdit}
            editingTodo={editingTodo}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={setEditingTodo}
        />

        {/* Footer actions */}
        {completedCount > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={clearCompleted}
              className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 hover:underline transition-colors"
            >
              🗑 Clear {completedCount} completed task{completedCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
