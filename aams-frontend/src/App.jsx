import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/common/Toaster';
import { AnimatedPage } from './components/animations/PageTransitions';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentCourses from './pages/admin/DepartmentCourses';
import TimetableManager from './pages/admin/TimetableManager';
import AttendanceReports from './pages/admin/AttendanceReports';
import DeviceManagement from './pages/admin/DeviceManagement';
import AdminNotifications from './pages/admin/AdminNotifications';
import FaceRegistration from './pages/admin/FaceRegistration';
import FaceDebug from './pages/admin/FaceDebug';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MarkAttendance from './pages/faculty/MarkAttendance';
import ClassReports from './pages/faculty/ClassReports';
import StudentAnalytics from './pages/faculty/StudentAnalytics';
import FacultyTimetable from './pages/faculty/FacultyTimetable';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyAttendance from './pages/student/MyAttendance';
import StudentProfile from './pages/student/StudentProfile';
import StudentNotifications from './pages/student/StudentNotifications';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildAttendance from './pages/parent/ChildAttendance';
import ParentProfile from './pages/parent/ParentProfile';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:40, height:40, border:'3px solid var(--border-color)', borderTopColor:'var(--brand-primary)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <Toaster />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
              <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
              <Route path="/" element={<RoleRedirect />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}>
                <Route path="dashboard" element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
                <Route path="users" element={<AnimatedPage><UserManagement /></AnimatedPage>} />
                <Route path="departments" element={<AnimatedPage><DepartmentCourses /></AnimatedPage>} />
                <Route path="timetable" element={<AnimatedPage><TimetableManager /></AnimatedPage>} />
                <Route path="reports" element={<AnimatedPage><AttendanceReports /></AnimatedPage>} />
                <Route path="devices" element={<AnimatedPage><DeviceManagement /></AnimatedPage>} />
                <Route path="notifications" element={<AnimatedPage><AdminNotifications /></AnimatedPage>} />
                <Route path="face-registration" element={<AnimatedPage><FaceRegistration /></AnimatedPage>} />
                <Route path="face-debug" element={<AnimatedPage><FaceDebug /></AnimatedPage>} />
              </Route>

              {/* Faculty Routes */}
              <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']}><DashboardLayout role="faculty" /></ProtectedRoute>}>
                <Route path="dashboard" element={<AnimatedPage><FacultyDashboard /></AnimatedPage>} />
                <Route path="mark-attendance" element={<AnimatedPage><MarkAttendance /></AnimatedPage>} />
                <Route path="reports" element={<AnimatedPage><ClassReports /></AnimatedPage>} />
                <Route path="analytics" element={<AnimatedPage><StudentAnalytics /></AnimatedPage>} />
                <Route path="timetable" element={<AnimatedPage><FacultyTimetable /></AnimatedPage>} />
              </Route>

              {/* Student Routes */}
              <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout role="student" /></ProtectedRoute>}>
                <Route path="dashboard" element={<AnimatedPage><StudentDashboard /></AnimatedPage>} />
                <Route path="attendance" element={<AnimatedPage><MyAttendance /></AnimatedPage>} />
                <Route path="profile" element={<AnimatedPage><StudentProfile /></AnimatedPage>} />
                <Route path="notifications" element={<AnimatedPage><StudentNotifications /></AnimatedPage>} />
              </Route>

              {/* Parent Routes */}
              <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><DashboardLayout role="parent" /></ProtectedRoute>}>
                <Route path="dashboard" element={<AnimatedPage><ParentDashboard /></AnimatedPage>} />
                <Route path="attendance" element={<AnimatedPage><ChildAttendance /></AnimatedPage>} />
                <Route path="profile" element={<AnimatedPage><ParentProfile /></AnimatedPage>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}