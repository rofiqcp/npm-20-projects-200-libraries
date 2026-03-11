import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

export default function CategoryChart({ byCategory }) {
  if (!byCategory || byCategory.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Spending by Category</h2>
        <p className="text-gray-400 text-center py-8">No data to display</p>
      </div>
    );
  }

  const data = {
    labels: byCategory.map(c => c.category),
    datasets: [
      {
        data: byCategory.map(c => Number(c.total).toFixed(2)),
        backgroundColor: COLORS.slice(0, byCategory.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: $${Number(value).toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Spending by Category</h2>
      <div className="max-w-xs mx-auto">
        <Pie data={data} options={options} />
      </div>
      <div className="mt-4 space-y-1">
        {byCategory.map((c, i) => (
          <div key={c.category} className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {c.category}
            </span>
            <span className="font-medium">${Number(c.total).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
