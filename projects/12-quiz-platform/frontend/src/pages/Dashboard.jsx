import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import Analytics from '../components/Analytics';

const GRADE_COLORS = { A: 'text-green-600', B: 'text-blue-600', C: 'text-yellow-600', D: 'text-orange-600', F: 'text-red-600' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('history'); // 'history' | 'analytics'

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    API.get('/attempts')
      .then(({ data }) => setAttempts(data.attempts))
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👋 Hello, {user?.username}!</h1>
          <p className="text-gray-500 text-sm mt-1">Track your quiz performance and progress</p>
        </div>
        <Link to="/create" className="btn-primary">+ Create Quiz</Link>
      </div>

      {/* Quick stats */}
      {!loading && attempts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Quizzes Taken" value={attempts.length} icon="📝" color="blue" />
          <StatCard
            label="Avg Score"
            value={`${Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)}%`}
            icon="📊"
            color="green"
          />
          <StatCard
            label="Best Score"
            value={`${Math.max(...attempts.map((a) => a.percentage))}%`}
            icon="🏆"
            color="yellow"
          />
          <StatCard
            label="Categories"
            value={new Set(attempts.map((a) => a.quiz_category)).size}
            icon="🗂"
            color="purple"
          />
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {['history', 'analytics'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {t === 'history' ? '📋 History' : '📈 Analytics'}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'analytics' ? (
        <Analytics />
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-16"></div>
          ))}
        </div>
      ) : attempts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-lg font-semibold text-gray-900">No attempts yet</p>
          <p className="text-gray-500 text-sm mb-4">Take your first quiz to see your history here!</p>
          <Link to="/" className="btn-primary">Browse Quizzes</Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Quiz</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Category</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Score</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Grade</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Time</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attempts.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{a.quiz_title}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="badge bg-blue-50 text-blue-700">{a.quiz_category}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div>
                        <p className="font-semibold">{a.score}/{a.total_points}</p>
                        <p className="text-xs text-gray-500">{a.percentage}%</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold text-lg ${GRADE_COLORS[a.grade] || ''}`}>{a.grade}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">{formatTime(a.time_spent)}</td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden lg:table-cell">{formatDate(a.completed_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/quiz/${a.quiz_id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        Retry →
                      </Link>
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

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
