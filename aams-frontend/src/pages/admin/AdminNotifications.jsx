import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Send, Users, User, Shield, BookOpen, Heart,
  CheckCircle, Clock, ChevronRight, Plus, X, Calendar, Filter
} from 'lucide-react';
import { fadeUp, scaleIn, stagger, slideLeft } from '../../utils/animations';
import toast from 'react-hot-toast';

const TEMPLATES = [
  { id: 't1', title: 'Low Attendance Warning', body: 'Dear {student}, your attendance in {course} has fallen to {pct}%. The minimum required is 75%.' },
  { id: 't2', title: 'Holiday Announcement',    body: 'Classes will remain suspended on {date} due to {reason}. Regular schedule resumes on {resumeDate}.' },
  { id: 't3', title: 'Exam Reminder',           body: 'This is a reminder that your {exam} examinations begin on {date}. Please check the schedule on the portal.' },
  { id: 't4', title: 'Session Open',            body: 'A new attendance session has been started for {course}. Please mark your attendance within {minutes} minutes.' },
];

const SENT_NOTIFICATIONS = [
  { id: 1, title: 'Low Attendance Warning', body: 'Attendance in CSE-301 has fallen below threshold.', recipients: 12, type: 'warning',  sentAt: '2h ago', read: 8 },
  { id: 2, title: 'Exam Schedule Released', body: 'End semester exams begin April 28th.',              recipients: 245, type: 'info',    sentAt: '1d ago', read: 198 },
  { id: 3, title: 'Holiday — Eid',          body: 'No classes on April 10–11.',                        recipients: 1289, type: 'success', sentAt: '3d ago', read: 1201 },
];

const TYPE_COLORS = { info: '#6C8EFF', success: '#34D399', warning: '#FBBF24', danger: '#F87171' };
const ROLE_ICONS  = { student: User, faculty: BookOpen, admin: Shield, parent: Heart, all: Users };

export default function AdminNotifications() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [title, setTitle]       = useState('');
  const [message, setMessage]   = useState('');
  const [type, setType]         = useState('info');
  const [target, setTarget]     = useState('all');
  const [targetRole, setTRole]  = useState('student');
  const [sending, setSending]   = useState(false);
  const [scheduleDate, setSchedDate] = useState('');

  const handleTemplate = (t) => {
    setTitle(t.title); setMessage(t.body); setComposeOpen(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) { toast.error('Title and message required'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    toast.success(`Notification sent to ${target === 'all' ? 'all users' : `${targetRole}s`}!`);
    setTitle(''); setMessage(''); setComposeOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Notifications</h1>
          <p>Compose and send targeted notifications to users</p>
        </div>
        <button id="btn-compose" className="btn btn-primary" onClick={() => setComposeOpen(true)}><Plus size={15} /> Compose</button>
      </div>

      <div className="grid-2">
        {/* Templates */}
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 16 }}>Quick Templates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} id={`template-${t.id}`} onClick={() => handleTemplate(t)}
                  style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                >
                  <Bell size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 2 }}>{t.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.body}</div>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Sent history */}
          <motion.div variants={fadeUp} custom={1} className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 16 }}>Sent History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SENT_NOTIFICATIONS.map(n => (
                <div key={n.id} style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.title}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600, background: `${TYPE_COLORS[n.type]}18`, color: TYPE_COLORS[n.type] }}>{n.type}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{n.body}</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>👥 {n.recipients} recipients</span>
                    <span>📖 {n.read} read</span>
                    <span>🕐 {n.sentAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Compose drawer (inline on desktop) */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible">
          <div className="glass-card" style={{ padding: 24, position: 'sticky', top: 80 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 20 }}>Compose Notification</h3>
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label" htmlFor="notif-title">Title *</label>
                <input id="notif-title" className="input" type="text" placeholder="Notification title" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="notif-message">Message *</label>
                <textarea id="notif-message" className="input" rows={4} placeholder="Write your notification message... Use {student}, {course} for placeholders." value={message} onChange={e => setMessage(e.target.value)} style={{ resize: 'vertical', minHeight: 100 }} required />
              </div>
              <div className="input-group">
                <label className="input-label">Type</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['info','success','warning','danger'].map(t => (
                    <button key={t} type="button" id={`notif-type-${t}`} onClick={() => setType(t)}
                      style={{ padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: type === t ? TYPE_COLORS[t] : 'var(--bg-elevated)', color: type === t ? 'white' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Target Audience</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['all','role','specific'].map(opt => (
                    <button key={opt} type="button" id={`target-${opt}`} onClick={() => setTarget(opt)}
                      style={{ padding: '9px 14px', borderRadius: 'var(--r-md)', border: target === opt ? '1.5px solid var(--border-accent)' : '1.5px solid var(--border-default)', cursor: 'pointer', background: target === opt ? 'rgba(108,142,255,0.08)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontSize: '0.82rem', transition: 'all 0.15s' }}
                    >
                      <Users size={16} color={target === opt ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                      {opt === 'all' ? 'All Users' : opt === 'role' ? 'By Role' : 'Specific User'}
                      {target === opt && <CheckCircle size={14} color="var(--accent-primary)" style={{ marginLeft: 'auto' }} />}
                    </button>
                  ))}
                </div>
                {target === 'role' && (
                  <select id="target-role-select" className="input" value={targetRole} onChange={e => setTRole(e.target.value)} style={{ marginTop: 8 }}>
                    <option value="student">Students</option>
                    <option value="faculty">Faculty</option>
                    <option value="parent">Parents</option>
                    <option value="admin">Admins</option>
                  </select>
                )}
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="notif-schedule">Schedule (optional)</label>
                <input id="notif-schedule" className="input" type="datetime-local" value={scheduleDate} onChange={e => setSchedDate(e.target.value)} />
              </div>
              <button id="btn-send-notification" type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={sending}>
                {sending ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Sending...</> : <><Send size={15} /> {scheduleDate ? 'Schedule' : 'Send Now'}</>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
