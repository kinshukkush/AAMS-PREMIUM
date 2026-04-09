/**
 * StudentDashboard - Main student home screen
 * Overview, quick actions, and recent attendance
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

export default function StudentDashboard({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/attendance`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });

      const attendance = response.data.attendance || [];
      const present = attendance.filter((a: any) => a.status === 'present').length;
      const absent = attendance.filter((a: any) => a.status === 'absent').length;
      const late = attendance.filter((a: any) => a.status === 'late').length;
      const percentage =
        attendance.length > 0 ? ((present + late) / attendance.length) * 100 : 0;

      setStats({ present, absent, late, percentage: Math.round(percentage) });
    } catch (error) {
      console.warn('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const statCards: StatCard[] = [
    {
      title: 'Present',
      value: stats.present,
      icon: 'checkmark-circle',
      color: '#10b981'
    },
    {
      title: 'Late',
      value: stats.late,
      icon: 'time',
      color: '#f59e0b'
    },
    {
      title: 'Absent',
      value: stats.absent,
      icon: 'close-circle',
      color: '#ef4444'
    },
    {
      title: 'Attendance',
      value: `${stats.percentage}%`,
      icon: 'chart-bar',
      color: '#3b82f6'
    }
  ];

  const quickActions = [
    {
      icon: 'qr-code',
      label: 'QR Scanner',
      onPress: () => navigation.navigate('QRScanner')
    },
    {
      icon: 'face',
      label: 'Face Attendance',
      onPress: () => navigation.navigate('Attendance')
    },
    {
      icon: 'document-text',
      label: 'My Attendance',
      onPress: () => navigation.navigate('Attendance')
    },
    {
      icon: 'settings',
      label: 'Settings',
      onPress: () => navigation.navigate('Profile')
    }
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
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

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <View
            key={index}
            style={[
              styles.statCard,
              {
                backgroundColor: colors.bg2,
                borderColor: colors.border
              }
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text2 }]}>
              {stat.title}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.bg2,
                  borderColor: colors.border
                }
              ]}
              onPress={action.onPress}
            >
              <Ionicons name={action.icon} size={32} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        <View
          style={[
            styles.activityCard,
            {
              backgroundColor: colors.bg2,
              borderColor: colors.border
            }
          ]}
        >
          <View style={styles.activityContent}>
            <Text style={[styles.activityTitle, { color: colors.text }]}>
              No recent activity
            </Text>
            <Text style={[styles.activityTime, { color: colors.text2 }]}>
              Mark your attendance to see activity
            </Text>
          </View>
        </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12
  },
  statCard: {
    flex: 0.48,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center'
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12
  },
  section: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  actionButton: {
    flex: 0.48,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center'
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  activityTime: {
    fontSize: 12
  }
});
