import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Filter, Search } from 'lucide-react';
import { fadeUp, stagger } from '../../utils/animations';
import toast from 'react-hot-toast';

const TYPE_COLORS = { info: '#6C8EFF', success: '#34D399', warning: '#FBBF24', danger: '#F87171', announcement: '#A78BFA' };
const TYPE_BG     = { info: 'rgba(108,142,255,0.08)', success: 'rgba(52,211,153,0.08)', warning: 'rgba(251,191,36,0.08)', danger: 'rgba(248,113,113,0.08)', announcement: 'rgba(167,139,250,0.08)' };

const MOCK_NOTIFS = [
  { id: 1, title: 'Low Attendance Alert',     body: 'Your attendance in OS Concepts has fallen to 70%. Minimum required is 75%.', type: 'danger',       time: '10m ago', read: false },
  { id: 2, title: 'Session Started',          body: 'Data Structures session is now active. Mark your attendance within 10 minutes.', type: 'success',  time: '1h ago',  read: false },
  { id: 3, title: 'Assignment Reminder',      body: 'DBMS assignment submission deadline is tomorrow at 11:59 PM.',                   type: 'warning', time: '3h ago',  read: false },
  { id: 4, title: 'Exam Schedule Released',   body: 'End semester examination schedule is now available. Check the portal.', type: 'announcement', time: '1d ago', read: true },
  { id: 5, title: 'Holiday Announcement',     body: 'No classes on April 14th (Dr. Ambedkar Jayanti). Classes resume April 15th.', type: 'info', time: '2d ago', read: true },
  { id: 6, title: 'Result Published',         body: 'Mid-semester results for Mathematics III have been published.', type: 'info', time: '3d ago', read: true },
];

export default function StudentNotifications() {
  const [notifs, setNotifs]         = useState(MOCK_NOTIFS);
  const [filter, setFilter]         = useState('all'); // all | unread
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch]         = useState('');

  const displayed = notifs
    .filter(n => filter === 'all' || !n.read)
    .filter(n => typeFilter === 'all' || n.type === typeFilter)
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()));

  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead   = (id) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => { setNotifs(ns => ns.map(n => ({ ...n, read: true }))); toast.success('All notifications marked as read'); };
  const deleteNotif = (id) => { setNotifs(ns => ns.filter(n => n.id !== id)); toast.success('Notification dismissed'); };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Notifications</h1>
          <p>Stay updated with your attendance alerts and announcements</p>
        </div>
        {unreadCount > 0 && (
          <button id="btn-mark-all-read" className="btn btn-secondary" onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass-card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} color="var(--text-muted)" />
          <input id="notif-search" type="text" placeholder="Search notifications..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all','unread'].map(f => (
            <button key={f} id={`filter-${f}`} onClick={() => setFilter(f)} className="btn btn-sm"
              style={{ background: filter === f ? 'var(--accent-primary)' : 'var(--bg-elevated)', color: filter === f ? 'white' : 'var(--text-secondary)', border: filter === f ? 'none' : '1px solid var(--border-default)' }}>
              {f === 'all' ? 'All' : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all','danger','warning','success','info','announcement'].map(t => (
            <button key={t} id={`type-filter-${t}`} onClick={() => setTypeFilter(t)} className="btn btn-sm"
              style={{ background: typeFilter === t ? (TYPE_COLORS[t] || 'var(--accent-primary)') : 'var(--bg-elevated)', color: typeFilter === t ? 'white' : 'var(--text-secondary)', border: typeFilter === t ? 'none' : '1px solid var(--border-default)', fontSize: '0.72rem' }}>
              {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notification list */}
      <motion.div variants={stagger} initial="hidden" animate="visible">
        <AnimatePresence>
          {displayed.length === 0 ? (
            <motion.div variants={fadeUp} className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Bell size={48} style={{ marginBottom: 16, opacity: 0.3, marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', marginBottom: 8 }}>No notifications</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>You're all caught up!</p>
            </motion.div>
          ) : displayed.map((n, i) => (
            <motion.div key={n.id} variants={fadeUp} custom={i}
              layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ marginBottom: 10, padding: '16px 20px', background: n.read ? 'var(--bg-surface)' : TYPE_BG[n.type] || TYPE_BG.info, border: `1px solid ${n.read ? 'var(--border-subtle)' : (TYPE_COLORS[n.type] || '#6C8EFF') + '30'}`,
                borderRadius: 'var(--r-lg)', display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => !n.read && markRead(n.id)}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'transparent' : (TYPE_COLORS[n.type] || 'var(--accent-primary)'), marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginRight: 8 }}>{n.title}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600, background: `${TYPE_COLORS[n.type] || '#6C8EFF'}18`, color: TYPE_COLORS[n.type] || '#6C8EFF' }}>{n.type}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{n.time}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{n.body}</p>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {!n.read && (
                  <button id={`mark-read-${n.id}`} onClick={e => { e.stopPropagation(); markRead(n.id); }} className="btn btn-ghost btn-icon" title="Mark as read" aria-label="Mark as read" style={{ color: 'var(--success)' }}>
                    <Check size={15} />
                  </button>
                )}
                <button id={`dismiss-${n.id}`} onClick={e => { e.stopPropagation(); deleteNotif(n.id); }} className="btn btn-ghost btn-icon" title="Dismiss" aria-label="Dismiss notification" style={{ color: 'var(--danger)' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
