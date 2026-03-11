import React from 'react';

const CATEGORY_COLORS = {
  Food: 'bg-green-100 text-green-700',
  Transport: 'bg-blue-100 text-blue-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Health: 'bg-red-100 text-red-700',
  Other: 'bg-gray-100 text-gray-700',
};

export default function ExpenseList({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
        <p className="text-lg">No expenses found.</p>
        <p className="text-sm mt-1">Add your first expense above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Expenses ({expenses.length})</h2>
      </div>
      <ul className="divide-y divide-gray-100">
        {expenses.map(expense => (
          <li key={expense.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other}`}>
                  {expense.category}
                </span>
                <p className="font-medium text-gray-900 truncate">{expense.title}</p>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-500">{expense.date}</p>
                {expense.notes && (
                  <p className="text-sm text-gray-400 truncate max-w-xs">{expense.notes}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <span className="text-lg font-bold text-gray-900">
                ${Number(expense.amount).toFixed(2)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(expense)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="text-sm text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
