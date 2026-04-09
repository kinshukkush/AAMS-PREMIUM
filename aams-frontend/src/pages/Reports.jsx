import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Filter, BarChart3 } from 'lucide-react';
import {
  Card, CardBody, CardHeader,
  Button,
  Input,
  Badge,
  Tabs
} from '../../components';

export default function Reports() {
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2026-04-08');
  const [department, setDepartment] = useState('all');

  // Mock attendance data by department
  const departmentStats = [
    { name: 'Computer Science', total: 150, present: 138, absent: 12, percentage: 92 },
    { name: 'Information Technology', total: 120, present: 109, absent: 11, percentage: 91 },
    { name: 'Mechanical Engineering', total: 180, present: 153, absent: 27, percentage: 85 },
    { name: 'Electrical Engineering', total: 140, present: 125, absent: 15, percentage: 89 },
  ];

  // Mock course statistics
  const courseStats = [
    { course: 'Data Structures', classes: 10, attended: 9, percentage: 90, instructor: 'Dr. Rajesh Kumar' },
    { course: 'Web Development', classes: 8, attended: 8, percentage: 100, instructor: 'Prof. Priya Singh' },
    { course: 'Database Systems', classes: 9, attended: 8, percentage: 89, instructor: 'Dr. Vikram Gupta' },
    { course: 'Algorithms', classes: 7, attended: 6, percentage: 86, instructor: 'Prof. Anjali Sharma' },
  ];

  // Mock student performance data
  const studentPerformance = [
    { name: 'Amit Sharma', attendancePercentage: 94, daysPresent: 47, status: 'Excellent' },
    { name: 'Bhavna Patel', attendancePercentage: 88, daysPresent: 44, status: 'Good' },
    { name: 'Chirag Kumar', attendancePercentage: 82, daysPresent: 41, status: 'Fair' },
    { name: 'Diana Singh', attendancePercentage: 95, daysPresent: 48, status: 'Excellent' },
    { name: 'Eshan Gupta', attendancePercentage: 75, daysPresent: 38, status: 'Poor' },
  ];

  const tabs = [
    {
      label: 'Department Overview',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {departmentStats.map((dept) => (
              <Card key={dept.name}>
                <CardBody className="space-y-3">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{dept.name}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Attendance</span>
                      <Badge variant="success" size="sm">{dept.percentage}%</Badge>
                    </div>
                    <div className="h-2 bg-neutral-200 dark:bg-dark-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dept.percentage}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      />
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {dept.present}/{dept.total} students
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Department Table */}
          <Card>
            <CardHeader title="Detailed Department Statistics" />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-dark-700 bg-neutral-50 dark:bg-dark-800">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Total Students</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Present</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Absent</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentStats.map((dept) => (
                    <tr key={dept.name} className="border-t border-neutral-200 dark:border-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-800">
                      <td className="px-6 py-4 font-medium">{dept.name}</td>
                      <td className="px-6 py-4">{dept.total}</td>
                      <td className="px-6 py-4 text-green-600 dark:text-green-400 font-semibold">{dept.present}</td>
                      <td className="px-6 py-4 text-red-600 dark:text-red-400 font-semibold">{dept.absent}</td>
                      <td className="px-6 py-4">
                        <Badge variant="success" size="sm">{dept.percentage}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      ),
    },
    {
      label: 'Course Analysis',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader title="Course-wise Attendance Statistics" />
            <CardBody className="space-y-4">
              {courseStats.map((course) => (
                <div key={course.course} className="p-4 bg-neutral-50 dark:bg-dark-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-50">{course.course}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Instructor: {course.instructor}</p>
                    </div>
                    <Badge variant={course.percentage >= 90 ? 'success' : 'warning'} size="sm">
                      {course.percentage}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-neutral-200 dark:bg-dark-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.percentage}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      />
                    </div>
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      {course.attended}/{course.classes}
                    </span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </motion.div>
      ),
    },
    {
      label: 'Student Performance',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader title="Top Performers" />
            <CardBody>
              <div className="space-y-3">
                {studentPerformance.map((student, idx) => (
                  <div key={student.name} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-dark-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-50">{student.name}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{student.daysPresent} days present</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{student.attendancePercentage}%</p>
                      <Badge
                        variant={
                          student.status === 'Excellent' ? 'success' :
                          student.status === 'Good' ? 'success' :
                          student.status === 'Fair' ? 'warning' : 'error'
                        }
                        size="sm"
                      >
                        {student.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
          Attendance Reports
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Analyze attendance trends and performance metrics
        </p>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-2">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900"
              >
                <option value="all">All Departments</option>
                <option value="cs">Computer Science</option>
                <option value="it">Information Technology</option>
                <option value="me">Mechanical Engineering</option>
                <option value="ee">Electrical Engineering</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" icon={BarChart3} fullWidth>
                Refresh
              </Button>
              <Button variant="primary" icon={Download}>
                Export
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Classes', value: '234', color: 'from-blue-500 to-blue-600' },
          { label: 'Avg Attendance', value: '89.2%', color: 'from-green-500 to-green-600' },
          { label: 'Total Present', value: '5,234', color: 'from-emerald-500 to-emerald-600' },
          { label: 'Total Absent', value: '648', color: 'from-red-500 to-red-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody className="space-y-3">
              <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg w-fit`}>
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} />
    </div>
  );
}
