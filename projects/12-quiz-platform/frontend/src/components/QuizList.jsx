import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../context/AuthContext';

const DIFFICULTY_COLORS = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
};

const CATEGORY_ICONS = {
  Programming: '💻',
  Geography: '🌍',
  Science: '🔬',
  History: '📜',
  Math: '🔢',
  General: '🎯',
};

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    API.get('/quizzes/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    API.get('/quizzes', { params })
      .then(({ data }) => setQuizzes(data.quizzes))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, [search, category, difficulty]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="input flex-1"
          placeholder="🔍 Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input sm:w-40" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input sm:w-36" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All Levels</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-medium">No quizzes found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuizCard({ quiz }) {
  const icon = CATEGORY_ICONS[quiz.category] || '🎯';
  const diffColor = DIFFICULTY_COLORS[quiz.difficulty] || 'bg-gray-100 text-gray-700';
  const mins = Math.floor((quiz.time_limit || 300) / 60);

  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        <span className={`badge ${diffColor}`}>{quiz.difficulty}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
        {quiz.title}
      </h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{quiz.description}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <span>📝 {quiz.question_count} questions</span>
        <span>⏱ {mins} min</span>
        <span>👤 {quiz.creator_name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`badge bg-blue-50 text-blue-700`}>{quiz.category}</span>
        <Link
          to={`/quiz/${quiz.id}`}
          className="btn-primary text-sm py-1.5 px-3"
        >
          Start Quiz →
        </Link>
      </div>
    </div>
  );
}
