require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');
const Department = require('../models/Department');

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
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGODB_URI is missing in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Clear collections
    await User.deleteMany({});
    try {
      await User.collection.dropIndex("email_1");
    } catch (e) {
      console.log("Index email_1 not found or already dropped.");
    }
    await User.deleteMany({});
    await Course.deleteMany({});
    await Timetable.deleteMany({});
    await AttendanceRecord.deleteMany({});
    await AttendanceSession.deleteMany({});

    // Create a dummy department to satisfy required schema refs
    await Department.deleteMany({});
    const dept = await Department.create({
      code: "CSE",
      name: "Computer Science and Engineering",
      hod: null
    });

    // ─── 1. Admin ───────────────────────────────────────────────────────────
    // Username (enrollmentId): 1234   |  Password: 1234@admin
    const adminPassword = await bcrypt.hash("1234@admin", 10);
    await User.create({
      name: "Admin",
      enrollmentId: "1234",
      password: adminPassword,
      role: "admin",
      isDefaultPassword: false,
      department: dept._id
    });
    console.log("✅ Admin created — ID: 1234 / Pass: 1234@admin");

    // ─── 2. Faculty ─────────────────────────────────────────────────────────
    // Demo faculty  →  ID: 123456   |  Password: 123456@faculty
    // Other faculty →  ID: 123457+  |  Password: {id}@faculty
    const teacherLastNames = [
      "Sharma", "Verma", "Singh", "Gupta", "Patel",
      "Rao", "Nair", "Mehta", "Iyer", "Khan"
    ];
    const teachers = [];
    let teacherStartId = 123456;

    for (let i = 0; i < teacherLastNames.length; i++) {
      const name = teacherLastNames[i];
      const currentId = (teacherStartId + i).toString();
      const isDemoTeacher = i === 0; // 123456 is the demo faculty

      const rawPassword = isDemoTeacher ? "123456@faculty" : `${currentId}@faculty`;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      const teacher = await User.create({
        name: `Dr. ${name}`,
        enrollmentId: currentId,
        password: hashedPassword,
        role: "teacher",
        isDefaultPassword: false,
        department: dept._id,
        facultyProfile: { employeeCode: currentId, designation: "Assistant Professor" }
      });
      teachers.push(teacher);
    }
    console.log("✅ 10 Faculty created — Demo ID: 123456 / Pass: 123456@faculty");

    // ─── 3. Students ────────────────────────────────────────────────────────
    // Demo student  →  ID: 12223650  |  Password: 12223650
    // Other students → ID: 12223601–12223649, 12223651+  |  Password: {id}
    const students = [];

    // Determine which index corresponds to ID 12223650
    // We place 12223650 as the FIRST student (index 0 = demo).
    // Other students get IDs starting from 12223601 (skipping 12223650).

    const demoStudentId = "12223650";
    const demoStudentName = "Kinshuk Saxena";

    // Create demo student first
    const demoStudentPasswordRaw = `${demoStudentId}@`;
    const demoStudentPassword = await bcrypt.hash(demoStudentPasswordRaw, 10);
    const demoStudent = await User.create({
      name: demoStudentName,
      enrollmentId: demoStudentId,
      password: demoStudentPassword,
      role: "student",
      isDefaultPassword: false,
      section: "CSE-A",
      semester: 5,
      department: dept._id,
      studentProfile: { rollNo: demoStudentId, batch: "2022-26", semester: 5, section: "CSE-A", admissionYear: 2022 }
    });
    students.push(demoStudent);
    console.log(`✅ Demo student created — ID: ${demoStudentId} / Pass: ${demoStudentPasswordRaw}`);

    // Create 99 more students (IDs 12223601–12223699, skipping 12223650)
    let studentId = 12223601;
    let nameIndex = 0;
    while (students.length < 100) {
      if (studentId.toString() === demoStudentId) {
        studentId++;
        continue;
      }

      const rawPassword = `${studentId}@`;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const name = indianNames[nameIndex % indianNames.length];
      nameIndex++;
      const firstName = name.split(' ')[0].toLowerCase();
      const section = students.length < 51 ? "CSE-A" : "CSE-B";
      const semester = students.length < 51 ? 5 : 3;

      const student = await User.create({
        name,
        enrollmentId: studentId.toString(),
        password: hashedPassword,
        role: "student",
        isDefaultPassword: false,
        section,
        semester,
        department: dept._id,
        studentProfile: {
          rollNo: studentId.toString(),
          batch: "2022-26",
          semester,
          section,
          admissionYear: 2022
        }
      });
      students.push(student);
      studentId++;
    }
    console.log("✅ 100 Students created");

    // ─── 4. Courses ─────────────────────────────────────────────────────────
    const coursesData = [
      { code: "CSE301", name: "Data Structures", section: "CSE-A", semester: 5, teacher: teachers[0]._id },
      { code: "CSE302", name: "Algorithms", section: "CSE-A", semester: 5, teacher: teachers[1]._id },
      { code: "CSE303", name: "DBMS", section: "CSE-B", semester: 3, teacher: teachers[2]._id },
      { code: "CSE501", name: "Machine Learning", section: "CSE-A", semester: 5, teacher: teachers[3]._id },
      { code: "CSE502", name: "Cloud Computing", section: "CSE-B", semester: 3, teacher: teachers[4]._id }
    ];

    const courses = [];
    for (const data of coursesData) {
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
    console.log("✅ 5 Courses created");

    // ─── 5. Timetable ───────────────────────────────────────────────────────
    const timetableData = [
      { courseIndex: 0, day: 1, start: "09:00", end: "10:00" },
      { courseIndex: 0, day: 3, start: "09:00", end: "10:00" },
      { courseIndex: 0, day: 5, start: "09:00", end: "10:00" },
      { courseIndex: 1, day: 2, start: "10:00", end: "11:00" },
      { courseIndex: 1, day: 4, start: "10:00", end: "11:00" },
      { courseIndex: 2, day: 1, start: "11:00", end: "12:00" },
      { courseIndex: 2, day: 3, start: "11:00", end: "12:00" },
      { courseIndex: 3, day: 2, start: "14:00", end: "15:00" },
      { courseIndex: 3, day: 4, start: "14:00", end: "15:00" },
      { courseIndex: 4, day: 1, start: "15:00", end: "16:00" },
      { courseIndex: 4, day: 5, start: "15:00", end: "16:00" }
    ];

    for (const t of timetableData) {
      const courseObj = courses[t.courseIndex];
      await Timetable.create({
        course: courseObj._id,
        teacher: courseObj.teacher,
        department: dept._id,
        batch: "2022-26",
        section: courseObj.section,
        dayOfWeek: t.day,
        startTime: t.start,
        endTime: t.end,
        room: `Room-${100 + t.courseIndex}`
      });
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Seed complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Demo Credentials:");
    console.log("  🔑 Admin   — ID: 1234         | Pass: 1234@admin");
    console.log("  🔑 Faculty — ID: 123456        | Pass: 123456@faculty");
    console.log("  🔑 Student — ID: 12223650      | Pass: 12223650@");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    process.exit(0);

  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();
