import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Progress from '../models/Progress.js';

const router = express.Router();

// Track time spent in simulation (called periodically by frontend)
router.post('/track', protect, async (req, res) => {
  const { simulationName, secondsToAdd } = req.body;
  
  if (!simulationName || !secondsToAdd) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  try {
    let progress = await Progress.findOne({ 
      userId: req.user._id, 
      simulationName 
    });

    if (progress) {
      progress.timeSpentSeconds += secondsToAdd;
      progress.lastAccessed = Date.now();
      await progress.save();
    } else {
      progress = await Progress.create({
        userId: req.user._id,
        simulationName,
        timeSpentSeconds: secondsToAdd,
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user's progress
router.get('/', protect, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
