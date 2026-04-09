/**
 * App.tsx - Mobile App Entry Point
 * React Native Expo with navigation and theme
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAppStore } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

/**
 * App shell with providers
 */
function AppContainer() {
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  const { isAppReady, setAppReady } = useAppStore();
  const [navigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    // Hide splash screen after 1 second
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
      setAppReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [setAppReady]);

  if (!isAppReady || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1629' }}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  const linking = {
    prefixes: ['aams://', 'https://aams.app'],
    config: {
      screens: {
        Login: 'login',
        Dashboard: 'dashboard/:role',
        QRScanner: 'qr-scanner',
        FaceAttendance: 'face-attendance',
        Attendance: 'attendance/:studentId',
        Profile: 'profile/:userId',
        Settings: 'settings'
      }
    }
  };

  return (
    <NavigationContainer 
      linking={linking} 
      fallback={<ActivityIndicator color="#00d4ff" />}
      onReady={() => setNavigationReady(true)}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <RootNavigator />
          <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

/**
 * Main App with all providers
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContainer />
      </AuthProvider>
    </ThemeProvider>
  );
}
