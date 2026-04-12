/**
 * Notification Service
 * Handles email, push, and in-app notifications
 */

const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

class NotificationService {
  constructor() {
    // Email transporter setup
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS
      }
    });

    // Verify transporter connection
    this.transporter.verify((error) => {
      if (error) {
        console.error('Email transporter error:', error);
      } else {
        console.log('✅ Email transporter connected');
      }
    });
  }

  /**
   * Send email notification
   */
  async sendEmail(to, subject, html, replyTo = null) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html,
        replyTo: replyTo || process.env.EMAIL_FROM
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent: ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`📧 Email send failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create in-app notification
   */
  async createNotification(userId, type, title, message, data = {}) {
    try {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: new Date()
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Notification creation failed:', error);
      return null;
    }
  }

  /**
   * Notify late attendance
   */
  async notifyLateAttendance(user, session, arrivalTime) {
    const lateMinutes = this.calculateLateMinutes(session.startTime, arrivalTime);

    // Create in-app notification
    await this.createNotification(
      user._id,
      'late_attendance',
      'Late Arrival Recorded',
      `You arrived ${lateMinutes} minutes late to ${session.name}`,
      { sessionId: session._id, lateMinutes }
    );

    // Send email if configured
    if (user.email && user.preferences?.emailNotifications) {
      await this.sendEmail(
        user.email,
        'Late Arrival Notification - AAMS',
        this.getEmailTemplate('lateArrival', {
          userName: user.name,
          sessionName: session.name,
          lateMinutes,
          course: session.course
        })
      );
    }

    return true;
  }

  /**
   * Notify absence
   */
  async notifyAbsence(user, session) {
    // Create in-app notification
    await this.createNotification(
      user._id,
      'absence',
      'Absence Recorded',
      `You were marked absent in ${session.name}`,
      { sessionId: session._id }
    );

    // Send email notification
    if (user.email && user.preferences?.emailNotifications) {
      await this.sendEmail(
        user.email,
        'Absence Notification - AAMS',
        this.getEmailTemplate('absence', {
          userName: user.name,
          sessionName: session.name,
          course: session.course
        })
      );
    }

    // Parent notification (if student)
    if (user.role === 'student' && user.parentContact) {
      await this.notifyParent(user, session, 'absence');
    }

    return true;
  }

  /**
   * Notify parent about student absence
   */
  async notifyParent(student, session, eventType) {
    try {
      await this.sendEmail(
        student.parentContact.email,
        `${student.name} - ${eventType.toUpperCase()} Alert - AAMS`,
        this.getEmailTemplate('parentAlert', {
          studentName: student.name,
          eventType,
          sessionName: session.name,
          course: session.course,
          parentName: student.parentContact.name
        })
      );
    } catch (error) {
      console.error('Parent notification failed:', error);
    }
  }

  /**
   * Notify session events
   */
  async notifySessionEvent(session, eventType, details = {}) {
    const students = await require('../models/User').find({
      enrolledCourses: session.course,
      role: 'student'
    });

    const subject = eventType === 'started'
      ? `Attendance Session Started: ${session.name}`
      : `Attendance Session Ended: ${session.name}`;

    for (const student of students) {
      await this.createNotification(
        student._id,
        `session_${eventType}`,
        `Session ${eventType}`,
        `${session.name} has ${eventType}`,
        { sessionId: session._id, ...details }
      );

      if (student.email && student.preferences?.emailNotifications) {
        await this.sendEmail(
          student.email,
          subject,
          this.getEmailTemplate(`session${eventType}`, {
            studentName: student.name,
            sessionName: session.name,
            startTime: session.startTime,
            endTime: session.endTime
          })
        );
      }
    }
  }

  /**
   * Send analytics digest
   */
  async sendAnalyticsDigest(user, analytics) {
    if (!user.email || !user.preferences?.weeklyDigest) return;

    await this.sendEmail(
      user.email,
      'Weekly Attendance Analytics - AAMS',
      this.getEmailTemplate('analyticsDigest', {
        userName: user.name,
        totalSessions: analytics.totalSessions,
        presentDays: analytics.presentDays,
        absentDays: analytics.absentDays,
        attendancePercentage: analytics.percentage,
        lateArrivals: analytics.lateArrivals
      })
    );
  }

  /**
   * Calculate minutes late
   */
  calculateLateMinutes(startTime, arrivalTime) {
    const start = new Date(startTime);
    const arrival = new Date(arrivalTime);
    return Math.floor((arrival - start) / 60000);
  }

  /**
   * Get email template
   */
  getEmailTemplate(templateName, variables) {
    const templates = {
      lateArrival: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Late Arrival Notification</h2>
          <p>Hi ${variables.userName},</p>
          <p>You were marked late by <strong>${variables.lateMinutes} minutes</strong> in:</p>
          <p>
            <strong>Course:</strong> ${variables.course}<br>
            <strong>Session:</strong> ${variables.sessionName}
          </p>
          <p>Please contact your instructor if you have any concerns.</p>
        </div>
      `,
      absence: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Absence Notification</h2>
          <p>Hi ${variables.userName},</p>
          <p>You were marked absent in:</p>
          <p>
            <strong>Course:</strong> ${variables.course}<br>
            <strong>Session:</strong> ${variables.sessionName}
          </p>
        </div>
      `,
      parentAlert: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Student ${variables.eventType.toUpperCase()} Alert</h2>
          <p>Dear ${variables.parentName},</p>
          <p>This is to inform you that ${variables.studentName} was marked <strong>${variables.eventType}</strong> in:</p>
          <p>
            <strong>Course:</strong> ${variables.course}<br>
            <strong>Session:</strong> ${variables.sessionName}
          </p>
        </div>
      `,
      sessionStarted: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Attendance Session Started</h2>
          <p>Hi ${variables.studentName},</p>
          <p><strong>${variables.sessionName}</strong> has started.</p>
          <p>Please mark your attendance using face recognition or QR code.</p>
          <p><strong>Start Time:</strong> ${new Date(variables.startTime).toLocaleString()}</p>
        </div>
      `,
      sessionEnded: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Attendance Session Ended</h2>
          <p>Hi ${variables.studentName},</p>
          <p><strong>${variables.sessionName}</strong> has ended.</p>
          <p><strong>End Time:</strong> ${new Date(variables.endTime).toLocaleString()}</p>
        </div>
      `,
      analyticsDigest: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Weekly Attendance Report</h2>
          <p>Hi ${variables.userName},</p>
          <p><strong>Summary:</strong></p>
          <ul>
            <li>Total Sessions: ${variables.totalSessions}</li>
            <li>Present: ${variables.presentDays} days</li>
            <li>Absent: ${variables.absentDays} days</li>
            <li>Attendance: ${variables.attendancePercentage}%</li>
            <li>Late Arrivals: ${variables.lateArrivals}</li>
          </ul>
        </div>
      `
    };

    return templates[templateName] || '<p>Notification</p>';
  }
}

module.exports = new NotificationService();
