/**
 * Socket.io Real-time Event Service
 * Handles live attendance updates, notifications, and broadcasts
 */

const socketIO = require('socket.io');

class RealtimeService {
  constructor(httpServer) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:19006',
      'http://localhost:8081',
      'http://localhost:5173'
    ].filter(Boolean);

    this.io = socketIO(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.userSockets = new Map(); // userId -> socket.id mapping
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`✅ Client connected: ${socket.id}`);

      socket.on('authenticate', (userId) => {
        this.userSockets.set(userId, socket.id);
        socket.join(`user:${userId}`);
        console.log(`👤 User authenticated: ${userId} (${socket.id})`);
      });

      socket.on('join-session', (sessionId, userId) => {
        socket.join(`session:${sessionId}`);
        socket.emit('session-joined', { sessionId, message: 'Joined session' });
      });

      socket.on('leave-session', (sessionId) => {
        socket.leave(`session:${sessionId}`);
      });

      socket.on('disconnect', () => {
        // Find and remove user from mapping
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            break;
          }
        }
        console.log(`❌ Client disconnected: ${socket.id}`);
      });

      socket.on('error', (error) => {
        console.error(`⚠️ Socket error: ${error}`);
      });
    });
  }

  /**
   * Broadcast attendance marked event
   */
  broadcastAttendanceMarked(sessionId, attendance) {
    this.io.to(`session:${sessionId}`).emit('attendance-marked', {
      timestamp: new Date(),
      attendance: {
        studentId: attendance.studentId,
        studentName: attendance.studentName,
        status: attendance.status,
        time: attendance.time
      }
    });
  }

  /**
   * Broadcast session started event
   */
  broadcastSessionStarted(session) {
    this.io.emit('session-started', {
      timestamp: new Date(),
      session: {
        id: session._id,
        name: session.name,
        course: session.course,
        startTime: session.startTime,
        endTime: session.endTime
      }
    });
  }

  /**
   * Broadcast session ended event
   */
  broadcastSessionEnded(sessionId, stats) {
    this.io.emit('session-ended', {
      timestamp: new Date(),
      sessionId,
      stats
    });
  }

  /**
   * Broadcast real-time attendance count update
   */
  broadcastAttendanceCount(sessionId, count) {
    this.io.to(`session:${sessionId}`).emit('attendance-count-updated', {
      timestamp: new Date(),
      sessionId,
      presentCount: count.present,
      absentCount: count.absent,
      totalCount: count.total,
      percentage: ((count.present / count.total) * 100).toFixed(2)
    });
  }

  /**
   * Send notification to specific user
   */
  notifyUser(userId, notification) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', {
        timestamp: new Date(),
        ...notification
      });
    }
  }

  /**
   * Broadcast notification to all users in role
   */
  notifyRole(role, notification) {
    this.io.emit(`notification-${role}`, {
      timestamp: new Date(),
      ...notification
    });
  }

  /**
   * Broadcast QR scan event
   */
  broadcastQRScan(sessionId, scanData) {
    this.io.to(`session:${sessionId}`).emit('qr-scanned', {
      timestamp: new Date(),
      studentId: scanData.studentId,
      studentName: scanData.studentName,
      status: 'success'
    });
  }

  /**
   * Broadcast face detection event
   */
  broadcastFaceDetected(sessionId, faceData) {
    this.io.to(`session:${sessionId}`).emit('face-detected', {
      timestamp: new Date(),
      studentId: faceData.studentId,
      studentName: faceData.studentName,
      confidence: faceData.confidence,
      status: 'recognized'
    });
  }

  /**
   * Broadcast live analytics update
   */
  broadcastAnalytics(sessionId, analytics) {
    this.io.to(`session:${sessionId}`).emit('analytics-updated', {
      timestamp: new Date(),
      ...analytics
    });
  }

  /**
   * Get online user count
   */
  getOnlineUserCount() {
    return this.userSockets.size;
  }

  /**
   * Get users in session
   */
  getUsersInSession(sessionId) {
    const sockets = this.io.sockets.adapter.rooms.get(`session:${sessionId}`);
    return sockets ? sockets.size : 0;
  }
}

module.exports = RealtimeService;
