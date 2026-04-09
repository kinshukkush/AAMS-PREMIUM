/**
 * User Factory - Generate mock user data for testing
 */

const mongoose = require('mongoose');

const createUser = (overrides = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!',
    phone: '+91-9999999999',
    role: 'student',
    isActive: true,
    lastLogin: null,
    studentProfile: {
      rollNo: 'LPU001',
      batch: '2020',
      section: 'A',
      semester: 1
    }
  };

  return { ...defaultUser, ...overrides };
};

const createFacultyUser = (overrides = {}) => {
  return createUser({
    role: 'faculty',
    email: 'faculty@example.com',
    facultyProfile: {
      employeeCode: 'EMP001',
      department: new mongoose.Types.ObjectId(),
      specialization: 'Computer Science'
    },
    ...overrides
  });
};

const createAdminUser = (overrides = {}) => {
  return createUser({
    role: 'admin',
    email: 'admin@example.com',
    ...overrides
  });
};

const createParentUser = (overrides = {}) => {
  return createUser({
    role: 'parent',
    email: 'parent@example.com',
    parentProfile: {
      linkedStudent: new mongoose.Types.ObjectId(),
      relationship: 'Father'
    },
    ...overrides
  });
};

module.exports = {
  createUser,
  createFacultyUser,
  createAdminUser,
  createParentUser
};
