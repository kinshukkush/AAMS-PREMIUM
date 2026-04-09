/**
 * FacultyDashboard - Faculty home screen with session management
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface Session {
  _id: string;
  name: string;
  date: string;
  status: 'active' | 'inactive';
  attendanceCount: number;
  totalStudents: number;
}

export default function FacultyDashboard({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    avgAttendance: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });
      setSessions(response.data.sessions || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.warn('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.name}>{user?.name}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <Ionicons name="document-text" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.totalClasses}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text2 }]}>
            Total Classes
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <Ionicons name="people" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stats.totalStudents}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text2 }]}>
            Total Students
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <Ionicons name="stats-chart" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {Math.round(stats.avgAttendance || 0)}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.text2 }]}>
            Avg Attendance
          </Text>
        </View>
      </View>

      {/* Active Sessions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Active Sessions
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('MarkAttendance')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {sessions.length > 0 ? (
          sessions.slice(0, 3).map((session) => (
            <View
              key={session._id}
              style={[
                styles.sessionCard,
                {
                  backgroundColor: colors.bg2,
                  borderColor: colors.border
                }
              ]}
            >
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionName, { color: colors.text }]}>
                  {session.name}
                </Text>
                <Text style={[styles.sessionDate, { color: colors.text2 }]}>
                  {new Date(session.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.sessionStats}>
                <Text style={[styles.attendanceCount, { color: colors.primary }]}>
                  {session.attendanceCount}/{session.totalStudents}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        session.status === 'active'
                          ? '#dcfce7'
                          : '#f3f4f6'
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          session.status === 'active'
                            ? '#16a34a'
                            : colors.text2
                      }
                    ]}
                  >
                    {session.status}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: colors.bg2, borderColor: colors.border }
            ]}
          >
            <Ionicons name="calendar-outline" size={32} color={colors.text2} />
            <Text style={[styles.emptyText, { color: colors.text2 }]}>
              No active sessions
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary }
          ]}
          onPress={() => navigation.navigate('MarkAttendance')}
        >
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
          <Text style={styles.actionText}>Mark Attendance</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    padding: 24,
    paddingTop: 16
  },
  greeting: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9
  },
  name: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center'
  },
  section: {
    padding: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '600'
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  sessionInfo: {
    flex: 1
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  sessionDate: {
    fontSize: 12
  },
  sessionStats: {
    alignItems: 'flex-end',
    gap: 8
  },
  attendanceCount: {
    fontSize: 14,
    fontWeight: '600'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 12,
    borderWidth: 1
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  }
});
