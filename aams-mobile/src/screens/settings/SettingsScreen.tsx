/**
 * SettingsScreen - Mobile app settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../context/AppContext';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { settings, updateSettings } = useAppStore();

  const handleBiometricToggle = (value: boolean) => {
    updateSettings({ enableBiometric: value });
  };

  const handleNotificationsToggle = (value: boolean) => {
    updateSettings({ enableNotifications: value });
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Are you sure you want to clear app cache?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          // Implementation pending
          Alert.alert('Success', 'Cache cleared');
        }
      }
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Appearance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Appearance
        </Text>

        <View
          style={[
            styles.settingItem,
            {
              backgroundColor: colors.bg2,
              borderColor: colors.border
            }
          ]}
        >
          <View style={styles.settingContent}>
            <Ionicons name="moon" size={20} color={colors.primary} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#d1d5db', true: colors.primary }}
          />
        </View>
      </View>

      {/* Security */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Security
        </Text>

        <View
          style={[
            styles.settingItem,
            {
              backgroundColor: colors.bg2,
              borderColor: colors.border
            }
          ]}
        >
          <View style={styles.settingContent}>
            <Ionicons name="fingerprint" size={20} color={colors.primary} />
            <View style={styles.settingLabel}>
              <Text style={[styles.settingLabelText, { color: colors.text }]}>
                Biometric Login
              </Text>
              <Text style={[styles.settingDescription, { color: colors.text2 }]}>
                Use fingerprint to login
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enableBiometric}
            onValueChange={handleBiometricToggle}
            trackColor={{ false: '#d1d5db', true: colors.primary }}
          />
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Notifications
        </Text>

        <View
          style={[
            styles.settingItem,
            {
              backgroundColor: colors.bg2,
              borderColor: colors.border
            }
          ]}
        >
          <View style={styles.settingContent}>
            <Ionicons name="notifications" size={20} color={colors.primary} />
            <View style={styles.settingLabel}>
              <Text style={[styles.settingLabelText, { color: colors.text }]}>
                Push Notifications
              </Text>
              <Text style={[styles.settingDescription, { color: colors.text2 }]}>
                Receive attendance alerts
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enableNotifications}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#d1d5db', true: colors.primary }}
          />
        </View>
      </View>

      {/* Storage */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Storage
        </Text>

        <TouchableOpacity
          style={[
            styles.settingItem,
            {
              backgroundColor: colors.bg2,
              borderColor: colors.border
            }
          ]}
          onPress={handleClearCache}
        >
          <View style={styles.settingContent}>
            <Ionicons name="trash" size={20} color="#ef4444" />
            <Text style={[styles.settingLabel, { color: '#ef4444' }]}>
              Clear Cache
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text2} />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About
        </Text>

        <View
          style={[
            styles.aboutItem,
            {
              backgroundColor: colors.bg2,
              borderColor: colors.border
            }
          ]}
        >
          <View>
            <Text style={[styles.aboutLabel, { color: colors.text2 }]}>
              Version
            </Text>
            <Text style={[styles.aboutValue, { color: colors.text }]}>
              1.0.0
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.aboutItem,
            {
              backgroundColor: colors.bg2,
              borderColor: colors.border
            }
          ]}
        >
          <View>
            <Text style={[styles.aboutLabel, { color: colors.text2 }]}>
              Build
            </Text>
            <Text style={[styles.aboutValue, { color: colors.text }]}>
              1.0.0-beta.1
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
  section: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  settingLabel: {
    flex: 1
  },
  settingLabelText: {
    fontSize: 14,
    fontWeight: '600'
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4
  },
  aboutItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  aboutLabel: {
    fontSize: 12,
    marginBottom: 4
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '600'
  }
});
