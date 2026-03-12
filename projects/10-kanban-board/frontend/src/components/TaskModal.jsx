import React, { useState } from 'react';

const PRIORITIES = ['low', 'medium', 'high'];

export default function TaskModal({ task, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'medium',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
    labels: task.labels?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(task._id, {
        ...form,
        labels: form.labels.split(',').map((s) => s.trim()).filter(Boolean),
        dueDate: form.dueDate || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">Task Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={save} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handle}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handle}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handle}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labels (comma-separated)</label>
            <input
              name="labels"
              value={form.labels}
              onChange={handle}
              placeholder="bug, feature, urgent"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { if (confirm('Delete this task?')) onDelete(task._id); }}
              className="px-4 py-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 text-sm"
            >
              Delete
            </button>
            <div className="flex-1" />
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50 text-sm">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
