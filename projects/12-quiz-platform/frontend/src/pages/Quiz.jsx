import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';
import QuizTaker from '../components/QuizTaker';
import Leaderboard from '../components/Leaderboard';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('take'); // 'take' | 'leaderboard'

  useEffect(() => {
    API.get(`/quizzes/${id}`)
      .then(({ data }) => setQuiz(data))
      .catch(() => setError('Quiz not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="card animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="card text-center py-12">
        <p className="text-5xl mb-3">😕</p>
        <p className="text-xl font-semibold text-gray-900">{error}</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">Back to Quizzes</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
        <div className="flex-1"></div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('take')}
            className={`btn text-sm py-1.5 px-4 ${view === 'take' ? 'btn-primary' : 'btn-secondary'}`}
          >
            📝 Take Quiz
          </button>
          <button
            onClick={() => setView('leaderboard')}
            className={`btn text-sm py-1.5 px-4 ${view === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`}
          >
            🏆 Leaderboard
          </button>
        </div>
      </div>

      {view === 'take' ? <QuizTaker quiz={quiz} /> : <Leaderboard quizId={quiz.id} />}
    </div>
  );
}
