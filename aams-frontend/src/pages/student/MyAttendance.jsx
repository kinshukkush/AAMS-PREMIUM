import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, Download, Filter,
  CheckCircle, XCircle, Clock, List, Grid, Info
} from 'lucide-react';
import { fadeUp, stagger } from '../../utils/animations';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const generateCalendarData = () => {
  const d = {};
  for (let day = 1; day <= 30; day++) {
    const r = Math.random();
    d[day] = r > 0.85 ? 'holiday' : r > 0.15 ? 'present' : r > 0.05 ? 'absent' : 'pending';
  }
  return d;
};

const CAL_DATA = generateCalendarData();

const STATUS_CONFIG = {
  present: { color: '#34D399', bg: 'rgba(52,211,153,0.20)', label: 'Present', icon: CheckCircle },
  absent:  { color: '#F87171', bg: 'rgba(248,113,113,0.20)', label: 'Absent',  icon: XCircle },
  holiday: { color: '#FBBF24', bg: 'rgba(251,191,36,0.20)',  label: 'Holiday', icon: Clock },
  pending: { color: '#9BA3B8', bg: 'rgba(155,163,184,0.10)', label: 'No class',icon: null },
};

const CLASSES_BY_DAY = {
  5:  [{ course: 'Data Structures', time: '09:00', status: 'present', faculty: 'Dr. Singh' }],
  7:  [{ course: 'Mathematics III', time: '11:00', status: 'absent',  faculty: 'Prof. Mehta' },{ course: 'DBMS', time: '14:00', status: 'present', faculty: 'Dr. Patel' }],
  12: [{ course: 'Computer Networks', time: '09:00', status: 'present', faculty: 'Prof. Kumar' }],
};

export default function MyAttendance() {
  const [month, setMonth]       = useState(3);  // April
  const [year]                  = useState(2026);
  const [view, setView]         = useState('calendar'); // 'calendar' | 'list'
  const [selectedDay, setDay]   = useState(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });

  const daysInMonth = 30;
  const firstDayOfWeek = 2; // Tuesday
  const presentCount = Object.values(CAL_DATA).filter(v => v === 'present').length;
  const absentCount  = Object.values(CAL_DATA).filter(v => v === 'absent').length;
  const pct = Math.round((presentCount / (presentCount + absentCount)) * 100);

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
          { label: 'Classes Attended', value: presentCount, color: '#34D399', suffix: '' },
          { label: 'Classes Missed',   value: absentCount,  color: '#F87171', suffix: '' },
          { label: 'Attendance Rate',  value: pct,          color: pct >= 85 ? '#34D399' : pct >= 75 ? '#FBBF24' : '#F87171', suffix: '%' },
          { label: 'Holidays',         value: Object.values(CAL_DATA).filter(v => v === 'holiday').length, color: '#FBBF24', suffix: '' },
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
          <button id="btn-prev-month" className="btn btn-secondary btn-sm" onClick={() => setMonth(m => Math.max(0, m-1))}><ChevronLeft size={16} /></button>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }}>{MONTHS[month]} {year}</h3>
          <button id="btn-next-month" className="btn btn-secondary btn-sm" onClick={() => setMonth(m => Math.min(11, m+1))}><ChevronRight size={16} /></button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={`${month}-${view}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {view === 'calendar' ? (
              <>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
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