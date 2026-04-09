/**
 * QRScannerScreen - QR code scanning for attendance
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function QRScannerScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<boolean | null>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: any) => {
    if (!scanning || loading) return;
    setScanning(false);
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/attendance/mark-qr`,
        { qrData: data },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('aams_token')}`
          }
        }
      );

      Alert.alert('Success', 'Attendance marked successfully', [
        {
          text: 'OK',
          onPress: () => {
            setScanning(true);
            setLoading(false);
          }
        }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark attendance';
      Alert.alert('Error', message, [
        {
          text: 'Try Again',
          onPress: () => {
            setScanning(true);
            setLoading(false);
          }
        }
      ]);
    }
  };

  if (permission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (permission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {scanning ? (
        <Camera
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View style={[styles.previewContainer, { backgroundColor: colors.bg2 }]}>
          <View style={[styles.previewBox, { borderColor: colors.primary }]}>
            <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
            <Text style={[styles.previewText, { color: colors.text }]}>
              QR scanned successfully!
            </Text>
            {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />}
          </View>
        </View>
      )}

      {/* Overlay Controls */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.bg2 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Scan QR Code</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scanner Guide */}
        <View style={styles.scanner}>
          <View
            style={[
              styles.scannerFrame,
              {
                borderColor: colors.primary
              }
            ]}
          />
          <Text style={[styles.instruction, { color: colors.text2 }]}>
            Align QR code within the frame
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.controls}>
          {!scanning && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => setScanning(true)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewBox: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2
  },
  previewText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16
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
  scanner: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderRadius: 12
  },
  instruction: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center'
  },
  controls: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center'
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  }
});
