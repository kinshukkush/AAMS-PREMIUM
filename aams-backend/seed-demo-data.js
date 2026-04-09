/**
 * DEMO CREDENTIALS & SEED DATA FOR AAMS SYSTEM
 * 
 * Run this script to populate the database with demo accounts for UI preview
 * Command: node seed-demo-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./src/models/User');
const Department = require('./src/models/Department');

const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@aams.demo',
    password: 'Admin@123',
    name: 'Admin User',
    role: 'admin',
    phone: '+91 9876543210'
  },
  faculty: {
    email: 'faculty@aams.demo',
    password: 'Faculty@123',
    name: 'Dr. Rajesh Kumar',
    role: 'faculty',
    phone: '+91 9876543211'
  },
  student: {
    email: 'student@aams.demo',
    password: 'Student@123',
    name: 'Amit Sharma',
    role: 'student',
    phone: '+91 9876543212'
  },
  parent: {
    email: 'parent@aams.demo',
    password: 'Parent@123',
    name: 'Sharma Family',
    role: 'parent',
    phone: '+91 9876543213'
  }
};

async function seedDemoData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aams');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing demo data (optional - comment out to preserve data)
    // console.log('🗑️  Clearing existing demo users...');
    // await User.deleteMany({ email: { $in: Object.values(DEMO_CREDENTIALS).map(u => u.email) } });
    // console.log('✅ Cleared\n');

    console.log('📝 Creating demo accounts...\n');

    const createdUsers = {};
    for (const [role, creds] of Object.entries(DEMO_CREDENTIALS)) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: creds.email });
        if (existingUser) {
          console.log(`⏭️  ${role.toUpperCase()}: Already exists (${creds.email})`);
          createdUsers[role] = existingUser;
        } else {
          // Create new user
          const user = await User.create({
            name: creds.name,
            email: creds.email,
            password: creds.password,
            role: creds.role,
            phone: creds.phone,
            isActive: true,
            ...(role === 'student' && {
              studentProfile: {
                rollNo: 'DEMO001',
                enrollmentNo: 'E-2024-001',
                batch: '2024',
                semester: 4,
                section: 'A'
              }
            }),
            ...(role === 'faculty' && {
              facultyProfile: {
                employeeId: 'FAC-001',
                department: 'Computer Science',
                specialization: 'AI & Machine Learning',
                officeLocation: 'Room 101'
              }
            })
          });

          console.log(`✅ ${role.toUpperCase()}: Created successfully`);
          console.log(`   📧 Email: ${creds.email}`);
          console.log(`   🔐 Password: ${creds.password}`);
          console.log(`   👤 Name: ${creds.name}\n`);

          createdUsers[role] = user;
        }
      } catch (error) {
        console.error(`❌ Error creating ${role}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ DEMO CREDENTIALS FOR UI PREVIEW');
    console.log('='.repeat(60) + '\n');

    console.log('ADMIN ACCOUNT:');
    console.log('  Email: admin@aams.demo');
    console.log('  Password: Admin@123\n');

    console.log('FACULTY ACCOUNT:');
    console.log('  Email: faculty@aams.demo');
    console.log('  Password: Faculty@123\n');

    console.log('STUDENT ACCOUNT:');
    console.log('  Email: student@aams.demo');
    console.log('  Password: Student@123\n');

    console.log('PARENT ACCOUNT:');
    console.log('  Email: parent@aams.demo');
    console.log('  Password: Parent@123\n');

    console.log('='.repeat(60));
    console.log('🌐 Access the UI at: http://localhost:5173');
    console.log('🎯 Login with any of the above credentials');
    console.log('='.repeat(60) + '\n');

    await mongoose.connection.close();
    console.log('✅ Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedDemoData();
}

module.exports = { DEMO_CREDENTIALS, seedDemoData };
