import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard.jsx';
import AddTask from './AddTask.jsx';

export default function Column({ column, tasks, onAddTask, onSelectTask }) {
  return (
    <div className="w-72 flex-shrink-0 bg-gray-100 rounded-xl flex flex-col max-h-screen">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">{column.title}</h3>
        <span className="bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>

      <Droppable droppableId={column._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-3 py-1 min-h-[60px] transition-colors ${snapshot.isDraggingOver ? 'bg-violet-50' : ''}`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task._id} task={task} index={index} onClick={onSelectTask} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="p-3 border-t border-gray-200">
        <AddTask columnId={column._id} onAdd={onAddTask} />
      </div>
    </div>
  );
}
