// import { useState, useRef, useEffect } from 'react';
// import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '../../context/AuthContext';
// import {
//   LayoutDashboard, Users, BookOpen, Calendar, BarChart2, Bell,
//   Monitor, LogOut, GraduationCap, ChevronLeft, ChevronRight,
//   User, ClipboardList, TrendingUp, Heart, ScanFace, FileText,
//   Settings, Menu, X, QrCode, Eye, Home, CheckCircle,
// } from 'lucide-react';
// import { fadeUp, stagger, slideRight } from '../../utils/animations';

// /* ─── Navigation Config ─────────────────────────────────────────────── */
// const NAV_CONFIG = {
//   admin: [
//     { section: 'Overview', items: [
//       { path: '/admin/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
//     ]},
//     { section: 'Management', items: [
//       { path: '/admin/users',            icon: Users,           label: 'Users' },
//       { path: '/admin/departments',      icon: BookOpen,        label: 'Departments & Courses' },
//       { path: '/admin/timetable',        icon: Calendar,        label: 'Timetable' },
//       { path: '/admin/devices',          icon: Monitor,         label: 'Device Management' },
//       { path: '/admin/face-registration',icon: ScanFace,        label: 'Face Registration' },
//     ]},
//     { section: 'Reports & Comms', items: [
//       { path: '/admin/reports',          icon: BarChart2,       label: 'Attendance Reports' },
//       { path: '/admin/notifications',    icon: Bell,            label: 'Notifications' },
//     ]},
//   ],
//   faculty: [
//     { section: 'Overview', items: [
//       { path: '/faculty/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
//       { path: '/faculty/timetable',      icon: Calendar,        label: 'My Timetable' },
//     ]},
//     { section: 'Attendance', items: [
//       { path: '/faculty/mark-attendance',icon: ScanFace,        label: 'Mark Attendance' },
//       { path: '/faculty/reports',        icon: ClipboardList,   label: 'Class Reports' },
//     ]},
//     { section: 'Analytics', items: [
//       { path: '/faculty/analytics',      icon: TrendingUp,      label: 'Student Analytics' },
//     ]},
//   ],
//   student: [
//     { section: 'Overview', items: [
//       { path: '/student/dashboard',      icon: Home,            label: 'Dashboard' },
//     ]},
//     { section: 'My Records', items: [
//       { path: '/student/attendance',     icon: CheckCircle,     label: 'My Attendance' },
//       { path: '/student/profile',        icon: User,            label: 'Profile' },
//     ]},
//     { section: 'Updates', items: [
//       { path: '/student/notifications',  icon: Bell,            label: 'Notifications', badge: true },
//     ]},
//   ],
//   parent: [
//     { section: 'Overview', items: [
//       { path: '/parent/dashboard',       icon: Home,            label: 'Dashboard' },
//     ]},
//     { section: "Child's Records", items: [
//       { path: '/parent/attendance',      icon: FileText,        label: 'Attendance Details' },
//       { path: '/parent/profile',         icon: Heart,           label: 'Profile' },
//     ]},
//   ],
// };

// const ROLE_GRADIENTS = {
//   admin:   'linear-gradient(135deg,#F87171,#EC4899)',
//   faculty: 'linear-gradient(135deg,#A78BFA,#7C3AED)',
//   student: 'linear-gradient(135deg,#6C8EFF,#60A5FA)',
//   parent:  'linear-gradient(135deg,#34D399,#059669)',
// };

// /* ─── DashboardLayout ───────────────────────────────────────────────── */
// export default function DashboardLayout({ role }) {
//   const [collapsed, setCollapsed]     = useState(false);
//   const [mobileOpen, setMobileOpen]   = useState(false);
//   const [notifOpen, setNotifOpen]     = useState(false);
//   const [notifCount, setNotifCount]   = useState(3);
//   const [notifications, setNotifications] = useState([
//     { id: 1, title: 'New session started', body: 'Math 101 session is now active', time: '2m ago', read: false },
//     { id: 2, title: 'Attendance report ready', body: 'Weekly report for CSE-A is available', time: '1h ago', read: false },
//     { id: 3, title: 'Low attendance alert', body: '3 students below 75% threshold', time: '3h ago', read: true },
//   ]);

//   const { user, logout } = useAuth();
//   const navigate   = useNavigate();
//   const location   = useLocation();
//   const notifRef   = useRef(null);

//   const navSections   = NAV_CONFIG[role] || [];
//   const roleGradient  = ROLE_GRADIENTS[role];

//   const currentPageLabel = navSections
//     .flatMap(s => s.items)
//     .find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard';

//   /* Close notif panel on outside click */
//   useEffect(() => {
//     const handler = (e) => {
//       if (notifRef.current && !notifRef.current.contains(e.target)) {
//         setNotifOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const handleLogout = () => { logout(); navigate('/login'); };

//   const markAllRead = () => {
//     setNotifications(n => n.map(x => ({ ...x, read: true })));
//     setNotifCount(0);
//   };

//   const dismissNotif = (id) => {
//     setNotifications(n => n.filter(x => x.id !== id));
//     setNotifCount(c => Math.max(0, c - 1));
//   };

//   return (
//     <div className="app-layout bg-mesh">
//       {/* Mobile overlay */}
//       <AnimatePresence>
//         {mobileOpen && (
//           <motion.div
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, backdropFilter: 'blur(4px)' }}
//             onClick={() => setMobileOpen(false)}
//           />
//         )}
//       </AnimatePresence>

//       {/* ── Sidebar ── */}
//       <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
//         {/* Logo */}
//         <div className="sidebar-logo">
//           <div className="sidebar-logo-icon glow-pulse">
//             <GraduationCap size={18} color="white" />
//           </div>
//           <div className="sidebar-logo-text">
//             <h2>AAMS</h2>
//             <span>LPU Platform</span>
//           </div>
//         </div>

//         {/* User card */}
//         {!collapsed && (
//           <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
//             <div className="avatar" style={{ background: roleGradient, width: 34, height: 34, fontSize: '0.8rem', flexShrink: 0 }}>
//               {user?.name?.[0]?.toUpperCase() || 'U'}
//             </div>
//             <div style={{ overflow: 'hidden', flex: 1 }}>
//               <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                 {user?.name || 'User'}
//               </div>
//               <span className={`badge role-${role}`} style={{ padding: '1px 8px', fontSize: '0.65rem' }}>{role}</span>
//             </div>
//           </div>
//         )}

//         {/* Navigation */}
//         <nav className="sidebar-nav">
//           <motion.div variants={stagger} initial="hidden" animate="visible">
//             {navSections.map((section, si) => (
//               <div key={section.section}>
//                 <div className="sidebar-section-label">{section.section}</div>
//                 {section.items.map((item, ii) => {
//                   const Icon = item.icon;
//                   return (
//                     <motion.div key={item.path} variants={slideRight} custom={si * 4 + ii}>
//                       <NavLink
//                         to={item.path}
//                         className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
//                         onClick={() => setMobileOpen(false)}
//                         title={collapsed ? item.label : undefined}
//                       >
//                         <Icon className="nav-item-icon" size={18} />
//                         <span className="nav-item-label">{item.label}</span>
//                         {item.badge && notifCount > 0 && (
//                           <span className="nav-badge">{notifCount}</span>
//                         )}
//                       </NavLink>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             ))}
//           </motion.div>
//         </nav>

//         {/* Sidebar footer */}
//         <div className="sidebar-footer">
//           <button
//             className="nav-item"
//             onClick={handleLogout}
//             style={{ width: '100%', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
//           >
//             <LogOut className="nav-item-icon" size={18} />
//             <span className="nav-item-label">Sign Out</span>
//           </button>
//           {!collapsed && (
//             <button
//               className="nav-item"
//               onClick={() => setCollapsed(true)}
//               style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
//             >
//               <ChevronLeft className="nav-item-icon" size={18} />
//               <span className="nav-item-label">Collapse</span>
//             </button>
//           )}
//         </div>
//       </aside>

//       {/* ── Main Content ── */}
//       <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
//         {/* Header */}
//         <header className="topbar">
//           <button
//             className="btn btn-ghost btn-icon"
//             onClick={() => collapsed ? setCollapsed(false) : setMobileOpen(!mobileOpen)}
//             aria-label="Toggle sidebar"
//           >
//             {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
//           </button>

//           {/* Breadcrumb */}
//           <div className="topbar-title">
//             <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: 6, textTransform: 'capitalize' }}>
//               {role}
//             </span>
//             <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>/</span>
//             <span>{currentPageLabel}</span>
//           </div>

//           <div className="topbar-actions">
//             {/* Notification bell */}
//             <div ref={notifRef} style={{ position: 'relative' }}>
//               <button
//                 className="topbar-icon-btn"
//                 onClick={() => setNotifOpen(o => !o)}
//                 aria-label="Notifications"
//                 id="notif-bell-btn"
//               >
//                 <Bell size={17} />
//                 {notifCount > 0 && (
//                   <span style={{
//                     position: 'absolute', top: -4, right: -4,
//                     background: 'var(--danger)', color: 'white',
//                     borderRadius: '99px', fontSize: '0.6rem', fontWeight: 700,
//                     padding: '1px 5px', minWidth: 16, textAlign: 'center',
//                     border: '2px solid var(--bg-base)'
//                   }}>{notifCount}</span>
//                 )}
//               </button>

//               {/* Notification panel */}
//               <AnimatePresence>
//                 {notifOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
//                     animate={{ opacity: 1, y: 0, scaleY: 1 }}
//                     exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
//                     transition={{ duration: 0.22 }}
//                     className="notification-panel"
//                     style={{ transformOrigin: 'top right' }}
//                   >
//                     <div className="notification-panel-header">
//                       <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
//                         Notifications
//                         {notifCount > 0 && <span className="badge badge-danger" style={{ marginLeft: 8 }}>{notifCount}</span>}
//                       </span>
//                       <button
//                         onClick={markAllRead}
//                         style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 500 }}
//                       >
//                         Mark all read
//                       </button>
//                     </div>

//                     <div style={{ maxHeight: 320, overflowY: 'auto' }}>
//                       {notifications.length === 0 ? (
//                         <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
//                           <Bell size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
//                           <p style={{ fontSize: '0.875rem' }}>No notifications</p>
//                         </div>
//                       ) : notifications.map(n => (
//                         <div key={n.id} style={{
//                           padding: '12px 20px', display: 'flex', gap: 12, alignItems: 'flex-start',
//                           background: n.read ? 'transparent' : 'rgba(108,142,255,0.05)',
//                           borderBottom: '1px solid var(--border-subtle)',
//                           cursor: 'pointer', transition: 'background 0.15s'
//                         }}>
//                           <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'transparent' : 'var(--accent-primary)', marginTop: 6, flexShrink: 0 }} />
//                           <div style={{ flex: 1, minWidth: 0 }}>
//                             <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 2 }}>{n.title}</div>
//                             <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 4 }}>{n.body}</div>
//                             <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</div>
//                           </div>
//                           <button
//                             onClick={(e) => { e.stopPropagation(); dismissNotif(n.id); }}
//                             style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, flexShrink: 0 }}
//                             aria-label="Dismiss notification"
//                           >
//                             <X size={14} />
//                           </button>
//                         </div>
//                       ))}
//                     </div>

//                     <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
//                       <button
//                         onClick={() => { setNotifOpen(false); navigate(`/${role}/notifications`); }}
//                         style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 500 }}
//                       >
//                         View all notifications →
//                       </button>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             {/* Avatar */}
//             <div
//               className="avatar"
//               style={{ background: roleGradient }}
//               onClick={() => navigate(`/${role}/profile`)}
//               title={user?.name}
//               role="button"
//               aria-label="User profile"
//             >
//               {user?.name?.[0]?.toUpperCase() || 'U'}
//             </div>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="page-container">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }


























import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, Calendar, BarChart2, Bell,
  Monitor, LogOut, GraduationCap, ChevronLeft, ChevronRight,
  User, ClipboardList, TrendingUp, Heart, ScanFace, FileText,
  Menu, X, Home, CheckCircle, Sparkles, Settings,
  ChevronDown, Search, Sun, Moon, Zap,
} from 'lucide-react';
import { fadeUp, stagger, slideRight } from '../../utils/animations';

/* ═══════════════════════════════════════════
   NAVIGATION CONFIG
═══════════════════════════════════════════ */
const NAV_CONFIG = {
  admin: [
    {
      section: 'Overview',
      items: [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#7C6AFF' },
      ],
    },
    {
      section: 'Management',
      items: [
        { path: '/admin/users', icon: Users, label: 'Users', color: '#06B6D4' },
        { path: '/admin/departments', icon: BookOpen, label: 'Departments & Courses', color: '#10B981' },
        { path: '/admin/timetable', icon: Calendar, label: 'Timetable', color: '#F59E0B' },
        { path: '/admin/devices', icon: Monitor, label: 'Device Management', color: '#EC4899' },
        { path: '/admin/face-registration', icon: ScanFace, label: 'Face Registration', color: '#A78BFA' },
      ],
    },
    {
      section: 'Reports & Comms',
      items: [
        { path: '/admin/reports', icon: BarChart2, label: 'Attendance Reports', color: '#06B6D4' },
        { path: '/admin/notifications', icon: Bell, label: 'Notifications', color: '#F59E0B', badge: true },
      ],
    },
  ],
  faculty: [
    {
      section: 'Overview',
      items: [
        { path: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#7C6AFF' },
        { path: '/faculty/timetable', icon: Calendar, label: 'My Timetable', color: '#06B6D4' },
      ],
    },
    {
      section: 'Attendance',
      items: [
        { path: '/faculty/mark-attendance', icon: ScanFace, label: 'Mark Attendance', color: '#10B981' },
        { path: '/faculty/reports', icon: ClipboardList, label: 'Class Reports', color: '#F59E0B' },
      ],
    },
    {
      section: 'Analytics',
      items: [
        { path: '/faculty/analytics', icon: TrendingUp, label: 'Student Analytics', color: '#EC4899' },
      ],
    },
  ],
  student: [
    {
      section: 'Overview',
      items: [
        { path: '/student/dashboard', icon: Home, label: 'Dashboard', color: '#7C6AFF' },
      ],
    },
    {
      section: 'My Records',
      items: [
        { path: '/student/attendance', icon: CheckCircle, label: 'My Attendance', color: '#10B981' },
        { path: '/student/profile', icon: User, label: 'Profile', color: '#06B6D4' },
      ],
    },
    {
      section: 'Updates',
      items: [
        { path: '/student/notifications', icon: Bell, label: 'Notifications', color: '#F59E0B', badge: true },
      ],
    },
  ],
  parent: [
    {
      section: 'Overview',
      items: [
        { path: '/parent/dashboard', icon: Home, label: 'Dashboard', color: '#7C6AFF' },
      ],
    },
    {
      section: "Child's Records",
      items: [
        { path: '/parent/attendance', icon: FileText, label: 'Attendance Details', color: '#06B6D4' },
        { path: '/parent/profile', icon: Heart, label: 'Profile', color: '#EC4899' },
      ],
    },
  ],
};

const ROLE_CONFIG = {
  admin: { gradient: 'linear-gradient(135deg,#EC4899,#7C6AFF)', glow: 'rgba(236,72,153,0.30)', label: 'Administrator' },
  faculty: { gradient: 'linear-gradient(135deg,#7C6AFF,#06B6D4)', glow: 'rgba(124,106,255,0.30)', label: 'Faculty' },
  student: { gradient: 'linear-gradient(135deg,#06B6D4,#10B981)', glow: 'rgba(6,182,212,0.30)', label: 'Student' },
  parent: { gradient: 'linear-gradient(135deg,#10B981,#06B6D4)', glow: 'rgba(16,185,129,0.30)', label: 'Parent' },
};

/* ═══════════════════════════════════════════
   SIDEBAR COMPONENT
═══════════════════════════════════════════ */
function Sidebar({ role, collapsed, mobileOpen, onCollapse, onClose, notifCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navSections = NAV_CONFIG[role] || [];
  const roleConfig = ROLE_CONFIG[role];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      style={{ zIndex: 100 }}
    >
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <motion.div
          className="sidebar-logo-icon glow-pulse"
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <GraduationCap size={20} color="white" />
        </motion.div>
        <motion.div
          className="sidebar-logo-text"
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <h2>AAMS</h2>
          <span>LPU Premium</span>
        </motion.div>
      </div>

      {/* ── User Card ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '14px 14px',
              borderBottom: '1px solid var(--border-subtle)',
              margin: '0 0 4px',
            }}
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--r-md)',
                background: 'rgba(124,106,255,0.06)',
                border: '1px solid rgba(124,106,255,0.12)',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/${role}/profile`)}
            >
              {/* Avatar with glow */}
              <div
                style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  background: roleConfig.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.85rem',
                  flexShrink: 0,
                  boxShadow: `0 0 16px ${roleConfig.glow}`,
                  border: '2px solid rgba(255,255,255,0.10)',
                }}
              >
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{
                  fontSize: '0.82rem', fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {user?.name || 'User'}
                </div>
                <span
                  className={`badge role-${role}`}
                  style={{ padding: '1px 8px', fontSize: '0.62rem', marginTop: 2 }}
                >
                  {roleConfig.label}
                </span>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        <motion.div variants={stagger} initial="hidden" animate="visible">
          {navSections.map((section, si) => (
            <div key={section.section}>
              {/* Section label */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    className="sidebar-section-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {section.section}
                  </motion.div>
                )}
              </AnimatePresence>

              {section.items.map((item, ii) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <motion.div
                    key={item.path}
                    variants={slideRight}
                    custom={si * 4 + ii}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      style={{ position: 'relative' }}
                    >
                      {/* Icon with color */}
                      <div
                        style={{
                          width: 32, height: 32,
                          borderRadius: 'var(--r-sm)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isActive
                            ? `${item.color}18`
                            : 'transparent',
                          transition: 'all var(--transition-fast)',
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          size={16}
                          style={{
                            color: isActive ? item.color : 'var(--text-secondary)',
                            transition: 'color var(--transition-fast)',
                          }}
                        />
                      </div>

                      {/* Label */}
                      <motion.span
                        className="nav-item-label"
                        animate={{
                          opacity: collapsed ? 0 : 1,
                          width: collapsed ? 0 : 'auto',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>

                      {/* Badge */}
                      {item.badge && notifCount > 0 && !collapsed && (
                        <motion.span
                          className="nav-badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          {notifCount}
                        </motion.span>
                      )}

                      {/* Active indicator dot (collapsed mode) */}
                      {isActive && collapsed && (
                        <motion.div
                          layoutId="collapsed-active-dot"
                          style={{
                            position: 'absolute',
                            right: 6, top: '50%',
                            transform: 'translateY(-50%)',
                            width: 6, height: 6,
                            borderRadius: '50%',
                            background: item.color,
                            boxShadow: `0 0 8px ${item.color}`,
                          }}
                        />
                      )}
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </motion.div>
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        {/* Collapse toggle */}
        <motion.button
          className="nav-item"
          onClick={onCollapse}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', background: 'none', border: 'none',
            cursor: 'pointer', marginBottom: 4,
            color: 'var(--text-muted)',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div style={{
            width: 32, height: 32,
            borderRadius: 'var(--r-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
          }}>
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft size={15} />
            </motion.div>
          </div>
          <motion.span
            className="nav-item-label"
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
          >
            Collapse
          </motion.span>
        </motion.button>

        {/* Logout */}
        <motion.button
          className="nav-item"
          onClick={handleLogout}
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', background: 'none', border: 'none',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 32, height: 32,
            borderRadius: 'var(--r-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(239,68,68,0.08)',
            transition: 'background var(--transition-fast)',
          }}>
            <LogOut size={15} style={{ color: 'var(--danger)' }} />
          </div>
          <motion.span
            className="nav-item-label"
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            style={{ color: 'var(--danger)' }}
          >
            Sign Out
          </motion.span>
        </motion.button>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════
   HEADER COMPONENT
═══════════════════════════════════════════ */
function Header({ role, collapsed, onToggleSidebar, notifCount, notifications,
  notifOpen, setNotifOpen, onMarkAllRead, onDismiss, notifRef }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const roleConfig = ROLE_CONFIG[role];

  const navSections = NAV_CONFIG[role] || [];
  const currentPage = navSections
    .flatMap(s => s.items)
    .find(i => location.pathname.startsWith(i.path));

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  return (
    <header className="topbar">
      {/* Toggle button */}
      <motion.button
        className="btn btn-ghost btn-icon"
        onClick={onToggleSidebar}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Toggle sidebar"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={collapsed ? 'expand' : 'collapse'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Menu size={18} />
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Breadcrumb */}
      <div className="topbar-title">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginRight: 6 }}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
        <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>›</span>
        {currentPage && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 20, height: 20, borderRadius: 6,
                background: `${currentPage.color}18`,
              }}
            >
              <currentPage.icon size={12} style={{ color: currentPage.color }} />
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentPage.label}
            </span>
          </span>
        )}
      </div>

      <div className="topbar-actions">
        {/* Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="search-bar" style={{ height: 38 }}>
                <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  autoFocus
                  placeholder="Search..."
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="topbar-icon-btn"
          onClick={() => setSearchOpen(o => !o)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Search"
        >
          <Search size={16} />
        </motion.button>

        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <motion.button
            className="topbar-icon-btn"
            onClick={() => setNotifOpen(o => !o)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Notifications"
          >
            <motion.div
              animate={notifCount > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
            >
              <Bell size={16} />
            </motion.div>
            {notifCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute', top: -5, right: -5,
                  background: 'linear-gradient(135deg,#EF4444,#EC4899)',
                  color: 'white',
                  borderRadius: '99px', fontSize: '0.58rem', fontWeight: 700,
                  padding: '1px 5px', minWidth: 16, textAlign: 'center',
                  border: '2px solid var(--bg-base)',
                  boxShadow: '0 0 8px rgba(239,68,68,0.50)',
                }}
              >
                {notifCount}
              </motion.span>
            )}
          </motion.button>

          {/* Notification Panel */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="notification-panel"
                style={{ transformOrigin: 'top right' }}
              >
                <div className="notification-panel-header">
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={15} style={{ color: 'var(--accent-primary)' }} />
                    Notifications
                    {notifCount > 0 && (
                      <motion.span
                        className="badge badge-info"
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                      >
                        {notifCount}
                      </motion.span>
                    )}
                  </span>
                  <button
                    onClick={onMarkAllRead}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600,
                      padding: '4px 8px', borderRadius: 'var(--r-sm)',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,106,255,0.10)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    Mark all read
                  </button>
                </div>

                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔔</div>
                      <p style={{ fontSize: '0.875rem' }}>All caught up!</p>
                    </motion.div>
                  ) : (
                    notifications.map((n, idx) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{
                          padding: '12px 16px',
                          display: 'flex', gap: 12, alignItems: 'flex-start',
                          background: n.read
                            ? 'transparent'
                            : 'rgba(124,106,255,0.04)',
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'background var(--transition-fast)',
                        }}
                        whileHover={{ background: 'rgba(124,106,255,0.06)' }}
                      >
                        {/* Unread dot */}
                        <div style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: n.read
                            ? 'transparent'
                            : 'var(--accent-primary)',
                          marginTop: 6, flexShrink: 0,
                          boxShadow: n.read ? 'none' : 'var(--glow-accent)',
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 4 }}>
                            {n.body}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {n.time}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, color: 'var(--danger)' }}
                          onClick={e => { e.stopPropagation(); onDismiss(n.id); }}
                          style={{
                            background: 'none', border: 'none',
                            cursor: 'pointer', color: 'var(--text-muted)',
                            padding: 4, flexShrink: 0,
                          }}
                        >
                          <X size={13} />
                        </motion.button>
                      </motion.div>
                    ))
                  )}
                </div>

                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <button
                    onClick={() => { setNotifOpen(false); navigate(`/${role}/notifications`); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    View all notifications
                    <ChevronRight size={13} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <motion.div
          className="avatar"
          style={{ background: roleConfig.gradient }}
          onClick={() => navigate(`/${role}/profile`)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title={user?.name}
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </motion.div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD LAYOUT
═══════════════════════════════════════════ */
export default function DashboardLayout({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New session started', body: 'Math 101 session is now active', time: '2m ago', read: false },
    { id: 2, title: 'Attendance report ready', body: 'Weekly report for CSE-A is available', time: '1h ago', read: false },
    { id: 3, title: 'Low attendance alert', body: '3 students below 75% threshold', time: '3h ago', read: true },
  ]);

  const location = useLocation();
  const notifRef = useRef(null);

  /* Close notif on outside click */
  useEffect(() => {
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close mobile sidebar on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const markAllRead = () => {
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setNotifCount(0);
  };

  const dismissNotif = id => {
    setNotifications(n => n.filter(x => x.id !== id));
    setNotifCount(c => Math.max(0, c - 1));
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(o => !o);
    } else {
      setCollapsed(o => !o);
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.70)',
              backdropFilter: 'blur(6px)',
              zIndex: 99,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <Sidebar
        role={role}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapse={() => setCollapsed(o => !o)}
        onClose={() => setMobileOpen(false)}
        notifCount={notifCount}
      />

      {/* ── Main Content ── */}
      <motion.div
        className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}
        animate={{ marginLeft: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{ marginLeft: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
      >
        {/* ── Header ── */}
        <Header
          role={role}
          collapsed={collapsed}
          onToggleSidebar={handleToggleSidebar}
          notifCount={notifCount}
          notifications={notifications}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          onMarkAllRead={markAllRead}
          onDismiss={dismissNotif}
          notifRef={notifRef}
        />

        {/* ── Page Content ── */}
        <main className="page-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}