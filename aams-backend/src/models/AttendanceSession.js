const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const attendanceSessionSchema = new mongoose.Schema({
  sessionCode: {
    type: String,
    unique: true,
    default: () => uuidv4()
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timetableSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable',
    default: null
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  batch: { type: String, required: true },
  section: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  startTime: { type: String },
  endTime: { type: String },
  method: {
    type: String,
    enum: ['face', 'qr', 'manual', 'mixed'],
    default: 'manual'
  },
  room: { type: String },
  startedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  isOpen: { type: Boolean, default: true },
  currentQrToken: { type: String },
  qrExpiresAt: { type: Date },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  totalStudents: { type: Number, default: 0 },
  presentCount: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

attendanceSessionSchema.index({ course: 1, date: 1 });
attendanceSessionSchema.index({ teacher: 1, date: 1 });
// NOTE: sessionCode is indexed via `unique: true` on the field — no separate index needed.

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
