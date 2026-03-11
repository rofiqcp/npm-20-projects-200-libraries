const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { attempts, quizzes, questions, users, leaderboardCache, rebuildLeaderboard, getNextAttemptId } = require('../db/mockData');
const { gradeAttempt, getGrade, isPassed } = require('../services/scoringService');

const router = express.Router();

// POST /api/attempts  - start or submit an attempt
// Body: { quiz_id, answers: { [question_id]: answer }, time_spent }
router.post('/', authenticateToken, (req, res) => {
  const { quiz_id, answers, time_spent } = req.body;

  if (!quiz_id) return res.status(400).json({ error: 'quiz_id is required' });

  const quiz = quizzes.find((q) => q.id === parseInt(quiz_id));
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const quizQuestions = questions.filter((q) => q.quiz_id === quiz.id).sort((a, b) => a.order_num - b.order_num);

  const { score, total_points, percentage, graded_answers } = gradeAttempt(quizQuestions, answers || {});

  const attempt = {
    id: getNextAttemptId(),
    user_id: req.user.id,
    quiz_id: parseInt(quiz_id),
    score,
    total_points,
    time_spent: time_spent || 0,
    completed_at: new Date(),
  };
  attempts.push(attempt);

  // Update leaderboard cache
  rebuildLeaderboard();

  const grade = getGrade(percentage);
  const passed = isPassed(percentage);

  res.status(201).json({
    attempt_id: attempt.id,
    score,
    total_points,
    percentage,
    grade,
    passed,
    time_spent: attempt.time_spent,
    graded_answers,
    quiz_title: quiz.title,
  });
});

// GET /api/attempts  - get current user's attempts
router.get('/', authenticateToken, (req, res) => {
  const userAttempts = attempts
    .filter((a) => a.user_id === req.user.id)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    .map((a) => {
      const quiz = quizzes.find((q) => q.id === a.quiz_id);
      return {
        ...a,
        quiz_title: quiz?.title || 'Unknown',
        quiz_category: quiz?.category || '',
        quiz_difficulty: quiz?.difficulty || '',
        percentage: a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0,
        grade: getGrade(a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0),
      };
    });

  res.json({ attempts: userAttempts, total: userAttempts.length });
});

// GET /api/attempts/analytics  - aggregate analytics for current user
router.get('/analytics', authenticateToken, (req, res) => {
  const userAttempts = attempts.filter((a) => a.user_id === req.user.id);

  if (userAttempts.length === 0) {
    return res.json({ total_attempts: 0, average_score: 0, best_score: 0, categories: [], recent: [] });
  }

  const percentages = userAttempts.map((a) => (a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0));
  const avg = Math.round(percentages.reduce((s, p) => s + p, 0) / percentages.length);
  const best = Math.max(...percentages);

  // Per-quiz performance
  const byQuiz = {};
  userAttempts.forEach((a) => {
    const quiz = quizzes.find((q) => q.id === a.quiz_id);
    const pct = a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0;
    if (!byQuiz[a.quiz_id]) byQuiz[a.quiz_id] = { quiz_id: a.quiz_id, title: quiz?.title || 'Unknown', category: quiz?.category || '', attempts: 0, total_pct: 0 };
    byQuiz[a.quiz_id].attempts++;
    byQuiz[a.quiz_id].total_pct += pct;
  });
  const quizStats = Object.values(byQuiz).map((q) => ({ ...q, avg_pct: Math.round(q.total_pct / q.attempts) }));

  // Category breakdown
  const byCat = {};
  userAttempts.forEach((a) => {
    const quiz = quizzes.find((q) => q.id === a.quiz_id);
    const cat = quiz?.category || 'Other';
    const pct = a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0;
    if (!byCat[cat]) byCat[cat] = { category: cat, attempts: 0, total_pct: 0 };
    byCat[cat].attempts++;
    byCat[cat].total_pct += pct;
  });
  const categories = Object.values(byCat).map((c) => ({ ...c, avg_pct: Math.round(c.total_pct / c.attempts) }));

  // Recent performance (last 10)
  const recent = userAttempts
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    .slice(0, 10)
    .map((a) => {
      const quiz = quizzes.find((q) => q.id === a.quiz_id);
      return {
        date: a.completed_at,
        quiz_title: quiz?.title || 'Unknown',
        percentage: a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0,
      };
    });

  res.json({ total_attempts: userAttempts.length, average_score: avg, best_score: best, quiz_stats: quizStats, categories, recent });
});

// GET /api/attempts/:id  - get single attempt
router.get('/:id', authenticateToken, (req, res) => {
  const attempt = attempts.find((a) => a.id === parseInt(req.params.id));
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  if (attempt.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const quiz = quizzes.find((q) => q.id === attempt.quiz_id);
  const pct = attempt.total_points > 0 ? Math.round((attempt.score / attempt.total_points) * 100) : 0;

  res.json({ ...attempt, quiz_title: quiz?.title || 'Unknown', percentage: pct, grade: getGrade(pct) });
});

module.exports = router;
