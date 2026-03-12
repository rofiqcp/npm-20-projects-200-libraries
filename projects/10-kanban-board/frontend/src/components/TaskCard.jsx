import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export default function TaskCard({ task, index, onClick }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-white rounded-lg p-3 mb-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-transparent ${snapshot.isDragging ? 'shadow-lg border-violet-300 rotate-1' : ''}`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400">
            {task.labels?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {task.labels.slice(0, 2).map((lbl) => (
                  <span key={lbl} className="bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">{lbl}</span>
                ))}
              </div>
            )}
            {task.dueDate && (
              <span className={`ml-auto ${isOverdue ? 'text-red-500' : ''}`}>
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {task.comments?.length > 0 && (
            <div className="mt-1 text-xs text-gray-400">💬 {task.comments.length}</div>
          )}
        </div>
      )}
    </Draggable>
  );
}
