/**
 * StudentAttendance - View student's attendance history
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  timeIn?: string;
  remarks?: string;
}

export default function StudentAttendance() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/attendance`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });
      setAttendance(response.data.attendance || []);
    } catch (error) {
      console.warn('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return '#10b981';
      case 'late':
        return '#f59e0b';
      case 'absent':
        return '#ef4444';
      default:
        return colors.text2;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return 'checkmark-circle';
      case 'late':
        return 'time';
      case 'absent':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => (
    <View
      style={[
        styles.attendanceItem,
        {
          backgroundColor: colors.bg2,
          borderColor: colors.border
        }
      ]}
    >
      <View style={styles.itemLeft}>
        <Ionicons
          name={getStatusIcon(item.status)}
          size={24}
          color={getStatusColor(item.status)}
        />
        <View style={styles.itemInfo}>
          <Text style={[styles.date, { color: colors.text }]}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
          {item.timeIn && (
            <Text style={[styles.timeIn, { color: colors.text2 }]}>
              {item.timeIn}
            </Text>
          )}
        </View>
      </View>
      <Text
        style={[
          styles.status,
          {
            color: getStatusColor(item.status)
          }
        ]}
      >
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Text>
    </View>
  );

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
        data={attendance}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={48} color={colors.text2} />
            <Text style={[styles.emptyText, { color: colors.text2 }]}>
              No attendance records yet
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  itemInfo: {
    flex: 1
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  timeIn: {
    fontSize: 12
  },
  status: {
    fontSize: 12,
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12
  }
});
