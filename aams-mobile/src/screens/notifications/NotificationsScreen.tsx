/**
 * NotificationsScreen - Notifications center (placeholder)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'attendance' | 'alert' | 'info';
  timestamp: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return 'checkmark-circle';
      case 'alert':
        return 'alert-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'attendance':
        return '#10b981';
      case 'alert':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return colors.text2;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: item.read ? colors.bg2 : colors.bg,
          borderColor: item.read ? colors.border : colors.primary,
          borderLeftWidth: 4,
          borderLeftColor: getNotificationColor(item.type)
        }
      ]}
    >
      <Ionicons
        name={getNotificationIcon(item.type)}
        size={24}
        color={getNotificationColor(item.type)}
      />
      <View style={styles.notificationContent}>
        <Text style={[styles.title, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.message, { color: colors.text2 }]}>
          {item.message}
        </Text>
        <Text style={[styles.timestamp, { color: colors.text2 }]}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      {!item.read && (
        <View
          style={[styles.unreadDot, { backgroundColor: colors.primary }]}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="notifications-off"
            size={48}
            color={colors.text2}
          />
          <Text style={[styles.emptyText, { color: colors.text2 }]}>
            No notifications yet
          </Text>
        </View>
      )}
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
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12
  },
  notificationContent: {
    flex: 1
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  message: {
    fontSize: 12,
    marginBottom: 4
  },
  timestamp: {
    fontSize: 11
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12
  }
});
