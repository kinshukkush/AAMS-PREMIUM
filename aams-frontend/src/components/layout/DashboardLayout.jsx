import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, Calendar, BarChart2, Bell,
  Monitor, LogOut, GraduationCap, ChevronLeft, ChevronRight,
  User, ClipboardList, TrendingUp, Heart, ScanFace, FileText,
  Settings, Menu, X, QrCode, Eye, Home, CheckCircle,
} from 'lucide-react';
import { fadeUp, stagger, slideRight } from '../../utils/animations';

/* ─── Navigation Config ─────────────────────────────────────────────── */
const NAV_CONFIG = {
  admin: [
    { section: 'Overview', items: [
      { path: '/admin/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'Management', items: [
      { path: '/admin/users',            icon: Users,           label: 'Users' },
      { path: '/admin/departments',      icon: BookOpen,        label: 'Departments & Courses' },
      { path: '/admin/timetable',        icon: Calendar,        label: 'Timetable' },
      { path: '/admin/devices',          icon: Monitor,         label: 'Device Management' },
      { path: '/admin/face-registration',icon: ScanFace,        label: 'Face Registration' },
    ]},
    { section: 'Reports & Comms', items: [
      { path: '/admin/reports',          icon: BarChart2,       label: 'Attendance Reports' },
      { path: '/admin/notifications',    icon: Bell,            label: 'Notifications' },
    ]},
  ],
  faculty: [
    { section: 'Overview', items: [
      { path: '/faculty/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/faculty/timetable',      icon: Calendar,        label: 'My Timetable' },
    ]},
    { section: 'Attendance', items: [
      { path: '/faculty/mark-attendance',icon: ScanFace,        label: 'Mark Attendance' },
      { path: '/faculty/reports',        icon: ClipboardList,   label: 'Class Reports' },
    ]},
    { section: 'Analytics', items: [
      { path: '/faculty/analytics',      icon: TrendingUp,      label: 'Student Analytics' },
    ]},
  ],
  student: [
    { section: 'Overview', items: [
      { path: '/student/dashboard',      icon: Home,            label: 'Dashboard' },
    ]},
    { section: 'My Records', items: [
      { path: '/student/attendance',     icon: CheckCircle,     label: 'My Attendance' },
      { path: '/student/profile',        icon: User,            label: 'Profile' },
    ]},
    { section: 'Updates', items: [
      { path: '/student/notifications',  icon: Bell,            label: 'Notifications', badge: true },
    ]},
  ],
  parent: [
    { section: 'Overview', items: [
      { path: '/parent/dashboard',       icon: Home,            label: 'Dashboard' },
    ]},
    { section: "Child's Records", items: [
      { path: '/parent/attendance',      icon: FileText,        label: 'Attendance Details' },
      { path: '/parent/profile',         icon: Heart,           label: 'Profile' },
    ]},
  ],
};

const ROLE_GRADIENTS = {
  admin:   'linear-gradient(135deg,#F87171,#EC4899)',
  faculty: 'linear-gradient(135deg,#A78BFA,#7C3AED)',
  student: 'linear-gradient(135deg,#6C8EFF,#60A5FA)',
  parent:  'linear-gradient(135deg,#34D399,#059669)',
};

/* ─── DashboardLayout ───────────────────────────────────────────────── */
export default function DashboardLayout({ role }) {
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifCount, setNotifCount]   = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New session started', body: 'Math 101 session is now active', time: '2m ago', read: false },
    { id: 2, title: 'Attendance report ready', body: 'Weekly report for CSE-A is available', time: '1h ago', read: false },
    { id: 3, title: 'Low attendance alert', body: '3 students below 75% threshold', time: '3h ago', read: true },
  ]);

  const { user, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const notifRef   = useRef(null);

  const navSections   = NAV_CONFIG[role] || [];
  const roleGradient  = ROLE_GRADIENTS[role];

  const currentPageLabel = navSections
    .flatMap(s => s.items)
    .find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard';

  /* Close notif panel on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const markAllRead = () => {
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setNotifCount(0);
  };

  const dismissNotif = (id) => {
    setNotifications(n => n.filter(x => x.id !== id));
    setNotifCount(c => Math.max(0, c - 1));
  };

  return (
    <div className="app-layout bg-mesh">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon glow-pulse">
            <GraduationCap size={18} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <h2>AAMS</h2>
            <span>LPU Platform</span>
          </div>
        </div>

        {/* User card */}
        {!collapsed && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar" style={{ background: roleGradient, width: 34, height: 34, fontSize: '0.8rem', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <span className={`badge role-${role}`} style={{ padding: '1px 8px', fontSize: '0.65rem' }}>{role}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            {navSections.map((section, si) => (
              <div key={section.section}>
                <div className="sidebar-section-label">{section.section}</div>
                {section.items.map((item, ii) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.path} variants={slideRight} custom={si * 4 + ii}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="nav-item-icon" size={18} />
                        <span className="nav-item-label">{item.label}</span>
                        {item.badge && notifCount > 0 && (
                          <span className="nav-badge">{notifCount}</span>
                        )}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        </nav>

        {/* Sidebar footer */}
        <div className="sidebar-footer">
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
          >
            <LogOut className="nav-item-icon" size={18} />
            <span className="nav-item-label">Sign Out</span>
          </button>
          {!collapsed && (
            <button
              className="nav-item"
              onClick={() => setCollapsed(true)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
            >
              <ChevronLeft className="nav-item-icon" size={18} />
              <span className="nav-item-label">Collapse</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
        <header className="topbar">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => collapsed ? setCollapsed(false) : setMobileOpen(!mobileOpen)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
          </button>

          {/* Breadcrumb */}
          <div className="topbar-title">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: 6, textTransform: 'capitalize' }}>
              {role}
            </span>
            <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>/</span>
            <span>{currentPageLabel}</span>
          </div>

          <div className="topbar-actions">
            {/* Notification bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                className="topbar-icon-btn"
                onClick={() => setNotifOpen(o => !o)}
                aria-label="Notifications"
                id="notif-bell-btn"
              >
                <Bell size={17} />
                {notifCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: 'var(--danger)', color: 'white',
                    borderRadius: '99px', fontSize: '0.6rem', fontWeight: 700,
                    padding: '1px 5px', minWidth: 16, textAlign: 'center',
                    border: '2px solid var(--bg-base)'
                  }}>{notifCount}</span>
                )}
              </button>

              {/* Notification panel */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
                    transition={{ duration: 0.22 }}
                    className="notification-panel"
                    style={{ transformOrigin: 'top right' }}
                  >
                    <div className="notification-panel-header">
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
                        Notifications
                        {notifCount > 0 && <span className="badge badge-danger" style={{ marginLeft: 8 }}>{notifCount}</span>}
                      </span>
                      <button
                        onClick={markAllRead}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 500 }}
                      >
                        Mark all read
                      </button>
                    </div>

                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <Bell size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                          <p style={{ fontSize: '0.875rem' }}>No notifications</p>
                        </div>
                      ) : notifications.map(n => (
                        <div key={n.id} style={{
                          padding: '12px 20px', display: 'flex', gap: 12, alignItems: 'flex-start',
                          background: n.read ? 'transparent' : 'rgba(108,142,255,0.05)',
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer', transition: 'background 0.15s'
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'transparent' : 'var(--accent-primary)', marginTop: 6, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 2 }}>{n.title}</div>
                            <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 4 }}>{n.body}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); dismissNotif(n.id); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, flexShrink: 0 }}
                            aria-label="Dismiss notification"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <button
                        onClick={() => { setNotifOpen(false); navigate(`/${role}/notifications`); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 500 }}
                      >
                        View all notifications →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div
              className="avatar"
              style={{ background: roleGradient }}
              onClick={() => navigate(`/${role}/profile`)}
              title={user?.name}
              role="button"
              aria-label="User profile"
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}