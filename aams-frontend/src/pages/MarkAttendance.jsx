import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Check, X, Download, Calendar } from 'lucide-react';
import {
  Card, CardBody, CardHeader,
  Button,
  Input,
  Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Alert,
  Tabs
} from '../../components';

const StudentRow = ({ student, onMarkAttendance }) => {
  const [status, setStatus] = useState(student.status);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-white dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-lg hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
          {student.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-50">{student.name}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{student.rollNo}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setStatus('present');
            onMarkAttendance(student.id, 'present');
          }}
          className={`p-2 rounded-lg transition-all ${
            status === 'present'
              ? 'bg-green-500 text-white'
              : 'bg-neutral-100 dark:bg-dark-800 text-neutral-600 dark:text-neutral-400 hover:bg-green-100 dark:hover:bg-green-900'
          }`}
        >
          <Check size={20} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setStatus('absent');
            onMarkAttendance(student.id, 'absent');
          }}
          className={`p-2 rounded-lg transition-all ${
            status === 'absent'
              ? 'bg-red-500 text-white'
              : 'bg-neutral-100 dark:bg-dark-800 text-neutral-600 dark:text-neutral-400 hover:bg-red-100 dark:hover:bg-red-900'
          }`}
        >
          <X size={20} />
        </motion.button>

        <Badge
          variant={status === 'present' ? 'success' : 'error'}
          size="sm"
        >
          {status === 'present' ? 'Present' : 'Absent'}
        </Badge>
      </div>
    </motion.div>
  );
};

export default function MarkAttendance() {
  const [search, setSearch] = useState('');
  const [sessionOpen, setSessionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendance, setAttendance] = useState({});

  // Mock data
  const students = [
    { id: 1, name: 'Amit Sharma', rollNo: 'A001', status: null },
    { id: 2, name: 'Bhavna Singh', rollNo: 'A002', status: null },
    { id: 3, name: 'Chirag Patel', rollNo: 'A003', status: null },
    { id: 4, name: 'Diana Kumar', rollNo: 'A004', status: null },
    { id: 5, name: 'Eshan Gupta', rollNo: 'A005', status: null },
  ];

  const sessions = [
    { id: 1, course: 'Data Structures', time: '10:00 AM - 11:30 AM', room: 'Lab-101', date: 'Apr 8, 2026' },
    { id: 2, course: 'Web Development', time: '2:00 PM - 3:30 PM', room: 'Room-202', date: 'Apr 8, 2026' },
    { id: 3, course: 'Database Systems', time: '4:00 PM - 5:30 PM', room: 'Lab-102', date: 'Apr 8, 2026' },
  ];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleMarkAttendance = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmitAttendance = () => {
    console.log('Attendance submitted:', attendance);
    setAttendance({});
    setSessionOpen(false);
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const markCount = Object.keys(attendance).length;

  const tabs = [
    {
      label: 'Mark Attendance',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {!selectedSession ? (
            // Session Selection
            <div className="space-y-4">
              <Card>
                <CardHeader title="Select a Session" subtitle="Choose the class you want to mark attendance for" />
                <CardBody className="space-y-3">
                  {sessions.map((session) => (
                    <motion.button
                      key={session.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedSession(session)}
                      className="w-full p-4 bg-white dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-lg text-left hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-50">{session.course}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            📅 {session.date} | ⏰ {session.time} | 📍 {session.room}
                          </p>
                        </div>
                        <Badge variant="primary" size="sm">
                          Select
                        </Badge>
                      </div>
                    </motion.button>
                  ))}
                </CardBody>
              </Card>
            </div>
          ) : (
            // Mark Attendance
            <div className="space-y-4">
              {/* Session Info */}
              <Card>
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Current Session</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{selectedSession.course}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSession(null)}
                    >
                      Change Session
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-neutral-50 dark:bg-dark-800 rounded">
                      <p className="text-neutral-600 dark:text-neutral-400">Time</p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-50">{selectedSession.time}</p>
                    </div>
                    <div className="p-2 bg-neutral-50 dark:bg-dark-800 rounded">
                      <p className="text-neutral-600 dark:text-neutral-400">Room</p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-50">{selectedSession.room}</p>
                    </div>
                    <div className="p-2 bg-neutral-50 dark:bg-dark-800 rounded">
                      <p className="text-neutral-600 dark:text-neutral-400">Date</p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-50">{selectedSession.date}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Attendance Progress */}
              <Card>
                <CardBody className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">Marked Present</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{presentCount}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">Marked Absent</p>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">{absentCount}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Total Marked</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{markCount}/{students.length}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Search Students */}
              <Input
                label="Search Students"
                placeholder="By name or roll number..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Student List */}
              <Card>
                <CardBody className="space-y-3">
                  <AnimatePresence>
                    {filteredStudents.map((student) => (
                      <StudentRow
                        key={student.id}
                        student={student}
                        onMarkAttendance={handleMarkAttendance}
                      />
                    ))}
                  </AnimatePresence>
                </CardBody>
              </Card>

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setSessionOpen(true)}
                  disabled={markCount === 0}
                >
                  Submit Attendance ({markCount}/{students.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSession(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      ),
    },
    {
      label: 'History',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {[
            { date: 'Apr 7, 2026', course: 'Data Structures', students: 45, present: 42 },
            { date: 'Apr 6, 2026', course: 'Web Development', students: 38, present: 35 },
            { date: 'Apr 5, 2026', course: 'Database Systems', students: 50, present: 48 },
          ].map((record) => (
            <Card key={record.date}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-50">{record.course}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{record.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Attendance</p>
                    <p className="font-bold text-neutral-900 dark:text-neutral-50">
                      {record.present}/{record.students} ({Math.round((record.present / record.students) * 100)}%)
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" icon={Download}>
                    Export
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
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
          Mark Attendance
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Record student attendance for your classes
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs tabs={tabs} />

      {/* Confirmation Modal */}
      <Modal open={sessionOpen} onClose={() => setSessionOpen(false)}>
        <ModalHeader title="Confirm Attendance Submission" />
        <ModalBody>
          <Alert
            variant="info"
            title="Review Before Submitting"
            message={`You are about to mark ${presentCount} students as present and ${absentCount} as absent for ${selectedSession?.course}.`}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSessionOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitAttendance}>
            Confirm & Submit
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
