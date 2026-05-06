/**
 * App.tsx - Mobile App Entry Point
 * React Native Expo with navigation and theme
 */

import React, { useEffect, useState, Component, ErrorInfo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAppStore } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

// Prevent splash screen from auto-hiding
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  // Ignore if already hidden
}

/**
 * Global Error Boundary — catches native module crashes (e.g., DETECT_SCREEN_CAPTURE)
 * and shows a friendly recovery UI instead of a white crash screen
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[ErrorBoundary] Caught error:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1629', padding: 24 }}>
          <Text style={{ color: '#00d4ff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
            Something went wrong
          </Text>
          <Text style={{ color: '#8892a4', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#00d4ff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={{ color: '#0f1629', fontWeight: 'bold', fontSize: 15 }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

/**
 * App shell with providers
 */
function AppContainer() {
  const { theme } = useTheme();
  const { initializing } = useAuth();
  const { isAppReady, setAppReady } = useAppStore();
  const [navigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    // Hide splash screen after 1 second
    const timer = setTimeout(() => {
      try { SplashScreen.hideAsync(); } catch (e) { /* ignore */ }
      setAppReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [setAppReady]);

  if (!isAppReady || initializing) {
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
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

/**
 * Main App with all providers and global error boundary
 */
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContainer />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
