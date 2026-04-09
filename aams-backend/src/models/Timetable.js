const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  batch: { type: String, required: true },         // e.g. "B.Tech CSE 2021"
  section: { type: String, required: true },        // e.g. "A"
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  startTime: { type: String, required: true },     // "09:00"
  endTime: { type: String, required: true },        // "10:00"
  room: { type: String },
  academicYear: { type: String },                   // "2025-26"
  semester: { type: Number },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

timetableSchema.index({ faculty: 1, dayOfWeek: 1 });
timetableSchema.index({ department: 1, batch: 1, section: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
