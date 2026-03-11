import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../context/AuthContext';

export default function Leaderboard({ quizId: propQuizId }) {
  const { quizId: paramId } = useParams();
  const quizId = propQuizId || paramId;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = quizId ? `/leaderboard/${quizId}` : '/leaderboard';
    API.get(url)
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [quizId]);

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRowBg = (rank) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-gray-100';
  };

  if (loading) return (
    <div className="card animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  const board = data?.leaderboard || [];

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🏆</span>
        <h3 className="text-lg font-semibold">
          {quizId ? `Leaderboard: ${data?.quiz_title || ''}` : 'Global Leaderboard'}
        </h3>
      </div>

      {board.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No scores yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {board.map((entry) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${getRowBg(entry.rank)}`}
            >
              <div className="w-8 text-center font-bold text-lg">{getMedal(entry.rank)}</div>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {entry.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{entry.username}</p>
                {!quizId && entry.total_attempts && (
                  <p className="text-xs text-gray-500">{entry.total_attempts} attempts</p>
                )}
              </div>
              <div className="text-right">
                {quizId ? (
                  <>
                    <p className="font-bold text-gray-900">{entry.score}/{entry.total_points}</p>
                    <p className="text-xs text-gray-500">{entry.percentage}%</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-gray-900">{entry.avg_percentage}%</p>
                    <p className="text-xs text-gray-500">avg score</p>
                  </>
                )}
              </div>
              {quizId && entry.time_spent && (
                <div className="text-right text-xs text-gray-500 w-14">
                  ⏱ {Math.floor(entry.time_spent / 60)}:{String(entry.time_spent % 60).padStart(2, '0')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
