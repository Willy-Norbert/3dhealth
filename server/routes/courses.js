import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Progress from '../models/Progress.js';
import QuizResult from '../models/QuizResult.js';
import { protect, trainer } from '../middleware/authMiddleware.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// GET /api/courses
// Students get their enrolled courses, trainers get their created courses
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'trainer') {
      const courses = await Course.find({ trainer: req.user._id }).populate('students', 'name email');
      res.json(courses);
    } else if (req.user.role === 'student') {
      const courses = await Course.find({ students: req.user._id }).populate('trainer', 'name');
      res.json(courses);
    } else {
      // Admin sees all
      const courses = await Course.find().populate('trainer', 'name').populate('students', 'name');
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
    const courses = await Course.find({ students: { $ne: req.user._id } }).populate('trainer', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/courses/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('trainer', 'name email')
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
    const course = await Course.findById(req.params.id).populate('trainer', 'name email');
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
          
          try {
            await sendEmail({
              email: user.email,
              subject: `Congratulations on completing ${course.title}! - VR HealthEd`,
              message: `<h2>Course Completed!</h2><p>Congratulations on completing all simulations and quizzes for <strong>${course.title}</strong>. Great job!</p>`
            });
          } catch (err) {
            console.error('Failed to send course completion email:', err);
          }
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
          
          try {
            await sendEmail({
              email: user.email,
              subject: `Congratulations on completing ${course.title}! - VR HealthEd`,
              message: `<h2>Course Completed!</h2><p>Congratulations on completing all simulations and quizzes for <strong>${course.title}</strong>. Great job!</p>`
            });
          } catch (err) {
            console.error('Failed to send course completion email:', err);
          }
        }
      }
    }

    res.json({ progressPercentage, isFinished });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/courses/:id/students-progress
router.get('/:id/students-progress', protect, trainer, async (req, res) => {
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
// trainer or admin
router.post('/', protect, trainer, async (req, res) => {
  const { title, description, simulations, trainer: assignedTrainer } = req.body;
  try {
    const courseTrainer = (req.user.role === 'admin' && assignedTrainer) ? assignedTrainer : req.user._id;

    const course = new Course({
      title,
      description,
      trainer: courseTrainer,
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

      const user = await User.findById(req.user._id);
      if (user) {
        try {
          await sendEmail({
            email: user.email,
            subject: `Enrolled: ${course.title} - VR HealthEd`,
            message: `<h2>Welcome to ${course.title}!</h2><p>You have successfully enrolled in this course.</p><p>Head over to your dashboard to get started with the simulations and quizzes!</p>`
          });
        } catch (err) {
          console.error('Failed to send enrollment email:', err);
        }
      }
    }
    res.json({ message: 'Successfully enrolled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/courses/:id
// trainer or admin
router.put('/:id', protect, trainer, async (req, res) => {
  const { title, description, simulations, students, trainer: assignedTrainer } = req.body;
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    if (course.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    if (simulations) course.simulations = simulations;
    
    // If admin is updating the trainer
    if (req.user.role === 'admin' && assignedTrainer) {
      course.trainer = assignedTrainer;
    }

    if (students) {
      const oldStudentIds = course.students.map(s => s.toString());
      const newStudentIds = students.filter(s => !oldStudentIds.includes(s.toString()));
      
      course.students = students;

      if (newStudentIds.length > 0) {
        const usersToEmail = await User.find({ _id: { $in: newStudentIds } });
        for (const u of usersToEmail) {
          try {
            await sendEmail({
              email: u.email,
              subject: `Enrolled: ${course.title} - VR HealthEd`,
              message: `<h2>Welcome to ${course.title}!</h2><p>You have been enrolled in this course.</p><p>Head over to your dashboard to get started with the simulations and quizzes!</p>`
            });
          } catch (err) {
            console.error('Failed to send trainer enrollment email:', err);
          }
        }
      }
    }

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/courses/:id
// trainer only
router.delete('/:id', protect, trainer, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await Course.deleteOne({ _id: course._id });
    res.json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
