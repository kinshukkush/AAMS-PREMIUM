/**
 * FaceAttendanceScreen - Face detection attendance marking
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function FaceAttendanceScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const cameraRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<boolean | null>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermission(status === 'granted');
    })();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || loading) return;

    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true
      });

      const response = await axios.post(
        `${API_URL}/api/attendance/mark-face`,
        { imageData: photo.base64 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('aams_token')}`
          }
        }
      );

      Alert.alert('Success', 'Face attendance marked successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark attendance';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  if (permission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.text, { color: colors.text }]}>Camera permission denied</Text>
      </View>
    );
  }

  if (permission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.camera} type={Camera.Constants.Type.front} />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.bg2 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Face Attendance</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Face Guide */}
        <View style={styles.faceGuide}>
          <View
            style={[
              styles.faceFrame,
              {
                borderColor: colors.primary
              }
            ]}
          />
          <Text style={[styles.instruction, { color: colors.text2 }]}>
            Position your face within the frame
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.captureButton, { backgroundColor: colors.primary }]}
            onPress={handleCapture}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Ionicons name="camera" size={32} color="#ffffff" />
            )}
          </TouchableOpacity>
          <Text style={[styles.captureLabel, { color: colors.text }]}>
            {loading ? 'Processing...' : 'Tap to capture'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  camera: {
    flex: 1
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    pointerEvents: 'box-none'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  text: {
    fontSize: 16
  },
  faceGuide: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  faceFrame: {
    width: 250,
    height: 300,
    borderWidth: 3,
    borderRadius: 20
  },
  instruction: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 40
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center'
  },
  captureLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600'
  }
});
