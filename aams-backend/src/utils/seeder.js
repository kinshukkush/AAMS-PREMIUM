require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const { Device } = require('../models/DeviceNotification');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Course.deleteMany({}),
    Timetable.deleteMany({}),
    AttendanceSession.deleteMany({}),
    AttendanceRecord.deleteMany({}),
    Device.deleteMany({})
  ]);
  console.log('🗑️  Cleared existing data');

  // ===== DEPARTMENTS =====
  const depts = await Department.insertMany([
    { name: 'Computer Science & Engineering', code: 'CSE', hodName: 'Dr. Rajesh Kumar' },
    { name: 'Electronics & Communication', code: 'ECE', hodName: 'Dr. Sunita Verma' },
    { name: 'Mechanical Engineering', code: 'ME', hodName: 'Dr. Anil Patel' },
    { name: 'Business Administration', code: 'MBA', hodName: 'Dr. Vikram Singh' },
  ]);
  const cseDept = depts[0];
  console.log('✅ Departments created');

  // ===== USERS =====
  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Dr. Rajesh Kumar',
    email: process.env.ADMIN_EMAIL || 'admin@lpu.edu',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
    department: cseDept._id,
    phone: '9876500001'
  });

  const faculty1 = await User.create({
    name: 'Prof. Priya Sharma',
    email: 'priya@lpu.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: cseDept._id,
    phone: '9876500002',
    facultyProfile: { employeeCode: 'FAC001', designation: 'Associate Professor' }
  });

  const faculty2 = await User.create({
    name: 'Prof. Arjun Mehta',
    email: 'arjun@lpu.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: cseDept._id,
    phone: '9876500003',
    facultyProfile: { employeeCode: 'FAC002', designation: 'Assistant Professor' }
  });

  const studentData = [
    { name: 'Siddharth Malik', email: 'sid@lpu.edu', rollNo: 'CSE2021001', section: 'A', batch: 'B.Tech CSE 2021' },
    { name: 'Kinshuk Gupta', email: 'kinshuk@lpu.edu', rollNo: 'CSE2021002', section: 'A', batch: 'B.Tech CSE 2021' },
    { name: 'Sanchi Jain', email: 'sanchi@lpu.edu', rollNo: 'CSE2021003', section: 'A', batch: 'B.Tech CSE 2021' },
    { name: 'Naman Verma', email: 'naman@lpu.edu', rollNo: 'CSE2021004', section: 'B', batch: 'B.Tech CSE 2021' },
    { name: 'Prachi Singh', email: 'prachi@lpu.edu', rollNo: 'CSE2021005', section: 'B', batch: 'B.Tech CSE 2021' },
    { name: 'Khushi Sharma', email: 'khushi@lpu.edu', rollNo: 'CSE2021006', section: 'B', batch: 'B.Tech CSE 2021' },
    { name: 'Aryan Kumar', email: 'aryan@lpu.edu', rollNo: 'CSE2021007', section: 'A', batch: 'B.Tech CSE 2021' },
    { name: 'Meera Patel', email: 'meera@lpu.edu', rollNo: 'CSE2021008', section: 'A', batch: 'B.Tech CSE 2021' },
  ];

  const students = await Promise.all(studentData.map(s =>
    User.create({
      name: s.name, email: s.email, password: 'Student@123',
      role: 'student', department: cseDept._id, phone: '9876543200',
      studentProfile: { rollNo: s.rollNo, batch: s.batch, section: s.section, semester: 5, admissionYear: 2021 }
    })
  ));

  // Parent linked to first student
  const parent = await User.create({
    name: 'Balraj Malik',
    email: 'balraj@gmail.com',
    password: 'Parent@123',
    role: 'parent',
    phone: '9876500099',
    parentProfile: { linkedStudent: students[0]._id, relationship: 'father' }
  });

  console.log('✅ Users created:', { admin: 1, faculty: 2, students: students.length, parent: 1 });

  // ===== COURSES =====
  const courses = await Course.insertMany([
    { code: 'CSE301', name: 'Data Structures & Algorithms', department: cseDept._id, semester: 5, credits: 4 },
    { code: 'CSE302', name: 'Database Management Systems', department: cseDept._id, semester: 5, credits: 4 },
    { code: 'CSE303', name: 'Operating Systems', department: cseDept._id, semester: 5, credits: 3 },
    { code: 'CSE304', name: 'Computer Networks', department: cseDept._id, semester: 5, credits: 4 },
    { code: 'CSE401', name: 'Machine Learning', department: cseDept._id, semester: 5, credits: 4 },
    { code: 'CSE402', name: 'Web Technologies', department: cseDept._id, semester: 5, credits: 3 },
  ]);
  console.log('✅ Courses created:', courses.length);

  // ===== TIMETABLE =====
  const timetableData = [
    { day: 'Monday', start: '09:00', end: '10:00', course: courses[0], faculty: faculty1, batch: 'B.Tech CSE 2021', section: 'A', room: 'CR-201' },
    { day: 'Monday', start: '10:00', end: '11:00', course: courses[1], faculty: faculty2, batch: 'B.Tech CSE 2021', section: 'A', room: 'CR-202' },
    { day: 'Tuesday', start: '09:00', end: '10:00', course: courses[4], faculty: faculty1, batch: 'B.Tech CSE 2021', section: 'A', room: 'CR-205' },
    { day: 'Tuesday', start: '10:00', end: '11:00', course: courses[5], faculty: faculty2, batch: 'B.Tech CSE 2021', section: 'B', room: 'CR-201' },
    { day: 'Wednesday', start: '09:00', end: '10:00', course: courses[0], faculty: faculty1, batch: 'B.Tech CSE 2021', section: 'B', room: 'CR-201' },
    { day: 'Thursday', start: '11:15', end: '12:15', course: courses[2], faculty: faculty2, batch: 'B.Tech CSE 2021', section: 'A', room: 'CR-203' },
    { day: 'Friday', start: '09:00', end: '10:00', course: courses[3], faculty: faculty1, batch: 'B.Tech CSE 2021', section: 'A', room: 'CR-204' },
  ];

  await Timetable.insertMany(timetableData.map(t => ({
    course: t.course._id, faculty: t.faculty._id, department: cseDept._id,
    batch: t.batch, section: t.section, dayOfWeek: t.day,
    startTime: t.start, endTime: t.end, room: t.room, semester: 5, academicYear: '2025-26'
  })));
  console.log('✅ Timetable created');

  // ===== DEVICES =====
  await Device.insertMany([
    { name: 'Cam-CR201', type: 'ip_camera', location: 'Classroom 201, Block A', room: 'CR-201', department: cseDept._id, ipAddress: '192.168.1.101', status: 'active', registeredBy: admin._id },
    { name: 'Cam-CR202', type: 'webcam', location: 'Classroom 202, Block A', room: 'CR-202', department: cseDept._id, ipAddress: '192.168.1.102', status: 'active', registeredBy: admin._id },
    { name: 'Cam-CR203', type: 'ip_camera', location: 'Classroom 203, Block A', room: 'CR-203', department: cseDept._id, ipAddress: '192.168.1.103', status: 'inactive', registeredBy: admin._id },
    { name: 'Cam-Lab01', type: 'ip_camera', location: 'Computer Lab 1, Block B', room: 'LAB-01', department: cseDept._id, ipAddress: '192.168.1.104', status: 'active', registeredBy: admin._id },
  ]);
  console.log('✅ Devices created');

  // ===== SAMPLE ATTENDANCE DATA =====
  // Create a completed session
  const session = await AttendanceSession.create({
    course: courses[0]._id,
    faculty: faculty1._id,
    department: cseDept._id,
    batch: 'B.Tech CSE 2021',
    section: 'A',
    date: new Date('2026-03-10'),
    startTime: '09:00',
    endTime: '10:00',
    method: 'face',
    room: 'CR-201',
    status: 'completed',
    totalStudents: 8,
    presentCount: 6
  });

  const sectionAStudents = students.filter(s => s.studentProfile.section === 'A');
  await AttendanceRecord.insertMany(sectionAStudents.map((s, i) => ({
    session: session._id,
    student: s._id,
    course: courses[0]._id,
    faculty: faculty1._id,
    date: new Date('2026-03-10'),
    status: i < 6 ? 'present' : 'absent',
    checkInTime: i < 6 ? `09:0${i + 1}` : null,
    method: 'face',
    markedBy: 'system',
    confidence: i < 6 ? 95 + Math.random() * 4 : null
  })));

  console.log('✅ Sample attendance data created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin Login:    admin@lpu.edu / Admin@123');
  console.log('👨‍🏫 Faculty Login:  priya@lpu.edu / Faculty@123');
  console.log('🎓 Student Login:  sid@lpu.edu / Student@123');
  console.log('👨‍👧 Parent Login:   balraj@gmail.com / Parent@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
};

seed().catch(err => {
  console.error('Seeder error:', err);
  process.exit(1);
});
