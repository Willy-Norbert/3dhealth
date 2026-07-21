import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Progress from '../models/Progress.js';
import QuizResult from '../models/QuizResult.js';
import { protect, lecturer } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/courses
// Students get their enrolled courses, Lecturers get their created courses
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'lecturer') {
      const courses = await Course.find({ lecturer: req.user._id }).populate('students', 'name email');
      res.json(courses);
    } else if (req.user.role === 'student') {
      const courses = await Course.find({ students: req.user._id }).populate('lecturer', 'name');
      res.json(courses);
    } else {
      // Admin sees all
      const courses = await Course.find().populate('lecturer', 'name').populate('students', 'name');
      res.json(courses);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/courses/available
// Students get all courses they are NOT enrolled in
router.get('/available', protect, async (req, res) => {
  try {
    const courses = await Course.find({ students: { $ne: req.user._id } }).populate('lecturer', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/courses/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lecturer', 'name email')
      .populate('students', 'name email');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Basic access check
    if (req.user.role === 'student' && !course.students.some(s => s._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/courses/:id/student-dashboard-details
router.get('/:id/student-dashboard-details', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('lecturer', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Check if enrolled
    const studentEnrolled = course.students.some(s => s.equals(req.user._id));
    if (!studentEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const quizzes = await Quiz.find({ course: course._id });
    const quizIds = quizzes.map(q => q._id);

    const progressRecords = await Progress.find({ 
      userId: req.user._id, 
      simulationName: { $in: course.simulations } 
    });

    const quizResults = await QuizResult.find({ 
      student: req.user._id, 
      quiz: { $in: quizIds } 
    });

    const totalSims = course.simulations.length;
    const totalQuizzes = quizzes.length;
    const totalItems = totalSims + totalQuizzes;
    
    let completedSimsCount = 0;
    course.simulations.forEach(sim => {
      const p = progressRecords.find(pr => pr.simulationName === sim);
      if (p && p.timeSpentSeconds > 0) completedSimsCount++;
    });

    const completedQuizzesCount = quizResults.length;
    const isFinished = (completedSimsCount === totalSims) && (completedQuizzesCount === totalQuizzes);
    
    let progressPercentage = 0;
    if (totalItems > 0) {
      const rawPercentage = Math.round(((completedSimsCount + completedQuizzesCount) / totalItems) * 100);
      progressPercentage = isFinished ? 100 : Math.min(99, rawPercentage);
    }

    if (isFinished) {
      const user = await User.findById(req.user._id);
      if (user) {
        if (!user.completedCourses) user.completedCourses = [];
        if (!user.completedCourses.some(id => id.equals(course._id))) {
          user.completedCourses.push(course._id);
          await user.save();
        }
      }
    }

    res.json({
      course,
      quizzes,
      quizResults,
      progressPercentage,
      isFinished
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/courses/:id/progress
router.get('/:id/progress', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const quizzes = await Quiz.find({ course: course._id });
    const totalSims = course.simulations.length;
    const totalQuizzes = quizzes.length;
    const totalItems = totalSims + totalQuizzes;

    if (totalItems === 0) {
      return res.json({ progressPercentage: 0, isFinished: false });
    }

    const progressRecords = await Progress.find({ userId: req.user._id });
    const quizIds = quizzes.map(q => q._id);
    const quizResults = await QuizResult.find({ student: req.user._id, quiz: { $in: quizIds } });

    let completedSimsCount = 0;
    course.simulations.forEach(sim => {
      const p = progressRecords.find(pr => pr.simulationName === sim);
      if (p && p.timeSpentSeconds > 0) completedSimsCount++;
    });

    const completedQuizzesCount = quizResults.length;
    const isFinished = (completedSimsCount === totalSims) && (completedQuizzesCount === totalQuizzes);
    
    let progressPercentage = 0;
    if (totalItems > 0) {
      const rawPercentage = Math.round(((completedSimsCount + completedQuizzesCount) / totalItems) * 100);
      progressPercentage = isFinished ? 100 : Math.min(99, rawPercentage);
    }

    if (isFinished) {
      const user = await User.findById(req.user._id);
      if (user) {
        if (!user.completedCourses) {
          user.completedCourses = [];
        }
        if (!user.completedCourses.some(id => id.equals(course._id))) {
          user.completedCourses.push(course._id);
          await user.save();
        }
      }
    }

    res.json({ progressPercentage, isFinished });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/courses/:id/students-progress
router.get('/:id/students-progress', protect, lecturer, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('students', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const quizzes = await Quiz.find({ course: course._id });
    const totalSims = course.simulations.length;
    const totalQuizzes = quizzes.length;
    const totalItems = totalSims + totalQuizzes;

    const studentsProgress = [];

    for (const student of course.students) {
      if (totalItems === 0) {
        studentsProgress.push({
          studentId: student._id,
          name: student.name,
          email: student.email,
          progressPercentage: 0,
          isFinished: false
        });
        continue;
      }

      const progressRecords = await Progress.find({ userId: student._id });
      const quizIds = quizzes.map(q => q._id);
      const quizResults = await QuizResult.find({ student: student._id, quiz: { $in: quizIds } });

      let completedSimsCount = 0;
      course.simulations.forEach(sim => {
        const p = progressRecords.find(pr => pr.simulationName === sim);
        if (p && p.timeSpentSeconds > 0) completedSimsCount++;
      });

      const completedQuizzesCount = quizResults.length;
      const isFinished = (completedSimsCount === totalSims) && (completedQuizzesCount === totalQuizzes);

      let progressPercentage = 0;
      if (totalItems > 0) {
        const rawPercentage = Math.round(((completedSimsCount + completedQuizzesCount) / totalItems) * 100);
        progressPercentage = isFinished ? 100 : Math.min(99, rawPercentage);
      }

      studentsProgress.push({
        studentId: student._id,
        name: student.name,
        email: student.email,
        progressPercentage,
        isFinished
      });
    }

    res.json(studentsProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/courses
// Lecturer only
router.post('/', protect, lecturer, async (req, res) => {
  const { title, description, simulations } = req.body;
  try {
    const course = new Course({
      title,
      description,
      lecturer: req.user._id,
      simulations: simulations || []
    });
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/courses/:id/enroll
// Student enrolls themselves in a course
router.post('/:id/enroll', protect, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can enroll' });
  }
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    if (!course.students.includes(req.user._id)) {
      course.students.push(req.user._id);
      await course.save();
    }
    res.json({ message: 'Successfully enrolled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/courses/:id
// Lecturer only
router.put('/:id', protect, lecturer, async (req, res) => {
  const { title, description, simulations, students } = req.body;
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    if (course.lecturer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    if (simulations) course.simulations = simulations;
    if (students) course.students = students;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/courses/:id
// Lecturer only
router.delete('/:id', protect, lecturer, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.lecturer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await Course.deleteOne({ _id: course._id });
    res.json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
