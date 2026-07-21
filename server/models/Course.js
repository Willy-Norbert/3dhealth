import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  simulations: [{ type: String }] // Array of string IDs referencing frontend simulations
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;
