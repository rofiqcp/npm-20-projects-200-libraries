import TodoItem from './TodoItem'

export default function TodoList({ todos, onToggle, onDelete, onEdit }) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 dark:text-slate-500">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-lg font-medium">No tasks here!</p>
        <p className="text-sm mt-1">Add a new task above to get started.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}
