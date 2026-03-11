import React from 'react';
import { Link } from 'react-router-dom';
import QuizList from '../components/QuizList';
import Leaderboard from '../components/Leaderboard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Hero */}
      <div className="text-center py-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white px-6">
        <h1 className="text-4xl font-extrabold mb-3">Challenge Your Mind 🧠</h1>
        <p className="text-blue-100 text-lg mb-6 max-w-xl mx-auto">
          Take timed quizzes, track your progress, and compete on the global leaderboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user ? (
            <>
              <Link to="/create" className="btn bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 py-2.5">
                ✏️ Create a Quiz
              </Link>
              <Link to="/dashboard" className="btn bg-blue-500 text-white border border-blue-400 hover:bg-blue-400 font-semibold px-6 py-2.5">
                📊 My Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 py-2.5">
                Get Started →
              </Link>
              <Link to="/login?tab=register" className="btn bg-blue-500 text-white border border-blue-400 hover:bg-blue-400 font-semibold px-6 py-2.5">
                Sign Up Free
              </Link>
            </>
          )}
        </div>

        <div className="flex justify-center gap-10 mt-8 text-sm text-blue-100">
          <div><span className="text-2xl font-bold text-white">4+</span><br />Quizzes</div>
          <div><span className="text-2xl font-bold text-white">3+</span><br />Categories</div>
          <div><span className="text-2xl font-bold text-white">∞</span><br />Knowledge</div>
        </div>
      </div>

      {/* Quiz list + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Quizzes</h2>
          <QuizList />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🏆 Top Players</h2>
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
