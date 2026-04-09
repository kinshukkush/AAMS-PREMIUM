import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react';
import {
  Card, CardBody, CardHeader,
  Button,
  Badge,
  Tabs,
  Alert,
  Skeleton,
  Pagination
} from '../../components';

const AttendanceRecord = ({ date, time, subject, status, percentage }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-dark-800 dark:to-dark-700 rounded-lg border border-neutral-200 dark:border-dark-600 hover:shadow-md transition-shadow"
  >
    <div className="flex-1">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${status === 'present' ? 'bg-green-500' : status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'}`} />
        <div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-50">{subject}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{date} at {time}</p>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{percentage}%</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Class Avg</p>
      </div>
      <Badge
        variant={status === 'present' ? 'success' : status === 'absent' ? 'error' : 'warning'}
        size="sm"
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    </div>
  </motion.div>
);

const AttendanceStat = ({ icon: Icon, label, value, trend, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 bg-white dark:bg-dark-900 rounded-xl border border-neutral-200 dark:border-dark-700 shadow-soft hover:shadow-md transition-all"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
          <TrendingUp size={16} />
          {trend}%
        </div>
      )}
    </div>
    <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">{value}</p>
  </motion.div>
);

export default function StudentAttendance() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Mock data
  const stats = {
    presentDays: 42,
    totalClasses: 50,
    attendancePercentage: 84,
    leaves: 3,
  };

  const records = [
    { date: 'Apr 8, 2026', time: '10:00 AM', subject: 'Data Structures', status: 'present', percentage: 92 },
    { date: 'Apr 7, 2026', time: '2:00 PM', subject: 'Web Development', status: 'present', percentage: 88 },
    { date: 'Apr 6, 2026', time: '4:00 PM', subject: 'Database Systems', status: 'absent', percentage: 85 },
    { date: 'Apr 5, 2026', time: '11:00 AM', subject: 'Algorithms', status: 'present', percentage: 90 },
    { date: 'Apr 4, 2026', time: '3:00 PM', subject: 'Operating Systems', status: 'leave', percentage: 87 },
  ];

  const tabs = [
    {
      label: 'Overview',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Attendance Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AttendanceStat
              icon={CheckCircle}
              label="Days Present"
              value={stats.presentDays}
              trend={5}
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <AttendanceStat
              icon={Calendar}
              label="Total Classes"
              value={stats.totalClasses}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <AttendanceStat
              icon={TrendingUp}
              label="Attendance %"
              value={`${stats.attendancePercentage}%`}
              trend={3}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <AttendanceStat
              icon={Eye}
              label="Leaves Taken"
              value={stats.leaves}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
            />
          </div>

          {/* Attendance Warning Alert */}
          {stats.attendancePercentage < 85 && (
            <Alert
              variant="warning"
              title="Low Attendance Alert"
              message={`Your attendance is ${stats.attendancePercentage}%. Aim to maintain at least 85% to be eligible for exams.`}
              action={{ label: 'View Guidelines', onClick: () => {} }}
            />
          )}

          {/* Recent Attendance Records */}
          <Card>
            <CardHeader
              title="Recent Attendance Records"
              subtitle="Last 5 sessions"
            />
            <CardBody className="space-y-3">
              <AnimatePresence>
                {records.map((record) => (
                  <AttendanceRecord key={record.date} {...record} />
                ))}
              </AnimatePresence>
            </CardBody>
          </Card>

          {/* Pagination */}
          <div className="flex justify-center">
            <Pagination
              current={page}
              total={5}
              onPageChange={setPage}
              loading={loading}
            />
          </div>
        </motion.div>
      ),
    },
    {
      label: 'By Subject',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {[
            { subject: 'Data Structures', attended: 12, total: 14, percentage: 86 },
            { subject: 'Web Development', attended: 13, total: 14, percentage: 93 },
            { subject: 'Database Systems', attended: 11, total: 12, percentage: 92 },
            { subject: 'Algorithms', attended: 10, total: 12, percentage: 83 },
            { subject: 'Operating Systems', attended: 9, total: 11, percentage: 82 },
          ].map((item) => (
            <div key={item.subject} className="p-4 bg-white dark:bg-dark-900 rounded-lg border border-neutral-200 dark:border-dark-700">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-neutral-900 dark:text-neutral-50">{item.subject}</p>
                <Badge variant={item.percentage >= 85 ? 'success' : 'warning'} size="sm">
                  {item.percentage}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-neutral-200 dark:bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-green-500 to-green-600"
                  />
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {item.attended}/{item.total}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      ),
    },
    {
      label: 'Statistics',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Card>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">Present Classes</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">42</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">Absent Classes</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">5</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Leaves</p>
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">3</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Classes</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">50</p>
                </div>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4">
                Your average attendance across all subjects is <strong>84%</strong>. Keep attending classes to maintain and improve your attendance record.
              </p>
            </CardBody>
          </Card>
        </motion.div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
          My Attendance
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Track your class attendance and participation records
        </p>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : (
        <Tabs tabs={tabs} />
      )}
    </div>
  );
}
