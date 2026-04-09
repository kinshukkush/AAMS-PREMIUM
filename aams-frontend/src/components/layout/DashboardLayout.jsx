import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Eye,
  LayoutDashboard, Users, BookOpen, Calendar, BarChart2, Bell,
  Monitor, LogOut, GraduationCap, ChevronLeft, ChevronRight,
  Sun, Moon, User, ClipboardList, TrendingUp, Heart,
  ScanFace, QrCode, FileText, Settings, Menu, X
} from 'lucide-react';

const NAV_CONFIG = {
  admin: [
    { section: 'Overview', items: [
      { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'Management', items: [
      { path: '/admin/users', icon: Users, label: 'Users' },
      { path: '/admin/departments', icon: BookOpen, label: 'Departments & Courses' },
      { path: '/admin/timetable', icon: Calendar, label: 'Timetable' },
      { path: '/admin/devices', icon: Monitor, label: 'Devices' },
      { path: '/admin/face-registration', icon: ScanFace, label: 'Face Registration' },
      { path: '/admin/face-debug', icon: Eye, label: 'Face Debug' },
    ]},
    { section: 'Reports', items: [
      { path: '/admin/reports', icon: BarChart2, label: 'Attendance Reports' },
      { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    ]},
  ],
  faculty: [
    { section: 'Overview', items: [
      { path: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/faculty/timetable', icon: Calendar, label: 'My Timetable' },
    ]},
    { section: 'Attendance', items: [
      { path: '/faculty/mark-attendance', icon: ScanFace, label: 'Mark Attendance' },
      { path: '/faculty/reports', icon: ClipboardList, label: 'Class Reports' },
    ]},
    { section: 'Analytics', items: [
      { path: '/faculty/analytics', icon: TrendingUp, label: 'Student Analytics' },
    ]},
  ],
  student: [
    { section: 'Overview', items: [
      { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: 'My Records', items: [
      { path: '/student/attendance', icon: ClipboardList, label: 'My Attendance' },
      { path: '/student/profile', icon: User, label: 'Profile' },
    ]},
    { section: 'Updates', items: [
      { path: '/student/notifications', icon: Bell, label: 'Notifications', badge: '2' },
    ]},
  ],
  parent: [
    { section: 'Overview', items: [
      { path: '/parent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
    { section: "Child's Records", items: [
      { path: '/parent/attendance', icon: FileText, label: 'Attendance Details' },
      { path: '/parent/profile', icon: Heart, label: 'Profile' },
    ]},
  ],
};

const ROLE_COLORS = {
  admin: '#EF4444',
  faculty: '#7C3AED',
  student: '#4F6EF7',
  parent: '#06D6A0',
};

export default function DashboardLayout({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navSections = NAV_CONFIG[role] || [];
  const roleColor = ROLE_COLORS[role];

  const currentPageLabel = navSections
    .flatMap(s => s.items)
    .find(i => location.pathname === i.path)?.label || 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <GraduationCap size={18} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <h2>AAMS</h2>
            <span>LPU Platform</span>
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div className="avatar" style={{ background: roleColor, width: 34, height: 34, fontSize: '0.8rem' }}>
              {user?.avatar || user?.name?.[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                <span className={`badge role-${role}`} style={{ padding: '1px 7px', fontSize: '0.65rem' }}>{role}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navSections.map(section => (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="nav-item-icon" />
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--brand-danger)', cursor: 'pointer' }}
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

      {/* Main Content */}
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="topbar">
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => collapsed ? setCollapsed(false) : setMobileOpen(!mobileOpen)}
            style={{ display: 'flex' }}
          >
            {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
          </button>

          <div className="topbar-title">{currentPageLabel}</div>

          <div className="topbar-actions">
            <button className="topbar-icon-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button className="topbar-icon-btn" onClick={() => navigate(`/${role}/notifications`)} title="Notifications">
              <Bell size={16} />
              <div className="notification-dot" />
            </button>

            <div
              className="avatar"
              style={{ background: roleColor }}
              onClick={() => navigate(`/${role}/profile`)}
              title={user?.name}
            >
              {user?.avatar || user?.name?.[0]}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}