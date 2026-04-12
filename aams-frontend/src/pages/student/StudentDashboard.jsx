import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, CheckCircle, AlertTriangle, Bell, Calendar, TrendingUp, User } from 'lucide-react';
import { fadeUp, stagger } from '../../utils/animations';
import { useAuth } from '../../context/AuthContext';

const SUBJECTS = [
  { name: 'Data Structures',  code: 'CSE-301', attended: 22, total: 25, pct: 88 },
  { name: 'Mathematics III',  code: 'MA-301',  attended: 18, total: 24, pct: 75 },
  { name: 'Computer Networks',code: 'CSE-302', attended: 20, total: 22, pct: 90 },
  { name: 'OS Concepts',      code: 'CSE-303', attended: 14, total: 20, pct: 70 },
  { name: 'DBMS',             code: 'CSE-304', attended: 19, total: 21, pct: 90 },
];

const TODAY_CLASSES = [
  { time: '09:00', course: 'Data Structures',  room: 'LH-204', status: 'present' },
  { time: '11:00', course: 'Mathematics III',  room: 'LH-102', status: 'present' },
  { time: '14:00', course: 'Computer Networks',room: 'LH-301', status: 'upcoming' },
  { time: '16:00', course: 'OS Concepts',      room: 'LH-205', status: 'upcoming' },
];

const ACTIVITY = [
  { text: 'Attendance marked in Data Structures', time: '2h ago', icon: CheckCircle, color: 'var(--success)' },
  { text: 'New notification: Assignment due tomorrow', time: '4h ago', icon: Bell, color: 'var(--warning)' },
  { text: 'Mathematics III attendance recorded', time: '6h ago', icon: CheckCircle, color: 'var(--success)' },
  { text: 'Low attendance warning for OS Concepts', time: '1d ago', icon: AlertTriangle, color: 'var(--danger)' },
];

function AttendanceDonut({ pct }) {
  const r = 70, c = 2 * Math.PI * r;
  const color = pct >= 85 ? '#34D399' : pct >= 75 ? '#FBBF24' : '#F87171';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 180, height: 180 }}>
        <svg width={180} height={180} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={90} cy={90} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={12} />
          <circle cx={90} cy={90} r={r} fill="none" stroke={color} strokeWidth={12}
            strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s var(--ease-smooth)' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color }}>{pct}%</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Overall</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: pct >= 85 ? 'var(--success)' : pct >= 75 ? 'var(--warning)' : 'var(--danger)' }}>
          {pct >= 85 ? '✓ Excellent attendance' : pct >= 75 ? '⚠ Near minimum threshold' : '⚠ Below 75% — At risk!'}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const overallPct = Math.round(SUBJECTS.reduce((a, s) => a + s.pct, 0) / SUBJECTS.length);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const greeting = time.getHours() < 12 ? 'Good morning' : time.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Greeting */}
      <motion.div variants={stagger} initial="hidden" animate="visible">
        <motion.div variants={fadeUp} className="page-header">
          <div className="page-header-left">
            <h1>{greeting}, {user?.name?.split(' ')[0] || 'Student'} 👋</h1>
            <p>{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </motion.div>

        {/* Below-75 warning */}
        {overallPct < 75 && (
          <motion.div variants={fadeUp} custom={0.5}
            style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.30)', borderRadius: 'var(--r-lg)', padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}
          >
            <AlertTriangle size={20} color="var(--danger)" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.9rem' }}>Attendance Alert</div>
              <div style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Your overall attendance is {overallPct}% — below the 75% minimum. You may be barred from exams.</div>
            </div>
          </motion.div>
        )}

        {/* Hero row */}
        <div className="grid-3" style={{ marginBottom: 24 }}>
          {/* Attendance Donut */}
          <motion.div variants={fadeUp} custom={1} className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', marginBottom: 8 }}>Overall Attendance</h3>
            <AttendanceDonut pct={overallPct} />
          </motion.div>

          {/* Today's classes timeline */}
          <motion.div variants={fadeUp} custom={2} className="glass-card" style={{ padding: 24, gridColumn: 'span 2' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', marginBottom: 20 }}>Today's Timetable</h3>
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
              {TODAY_CLASSES.map((c, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', minWidth: 150, position: 'relative' }}>
                  {i > 0 && <div style={{ position: 'absolute', top: 20, left: -8, right: 0, height: 2, background: 'var(--border-subtle)', zIndex: 0 }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: c.status === 'present' ? 'rgba(52,211,153,0.15)' : 'rgba(108,142,255,0.15)', border: `2px solid ${c.status === 'present' ? 'var(--success)' : 'var(--accent-primary)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, position: 'relative' }}>
                      {c.status === 'present' ? <CheckCircle size={18} color="var(--success)" /> : <Clock size={18} color="var(--accent-primary)" />}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.time}</span>
                  </div>
                  <div style={{ paddingLeft: 4 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{c.course}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.room}</div>
                    <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600, background: c.status === 'present' ? 'rgba(52,211,153,0.12)' : 'rgba(108,142,255,0.12)', color: c.status === 'present' ? 'var(--success)' : 'var(--accent-primary)' }}>
                      {c.status === 'present' ? 'Present' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Subject-wise bars */}
        <motion.div variants={fadeUp} custom={3} className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 20 }}>Subject-wise Attendance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {SUBJECTS.map((s, i) => (
              <motion.div key={s.code} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginRight: 8 }}>{s.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.code}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.attended}/{s.total} classes</span>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: s.pct >= 85 ? 'var(--success)' : s.pct >= 75 ? 'var(--warning)' : 'var(--danger)' }}>{s.pct}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <motion.div className={`progress-fill ${s.pct >= 85 ? 'high' : s.pct >= 75 ? 'medium' : 'low'}`}
                    initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={fadeUp} custom={4} className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 16 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ACTIVITY.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={a.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 2 }}>{a.text}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}