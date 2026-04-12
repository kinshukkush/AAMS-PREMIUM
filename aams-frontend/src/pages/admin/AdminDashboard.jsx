import { useState, useEffect, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Activity, Calendar, AlertTriangle, TrendingUp, TrendingDown,
  Plus, UserPlus, FileText, Send, BarChart2, RefreshCw, Zap
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { fadeUp, scaleIn, stagger } from '../../utils/animations';

/* ─── Mock Data ─────────────────────────────────────────────────── */
const WEEKLY = [
  { day: 'Mon', attendance: 88, sessions: 12 },
  { day: 'Tue', attendance: 92, sessions: 14 },
  { day: 'Wed', attendance: 79, sessions: 11 },
  { day: 'Thu', attendance: 94, sessions: 15 },
  { day: 'Fri', attendance: 86, sessions: 13 },
  { day: 'Sat', attendance: 71, sessions: 8 },
  { day: 'Sun', attendance: 0,  sessions: 0 },
];

const DEPT_DATA = [
  { name: 'CSE',    value: 34, color: '#6C8EFF' },
  { name: 'ECE',    value: 22, color: '#A78BFA' },
  { name: 'MBA',    value: 18, color: '#34D399' },
  { name: 'MECH',   value: 16, color: '#FBBF24' },
  { name: 'CIVIL',  value: 10, color: '#F87171' },
];

const LIVE_SESSIONS = [
  { id: 1, course: 'Data Structures (CSE-301)', faculty: 'Dr. Singh', room: 'LH-204', students: 42, present: 38, method: 'face', status: 'active' },
  { id: 2, course: 'Mathematics (MA-101)',      faculty: 'Prof. Mehta', room: 'LH-102', students: 58, present: 51, method: 'qr',   status: 'active' },
  { id: 3, course: 'Physics Lab (PH-203)',      faculty: 'Dr. Patel',  room: 'Lab-3',  students: 28, present: 25, method: 'manual',status: 'active' },
];

const NOTIFICATIONS = [
  { id: 1, type: 'warning', msg: '5 students below 75% attendance in CSE-A',  time: '2m ago' },
  { id: 2, type: 'info',    msg: 'New session started: Data Structures Lab',    time: '8m ago' },
  { id: 3, type: 'success', msg: 'Face registration completed for 12 students', time: '31m ago' },
  { id: 4, type: 'danger',  msg: '3 consecutive absences — Student ID LPU4421', time: '1h ago' },
];

const HEATMAP_HOURS = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);
const HEATMAP_DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat'];

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ label, value, unit = '', icon: Icon, color, trend, trendDir, custom }) {
  const count = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <motion.div variants={fadeUp} custom={custom} className="stat-card glass-card" style={{ borderTop: `2px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: trendDir === 'up' ? 'var(--success)' : 'var(--danger)', fontSize: '0.75rem', fontWeight: 600 }}>
            {trendDir === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>
        {count}{unit}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: '0.875rem', fontWeight: 600, color: p.color || 'var(--text-primary)' }}>
          {p.name}: {p.value}{p.name === 'attendance' ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [fabOpen, setFabOpen]     = useState(false);
  const [refreshing, setRefresh]  = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = () => {
    setRefresh(true);
    setTimeout(() => { setRefresh(false); setLastUpdate(new Date()); }, 1200);
  };

  const FAB_ACTIONS = [
    { icon: UserPlus, label: 'Add User',         color: '#6C8EFF', onClick: () => navigate('/admin/users') },
    { icon: Calendar, label: 'Create Session',   color: '#A78BFA', onClick: () => navigate('/admin/timetable') },
    { icon: FileText, label: 'Generate Report',  color: '#34D399', onClick: () => navigate('/admin/reports') },
    { icon: Send,     label: 'Send Notification',color: '#FBBF24', onClick: () => navigate('/admin/notifications') },
  ];

  const heatmapValue = (day, hour) => {
    const base = WEEKLY.find(w => w.day === day)?.attendance ?? 0;
    return Math.max(0, Math.min(100, base + (hour - 8) * 3 - 10 + Math.random() * 20));
  };

  const heatmapColor = (v) => {
    if (v > 85) return 'rgba(52,211,153,0.75)';
    if (v > 70) return 'rgba(251,191,36,0.65)';
    if (v > 0)  return 'rgba(248,113,113,0.60)';
    return 'var(--bg-elevated)';
  };

  return (
    <div>
      {/* ── Page header ── */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="page-header">
        <motion.div variants={fadeUp} className="page-header-left">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's your system overview for today.</p>
        </motion.div>
        <motion.div variants={fadeUp} custom={1} style={{ display: 'flex', gap: 10 }}>
          <button id="btn-refresh" className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button id="btn-goto-reports" className="btn btn-primary" onClick={() => navigate('/admin/reports')}>
            <BarChart2 size={15} /> View Reports
          </button>
        </motion.div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div className="stats-grid" variants={stagger} initial="hidden" animate="visible">
        <StatCard label="Total Students" value={12840} icon={Users}          color="#6C8EFF" trend="+4.2%" trendDir="up"   custom={0} />
        <StatCard label="Active Sessions" value={3}   icon={Activity}        color="#A78BFA" trend="Live"  trendDir="up"   custom={1} />
        <StatCard label="Today's Attendance" value={87} unit="%" icon={TrendingUp}  color="#34D399" trend="+2.1%" trendDir="up" custom={2} />
        <StatCard label="Flagged Absences" value={47}  icon={AlertTriangle}  color="#F87171" trend="+5"    trendDir="down" custom={3} />
      </motion.div>

      {/* ── Charts Row ── */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {/* Weekly Attendance Trend */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" className="glass-card" style={{ gridColumn: 'span 2', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Weekly Attendance Trend</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last 7 days • Updated {lastUpdate.toLocaleTimeString()}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={WEEKLY}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6C8EFF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6C8EFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[60, 100]} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="attendance" name="attendance" stroke="#6C8EFF" strokeWidth={2.5} fill="url(#attGrad)" dot={{ fill: '#6C8EFF', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Donut */}
        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible" className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>Department Split</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={DEPT_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {DEPT_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEPT_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Heatmap ── */}
      <motion.div variants={fadeUp} custom={6} initial="hidden" animate="visible" className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Peak Hours Heatmap</h3>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${HEATMAP_HOURS.length},1fr)`, gap: 4, minWidth: 600 }}>
            <div />
            {HEATMAP_HOURS.map(h => (
              <div key={h} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: 4 }}>{h}</div>
            ))}
            {HEATMAP_DAYS.map(day => (
              <Fragment key={day}>
                <div key={`${day}-label`} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>{day}</div>
                {HEATMAP_HOURS.map(hour => {
                  const val = WEEKLY.find(w => w.day === day)?.attendance ?? 0;
                  const adjusted = Math.floor(val * (0.7 + Math.random() * 0.6));
                  return (
                    <div key={`${day}-${hour}`} title={`${day} ${hour}: ~${adjusted}% attendance`}
                      style={{ height: 28, borderRadius: 4, background: heatmapColor(adjusted), cursor: 'pointer', transition: 'opacity 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {[['> 85%','rgba(52,211,153,0.75)','High'],['70–85%','rgba(251,191,36,0.65)','Medium'],['< 70%','rgba(248,113,113,0.60)','Low'],['No class','var(--bg-elevated)','None']].map(([label, color, desc]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: color }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc} ({label})</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Live Sessions + Notifications ── */}
      <div className="grid-2">
        {/* Live Sessions */}
        <motion.div variants={fadeUp} custom={7} initial="hidden" animate="visible" className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Live Active Sessions</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-refreshes every 30s</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'glow-pulse 1.5s infinite' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          {LIVE_SESSIONS.map(s => (
            <div key={s.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.course}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.faculty} · {s.room}</div>
                </div>
                <span className="badge badge-success" style={{ flexShrink: 0, marginLeft: 8 }}>{s.method}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-fill high" style={{ width: `${(s.present / s.students) * 100}%` }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {s.present}/{s.students}
                </span>
              </div>
            </div>
          ))}
          <button id="btn-all-sessions" className="btn btn-ghost" style={{ width: '100%', marginTop: 12, justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => navigate('/admin/reports')}>
            View all sessions →
          </button>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={fadeUp} custom={8} initial="hidden" animate="visible" className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Recent Alerts</h3>
            <button id="btn-goto-notifications" className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/notifications')}>View all</button>
          </div>
          {NOTIFICATIONS.map(n => (
            <div key={n.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: n.type === 'warning' ? 'var(--warning)' : n.type === 'success' ? 'var(--success)' : n.type === 'danger' ? 'var(--danger)' : 'var(--info)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>{n.msg}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── FAB ── */}
      <div className="fab">
        <motion.div
          animate={fabOpen ? { rotate: 45 } : { rotate: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'contents' }}
        >
          <button id="fab-main-btn" className="fab-main" onClick={() => setFabOpen(o => !o)} aria-label="Quick actions">
            <Plus size={24} />
          </button>
        </motion.div>

        <AnimatePresence>
          {fabOpen && (
            <motion.div
              className="fab-actions"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={stagger}
            >
              {FAB_ACTIONS.map((a, i) => (
                <motion.div
                  key={a.label}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } }}
                  className="fab-action"
                >
                  <span className="fab-action-label">{a.label}</span>
                  <button
                    id={`fab-action-${a.label.toLowerCase().replace(/\s+/g,'-')}`}
                    className="fab-action-btn"
                    onClick={() => { a.onClick(); setFabOpen(false); }}
                    style={{ borderColor: `${a.color}40`, color: a.color }}
                    aria-label={a.label}
                  >
                    <a.icon size={18} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
