import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Card, CardBody, CardHeader,
  Button,
  Badge,
  Tabs
} from '../../components';

const TimeSlot = ({ session, isToday }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-4 rounded-lg border-l-4 ${
      session.type === 'lecture'
        ? 'bg-blue-50 dark:bg-blue-950 border-blue-500'
        : 'bg-purple-50 dark:bg-purple-950 border-purple-500'
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <p className="font-semibold text-neutral-900 dark:text-neutral-50">
            {session.course}
          </p>
          <Badge
            variant={session.type === 'lecture' ? 'primary' : 'secondary'}
            size="sm"
          >
            {session.type === 'lecture' ? 'Lecture' : 'Lab'}
          </Badge>
          {isToday && <Badge variant="success" size="sm">Today</Badge>}
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          👨‍🏫 {session.instructor}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          📍 {session.classroom}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          {session.time}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {session.duration} min
        </p>
      </div>
    </div>
  </motion.div>
);

export default function Timetable() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 8)); // Apr 8, 2026
  const [viewMode, setViewMode] = useState('weekly');

  // Mock timetable data
  const weeklyTimetable = {
    Monday: [
      { course: 'Data Structures', type: 'lecture', time: '10:00 AM', duration: 90, instructor: 'Dr. Rajesh Kumar', classroom: 'Room-201' },
      { course: 'Data Structures Lab', type: 'lab', time: '12:00 PM', duration: 120, instructor: 'Prof. Anjali Sharma', classroom: 'Lab-101' },
      { course: 'Database Systems', type: 'lecture', time: '4:00 PM', duration: 90, instructor: 'Dr. Vikram Gupta', classroom: 'Room-202' },
    ],
    Tuesday: [
      { course: 'Web Development', type: 'lecture', time: '9:00 AM', duration: 90, instructor: 'Prof. Priya Singh', classroom: 'Room-101' },
      { course: 'Algorithms', type: 'lecture', time: '1:00 PM', duration: 90, instructor: 'Dr. Rajesh Kumar', classroom: 'Room-201' },
    ],
    Wednesday: [
      { course: 'Operating Systems', type: 'lecture', time: '10:00 AM', duration: 90, instructor: 'Prof. Suresh Kumar', classroom: 'Room-301' },
      { course: 'Operating Systems Lab', type: 'lab', time: '12:00 PM', duration: 120, instructor: 'Prof. Anjali Sharma', classroom: 'Lab-102' },
      { course: 'Data Structures', type: 'lecture', time: '3:00 PM', duration: 90, instructor: 'Dr. Rajesh Kumar', classroom: 'Room-201' },
    ],
    Thursday: [
      { course: 'Web Development Lab', type: 'lab', time: '9:00 AM', duration: 120, instructor: 'Prof. Priya Singh', classroom: 'Lab-103' },
      { course: 'Database Systems', type: 'lecture', time: '2:00 PM', duration: 90, instructor: 'Dr. Vikram Gupta', classroom: 'Room-202' },
    ],
    Friday: [
      { course: 'Algorithms', type: 'lecture', time: '10:00 AM', duration: 90, instructor: 'Dr. Rajesh Kumar', classroom: 'Room-201' },
      { course: 'Guest Lecture', type: 'lecture', time: '2:00 PM', duration: 60, instructor: 'Industry Expert', classroom: 'Auditorium' },
    ],
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const tabs = [
    {
      label: 'Weekly View',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Week of</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                Apr 8 - 12, 2026
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" icon={ChevronLeft} size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Today
              </Button>
              <Button variant="outline" icon={ChevronRight} size="sm">
                Next
              </Button>
            </div>
          </div>

          {/* Weekly Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {days.map((day) => (
              <Card key={day}>
                <CardHeader
                  title={day}
                  subtitle={`${weeklyTimetable[day]?.length || 0} classes`}
                />
                <CardBody className="space-y-3">
                  {weeklyTimetable[day]?.map((session, idx) => (
                    <TimeSlot
                      key={idx}
                      session={session}
                      isToday={day === 'Wednesday'}
                    />
                  ))}
                </CardBody>
              </Card>
            ))}
          </div>
        </motion.div>
      ),
    },
    {
      label: 'Daily View',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Date Selection */}
          <Card>
            <CardBody className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Selected Date</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  Wednesday, April 8, 2026
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" icon={ChevronLeft} size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Today
                </Button>
                <Button variant="outline" icon={ChevronRight} size="sm">
                  Next
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Daily Schedule */}
          <Card>
            <CardHeader title="Today's Schedule" />
            <CardBody className="space-y-4">
              {[
                { course: 'Operating Systems', time: '10:00 AM - 11:30 AM', instructor: 'Prof. Suresh Kumar', classroom: 'Room-301', type: 'lecture' },
                { course: 'Operating Systems Lab', time: '12:00 PM - 2:00 PM', instructor: 'Prof. Anjali Sharma', classroom: 'Lab-102', type: 'lab' },
                { course: 'Data Structures', time: '3:00 PM - 4:30 PM', instructor: 'Dr. Rajesh Kumar', classroom: 'Room-201', type: 'lecture' },
              ].map((session, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-dark-800 dark:to-dark-700 rounded-lg border border-neutral-200 dark:border-dark-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-50">{session.course}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{session.time}</p>
                    </div>
                    <Badge variant={session.type === 'lecture' ? 'primary' : 'secondary'} size="sm">
                      {session.type === 'lecture' ? 'Lecture' : 'Lab'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">Instructor</p>
                      <p className="font-medium text-neutral-900 dark:text-neutral-50">{session.instructor}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">Classroom</p>
                      <p className="font-medium text-neutral-900 dark:text-neutral-50">{session.classroom}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardBody>
          </Card>

          {/* Time Summary */}
          <Card>
            <CardBody className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Classes', value: '3' },
                { label: 'Total Hours', value: '5 hrs' },
                { label: 'Classes Done', value: '0' },
              ].map((item) => (
                <div key={item.label} className="p-4 bg-neutral-50 dark:bg-dark-800 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.label}</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">{item.value}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </motion.div>
      ),
    },
    {
      label: 'Monthly View',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader title="April 2026" />
            <CardBody>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-neutral-600 dark:text-neutral-400 p-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, idx) => {
                  const date = idx + 1 - 6; // Adjust for starting day
                  const isCurrentMonth = date > 0 && date <= 30;
                  const isToday = date === 8;

                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className={`p-3 text-center rounded-lg cursor-pointer transition-all ${
                        isToday
                          ? 'bg-primary-500 text-white font-bold'
                          : isCurrentMonth
                          ? 'bg-neutral-50 dark:bg-dark-800 text-neutral-900 dark:text-neutral-50 hover:bg-primary-100 dark:hover:bg-primary-900'
                          : 'text-neutral-300 dark:text-neutral-700'
                      }`}
                    >
                      {isCurrentMonth && date}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  📅 Total classes this month: <strong>64</strong>
                </p>
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
          My Timetable
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          View your class schedule and manage your time
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs tabs={tabs} />
    </div>
  );
}
