import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { io } from 'socket.io-client';
import api from '../services/api.js';
import Column from '../components/Column.jsx';
import TaskModal from '../components/TaskModal.jsx';

export default function BoardView() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newColTitle, setNewColTitle] = useState('');
  const socketRef = useRef(null);

  const token = localStorage.getItem('kanban_token');

  useEffect(() => {
    api.get(`/boards/${id}`)
      .then(({ data }) => {
        setBoard(data.board);
        setColumns(data.columns);
        setTasks(data.tasks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    const s = io('/', { auth: { token } });
    socketRef.current = s;
    s.emit('join_board', id);

    s.on('task_moved', ({ taskId, columnId, order }) => {
      setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, columnId, order } : t));
    });
    s.on('task_created', (task) => setTasks((prev) => [...prev, task]));
    s.on('task_updated', (task) => setTasks((prev) => prev.map((t) => t._id === task._id ? task : t)));
    s.on('task_deleted', (taskId) => setTasks((prev) => prev.filter((t) => t._id !== taskId)));

    return () => { s.emit('leave_board', id); s.disconnect(); };
  }, [id, token]);

  const onDragEnd = async ({ draggableId, destination, source }) => {
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newColumnId = destination.droppableId;
    const newOrder = destination.index;

    setTasks((prev) => prev.map((t) =>
      t._id === draggableId ? { ...t, columnId: newColumnId, order: newOrder } : t
    ));

    try {
      await api.post(`/tasks/${draggableId}/move`, { columnId: newColumnId, order: newOrder });
      socketRef.current?.emit('task_moved', { taskId: draggableId, columnId: newColumnId, order: newOrder, boardId: id });
    } catch (err) {
      console.error(err);
    }
  };

  const addColumn = async (e) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;
    try {
      const { data } = await api.post(`/boards/${id}/columns`, { title: newColTitle });
      setColumns((prev) => [...prev, data]);
      setNewColTitle('');
    } catch (err) {
      alert('Failed to add column');
    }
  };

  const addTask = async (columnId, title) => {
    try {
      const { data } = await api.post('/tasks', { boardId: id, columnId, title });
      setTasks((prev) => [...prev, data]);
      socketRef.current?.emit('task_created', { task: data, boardId: id });
    } catch (err) {
      alert('Failed to add task');
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, updates);
      setTasks((prev) => prev.map((t) => t._id === taskId ? data : t));
      socketRef.current?.emit('task_updated', { task: data, boardId: id });
      setSelectedTask(data);
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      socketRef.current?.emit('task_deleted', { taskId, boardId: id });
      setSelectedTask(null);
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading board...</div>;

  const getColumnTasks = (colId) =>
    tasks.filter((t) => t.columnId === colId || t.columnId?.toString() === colId?.toString())
      .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-violet-900 flex flex-col">
      <header className="bg-violet-800 text-white px-6 py-3 flex items-center gap-4 shadow">
        <Link to="/" className="text-violet-300 hover:text-white text-sm">← Boards</Link>
        <h1 className="font-bold text-lg">{board?.title}</h1>
      </header>

      <div className="flex-1 p-6 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 items-start min-w-max">
            {columns.map((col) => (
              <Column
                key={col._id}
                column={col}
                tasks={getColumnTasks(col._id)}
                onAddTask={addTask}
                onSelectTask={setSelectedTask}
              />
            ))}

            {/* Add Column */}
            <div className="w-72 flex-shrink-0">
              <form onSubmit={addColumn} className="bg-white bg-opacity-10 rounded-xl p-3">
                <input
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  placeholder="+ Add column..."
                  className="w-full bg-transparent text-white placeholder-violet-300 focus:outline-none text-sm"
                />
              </form>
            </div>
          </div>
        </DragDropContext>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}
