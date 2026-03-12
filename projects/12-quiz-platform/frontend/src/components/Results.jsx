import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const GRADE_COLORS = {
  A: 'text-green-600 bg-green-50',
  B: 'text-blue-600 bg-blue-50',
  C: 'text-yellow-600 bg-yellow-50',
  D: 'text-orange-600 bg-orange-50',
  F: 'text-red-600 bg-red-50',
};

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.result) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No result data found.</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">Go Home</button>
      </div>
    );
  }

  const { result, quiz } = state;
  const { score, total_points, percentage, grade, passed, time_spent, graded_answers, quiz_title } = result;
  const gradeStyle = GRADE_COLORS[grade] || 'text-gray-600 bg-gray-50';

  const formatTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Score header */}
      <div className="card text-center">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold mb-4 ${gradeStyle}`}>
          {grade}
        </div>
        <h2 className="text-2xl font-bold mb-1">{quiz_title}</h2>
        <p className={`text-lg font-semibold mb-4 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {passed ? '🎉 Passed!' : '❌ Not Passed'}
        </p>
        <div className="flex justify-center gap-8 text-sm">
          <div>
            <p className="text-3xl font-bold text-gray-900">{score}/{total_points}</p>
            <p className="text-gray-500">Score</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
            <p className="text-gray-500">Accuracy</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatTime(time_spent)}</p>
            <p className="text-gray-500">Time spent</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${passed ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Answer breakdown */}
      {graded_answers && graded_answers.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Answer Review</h3>
          <div className="space-y-4">
            {graded_answers.map((a, i) => (
              <div
                key={a.question_id}
                className={`p-4 rounded-lg border ${a.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{a.is_correct ? '✅' : '❌'}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">Q{i + 1}. {a.question_text}</p>
                    <p className="text-sm">
                      <span className="text-gray-500">Your answer: </span>
                      <span className={a.is_correct ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                        {a.user_answer || '(no answer)'}
                      </span>
                    </p>
                    {!a.is_correct && (
                      <p className="text-sm mt-1">
                        <span className="text-gray-500">Correct answer: </span>
                        <span className="text-green-700 font-medium">{a.correct_answer}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {a.points_earned}/{a.max_points} points
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => navigate(`/quiz/${quiz?.id || ''}`)} className="btn-secondary flex-1">
          🔄 Try Again
        </button>
        <Link to="/dashboard" className="btn-primary flex-1 text-center">
          📊 View Dashboard
        </Link>
        <Link to="/" className="btn-secondary flex-1 text-center">
          🏠 More Quizzes
        </Link>
      </div>
    </div>
  );
}
