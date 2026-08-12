import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import QuizResult from '../models/QuizResult.js';

const router = express.Router();

// Get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.deleteOne({ _id: user._id });
      await Progress.deleteMany({ userId: user._id }); // cleanup
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', protect, admin, async (req, res) => {
  const { role } = req.body;
  if (!['student', 'trainer', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = role;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get system stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalQuizResults = await QuizResult.countDocuments();

    const simulationStats = await Progress.aggregate([
      {
        $group: {
          _id: "$simulationName",
          totalTimeSeconds: { $sum: "$timeSpentSeconds" },
          uniqueUsers: { $addToSet: "$userId" }
        }
      },
      {
        $project: {
          simulationName: "$_id",
          totalTimeSeconds: 1,
          userCount: { $size: "$uniqueUsers" },
          _id: 0
        }
      }
    ]);
    
    res.json({
      totalUsers,
      totalCourses,
      totalQuizResults,
      simulationStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
