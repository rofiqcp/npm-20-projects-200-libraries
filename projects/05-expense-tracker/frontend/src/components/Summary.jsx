import React from 'react';

export default function Summary({ overall, monthly }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-600 text-white rounded-xl shadow p-4">
          <p className="text-sm text-blue-200">Total Spent</p>
          <p className="text-2xl font-bold mt-1">
            ${Number(overall?.total || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-green-600 text-white rounded-xl shadow p-4">
          <p className="text-sm text-green-200">Transactions</p>
          <p className="text-2xl font-bold mt-1">{overall?.count || 0}</p>
        </div>
        <div className="bg-purple-600 text-white rounded-xl shadow p-4">
          <p className="text-sm text-purple-200">Average</p>
          <p className="text-2xl font-bold mt-1">
            ${Number(overall?.average || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {monthly && monthly.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Monthly Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Month</th>
                  <th className="pb-2 text-right">Transactions</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthly.map(m => (
                  <tr key={m.month} className="py-2">
                    <td className="py-2 text-gray-700">{m.month}</td>
                    <td className="py-2 text-right text-gray-500">{m.count}</td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      ${Number(m.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
