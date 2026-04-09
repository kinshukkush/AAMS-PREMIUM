/**
 * ProfileScreen - User profile and account settings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout()
      }
    ]);
  };

  const profileItems = [
    {
      icon: 'person-outline',
      label: 'Full Name',
      value: user?.name,
      onPress: () => {}
    },
    {
      icon: 'mail-outline',
      label: 'Email',
      value: user?.email,
      onPress: () => {}
    },
    {
      icon: 'briefcase-outline',
      label: 'Role',
      value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1),
      onPress: () => {}
    }
  ];

  const settingsItems = [
    {
      icon: 'shield-checkmark-outline',
      label: 'Security',
      onPress: () => navigation.navigate('Settings')
    },
    {
      icon: 'bell-outline',
      label: 'Notifications',
      onPress: () => navigation.navigate('Settings')
    },
    {
      icon: 'help-circle-outline',
      label: 'About',
      onPress: () => {}
    }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={[styles.avatar, { backgroundColor: colors.bg }]}>
          <Ionicons name="person" size={40} color={colors.primary} />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
        {profileItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.item,
              {
                backgroundColor: colors.bg2,
                borderColor: colors.border
              }
            ]}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon} size={20} color={colors.primary} />
            <View style={styles.itemContent}>
              <Text style={[styles.itemLabel, { color: colors.text2 }]}>
                {item.label}
              </Text>
              <Text style={[styles.itemValue, { color: colors.text }]}>
                {item.value}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text2} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.item,
              {
                backgroundColor: colors.bg2,
                borderColor: colors.border
              }
            ]}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon} size={20} color={colors.primary} />
            <Text style={[styles.itemLabelOnly, { color: colors.text }]}>
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text2} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: colors.bg2,
              borderColor: '#ef4444'
            }
          ]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.logoutText, { color: '#ef4444' }]}>
            Logout
          </Text>
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
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  name: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  email: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14
  },
  section: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12
  },
  itemContent: {
    flex: 1
  },
  itemLabel: {
    fontSize: 12,
    marginBottom: 4
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600'
  },
  itemLabelOnly: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
    justifyContent: 'center'
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600'
  }
});
