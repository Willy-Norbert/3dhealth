import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  answers: [{ type: Number }] // Array of selected option indices
}, { timestamps: true });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);
export default QuizResult;
