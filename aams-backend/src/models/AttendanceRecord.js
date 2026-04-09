const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceSession',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  checkInTime: { type: String, default: null },      // "09:03"
  method: {
    type: String,
    enum: ['face', 'qr', 'manual'],
    default: 'manual'
  },
  confidence: { type: Number, default: null },        // Face recognition confidence %
  markedBy: {
    type: String,
    enum: ['system', 'faculty', 'self'],
    default: 'system'
  },
  isManualOverride: { type: Boolean, default: false },
  overrideBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  overrideReason: { type: String, default: null },
  ipAddress: { type: String },
  deviceId: { type: String },
  notes: { type: String }
}, { timestamps: true });

// Compound index — one record per student per session
attendanceRecordSchema.index({ session: 1, student: 1 }, { unique: true });
attendanceRecordSchema.index({ student: 1, date: 1 });
attendanceRecordSchema.index({ course: 1, date: 1 });
attendanceRecordSchema.index({ student: 1, course: 1 });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
