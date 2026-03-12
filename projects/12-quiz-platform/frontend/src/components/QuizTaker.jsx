import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

export default function QuizTaker({ quiz }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit || 300);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  const submit = useCallback(async (answersToSubmit) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    const timeSpent = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;

    try {
      const { data } = await API.post('/attempts', {
        quiz_id: quiz.id,
        answers: answersToSubmit,
        time_spent: timeSpent,
      });
      navigate(`/results/${data.attempt_id}`, { state: { result: data, quiz } });
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed');
      setSubmitting(false);
    }
  }, [quiz, navigate, submitting]);

  useEffect(() => {
    if (!started) return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); submit(answers); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  const questions = quiz.questions || [];
  const q = questions[current];

  const handleAnswer = (qId, value) => setAnswers((a) => ({ ...a, [qId]: value }));

  const progress = ((current + 1) / questions.length) * 100;
  const timerColor = timeLeft <= 30 ? 'text-red-600' : timeLeft <= 60 ? 'text-yellow-600' : 'text-green-600';
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  if (!user) {
    return (
      <div className="card text-center py-12">
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold mb-2">Login Required</h3>
        <p className="text-gray-500 mb-4">You need to be logged in to take quizzes</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Login to Continue</button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="card max-w-lg mx-auto text-center py-10">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
        <p className="text-gray-600 mb-6">{quiz.description}</p>
        <div className="flex justify-center gap-6 text-sm text-gray-500 mb-8">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">📝</span>
            <span className="font-medium text-gray-900">{questions.length}</span>
            <span>Questions</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">⏱</span>
            <span className="font-medium text-gray-900">{Math.floor((quiz.time_limit || 300) / 60)} min</span>
            <span>Time limit</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🏆</span>
            <span className="font-medium text-gray-900">{quiz.difficulty}</span>
            <span>Difficulty</span>
          </div>
        </div>
        <button onClick={() => setStarted(true)} className="btn-primary px-8 py-3 text-base">
          Start Quiz
        </button>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">Question {current + 1} / {questions.length}</span>
        <span className={`text-lg font-mono font-bold ${timerColor}`}>⏱ {mins}:{secs}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Question card */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge bg-blue-50 text-blue-700">{q.question_type === 'true_false' ? 'True/False' : 'Multiple Choice'}</span>
          <span className="badge bg-purple-50 text-purple-700">{q.points} {q.points === 1 ? 'point' : 'points'}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{q.question_text}</h3>

        <div className="space-y-3">
          {(Array.isArray(q.options) ? q.options : []).map((option, i) => {
            const selected = answers[q.id] === option;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(q.id, option)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  selected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-secondary disabled:opacity-40"
        >
          ← Previous
        </button>

        <div className="flex gap-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                i === current
                  ? 'bg-blue-600 text-white'
                  : answers[questions[i]?.id] !== undefined
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">
            Next →
          </button>
        ) : (
          <button
            onClick={() => submit(answers)}
            disabled={submitting}
            className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500"
          >
            {submitting ? 'Submitting...' : '✓ Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
