/**
 * Lazy Routes with Code Splitting
 * Enables automatic code splitting and lazy loading of route components
 */

import React, { Suspense } from 'react';
import { SkeletonDashboard } from '../components/common/SkeletonLoader';

// Lazy load page components for code splitting
export const AdminDashboard = React.lazy(() =>
  import('../pages/admin/AdminDashboard').then(m => ({ default: m.default }))
);
export const UserManagement = React.lazy(() =>
  import('../pages/admin/UserManagement').then(m => ({ default: m.default }))
);
export const DepartmentCourses = React.lazy(() =>
  import('../pages/admin/DepartmentCourses').then(m => ({ default: m.default }))
);
export const TimetableManager = React.lazy(() =>
  import('../pages/admin/TimetableManager').then(m => ({ default: m.default }))
);
export const AttendanceReports = React.lazy(() =>
  import('../pages/admin/AttendanceReports').then(m => ({ default: m.default }))
);
export const DeviceManagement = React.lazy(() =>
  import('../pages/admin/DeviceManagement').then(m => ({ default: m.default }))
);
export const AdminNotifications = React.lazy(() =>
  import('../pages/admin/AdminNotifications').then(m => ({ default: m.default }))
);
export const FaceRegistration = React.lazy(() =>
  import('../pages/admin/FaceRegistration').then(m => ({ default: m.default }))
);
export const FaceDebug = React.lazy(() =>
  import('../pages/admin/FaceDebug').then(m => ({ default: m.default }))
);

// Faculty pages
export const FacultyDashboard = React.lazy(() =>
  import('../pages/faculty/FacultyDashboard').then(m => ({ default: m.default }))
);
export const MarkAttendance = React.lazy(() =>
  import('../pages/faculty/MarkAttendance').then(m => ({ default: m.default }))
);
export const ClassReports = React.lazy(() =>
  import('../pages/faculty/ClassReports').then(m => ({ default: m.default }))
);
export const StudentAnalytics = React.lazy(() =>
  import('../pages/faculty/StudentAnalytics').then(m => ({ default: m.default }))
);
export const FacultyTimetable = React.lazy(() =>
  import('../pages/faculty/FacultyTimetable').then(m => ({ default: m.default }))
);

// Student pages
export const StudentDashboard = React.lazy(() =>
  import('../pages/student/StudentDashboard').then(m => ({ default: m.default }))
);
export const MyAttendance = React.lazy(() =>
  import('../pages/student/MyAttendance').then(m => ({ default: m.default }))
);
export const StudentProfile = React.lazy(() =>
  import('../pages/student/StudentProfile').then(m => ({ default: m.default }))
);
export const StudentNotifications = React.lazy(() =>
  import('../pages/student/StudentNotifications').then(m => ({ default: m.default }))
);

// Parent pages
export const ParentDashboard = React.lazy(() =>
  import('../pages/parent/ParentDashboard').then(m => ({ default: m.default }))
);
export const ChildAttendance = React.lazy(() =>
  import('../pages/parent/ChildAttendance').then(m => ({ default: m.default }))
);
export const ParentProfile = React.lazy(() =>
  import('../pages/parent/ParentProfile').then(m => ({ default: m.default }))
);

// Auth pages
export const LoginPage = React.lazy(() =>
  import('../pages/auth/LoginPage').then(m => ({ default: m.default }))
);

/**
 * Suspense fallback component
 */
export const PageLoader = () => (
  <div className="min-h-screen bg-white dark:bg-slate-900 p-6">
    <SkeletonDashboard />
  </div>
);

/**
 * Create lazy loaded route with fallback
 */
export const LazyRoute = ({ component: Component, fallback = <PageLoader /> }) => (
  <Suspense fallback={fallback}>
    <Component />
  </Suspense>
);

export default {
  AdminDashboard,
  UserManagement,
  DepartmentCourses,
  TimetableManager,
  AttendanceReports,
  DeviceManagement,
  AdminNotifications,
  FaceRegistration,
  FaceDebug,
  FacultyDashboard,
  MarkAttendance,
  ClassReports,
  StudentAnalytics,
  FacultyTimetable,
  StudentDashboard,
  MyAttendance,
  StudentProfile,
  StudentNotifications,
  ParentDashboard,
  ChildAttendance,
  ParentProfile,
  LoginPage,
  PageLoader,
  LazyRoute
};
