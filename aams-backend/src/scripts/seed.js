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
    await User.create({
      name: "Admin",
      enrollmentId: "1234",
      password: "1234@admin",
      role: "admin",
      isDefaultPassword: false,
      department: dept._id
    });
    console.log("✅ Admin created — ID: 1234 / Pass: 1234@admin");

    // ─── 2. Faculty ─────────────────────────────────────────────────────────
    // Demo faculty  →  ID: 123456   |  Password: 123456@faculty
    // Other faculty →  ID: 123456+  |  Password: {id}@faculty
    const facultyNames = [
      "Kuldip Singh", "Manpreet Kaur", "Sandeep Gupta", "Rajni Sharma", "Amit Patel",
      "Priyanka Rao", "Vikas Nair", "Sunita Mehta", "Anil Iyer", "Sonia Khan",
      "Ramesh Babu", "Meena Kumari", "Arvind Kejriwal", "Mamata Banerjee", "Rahul Gandhi",
      "Narendra Modi", "Sushma Swaraj", "Arun Jaitley", "Manmohan Singh", "Pratibha Patil",
      "Abdul Kalam", "Atal Bihari", "Indira Gandhi", "Jawaharlal Nehru", "Sardar Patel"
    ];
    const teachers = [];
    let teacherStartId = 123456;

    for (let i = 0; i < facultyNames.length; i++) {
      const name = facultyNames[i];
      const currentId = (teacherStartId + i).toString();
      const isDemoTeacher = i === 0;

      const rawPassword = isDemoTeacher ? "123456@faculty" : `${currentId}@faculty`;

      const teacher = await User.create({
        name: `Dr. ${name}`,
        enrollmentId: currentId,
        password: rawPassword,
        role: "teacher",
        isDefaultPassword: false,
        department: dept._id,
        facultyProfile: { employeeCode: currentId, designation: "Assistant Professor" }
      });
      teachers.push(teacher);
    }
    console.log(`✅ ${teachers.length} Faculty created — Demo ID: 123456 / Pass: 123456@faculty`);

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
    const demoStudent = await User.create({
      name: demoStudentName,
      enrollmentId: demoStudentId,
      password: demoStudentPasswordRaw,
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
    while (students.length < 101) {
      if (studentId.toString() === demoStudentId) {
        studentId++;
        continue;
      }

      const rawPassword = `${studentId}@`;
      const name = indianNames[nameIndex % indianNames.length];
      nameIndex++;
      const section = students.length <= 50 ? "CSE-A" : "CSE-B";
      const semester = students.length <= 50 ? 5 : 3;

      const student = await User.create({
        name,
        enrollmentId: studentId.toString(),
        password: rawPassword,
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
      { code: "CSE301", name: "Data Structures", section: "CSE-A", semester: 5 },
      { code: "CSE302", name: "Algorithms", section: "CSE-A", semester: 5 },
      { code: "CSE303", name: "DBMS", section: "CSE-B", semester: 3 },
      { code: "CSE501", name: "Machine Learning", section: "CSE-A", semester: 5 },
      { code: "CSE502", name: "Cloud Computing", section: "CSE-B", semester: 3 },
      { code: "CSE601", name: "Cyber Security", section: "CSE-A", semester: 5 },
      { code: "CSE602", name: "Full Stack Dev", section: "CSE-B", semester: 3 },
      { code: "CSE701", name: "AI Ethics", section: "CSE-A", semester: 5 },
      { code: "CSE702", name: "Blockchain", section: "CSE-B", semester: 3 },
      { code: "CSE801", name: "Project Mgmt", section: "CSE-A", semester: 5 }
    ];

    const courses = [];
    for (let i = 0; i < coursesData.length; i++) {
      const data = coursesData[i];
      const enrolled = students
        .filter(s => s.section === data.section && s.semester === data.semester)
        .map(s => s._id);

      const course = await Course.create({
        ...data,
        teacher: teachers[i % teachers.length]._id,
        enrolledStudents: enrolled,
        department: dept._id
      });
      courses.push(course);
    }
    console.log(`✅ ${courses.length} Courses created`);

    // ─── 5. Timetable ───────────────────────────────────────────────────────
    const days = [1, 2, 3, 4, 5]; // Mon-Fri
    const slots = [
      { start: "09:00", end: "10:00" },
      { start: "10:00", end: "11:00" },
      { start: "11:00", end: "12:00" },
      { start: "14:00", end: "15:00" },
      { start: "15:00", end: "16:00" }
    ];

    let timetableCount = 0;
    for (const day of days) {
      for (let i = 0; i < courses.length; i++) {
        const courseObj = courses[i];
        const slot = slots[i % slots.length];
        
        // Stagger courses across days
        if ((day + i) % 2 === 0) {
          await Timetable.create({
            course: courseObj._id,
            teacher: courseObj.teacher,
            department: dept._id,
            batch: "2022-26",
            section: courseObj.section,
            dayOfWeek: day,
            startTime: slot.start,
            endTime: slot.end,
            room: `Block-33, Room-${100 + i}`
          });
          timetableCount++;
        }
      }
    }
    console.log(`✅ ${timetableCount} Timetable slots created`);

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
