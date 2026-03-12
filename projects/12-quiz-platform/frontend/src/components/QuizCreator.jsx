import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';

const EMPTY_QUESTION = () => ({
  question_text: '',
  question_type: 'multiple_choice',
  options: ['', '', '', ''],
  correct_answer: '',
  points: 1,
});

export default function QuizCreator() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState('Medium');
  const [timeLimit, setTimeLimit] = useState(300);
  const [questions, setQuestions] = useState([EMPTY_QUESTION()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => setQuestions((q) => [...q, EMPTY_QUESTION()]);
  const removeQuestion = (i) => setQuestions((q) => q.filter((_, idx) => idx !== i));

  const updateQuestion = (i, field, value) => {
    setQuestions((q) => {
      const updated = [...q];
      updated[i] = { ...updated[i], [field]: value };
      if (field === 'question_type') {
        updated[i].options = value === 'true_false' ? ['True', 'False'] : ['', '', '', ''];
        updated[i].correct_answer = '';
      }
      return updated;
    });
  };

  const updateOption = (qi, oi, value) => {
    setQuestions((q) => {
      const updated = [...q];
      const opts = [...updated[qi].options];
      opts[oi] = value;
      updated[qi] = { ...updated[qi], options: opts };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Quiz title is required');
    const invalid = questions.findIndex((q) => !q.question_text.trim() || !q.correct_answer.trim());
    if (invalid >= 0) return setError(`Question ${invalid + 1}: text and correct answer are required`);

    setSubmitting(true);
    try {
      const { data } = await API.post('/quizzes', {
        title, description, category, difficulty,
        time_limit: parseInt(timeLimit),
        questions: questions.map((q) => ({
          ...q,
          options: q.options.filter((o) => o.trim()),
        })),
      });
      navigate(`/quiz/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create quiz');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Quiz details */}
      <div className="card space-y-4">
        <h2 className="text-xl font-bold text-gray-900">📝 Quiz Details</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. JavaScript Fundamentals" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="input h-20 resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe your quiz..." />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {['General', 'Programming', 'Science', 'Geography', 'History', 'Math', 'Language'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit</label>
            <select className="input" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)}>
              <option value={120}>2 min</option>
              <option value={180}>3 min</option>
              <option value={300}>5 min</option>
              <option value={420}>7 min</option>
              <option value={600}>10 min</option>
              <option value={900}>15 min</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, qi) => (
        <div key={qi} className="card space-y-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Question {qi + 1}</h3>
            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(qi)} className="text-red-500 hover:text-red-700 text-sm">
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select className="input" value={q.question_type} onChange={(e) => updateQuestion(qi, 'question_type', e.target.value)}>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True / False</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
            <textarea className="input h-16 resize-none" value={q.question_text} onChange={(e) => updateQuestion(qi, 'question_text', e.target.value)} placeholder="Enter your question..." required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correct_answer === opt && opt !== ''}
                    onChange={() => updateQuestion(qi, 'correct_answer', opt)}
                    className="accent-blue-600"
                    disabled={opt === ''}
                  />
                  <input
                    className="input flex-1"
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={q.question_type === 'true_false' ? opt : `Option ${oi + 1}`}
                    disabled={q.question_type === 'true_false'}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Select the radio button next to the correct answer</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Points:</label>
            <select className="input w-20" value={q.points} onChange={(e) => updateQuestion(qi, 'points', parseInt(e.target.value))}>
              {[1, 2, 3, 5].map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button type="button" onClick={addQuestion} className="btn-secondary flex-1">
          + Add Question
        </button>
        <button type="submit" disabled={submitting} className="btn-primary flex-1">
          {submitting ? 'Creating...' : '🚀 Create Quiz'}
        </button>
      </div>
    </form>
  );
}
