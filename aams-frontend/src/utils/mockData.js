// ===== MOCK DATA FOR AAMS DEMO =====

export const DEPARTMENTS = [
  { id: 1, name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. Rajesh Kumar', students: 1240, courses: 28 },
  { id: 2, name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Sunita Verma', students: 980, courses: 24 },
  { id: 3, name: 'Mechanical Engineering', code: 'ME', hod: 'Dr. Anil Patel', students: 860, courses: 22 },
  { id: 4, name: 'Civil Engineering', code: 'CE', hod: 'Dr. Neha Sharma', students: 720, courses: 20 },
  { id: 5, name: 'Business Administration', code: 'MBA', hod: 'Dr. Vikram Singh', students: 640, courses: 18 },
];

export const COURSES = [
  { id: 1, code: 'CSE301', name: 'Data Structures & Algorithms', deptId: 1, semester: 3, credits: 4, faculty: 'Prof. Priya Sharma' },
  { id: 2, code: 'CSE302', name: 'Database Management Systems', deptId: 1, semester: 3, credits: 4, faculty: 'Prof. Arjun Mehta' },
  { id: 3, code: 'CSE303', name: 'Operating Systems', deptId: 1, semester: 3, credits: 3, faculty: 'Prof. Kavita Joshi' },
  { id: 4, code: 'CSE304', name: 'Computer Networks', deptId: 1, semester: 4, credits: 4, faculty: 'Prof. Rahul Das' },
  { id: 5, code: 'CSE401', name: 'Machine Learning', deptId: 1, semester: 5, credits: 4, faculty: 'Prof. Priya Sharma' },
  { id: 6, code: 'CSE402', name: 'Web Technologies', deptId: 1, semester: 5, credits: 3, faculty: 'Prof. Arjun Mehta' },
];

export const STUDENTS = [
  { id: 1, rollNo: 'CSE2021001', name: 'Siddharth Malik', email: 'sid@lpu.edu', batch: 'B.Tech CSE 2021', semester: 5, section: 'A', phone: '9876543210', attendance: 87 },
  { id: 2, rollNo: 'CSE2021002', name: 'Kinshuk Gupta', email: 'kinshuk@lpu.edu', batch: 'B.Tech CSE 2021', semester: 5, section: 'A', phone: '9876543211', attendance: 72 },
  { id: 3, rollNo: 'CSE2021003', name: 'Sanchi Jain', email: 'sanchi@lpu.edu', batch: 'B.Tech CSE 2021', semester: 5, section: 'A', phone: '9876543212', attendance: 91 },
  { id: 4, rollNo: 'CSE2021004', name: 'Naman Verma', email: 'naman@lpu.edu', batch: 'B.Tech CSE 2021', semester: 5, section: 'B', phone: '9876543213', attendance: 65 },
  { id: 5, rollNo: 'CSE2021005', name: 'Prachi Singh', email: 'prachi@lpu.edu', batch: 'B.Tech CSE 2021', semester: 5, section: 'B', phone: '9876543214', attendance: 94 },
  { id: 6, rollNo: 'CSE2021006', name: 'Khushi Sharma', email: 'khushi@lpu.edu', batch: 'B.Tech CSE 2021', semester: 5, section: 'B', phone: '9876543215', attendance: 78 },
  { id: 7, rollNo: 'CSE2021007', name: 'Aryan Kumar', email: 'aryan@lpu.edu', batch: 'B.Tech CSE 2021', semester: 5, section: 'A', phone: '9876543216', attendance: 55 },
  { id: 8, rollNo: 'CSE2021008', name: 'Meera Patel', email: 'meera@lpu.edu', batch: 'B.Tech CSE 2021', semester: 5, section: 'A', phone: '9876543217', attendance: 88 },
];

export const FACULTY = [
  { id: 1, empCode: 'FAC001', name: 'Prof. Priya Sharma', email: 'priya@lpu.edu', dept: 'CSE', designation: 'Associate Professor', courses: 2, phone: '9876543300' },
  { id: 2, empCode: 'FAC002', name: 'Prof. Arjun Mehta', email: 'arjun@lpu.edu', dept: 'CSE', designation: 'Assistant Professor', courses: 2, phone: '9876543301' },
  { id: 3, empCode: 'FAC003', name: 'Prof. Kavita Joshi', email: 'kavita@lpu.edu', dept: 'CSE', designation: 'Professor', courses: 1, phone: '9876543302' },
  { id: 4, empCode: 'FAC004', name: 'Prof. Rahul Das', email: 'rahul@lpu.edu', dept: 'CSE', designation: 'Assistant Professor', courses: 1, phone: '9876543303' },
];

export const TIMETABLE = [
  { id: 1, day: 'Monday', time: '09:00 - 10:00', course: 'Data Structures', batch: 'CSE-A', room: 'CR-201', faculty: 'Prof. Priya Sharma' },
  { id: 2, day: 'Monday', time: '10:00 - 11:00', course: 'DBMS', batch: 'CSE-A', room: 'CR-202', faculty: 'Prof. Arjun Mehta' },
  { id: 3, day: 'Monday', time: '11:15 - 12:15', course: 'OS', batch: 'CSE-B', room: 'CR-203', faculty: 'Prof. Kavita Joshi' },
  { id: 4, day: 'Tuesday', time: '09:00 - 10:00', course: 'Machine Learning', batch: 'CSE-A', room: 'CR-205', faculty: 'Prof. Priya Sharma' },
  { id: 5, day: 'Tuesday', time: '10:00 - 11:00', course: 'Web Technologies', batch: 'CSE-B', room: 'CR-201', faculty: 'Prof. Arjun Mehta' },
  { id: 6, day: 'Wednesday', time: '09:00 - 10:00', course: 'Data Structures', batch: 'CSE-B', room: 'CR-201', faculty: 'Prof. Priya Sharma' },
  { id: 7, day: 'Thursday', time: '11:15 - 12:15', course: 'Machine Learning', batch: 'CSE-B', room: 'CR-205', faculty: 'Prof. Priya Sharma' },
  { id: 8, day: 'Friday', time: '09:00 - 10:00', course: 'DBMS', batch: 'CSE-B', room: 'CR-202', faculty: 'Prof. Arjun Mehta' },
];

export const ATTENDANCE_RECORDS = [
  { date: '2026-03-10', course: 'Data Structures', status: 'present', time: '09:03', method: 'face' },
  { date: '2026-03-10', course: 'DBMS', status: 'present', time: '10:02', method: 'qr' },
  { date: '2026-03-10', course: 'Machine Learning', status: 'absent', time: null, method: null },
  { date: '2026-03-11', course: 'Data Structures', status: 'present', time: '09:01', method: 'face' },
  { date: '2026-03-11', course: 'OS', status: 'late', time: '11:28', method: 'manual' },
  { date: '2026-03-12', course: 'DBMS', status: 'present', time: '10:05', method: 'face' },
  { date: '2026-03-12', course: 'Machine Learning', status: 'present', time: '09:00', method: 'face' },
  { date: '2026-03-13', course: 'Data Structures', status: 'absent', time: null, method: null },
  { date: '2026-03-13', course: 'Web Technologies', status: 'present', time: '10:01', method: 'qr' },
  { date: '2026-03-14', course: 'Machine Learning', status: 'present', time: '09:04', method: 'face' },
];

export const STUDENT_COURSE_ATTENDANCE = [
  { course: 'Data Structures', code: 'CSE301', total: 42, present: 38, percent: 90.5, faculty: 'Prof. Priya Sharma' },
  { course: 'Database Mgmt', code: 'CSE302', total: 38, present: 30, percent: 78.9, faculty: 'Prof. Arjun Mehta' },
  { course: 'Operating Systems', code: 'CSE303', total: 35, present: 25, percent: 71.4, faculty: 'Prof. Kavita Joshi' },
  { course: 'Computer Networks', code: 'CSE304', total: 40, present: 38, percent: 95.0, faculty: 'Prof. Rahul Das' },
  { course: 'Machine Learning', code: 'CSE401', total: 36, present: 29, percent: 80.6, faculty: 'Prof. Priya Sharma' },
  { course: 'Web Technologies', code: 'CSE402', total: 32, present: 28, percent: 87.5, faculty: 'Prof. Arjun Mehta' },
];

export const WEEKLY_ATTENDANCE = [
  { week: 'Week 1', present: 90, absent: 10 },
  { week: 'Week 2', present: 85, absent: 15 },
  { week: 'Week 3', present: 88, absent: 12 },
  { week: 'Week 4', present: 78, absent: 22 },
  { week: 'Week 5', present: 92, absent: 8 },
  { week: 'Week 6', present: 87, absent: 13 },
  { week: 'Week 7', present: 83, absent: 17 },
  { week: 'Week 8', present: 89, absent: 11 },
];

export const MONTHLY_TREND = [
  { month: 'Sep', avg: 88 }, { month: 'Oct', avg: 85 },
  { month: 'Nov', avg: 82 }, { month: 'Dec', avg: 79 },
  { month: 'Jan', avg: 84 }, { month: 'Feb', avg: 87 },
  { month: 'Mar', avg: 86 },
];

export const DEVICES = [
  { id: 1, name: 'Cam-CR201', type: 'IP Camera', location: 'Classroom 201, Block A', ip: '192.168.1.101', status: 'active', lastSeen: '2 mins ago' },
  { id: 2, name: 'Cam-CR202', type: 'Webcam', location: 'Classroom 202, Block A', ip: '192.168.1.102', status: 'active', lastSeen: '1 min ago' },
  { id: 3, name: 'Cam-CR203', type: 'IP Camera', location: 'Classroom 203, Block A', ip: '192.168.1.103', status: 'inactive', lastSeen: '2 hrs ago' },
  { id: 4, name: 'Cam-Lab01', type: 'IP Camera', location: 'Computer Lab 1, Block B', ip: '192.168.1.104', status: 'active', lastSeen: '5 mins ago' },
  { id: 5, name: 'Cam-Aud01', type: 'PTZ Camera', location: 'Main Auditorium', ip: '192.168.1.105', status: 'active', lastSeen: '30 secs ago' },
];

export const NOTIFICATIONS = [
  { id: 1, type: 'warning', title: 'Low Attendance Alert', message: 'Naman Verma has fallen below 75% attendance in OS.', time: '10 mins ago', read: false },
  { id: 2, type: 'warning', title: 'Low Attendance Alert', message: 'Aryan Kumar is at 55% — at risk of debarment.', time: '1 hr ago', read: false },
  { id: 3, type: 'info', title: 'System Update', message: 'Face recognition model updated to v2.1.', time: '3 hrs ago', read: true },
  { id: 4, type: 'success', title: 'Session Completed', message: 'Monday Data Structures class attendance marked.', time: '5 hrs ago', read: true },
  { id: 5, type: 'warning', title: 'Device Offline', message: 'Cam-CR203 has been offline for 2 hours.', time: '2 hrs ago', read: false },
];

export const DEPT_STATS = [
  { dept: 'CSE', avg: 86, students: 1240 },
  { dept: 'ECE', avg: 82, students: 980 },
  { dept: 'ME', avg: 79, students: 860 },
  { dept: 'CE', avg: 84, students: 720 },
  { dept: 'MBA', avg: 88, students: 640 },
];
