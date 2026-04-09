/**
 * MarkAttendanceScreen - Faculty attendance marking
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface Student {
  _id: string;
  name: string;
  email: string;
  attendance?: 'present' | 'absent' | 'late';
}

export default function MarkAttendanceScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchStudents();
  }, [selectedSession]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/students`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });
      setStudents(response.data.students || []);
      const initialAttendance: Record<string, string> = {};
      response.data.students.forEach((s: Student) => {
        initialAttendance[s._id] = '';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.warn('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  const toggleAttendance = (studentId: string, status: string) => {
    const newAttendance = { ...attendance };
    newAttendance[studentId] = newAttendance[studentId] === status ? '' : status;
    setAttendance(newAttendance);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${API_URL}/api/attendance/bulk-mark`,
        {
          attendance: Object.entries(attendance)
            .filter(([_, status]) => status)
            .map(([studentId, status]) => ({
              studentId,
              status
            }))
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('aams_token')}`
          }
        }
      );

      alert('Attendance marked successfully');
      setAttendance({});
    } catch (error) {
      alert('Error marking attendance');
    }
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    const currentStatus = attendance[item._id];

    return (
      <View
        style={[
          styles.studentItem,
          {
            backgroundColor: colors.bg2,
            borderColor: colors.border
          }
        ]}
      >
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.studentEmail, { color: colors.text2 }]}>
            {item.email}
          </Text>
        </View>

        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              {
                backgroundColor:
                  currentStatus === 'present'
                    ? '#dcfce7'
                    : colors.bg,
                borderColor:
                  currentStatus === 'present'
                    ? '#16a34a'
                    : colors.border
              }
            ]}
            onPress={() => toggleAttendance(item._id, 'present')}
          >
            <Ionicons
              name="checkmark"
              size={16}
              color={
                currentStatus === 'present'
                  ? '#16a34a'
                  : colors.text2
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              {
                backgroundColor:
                  currentStatus === 'late'
                    ? '#fef3c7'
                    : colors.bg,
                borderColor:
                  currentStatus === 'late'
                    ? '#ea580c'
                    : colors.border
              }
            ]}
            onPress={() => toggleAttendance(item._id, 'late')}
          >
            <Ionicons
              name="time"
              size={16}
              color={
                currentStatus === 'late'
                  ? '#ea580c'
                  : colors.text2
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              {
                backgroundColor:
                  currentStatus === 'absent'
                    ? '#fee2e2'
                    : colors.bg,
                borderColor:
                  currentStatus === 'absent'
                    ? '#dc2626'
                    : colors.border
              }
            ]}
            onPress={() => toggleAttendance(item._id, 'absent')}
          >
            <Ionicons
              name="close"
              size={16}
              color={
                currentStatus === 'absent'
                  ? '#dc2626'
                  : colors.text2
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.bg,
            justifyContent: 'center',
            alignItems: 'center'
          }
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Submit Button */}
      <View style={[styles.footer, { backgroundColor: colors.bg2, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <Ionicons name="checkmark-done" size={20} color="#ffffff" />
          <Text style={styles.submitText}>Submit Attendance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listContent: {
    padding: 16,
    paddingBottom: 100
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  studentInfo: {
    flex: 1,
    marginRight: 12
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  studentEmail: {
    fontSize: 12
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  }
});
