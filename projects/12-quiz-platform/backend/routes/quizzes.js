const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { quizzes, questions, users, getNextQuizId, getNextQuestionId } = require('../db/mockData');

const router = express.Router();

// GET /api/quizzes  - list all quizzes (public)
router.get('/', optionalAuth, (req, res) => {
  const { category, difficulty, search } = req.query;
  let result = quizzes.map((q) => {
    const creator = users.find((u) => u.id === q.created_by);
    const qCount = questions.filter((qu) => qu.quiz_id === q.id).length;
    return { ...q, creator_name: creator?.username || 'Unknown', question_count: qCount };
  });

  if (category) result = result.filter((q) => q.category.toLowerCase() === category.toLowerCase());
  if (difficulty) result = result.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  if (search) result = result.filter((q) => q.title.toLowerCase().includes(search.toLowerCase()) || q.description.toLowerCase().includes(search.toLowerCase()));

  res.json({ quizzes: result, total: result.length });
});

// GET /api/quizzes/categories
router.get('/categories', (req, res) => {
  const cats = [...new Set(quizzes.map((q) => q.category))];
  res.json({ categories: cats });
});

// GET /api/quizzes/:id  - get quiz with questions (public)
router.get('/:id', optionalAuth, (req, res) => {
  const quiz = quizzes.find((q) => q.id === parseInt(req.params.id));
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const creator = users.find((u) => u.id === quiz.created_by);
  const qs = questions
    .filter((q) => q.quiz_id === quiz.id)
    .sort((a, b) => a.order_num - b.order_num)
    .map((q) => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      points: q.points,
      order_num: q.order_num,
      // omit correct_answer so client can't cheat
    }));

  res.json({ ...quiz, creator_name: creator?.username || 'Unknown', questions: qs });
});

// POST /api/quizzes  - create quiz (auth required)
router.post('/', authenticateToken, (req, res) => {
  const { title, description, category, difficulty, time_limit, questions: qList } = req.body;

  if (!title) return res.status(400).json({ error: 'title is required' });

  const quiz = {
    id: getNextQuizId(),
    title,
    description: description || '',
    created_by: req.user.id,
    category: category || 'General',
    difficulty: difficulty || 'Medium',
    time_limit: time_limit || 300,
    created_at: new Date(),
  };
  quizzes.push(quiz);

  if (Array.isArray(qList)) {
    qList.forEach((q, i) => {
      questions.push({
        id: getNextQuestionId(),
        quiz_id: quiz.id,
        question_text: q.question_text,
        question_type: q.question_type || 'multiple_choice',
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points || 1,
        order_num: i + 1,
      });
    });
  }

  const creator = users.find((u) => u.id === quiz.created_by);
  res.status(201).json({ ...quiz, creator_name: creator?.username || 'Unknown', question_count: qList?.length || 0 });
});

// PUT /api/quizzes/:id  - update quiz (auth + owner)
router.put('/:id', authenticateToken, (req, res) => {
  const idx = quizzes.findIndex((q) => q.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Quiz not found' });
  if (quizzes[idx].created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { title, description, category, difficulty, time_limit } = req.body;
  if (title) quizzes[idx].title = title;
  if (description !== undefined) quizzes[idx].description = description;
  if (category) quizzes[idx].category = category;
  if (difficulty) quizzes[idx].difficulty = difficulty;
  if (time_limit) quizzes[idx].time_limit = time_limit;

  res.json(quizzes[idx]);
});

// DELETE /api/quizzes/:id  - delete quiz (auth + owner)
router.delete('/:id', authenticateToken, (req, res) => {
  const idx = quizzes.findIndex((q) => q.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Quiz not found' });
  if (quizzes[idx].created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  quizzes.splice(idx, 1);
  res.json({ message: 'Quiz deleted' });
});

module.exports = router;
