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
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timetable: {
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
  qrCode: { type: String },                          // base64 QR for QR mode
  qrExpiry: { type: Date },                          // QR code expiry time
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
attendanceSessionSchema.index({ faculty: 1, date: 1 });
// NOTE: sessionCode is indexed via `unique: true` on the field — no separate index needed.

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
