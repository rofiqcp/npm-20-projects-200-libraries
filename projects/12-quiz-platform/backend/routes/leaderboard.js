const express = require('express');
const { leaderboardCache, attempts, quizzes, users } = require('../db/mockData');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/leaderboard/:quizId  - top scores for a quiz
router.get('/:quizId', optionalAuth, (req, res) => {
  const quizId = parseInt(req.params.quizId);
  const quiz = quizzes.find((q) => q.id === quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const key = `leaderboard:${quizId}`;
  const board = leaderboardCache[key] || [];

  res.json({
    quiz_id: quizId,
    quiz_title: quiz.title,
    leaderboard: board.slice(0, 20),
    total: board.length,
  });
});

// GET /api/leaderboard  - global leaderboard across all quizzes
router.get('/', optionalAuth, (req, res) => {
  const scoreByUser = {};

  attempts.forEach((a) => {
    const pct = a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0;
    if (!scoreByUser[a.user_id]) {
      const user = users.find((u) => u.id === a.user_id);
      scoreByUser[a.user_id] = { user_id: a.user_id, username: user?.username || 'Unknown', total_attempts: 0, total_score: 0, avg_percentage: 0 };
    }
    scoreByUser[a.user_id].total_attempts++;
    scoreByUser[a.user_id].total_score += pct;
  });

  const global = Object.values(scoreByUser)
    .map((u) => ({ ...u, avg_percentage: Math.round(u.total_score / u.total_attempts) }))
    .sort((a, b) => b.avg_percentage - a.avg_percentage)
    .map((u, i) => ({ ...u, rank: i + 1 }));

  res.json({ leaderboard: global, total: global.length });
});

module.exports = router;
