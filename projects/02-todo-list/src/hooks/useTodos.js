import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'todos'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useTodos() {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const addTodo = useCallback((text, priority = 'medium') => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos(prev => [
      {
        id: generateId(),
        text: trimmed,
        completed: false,
        createdAt: new Date().toISOString(),
        priority,
      },
      ...prev,
    ])
  }, [])

  const editTodo = useCallback((id, text, priority) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: trimmed, priority } : todo
      )
    )
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.completed))
  }, [])

  const exportTodos = useCallback(() => {
    const data = JSON.stringify(todos, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'todos.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [todos])

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.filter(t => t.completed).length

  return {
    todos,
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
  }
}
