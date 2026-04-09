/**
 * Attendance Factory - Generate mock attendance data for testing
 */

const mongoose = require('mongoose');
const { subHours, subDays } = require('date-fns');

const createAttendanceRecord = (overrides = {}) => {
  const now = new Date();
  
  return {
    student: new mongoose.Types.ObjectId(),
    course: new mongoose.Types.ObjectId(),
    session: new mongoose.Types.ObjectId(),
    status: 'present',
    timestamp: now,
    type: 'qr',
    location: 'Lab-101',
    verified: true,
    confidence: 0.95,
    notes: '',
    ...overrides
  };
};

const createAttendanceSession = (overrides = {}) => {
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + 60 * 60000);
  
  return {
    course: new mongoose.Types.ObjectId(),
    faculty: new mongoose.Types.ObjectId(),
    title: 'Lecture 1',
    description: 'Introduction to Course',
    startTime,
    endTime,
    location: 'Room-A101',
    type: 'lecture',
    maxStudents: 100,
    qrCode: 'QR-' + Math.random().toString(36).substr(2, 9),
    isActive: true,
    attendanceCount: 0,
    totalStudents: 50,
    ...overrides
  };
};

const createMultipleAttendanceRecords = (count = 5, baseData = {}) => {
  const records = [];
  for (let i = 0; i < count; i++) {
    records.push(createAttendanceRecord({
      student: new mongoose.Types.ObjectId(),
      timestamp: subHours(new Date(), i),
      ...baseData
    }));
  }
  return records;
};

module.exports = {
  createAttendanceRecord,
  createAttendanceSession,
  createMultipleAttendanceRecords
};
