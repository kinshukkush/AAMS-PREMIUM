require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const attendanceRoutes = require('./routes/attendance');
const {
  deptRouter, courseRouter, timetableRouter,
  deviceRouter, notifRouter, reportRouter
} = require('./routes/resources');
const premiumRoutes = require('./routes/premium');
const notificationRoutes = require('./routes/notifications');

// ===== APP INIT =====
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:19006',
  'http://localhost:8081'
].filter(Boolean);

// ===== SOCKET.IO SETUP =====
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Attach io to app so controllers can use it
app.set('io', io);

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: Token required'));
  }
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    socket.userId = user._id;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

  // Join rooms by role/user (auth verified)
  socket.on('join_user_room', (userId) => {
    // Verify user is joining their own room or is admin
    if (socket.userId === userId || socket.user.role === 'admin') {
      socket.join(`user_${userId}`);
      console.log(`   → User ${userId} joined their room`);
    }
  });

  socket.on('join_session_room', (sessionId) => {
    // Faculty can join any session; students can only join their own
    socket.join(`session_${sessionId}`);
    console.log(`   → Joined session room: ${sessionId}`);
  });

  socket.on('join_faculty_room', (facultyId) => {
    // Only faculty can join their own faculty room
    if (socket.user.role === 'faculty' && socket.userId === facultyId) {
      socket.join(`faculty_${facultyId}`);
    }
  });

  // Face recognition frame forwarding to AI service
  socket.on('face_frame', async ({ sessionId, frame }) => {
    try {
      const axios = require('axios');
      const resp = await axios.post(`${process.env.AI_SERVICE_URL}/api/recognize`, {
        sessionId,
        frame,
        userId: socket.userId
      }, { timeout: 3000 });

      if (resp.data.recognized && resp.data.studentId) {
        socket.to(`session_${sessionId}`).emit('face_recognized', resp.data);
      }
    } catch (err) {
      // AI service may be busy — don't crash
      socket.emit('ai_error', { message: 'Recognition service temporarily unavailable.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ===== MIDDLEWARE =====
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', limiter);

// Stricter rate limit for auth (Relaxed for testing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Stricter limit for user management (admin operations) (Relaxed for testing)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: { success: false, message: 'Too many operations. Please try again later.' }
});

// Stricter limit for attendance operations (Relaxed for testing)
const attendanceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5000,
  message: { success: false, message: 'Too many attendance requests. Please try again after 1 minute.' }
});

// Stricter limit for face operations (resource intensive) (Relaxed for testing)
const faceLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5000,
  message: { success: false, message: 'Too many face operations. Please try again after 1 minute.' }
});

app.use('/api/users', adminLimiter);
app.use('/api/attendance/mark', attendanceLimiter);
app.use('/api/attendance/qr', attendanceLimiter);
app.use('/api/attendance/face', faceLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/departments', deptRouter);
app.use('/api/courses', courseRouter);
app.use('/api/timetable', timetableRouter);
app.use('/api/devices', deviceRouter);
app.use('/api/notifications-legacy', notifRouter);
app.use('/api/reports', reportRouter);
app.use('/api/premium', premiumRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AAMS Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's'
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'AAMS API — Automated Attendance Management System',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      attendance: '/api/attendance',
      departments: '/api/departments',
      courses: '/api/courses',
      timetable: '/api/timetable',
      devices: '/api/devices',
      notifications: '/api/notifications',
      premium: '/api/premium',
      reports: '/api/reports'
    }
  });
});

// ===== ERROR HANDLING =====
app.use(notFound);
app.use(errorHandler);

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

const startServer = async () => {
  await connectDB();
  server.listen(PORT, HOST, () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 AAMS Backend Server Started');
    console.log(`📡 API:      http://${HOST}:${PORT}/api`);
    console.log(`❤️  Health:   http://${HOST}:${PORT}/health`);
    console.log(`🔌 Socket:   ws://${HOST}:${PORT}`);
    console.log(`🌍 Env:      ${process.env.NODE_ENV || 'development'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });
});

module.exports = { app, io };
