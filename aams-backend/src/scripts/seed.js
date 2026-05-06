require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');
const Department = require('../models/Department'); // Needed since some models require department reference

const indianNames = [
  "Aarav Sharma", "Vivaan Verma", "Aditya Singh", "Vihaan Gupta", "Arjun Patel",
  "Sai Rao", "Reyansh Nair", "Ayaan Mehta", "Krishna Iyer", "Ishaan Khan",
  "Shaurya Reddy", "Atharva Joshi", "Aarush Bhat", "Dhruv Desai", "Kabir Menon",
  "Rudra Pillai", "Tara Nair", "Saanvi Iyer", "Ananya Menon", "Aadhya Pillai",
  "Riya Bhat", "Aarohi Desai", "Kiara Reddy", "Myra Joshi", "Diya Sharma",
  "Advik Verma", "Nikhil Singh", "Pranav Gupta", "Rohan Patel", "Karan Rao",
  "Vikram Nair", "Rahul Mehta", "Karthik Iyer", "Varun Khan", "Aman Reddy",
  "Dev Joshi", "Ayush Bhat", "Yash Desai", "Ravi Menon", "Raj Pillai",
  "Neha Nair", "Pooja Iyer", "Shruti Menon", "Sneha Pillai", "Priya Bhat",
  "Roshni Desai", "Swati Reddy", "Megha Joshi", "Kriti Sharma", "Kavya Verma",
  "Siddharth Singh", "Aryan Gupta", "Yuvraj Patel", "Rishabh Rao", "Ankit Nair",
  "Saurabh Mehta", "Harsh Iyer", "Abhishek Khan", "Nitin Reddy", "Gaurav Joshi",
  "Manish Bhat", "Deepak Desai", "Suresh Menon", "Ramesh Pillai", "Anjali Nair",
  "Divya Iyer", "Preeti Menon", "Shikha Pillai", "Tanvi Bhat", "Tanvi Desai",
  "Vandana Reddy", "Vandana Joshi", "Ritika Sharma", "Isha Verma", "Anushka Singh",
  "Avni Gupta", "Gauri Patel", "Janhvi Rao", "Kyra Nair", "Mahi Mehta",
  "Nandini Iyer", "Navya Khan", "Niharika Reddy", "Ojasvi Joshi", "Pari Bhat",
  "Pihu Desai", "Prisha Menon", "Sara Pillai", "Siya Nair", "Tanya Iyer",
  "Trisha Menon", "Vanya Pillai", "Vedika Bhat", "Rishi Desai", "Kunal Reddy",
  "Sahil Joshi", "Ajay Sharma", "Vijay Verma", "Akash Singh", "Sanjay Gupta"
];

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is missing in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear collections
    await User.deleteMany({});
    await Course.deleteMany({});
    await Timetable.deleteMany({});
    await AttendanceRecord.deleteMany({});
    await AttendanceSession.deleteMany({});
    
    // Create a dummy department to satisfy required schema refs (Course/Timetable)
    await Department.deleteMany({});
    const dept = await Department.create({
      code: "CSE",
      name: "Computer Science and Engineering",
      hod: null
    });

    // 1. Create Admin
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    await User.create({
      name: "Admin",
      email: "admin@aams.demo",
      enrollmentId: "00000001",
      password: adminPassword,
      role: "admin",
      isDefaultPassword: true,
      department: dept._id
    });

    // 2. Create Teachers
    const teacherNames = [
      "Sharma", "Verma", "Singh", "Gupta", "Patel",
      "Rao", "Nair", "Mehta", "Iyer", "Khan"
    ];
    const teachers = [];
    let teacherId = 10000001;
    for (const name of teacherNames) {
      const isDemoTeacher = teacherId === 10000001;
      const password = await bcrypt.hash(isDemoTeacher ? "Faculty@123" : `${teacherId}@`, 10);
      const teacher = await User.create({
        name: `Dr. ${name}`,
        email: isDemoTeacher ? "faculty@aams.demo" : `dr.${name.toLowerCase()}@aams.edu`,
        enrollmentId: teacherId.toString(),
        password: password,
        role: "teacher",
        isDefaultPassword: true,
        department: dept._id
      });
      teachers.push(teacher);
      teacherId++;
    }

    // 3. Create Students
    const students = [];
    let studentId = 12223601;
    for (let i = 0; i < 100; i++) {
      const isDemoStudent = i === 0;
      const password = await bcrypt.hash(isDemoStudent ? "Student@123" : `${studentId}@`, 10);
      const name = indianNames[i];
      const firstName = name.split(' ')[0].toLowerCase();
      const section = i < 50 ? "CSE-A" : "CSE-B";
      const semester = Math.random() < 0.5 ? 3 : 5;
      
      const student = await User.create({
        name: name,
        email: isDemoStudent ? "student@aams.demo" : `${firstName}.${studentId}@student.aams.edu`,
        enrollmentId: studentId.toString(),
        password: password,
        role: "student",
        isDefaultPassword: true,
        section: section,
        semester: semester,
        department: dept._id
      });
      students.push(student);
      studentId++;
    }

    // 4. Create Courses
    const coursesData = [
      { code: "CSE301", name: "Data Structures", section: "CSE-A", semester: 3, teacher: teachers[0]._id },
      { code: "CSE302", name: "Algorithms", section: "CSE-A", semester: 3, teacher: teachers[1]._id },
      { code: "CSE303", name: "DBMS", section: "CSE-B", semester: 3, teacher: teachers[2]._id },
      { code: "CSE501", name: "Machine Learning", section: "CSE-A", semester: 5, teacher: teachers[3]._id },
      { code: "CSE502", name: "Cloud Computing", section: "CSE-B", semester: 5, teacher: teachers[4]._id }
    ];

    const courses = [];
    for (const data of coursesData) {
      // Find enrolled students
      const enrolled = students
        .filter(s => s.section === data.section && s.semester === data.semester)
        .map(s => s._id);

      const course = await Course.create({
        code: data.code,
        name: data.name,
        section: data.section,
        semester: data.semester,
        teacher: data.teacher,
        enrolledStudents: enrolled,
        department: dept._id
      });
      courses.push(course);
    }

    // 5. Create Timetable
    const timetableData = [
      // CSE301: Mon/Wed/Fri 09:00–10:00
      { courseIndex: 0, day: 1, start: "09:00", end: "10:00" }, // Mon
      { courseIndex: 0, day: 3, start: "09:00", end: "10:00" }, // Wed
      { courseIndex: 0, day: 5, start: "09:00", end: "10:00" }, // Fri
      // CSE302: Tue/Thu 10:00–11:00
      { courseIndex: 1, day: 2, start: "10:00", end: "10:00" }, // Tue (Wait, 10-11)
      { courseIndex: 1, day: 2, start: "10:00", end: "11:00" }, // Tue (Fix)
      { courseIndex: 1, day: 4, start: "10:00", end: "11:00" }, // Thu
      // CSE303: Mon/Wed 11:00–12:00
      { courseIndex: 2, day: 1, start: "11:00", end: "12:00" }, // Mon
      { courseIndex: 2, day: 3, start: "11:00", end: "12:00" }, // Wed
      // CSE501: Tue/Thu 14:00–15:00
      { courseIndex: 3, day: 2, start: "14:00", end: "15:00" }, // Tue
      { courseIndex: 3, day: 4, start: "14:00", end: "15:00" }, // Thu
      // CSE502: Mon/Fri 15:00–16:00
      { courseIndex: 4, day: 1, start: "15:00", end: "16:00" }, // Mon
      { courseIndex: 4, day: 5, start: "15:00", end: "16:00" }  // Fri
    ];

    // Remove the bad Tue 10-10 entry
    const finalTimetableData = timetableData.filter(t => t.start !== t.end);

    for (const t of finalTimetableData) {
      const courseObj = courses[t.courseIndex];
      await Timetable.create({
        course: courseObj._id,
        teacher: courseObj.teacher,
        department: dept._id,
        batch: "2025",
        section: courseObj.section,
        dayOfWeek: t.day,
        startTime: t.start,
        endTime: t.end,
        room: `Room-${100 + t.courseIndex}`
      });
    }

    console.log("✅ Seed complete. 100 students | 10 teachers | 5 courses | timetable");
    process.exit(0);

  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();
