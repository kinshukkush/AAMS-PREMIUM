import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, Download, Filter,
  CheckCircle, XCircle, Clock, List, Grid, Info
} from 'lucide-react';
import { fadeUp, stagger } from '../../utils/animations';
import toast from 'react-hot-toast';
import { attendanceAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_CONFIG = {
  present: { color: '#34D399', bg: 'rgba(52,211,153,0.20)', label: 'Present', icon: CheckCircle },
  absent: { color: '#F87171', bg: 'rgba(248,113,113,0.20)', label: 'Absent', icon: XCircle },
  holiday: { color: '#FBBF24', bg: 'rgba(251,191,36,0.20)', label: 'Holiday', icon: Clock },
  pending: { color: '#9BA3B8', bg: 'rgba(155,163,184,0.10)', label: 'No class', icon: null },
};

export default function MyAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, percentage: 0 });
  const [month, setMonth] = useState(new Date().getMonth());
  const [year] = useState(new Date().getFullYear());
  const [view, setView] = useState('calendar');
  const [selectedDay, setDay] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await attendanceAPI.getStudentAttendance(user._id);
      if (res.success) {
        setRecords(res.data.records);
        // Calculate stats
        const p = res.data.records.filter(r => r.status === 'present').length;
        const a = res.data.records.filter(r => r.status === 'absent').length;
        const l = res.data.records.filter(r => r.status === 'late').length;
        const total = p + a + l;
        setStats({
          present: p,
          absent: a,
          late: l,
          percentage: total > 0 ? Math.round(((p + l) / total) * 100) : 0
        });
      }
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Map records to calendar
  const CAL_DATA = {};
  records.forEach(r => {
    const d = new Date(r.date);
    if (d.getMonth() === month && d.getFullYear() === year) {
      CAL_DATA[d.getDate()] = r.status;
    }
  });

  const CLASSES_BY_DAY = {};
  records.forEach(r => {
    const d = new Date(r.date);
    const day = d.getDate();
    if (!CLASSES_BY_DAY[day]) CLASSES_BY_DAY[day] = [];
    CLASSES_BY_DAY[day].push({
      course: r.course?.name || 'Unknown Course',
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: r.status,
      faculty: r.markedBy?.name || 'System'
    });
  });

  const handleDayClick = (day, e) => {
    if (!CAL_DATA[day] || CAL_DATA[day] === 'pending') return;
    setDay(day === selectedDay ? null : day);
  };

  const handleDownload = () => {
    toast.success('Attendance PDF downloading...');
    setTimeout(() => toast.success('PDF saved!'), 1500);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Attendance</h1>
          <p>Track your class-wise attendance history</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button id="btn-download-pdf" className="btn btn-secondary" onClick={handleDownload}><Download size={15} /> Download PDF</button>
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 3, border: '1px solid var(--border-default)' }}>
            <button id="btn-calendar-view" onClick={() => setView('calendar')} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', background: view === 'calendar' ? 'var(--bg-surface)' : 'transparent', color: view === 'calendar' ? 'var(--accent-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', transition: 'all 0.2s' }}>
              <Grid size={14} /> Calendar
            </button>
            <button id="btn-list-view" onClick={() => setView('list')} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', background: view === 'list' ? 'var(--bg-surface)' : 'transparent', color: view === 'list' ? 'var(--accent-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', transition: 'all 0.2s' }}>
              <List size={14} /> List
            </button>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Classes Attended', value: stats.present, color: '#34D399', suffix: '' },
          { label: 'Classes Missed', value: stats.absent, color: '#F87171', suffix: '' },
          { label: 'Attendance Rate', value: stats.percentage, color: stats.percentage >= 85 ? '#34D399' : stats.percentage >= 75 ? '#FBBF24' : '#F87171', suffix: '%' },
          { label: 'Late Arrivals', value: stats.late, color: '#A78BFA', suffix: '' },
        ].map((s, i) => (
          <motion.div key={s.label} variants={fadeUp} custom={i} className="stat-card glass-card" style={{ borderTop: `2px solid ${s.color}` }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: s.color, marginBottom: 4 }}>{s.value}{s.suffix}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Month nav */}
      <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button id="btn-prev-month" className="btn btn-secondary btn-sm" onClick={() => setMonth(m => Math.max(0, m - 1))}><ChevronLeft size={16} /></button>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }}>{MONTHS[month]} {year}</h3>
          <button id="btn-next-month" className="btn btn-secondary btn-sm" onClick={() => setMonth(m => Math.min(11, m + 1))}><ChevronRight size={16} /></button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={`${month}-${view}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {view === 'calendar' ? (
              <>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', padding: '6px 0' }}>{d}</div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const status = CAL_DATA[day] || 'pending';
                    const cfg = STATUS_CONFIG[status];
                    return (
                      <button
                        key={day}
                        id={`cal-day-${day}`}
                        onClick={(e) => handleDayClick(day, e)}
                        style={{
                          aspectRatio: '1', borderRadius: 8, border: selectedDay === day ? `2px solid ${cfg.color}` : '2px solid transparent',
                          background: cfg.bg, cursor: status !== 'pending' ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexDirection: 'column', gap: 2, transition: 'all 0.15s',
                          transform: selectedDay === day ? 'scale(1.08)' : 'scale(1)',
                        }}
                      >
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: cfg.color }}>{day}</span>
                        {status !== 'pending' && <div style={{ width: 4, height: 4, borderRadius: '50%', background: cfg.color }} />}
                      </button>
                    );
                  })}
                </div>

                {/* Day detail popover */}
                <AnimatePresence>
                  {selectedDay && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      style={{ marginTop: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-lg)', padding: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
                          {MONTHS[month]} {selectedDay}, {year}
                        </h4>
                        <button onClick={() => setDay(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                      </div>
                      {(CLASSES_BY_DAY[selectedDay] || [{ course: 'No class data available', time: '', status: CAL_DATA[selectedDay] }]).map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < (CLASSES_BY_DAY[selectedDay]?.length - 1) ? '1px solid var(--border-subtle)' : 'none' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_CONFIG[c.status]?.color || 'var(--text-muted)', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{c.course}</div>
                            {c.faculty && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.faculty} · {c.time}</div>}
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: STATUS_CONFIG[c.status]?.color || 'var(--text-muted)', textTransform: 'capitalize' }}>{c.status}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: v.color }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{v.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* List view */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(CAL_DATA).filter(([, v]) => v !== 'pending').map(([day, status]) => {
                  const cfg = STATUS_CONFIG[status];
                  const Icon = cfg.icon;
                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: cfg.bg, borderRadius: 'var(--r-md)', border: `1px solid ${cfg.color}30` }}>
                      {Icon && <Icon size={16} color={cfg.color} />}
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{MONTHS[month]} {day}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 600, fontSize: '0.78rem', color: cfg.color }}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}