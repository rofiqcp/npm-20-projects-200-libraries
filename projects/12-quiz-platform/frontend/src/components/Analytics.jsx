import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { API } from '../context/AuthContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/attempts/analytics')
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card animate-pulse h-48"></div>
      ))}
    </div>
  );

  if (!data || data.total_attempts === 0) return (
    <div className="card text-center py-12 text-gray-500">
      <div className="text-4xl mb-2">📊</div>
      <p className="font-medium">No attempts yet</p>
      <p className="text-sm">Take some quizzes to see your analytics!</p>
    </div>
  );

  const recentData = [...(data.recent || [])].reverse().map((r, i) => ({
    name: `#${i + 1}`,
    score: r.percentage,
    quiz: r.quiz_title,
  }));

  const categoryData = (data.categories || []).map((c) => ({
    category: c.category,
    score: c.avg_pct,
    attempts: c.attempts,
  }));

  const quizData = (data.quiz_stats || []).map((q) => ({
    name: q.title.length > 18 ? q.title.slice(0, 18) + '…' : q.title,
    score: q.avg_pct,
    attempts: q.attempts,
  }));

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{data.total_attempts}</p>
          <p className="text-sm text-gray-500 mt-1">Total Attempts</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{data.average_score}%</p>
          <p className="text-sm text-gray-500 mt-1">Average Score</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-purple-600">{data.best_score}%</p>
          <p className="text-sm text-gray-500 mt-1">Best Score</p>
        </div>
      </div>

      {/* Recent performance line chart */}
      {recentData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">📈 Recent Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={recentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v, n, p) => [`${v}%`, p.payload.quiz]}
                contentStyle={{ fontSize: 12 }}
              />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category breakdown bar chart */}
      {categoryData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">🗂 Score by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Avg Score']} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-quiz radar */}
      {quizData.length >= 3 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">🎯 Performance by Quiz</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={quizData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-quiz table */}
      {quizData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Quiz Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Quiz</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Attempts</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Avg Score</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {data.quiz_stats.map((q) => (
                  <tr key={q.quiz_id} className="border-b border-gray-50">
                    <td className="py-2 font-medium text-gray-900">{q.title}</td>
                    <td className="py-2 text-right text-gray-600">{q.attempts}</td>
                    <td className="py-2 text-right font-semibold">{q.avg_pct}%</td>
                    <td className="py-2 text-right w-24">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${q.avg_pct}%` }}
                          ></div>
                        </div>
                      </div>
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
