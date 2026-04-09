import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import {
  Card, CardBody, CardHeader,
  Button,
  Badge,
  Tabs,
  SkeletonCard,
  Spinner
} from '../../components';

const StatCard = ({ icon: Icon, label, value, trend, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
            {loading ? (
              <div className="h-8 w-24 bg-neutral-200 dark:bg-dark-700 rounded mt-2 animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-2">
                {value}
              </p>
            )}
          </div>
          <div className="p-3 bg-primary-100 dark:bg-primary-950 rounded-lg">
            <Icon size={24} className="text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        {trend && !loading && (
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">
              {trend}% vs last week
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  </motion.div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 1250,
    presentToday: 892,
    absent: 258,
    lateArrivals: 100,
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const recentSessions = [
    { id: 1, course: 'Data Structures', time: '10:00 AM', attendance: 45, present: 42 },
    { id: 2, course: 'Web Development', time: '2:00 PM', attendance: 38, present: 35 },
    { id: 3, course: 'Database Systems', time: '4:00 PM', attendance: 50, present: 48 },
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Total Students"
              value={stats.totalStudents}
              trend={5.2}
              loading={loading}
            />
            <StatCard
              icon={CheckCircle}
              label="Present Today"
              value={stats.presentToday}
              trend={3.1}
              loading={loading}
            />
            <StatCard
              icon={AlertCircle}
              label="Absent"
              value={stats.absent}
              trend={-2.3}
              loading={loading}
            />
            <StatCard
              icon={Clock}
              label="Late Arrivals"
              value={stats.lateArrivals}
              trend={1.5}
              loading={loading}
            />
          </div>

          {/* Recent Sessions */}
          <Card>
            <CardHeader title="Recent Sessions" />
            <CardBody>
              <div className="space-y-3">
                {recentSessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-dark-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-50">
                        {session.course}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {session.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium text-neutral-900 dark:text-neutral-50">
                          {session.present}/{session.attendance}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {Math.round((session.present / session.attendance) * 100)}%
                        </p>
                      </div>
                      <Badge variant="success" size="sm">
                        Completed
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ),
    },
    {
      label: 'Analytics',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardBody>
              <p className="text-neutral-600 dark:text-neutral-400">
                Analytics data will be displayed here with charts and detailed metrics.
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
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Welcome back! Here's your attendance overview.
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs tabs={tabs} />
    </div>
  );
}
