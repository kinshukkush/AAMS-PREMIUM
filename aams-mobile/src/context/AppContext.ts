/**
 * AppContext - Global App State Management
 * Zustand store for app-wide state
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Session {
  id: string;
  name: string;
  course: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'ended' | 'pending';
}

interface AttendanceRecord {
  sessionId: string;
  status: 'present' | 'late' | 'absent';
  timestamp: string;
  method: 'face' | 'qr' | 'manual';
}

interface Settings {
  enableBiometric: boolean;
  enableNotifications: boolean;
}

interface AppState {
  // App state
  isAppReady: boolean;
  setAppReady: (ready: boolean) => void;

  // Offline queue
  offlineQueue: AttendanceRecord[];
  addToQueue: (record: AttendanceRecord) => void;
  clearQueue: () => void;

  // Current session
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;

  // Notifications
  notifications: any[];
  addNotification: (notification: any) => void;
  clearNotifications: () => void;

  // Camera permissions
  cameraPermission: boolean | null;
  setCameraPermission: (permission: boolean) => void;

  // Biometric available
  biometricAvailable: boolean;
  setBiometricAvailable: (available: boolean) => void;

  // Network status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // Settings
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // App state
  isAppReady: false,
  setAppReady: (ready) => set({ isAppReady: ready }),

  // Offline queue
  offlineQueue: [],
  addToQueue: (record) =>
    set((state) => ({
      offlineQueue: [...state.offlineQueue, record]
    })),
  clearQueue: () => set({ offlineQueue: [] }),

  // Current session
  currentSession: null,
  setCurrentSession: (session) => set({ currentSession: session }),

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification]
    })),
  clearNotifications: () => set({ notifications: [] }),

  // Camera permissions
  cameraPermission: null,
  setCameraPermission: (permission) => set({ cameraPermission: permission }),

  // Biometric available
  biometricAvailable: false,
  setBiometricAvailable: (available) => set({ biometricAvailable: available }),

  // Network status
  isOnline: true,
  setIsOnline: (online) => set({ isOnline: online }),

  // Settings
  settings: {
    enableBiometric: true,
    enableNotifications: true
  },
  updateSettings: async (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates }
    }));
    
    // Persist to AsyncStorage
    if ('enableBiometric' in updates) {
      await AsyncStorage.setItem('aams_enable_biometric', JSON.stringify(updates.enableBiometric));
    }
    if ('enableNotifications' in updates) {
      await AsyncStorage.setItem('aams_enable_notifications', JSON.stringify(updates.enableNotifications));
    }
  }
}));

// Load settings from AsyncStorage on app startup
export async function loadAppSettings() {
  try {
    const biometric = await AsyncStorage.getItem('aams_enable_biometric');
    const notifications = await AsyncStorage.getItem('aams_enable_notifications');

    if (biometric !== null || notifications !== null) {
      const updates: Partial<Settings> = {};
      if (biometric !== null) {
        updates.enableBiometric = JSON.parse(biometric);
      }
      if (notifications !== null) {
        updates.enableNotifications = JSON.parse(notifications);
      }
      useAppStore.setState({
        settings: { ...useAppStore.getState().settings, ...updates }
      });
    }
  } catch (error) {
    console.warn('Error loading app settings:', error);
  }
}
