import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  simulationName: { type: String, required: true },
  timeSpentSeconds: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate entries for the same user and simulation combination
progressSchema.index({ userId: 1, simulationName: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
