/**
 * RootNavigator - Mobile App Navigation Structure
 * Login, Dashboard, and Tab-based navigation
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Student Screens
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentAttendance from '../screens/student/StudentAttendance';
import QRScannerScreen from '../screens/attendance/QRScannerScreen';
import FaceAttendanceScreen from '../screens/attendance/FaceAttendanceScreen';

// Faculty Screens
import FacultyDashboard from '../screens/faculty/FacultyDashboard';
import MarkAttendanceScreen from '../screens/faculty/MarkAttendanceScreen';

// Shared Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Auth Navigator - Login/Register screens
 */
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

/**
 * Student Bottom Tab Navigator
 */
function StudentTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: colors.bg2 },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.bg2,
          borderTopColor: colors.border,
          borderTopWidth: 1
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text2,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'QRScanner') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={StudentDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Attendance"
        component={StudentAttendance}
        options={{ title: 'My Attendance' }}
      />
      <Tab.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{ title: 'QR Scanner' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

/**
 * Faculty Bottom Tab Navigator
 */
function FacultyTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: colors.bg2 },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.bg2,
          borderTopColor: colors.border,
          borderTopWidth: 1
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text2,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MarkAttendance') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={FacultyDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="MarkAttendance"
        component={MarkAttendanceScreen}
        options={{ title: 'Mark Attendance' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root Navigator - Handles auth state
 */
export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Group screenOptions={{ animationEnabled: false }}>
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </Stack.Group>
      ) : user.role === 'faculty' || user.role === 'admin' ? (
        <Stack.Group screenOptions={{ animationEnabled: false }}>
          <Stack.Screen name="FacultyTabs" component={FacultyTabNavigator} />
        </Stack.Group>
      ) : (
        <Stack.Group screenOptions={{ animationEnabled: false }}>
          <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
