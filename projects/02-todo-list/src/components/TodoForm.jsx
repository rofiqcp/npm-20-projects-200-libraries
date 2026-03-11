import { useState, useEffect } from 'react'

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export default function TodoForm({ onAdd, onEdit, editingTodo, onCancelEdit }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingTodo) {
      setText(editingTodo.text)
      setPriority(editingTodo.priority || 'medium')
    } else {
      setText('')
      setPriority('medium')
    }
    setError('')
  }, [editingTodo])

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) {
      setError('Please enter a task.')
      return
    }
    setError('')
    if (editingTodo) {
      onEdit(text, priority)
    } else {
      onAdd(text, priority)
      setText('')
      setPriority('medium')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => { setText(e.target.value); setError('') }}
          placeholder={editingTodo ? 'Update task...' : 'Add a new task...'}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
        />
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        >
          {PRIORITIES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {editingTodo ? '✏️ Update Task' : '➕ Add Task'}
        </button>
        {editingTodo && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
