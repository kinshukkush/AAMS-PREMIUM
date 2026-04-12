const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student', 'parent'],
    required: true
  },
  phone: { type: String, trim: true },
  profilePhoto: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },

  // Student-specific fields
  studentProfile: {
    rollNo: { type: String, sparse: true },
    enrollmentNo: { type: String },
    batch: { type: String },
    semester: { type: Number, min: 1, max: 12 },
    section: { type: String },
    admissionYear: { type: Number }
  },

  // Faculty-specific fields
  facultyProfile: {
    employeeCode: { type: String, sparse: true },
    designation: { type: String },
    specialization: { type: String }
  },

  // Parent-specific fields
  parentProfile: {
    linkedStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    relationship: { type: String, enum: ['father', 'mother', 'guardian'] }
  },

  // Face data reference
  faceRegistered: { type: Boolean, default: false },
  faceDataPath: { type: String, default: null },

  // Auth
  refreshToken: { type: String, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  lastLogin: { type: Date },

}, { timestamps: true });

// Indexes
// NOTE: email is indexed via `unique: true` on the field — no separate index needed.
userSchema.index({ role: 1 });
userSchema.index({ 'studentProfile.rollNo': 1 }, { sparse: true });
userSchema.index({ 'facultyProfile.employeeCode': 1 }, { sparse: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get display name helper
userSchema.virtual('displayName').get(function () {
  return this.name;
});

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
