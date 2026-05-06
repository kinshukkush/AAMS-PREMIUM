/**
 * QRScannerScreen - QR code scanning for attendance
 * Uses expo-barcode-scanner (SDK 50 compatible)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../utils/auth';

export default function QRScannerScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      await apiClient.post('/attendance/mark-qr', { qrData: data });
      Alert.alert(
        '✅ Attendance Marked',
        'Your attendance has been recorded successfully!',
        [{ text: 'OK', onPress: () => { setScanned(false); setLoading(false); } }]
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to mark attendance. Please try again.';
      Alert.alert('❌ Error', message, [
        { text: 'Try Again', onPress: () => { setScanned(false); setLoading(false); } }
      ]);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.statusText, { color: colors.text2 }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Ionicons name="camera-outline" size={48} color={colors.text2} />
        <Text style={[styles.statusText, { color: colors.text }]}>
          Camera access denied
        </Text>
        <Text style={[styles.subText, { color: colors.text2 }]}>
          Please enable camera permission in device settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera / Scanner */}
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.bg2 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan QR Code</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scanner Frame */}
        <View style={styles.scanArea}>
          <View style={[styles.scanFrame, { borderColor: loading ? '#f59e0b' : colors.primary }]}>
            {/* Corner decorations */}
            <View style={[styles.corner, styles.topLeft, { borderColor: loading ? '#f59e0b' : colors.primary }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: loading ? '#f59e0b' : colors.primary }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: loading ? '#f59e0b' : colors.primary }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: loading ? '#f59e0b' : colors.primary }]} />
          </View>
          <Text style={styles.instruction}>
            {loading ? 'Processing...' : scanned ? 'QR Scanned! Processing...' : 'Align QR code within the frame'}
          </Text>
          {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />}
        </View>

        {/* Bottom Controls */}
        <View style={[styles.controls, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          {scanned && !loading && (
            <TouchableOpacity
              style={[styles.rescanButton, { backgroundColor: colors.primary }]}
              onPress={() => { setScanned(false); setLoading(false); }}
            >
              <Ionicons name="refresh" size={20} color="#ffffff" />
              <Text style={styles.rescanText}>Scan Again</Text>
            </TouchableOpacity>
          )}
          {!scanned && (
            <Text style={styles.hint}>
              Point your camera at the QR code shown by your teacher
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 },
  statusText: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 12 },
  subText: { fontSize: 13, textAlign: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 16
  },
  backButton: {
    width: 40, height: 40, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center'
  },
  title: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  scanArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanFrame: {
    width: 260, height: 260,
    borderWidth: 2,
    borderRadius: 12,
    position: 'relative'
  },
  corner: {
    position: 'absolute', width: 24, height: 24, borderWidth: 3
  },
  topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 10 },
  topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 10 },
  bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 10 },
  bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 10 },
  instruction: {
    color: '#ffffff', fontSize: 14,
    marginTop: 20, textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20
  },
  controls: {
    alignItems: 'center', paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 40 : 50,
    paddingTop: 16
  },
  rescanButton: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 32,
    borderRadius: 8, gap: 8
  },
  rescanText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  hint: {
    color: '#ffffff', fontSize: 13,
    textAlign: 'center', opacity: 0.8
  }
});
