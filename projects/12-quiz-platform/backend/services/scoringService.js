/**
 * Scoring service for auto-grading quiz attempts
 */

/**
 * Grade a single answer against the question definition.
 * @param {Object} question  - question record from DB / mock
 * @param {string} userAnswer - the answer the user submitted
 * @returns {{ is_correct: boolean, points_earned: number }}
 */
function gradeAnswer(question, userAnswer) {
  if (userAnswer === null || userAnswer === undefined || userAnswer.trim() === '') {
    return { is_correct: false, points_earned: 0 };
  }

  const normalize = (s) => String(s).trim().toLowerCase();

  let is_correct = false;

  switch (question.question_type) {
    case 'multiple_choice':
    case 'true_false':
      is_correct = normalize(question.correct_answer) === normalize(userAnswer);
      break;
    case 'short_answer':
      is_correct = normalize(question.correct_answer) === normalize(userAnswer);
      break;
    default:
      is_correct = normalize(question.correct_answer) === normalize(userAnswer);
  }

  return {
    is_correct,
    points_earned: is_correct ? question.points : 0,
  };
}

/**
 * Grade an entire attempt.
 * @param {Object[]} questions - all questions for the quiz
 * @param {Object}   answers   - map of { question_id: userAnswer }
 * @returns {{ score, total_points, percentage, graded_answers }}
 */
function gradeAttempt(questions, answers) {
  let score = 0;
  let total_points = 0;
  const graded_answers = [];

  for (const question of questions) {
    const userAnswer = answers[question.id] || '';
    const { is_correct, points_earned } = gradeAnswer(question, userAnswer);

    score += points_earned;
    total_points += question.points;

    graded_answers.push({
      question_id: question.id,
      question_text: question.question_text,
      user_answer: userAnswer,
      correct_answer: question.correct_answer,
      is_correct,
      points_earned,
      max_points: question.points,
    });
  }

  const percentage = total_points > 0 ? Math.round((score / total_points) * 100) : 0;

  return { score, total_points, percentage, graded_answers };
}

/**
 * Determine a letter grade from percentage.
 */
function getGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Determine pass/fail based on a pass threshold (default 60%).
 */
function isPassed(percentage, threshold = 60) {
  return percentage >= threshold;
}

module.exports = { gradeAnswer, gradeAttempt, getGrade, isPassed };
