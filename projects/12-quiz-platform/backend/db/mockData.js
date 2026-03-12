const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// ─── In-memory store ──────────────────────────────────────────────────────────
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@quiz.com',
    password_hash: bcrypt.hashSync('admin123', 10),
    created_at: new Date('2024-01-01'),
  },
  {
    id: 2,
    username: 'alice',
    email: 'alice@quiz.com',
    password_hash: bcrypt.hashSync('alice123', 10),
    created_at: new Date('2024-01-15'),
  },
  {
    id: 3,
    username: 'bob',
    email: 'bob@quiz.com',
    password_hash: bcrypt.hashSync('bob123', 10),
    created_at: new Date('2024-02-01'),
  },
];

const quizzes = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of core JavaScript concepts including variables, functions, closures, and prototypes.',
    created_by: 1,
    category: 'Programming',
    difficulty: 'Medium',
    time_limit: 300,
    created_at: new Date('2024-01-10'),
  },
  {
    id: 2,
    title: 'World Geography Quiz',
    description: 'How well do you know the world? Test your knowledge of countries, capitals, and landmarks.',
    created_by: 1,
    category: 'Geography',
    difficulty: 'Easy',
    time_limit: 240,
    created_at: new Date('2024-01-12'),
  },
  {
    id: 3,
    title: 'Advanced React Concepts',
    description: 'Dive deep into React hooks, context, performance optimization, and advanced patterns.',
    created_by: 2,
    category: 'Programming',
    difficulty: 'Hard',
    time_limit: 420,
    created_at: new Date('2024-02-05'),
  },
  {
    id: 4,
    title: 'Science Trivia',
    description: 'Fun science questions covering physics, chemistry, biology, and astronomy.',
    created_by: 1,
    category: 'Science',
    difficulty: 'Easy',
    time_limit: 180,
    created_at: new Date('2024-02-10'),
  },
];

const questions = [
  // JS Fundamentals (quiz_id: 1)
  { id: 1, quiz_id: 1, question_text: 'What does `typeof null` return in JavaScript?', question_type: 'multiple_choice', options: ['null', 'undefined', 'object', 'boolean'], correct_answer: 'object', points: 2, order_num: 1 },
  { id: 2, quiz_id: 1, question_text: 'Which method is used to add elements to the end of an array?', question_type: 'multiple_choice', options: ['push()', 'pop()', 'shift()', 'unshift()'], correct_answer: 'push()', points: 1, order_num: 2 },
  { id: 3, quiz_id: 1, question_text: 'JavaScript is a statically typed language.', question_type: 'true_false', options: ['True', 'False'], correct_answer: 'False', points: 1, order_num: 3 },
  { id: 4, quiz_id: 1, question_text: 'What is the output of `0.1 + 0.2 === 0.3` in JavaScript?', question_type: 'multiple_choice', options: ['true', 'false', 'undefined', 'NaN'], correct_answer: 'false', points: 2, order_num: 4 },
  { id: 5, quiz_id: 1, question_text: 'Which keyword creates a block-scoped variable?', question_type: 'multiple_choice', options: ['var', 'let', 'function', 'const'], correct_answer: 'let', points: 1, order_num: 5 },
  // World Geography (quiz_id: 2)
  { id: 6, quiz_id: 2, question_text: 'What is the capital of Australia?', question_type: 'multiple_choice', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct_answer: 'Canberra', points: 1, order_num: 1 },
  { id: 7, quiz_id: 2, question_text: 'Which is the longest river in the world?', question_type: 'multiple_choice', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correct_answer: 'Nile', points: 1, order_num: 2 },
  { id: 8, quiz_id: 2, question_text: 'Mount Everest is located in Nepal.', question_type: 'true_false', options: ['True', 'False'], correct_answer: 'True', points: 1, order_num: 3 },
  { id: 9, quiz_id: 2, question_text: 'How many continents are there on Earth?', question_type: 'multiple_choice', options: ['5', '6', '7', '8'], correct_answer: '7', points: 1, order_num: 4 },
  // Advanced React (quiz_id: 3)
  { id: 10, quiz_id: 3, question_text: 'Which hook is used to perform side effects in a React component?', question_type: 'multiple_choice', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correct_answer: 'useEffect', points: 2, order_num: 1 },
  { id: 11, quiz_id: 3, question_text: 'React Context API can replace Redux in all scenarios.', question_type: 'true_false', options: ['True', 'False'], correct_answer: 'False', points: 2, order_num: 2 },
  { id: 12, quiz_id: 3, question_text: 'What does React.memo do?', question_type: 'multiple_choice', options: ['Creates a memo', 'Memoizes a component', 'Stores state', 'Handles side effects'], correct_answer: 'Memoizes a component', points: 2, order_num: 3 },
  { id: 13, quiz_id: 3, question_text: 'Which hook lets you subscribe to React context?', question_type: 'multiple_choice', options: ['useEffect', 'useRef', 'useContext', 'useMemo'], correct_answer: 'useContext', points: 2, order_num: 4 },
  // Science Trivia (quiz_id: 4)
  { id: 14, quiz_id: 4, question_text: 'What is the chemical symbol for gold?', question_type: 'multiple_choice', options: ['Go', 'Gd', 'Au', 'Ag'], correct_answer: 'Au', points: 1, order_num: 1 },
  { id: 15, quiz_id: 4, question_text: 'The speed of light is approximately 300,000 km/s.', question_type: 'true_false', options: ['True', 'False'], correct_answer: 'True', points: 1, order_num: 2 },
  { id: 16, quiz_id: 4, question_text: 'How many bones are in the adult human body?', question_type: 'multiple_choice', options: ['186', '206', '226', '256'], correct_answer: '206', points: 1, order_num: 3 },
  { id: 17, quiz_id: 4, question_text: 'Which planet is known as the Red Planet?', question_type: 'multiple_choice', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correct_answer: 'Mars', points: 1, order_num: 4 },
];

const attempts = [
  { id: 1, user_id: 2, quiz_id: 1, score: 6, total_points: 7, time_spent: 245, completed_at: new Date('2024-03-01') },
  { id: 2, user_id: 3, quiz_id: 1, score: 5, total_points: 7, time_spent: 290, completed_at: new Date('2024-03-02') },
  { id: 3, user_id: 2, quiz_id: 2, score: 4, total_points: 4, time_spent: 120, completed_at: new Date('2024-03-03') },
  { id: 4, user_id: 3, quiz_id: 3, score: 5, total_points: 8, time_spent: 380, completed_at: new Date('2024-03-04') },
  { id: 5, user_id: 2, quiz_id: 4, score: 4, total_points: 4, time_spent: 90, completed_at: new Date('2024-03-05') },
];

// Leaderboard cache (simulates Redis sorted sets)
const leaderboardCache = {};

function rebuildLeaderboard() {
  attempts.forEach((attempt) => {
    const key = `leaderboard:${attempt.quiz_id}`;
    if (!leaderboardCache[key]) leaderboardCache[key] = [];
    const user = users.find((u) => u.id === attempt.user_id);
    const existing = leaderboardCache[key].findIndex((e) => e.user_id === attempt.user_id);
    const pct = attempt.total_points > 0 ? Math.round((attempt.score / attempt.total_points) * 100) : 0;
    const entry = { user_id: attempt.user_id, username: user?.username || 'Unknown', score: attempt.score, total_points: attempt.total_points, percentage: pct, time_spent: attempt.time_spent, completed_at: attempt.completed_at };
    if (existing >= 0) {
      if (attempt.score > leaderboardCache[key][existing].score) leaderboardCache[key][existing] = entry;
    } else {
      leaderboardCache[key].push(entry);
    }
  });
  Object.keys(leaderboardCache).forEach((k) => {
    leaderboardCache[k].sort((a, b) => b.score - a.score || a.time_spent - b.time_spent);
    leaderboardCache[k].forEach((e, i) => { e.rank = i + 1; });
  });
}
rebuildLeaderboard();

let nextUserId = users.length + 1;
let nextAttemptId = attempts.length + 1;
let nextQuizId = quizzes.length + 1;
let nextQuestionId = questions.length + 1;

module.exports = {
  users,
  quizzes,
  questions,
  attempts,
  leaderboardCache,
  rebuildLeaderboard,
  getNextUserId: () => nextUserId++,
  getNextAttemptId: () => nextAttemptId++,
  getNextQuizId: () => nextQuizId++,
  getNextQuestionId: () => nextQuestionId++,
};
