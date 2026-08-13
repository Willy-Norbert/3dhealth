import express from 'express';
import Quiz from '../models/Quiz.js';
import QuizResult from '../models/QuizResult.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect, trainer } from '../middleware/authMiddleware.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// GET /api/quizzes/course/:courseId
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/quizzes/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/quizzes/:id/answers
// Trainer-only: reveal correct answers for a quiz
router.get('/:id/answers', protect, trainer, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Ensure the requesting trainer owns the quiz
    if (quiz.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view answers for this quiz' });
    }

    // Return questions including correctOptionIndex
    const questions = quiz.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
    }));

    res.json({ quizId: quiz._id, title: quiz.title, questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/quizzes
// trainer only
router.post('/', protect, trainer, async (req, res) => {
  const { title, courseId, simulation, questions } = req.body;
  try {
    const quiz = new Quiz({
      title,
      course: courseId,
      simulation,
      questions,
      trainer: req.user._id
    });
    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/quizzes/:id/submit
// Student submits a quiz
router.post('/:id/submit', protect, async (req, res) => {
  const { answers } = req.body; // Array of selected option indices
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Check if student already submitted this quiz
    const existingResult = await QuizResult.findOne({ student: req.user._id, quiz: quiz._id });
    if (existingResult) {
      return res.status(400).json({ message: 'Quiz already completed' });
    }

    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctOptionIndex) {
        score += 1;
      }
    });

    const result = new QuizResult({
      student: req.user._id,
      quiz: quiz._id,
      score,
      total: quiz.questions.length,
      answers
    });

    const savedResult = await result.save();

    // Send quiz results email
    const user = await User.findById(req.user._id);
    if (user) {
      try {
        await sendEmail({
          email: user.email,
          subject: `Quiz Results: ${quiz.title} - VR HealthEd`,
          message: `<h2>Quiz Completed!</h2>
                    <p>You have submitted the quiz <strong>${quiz.title}</strong>.</p>
                    <p><strong>Your Score:</strong> ${score} out of ${quiz.questions.length}</p>`
        });
      } catch (err) {
        console.error('Failed to send quiz result email:', err);
      }
    }

    res.status(201).json(savedResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/quizzes/course/:courseId/results
// trainer sees all results for a course
router.get('/course/:courseId/results', protect, trainer, async (req, res) => {
  try {
    // Find quizzes for the course
    const quizzes = await Quiz.find({ course: req.params.courseId });
    const quizIds = quizzes.map(q => q._id);

    const results = await QuizResult.find({ quiz: { $in: quizIds } })
      .populate('student', 'name email')
      .populate('quiz', 'title simulation');
      
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/quizzes/my-results
// Student sees their own results
router.get('/my-results', protect, async (req, res) => {
  try {
    const results = await QuizResult.find({ student: req.user._id })
      .populate({
        path: 'quiz',
        select: 'title simulation course',
        populate: { path: 'course', select: 'title' }
      });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
