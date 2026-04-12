const nodemailer = require('nodemailer');

// ===== Email Graceful Degradation =====
// If SMTP credentials are missing or invalid, emailEnabled = false.
// All send functions resolve silently — server never crashes on email failure.
let emailEnabled = false;
let transporter = null;

const initEmail = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email: EMAIL_USER or EMAIL_PASS not set. Email sending disabled.');
    return;
  }

  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();
    emailEnabled = true;
    console.log('✅ Email: SMTP connection verified. Email sending enabled.');
  } catch (error) {
    emailEnabled = false;
    transporter = null;
    console.warn(`⚠️  Email: SMTP verification failed (${error.message}). Email sending disabled.`);
  }
};

// Initialize on module load — non-blocking
initEmail().catch(() => {});

const sendEmail = async ({ to, subject, html, text }) => {
  if (!emailEnabled || !transporter) {
    console.warn(`📧 Email skipped (disabled): "${subject}" to ${to}`);
    return null;
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'AAMS System <noreply@lpu.edu>',
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>/g, '')
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return null; // Never throw — gracefully degrade
  }
};

const sendLowAttendanceAlert = async (studentEmail, studentName, courseName, percent) => {
  if (!emailEnabled) return null;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6C8EFF, #A78BFA); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Low Attendance Alert</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Automated Attendance Management System — LPU</p>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; color: #374151;">Dear <strong>${studentName}</strong>,</p>
        <p style="color: #6b7280; line-height: 1.6;">
          This is an automated alert to inform you that your attendance in 
          <strong style="color: #6C8EFF;">${courseName}</strong> has fallen to 
          <strong style="color: #EF4444; font-size: 20px;">${percent}%</strong>.
        </p>
        <div style="background: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #DC2626; margin: 0; font-weight: 600;">⚠️ Minimum required attendance: 75%</p>
          <p style="color: #991B1B; margin: 8px 0 0; font-size: 14px;">Falling below this threshold may result in debarment from examinations.</p>
        </div>
        <p style="color: #6b7280;">Please attend classes regularly. Contact your faculty if you have any concerns.</p>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          This is an automated message from AAMS — Lovely Professional University
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: studentEmail, subject: `⚠️ Low Attendance Alert — ${courseName}`, html });
};

const sendWelcomeEmail = async (userEmail, userName, role, tempPassword) => {
  if (!emailEnabled) return null;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6C8EFF, #A78BFA); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to AAMS! 🎓</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Your account has been created as <strong style="text-transform: capitalize;">${role}</strong>.</p>
        <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${userEmail}</p>
          <p style="margin: 8px 0 0;"><strong>Temporary Password:</strong> <code style="background: #fff; padding: 2px 8px; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        <p style="color: #EF4444; font-weight: 600;">Please change your password after first login.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: userEmail, subject: 'Welcome to AAMS — Your Account Details', html });
};

const sendWelcomeEmailWithResetLink = async (userEmail, userName, role, resetUrl) => {
  if (!emailEnabled) return null;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6C8EFF, #A78BFA); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to AAMS! 🎓</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Your account has been created as <strong style="text-transform: capitalize;">${role}</strong> on the AAMS system.</p>
        <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${userEmail}</p>
          <p style="margin: 8px 0 0;"><strong>Role:</strong> <code style="background: #fff; padding: 2px 8px; border-radius: 4px; text-transform: capitalize;">${role}</code></p>
        </div>
        <p style="color: #374151; margin-bottom: 12px;">Click the button below to set up your password:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #6C8EFF, #A78BFA); color: white; text-decoration: none; padding: 12px 32px; border-radius: 6px; display: inline-block; font-weight: 600;">
            Set Up Your Password
          </a>
        </div>
        <p style="color: #6B7280; font-size: 14px;">This link will expire in 24 hours for security reasons.</p>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          This is an automated message from AAMS — Lovely Professional University
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: userEmail, subject: 'Welcome to AAMS — Set Up Your Account', html });
};

module.exports = {
  sendEmail,
  sendLowAttendanceAlert,
  sendWelcomeEmail,
  sendWelcomeEmailWithResetLink,
  isEmailEnabled: () => emailEnabled
};
