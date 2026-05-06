/**
 * LoginScreen - Mobile Authentication
 * Email/password login with biometric support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { colors } = useTheme();
  const { login, loading, error, clearError } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.warn('Biometric check error:', error);
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter identifier and password');
      return;
    }

    try {
      await login(identifier, password);
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Authenticate to login to AAMS'
      });

      if (result.success) {
        // In production, retrieve stored credentials securely
        handleLogin();
      }
    } catch (error) {
      Alert.alert('Biometric Error', 'Failed to authenticate');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.badgeInfo, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <Ionicons name="flash" size={14} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>Secure access</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Welcome back 👋</Text>
          <Text style={[styles.subtitle, { color: colors.text2 }]}>
            Sign in to continue to your premium AAMS workspace.
          </Text>
        </View>

        {/* Error message */}
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}>
            <Text style={{ color: '#dc2626' }}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={20} color="#dc2626" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          {/* Demo Accounts */}
          <View style={[styles.demoContainer, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
            <Text style={[styles.demoTitle, { color: colors.text2 }]}>DEMO ACCOUNTS</Text>
            
            {( [
              { role: 'Admin', identifier: 'admin@aams.demo', pass: 'Admin@123', color: '#8B5CF6' },
              { role: 'Teacher', identifier: 'faculty@aams.demo', pass: 'Faculty@123', color: '#10B981' },
              { role: 'Student', identifier: 'student@aams.demo', pass: 'Student@123', color: '#F59E0B' }
            ] ).map((account) => (
              <TouchableOpacity
                key={account.role}
                style={[styles.demoCard, { backgroundColor: colors.bg, borderColor: colors.border }]}
                onPress={async () => {
                  setIdentifier(account.identifier);
                  setPassword(account.pass);
                  try {
                    await login(account.identifier, account.pass);
                  } catch (e) {
                    Alert.alert('Login Failed', e instanceof Error ? e.message : 'Unknown error');
                  }
                }}
                disabled={loading}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.demoDot, { backgroundColor: account.color, shadowColor: account.color }]} />
                  <View>
                    <Text style={[styles.demoRole, { color: colors.text }]}>{account.role}</Text>
                    <Text style={[styles.demoEmail, { color: colors.text2 }]}>{account.identifier}</Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={16} color={colors.text2} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Identifier Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address or Enrollment ID</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.bg2,
                  borderColor: colors.border
                }
              ]}
            >
              <Ionicons name="mail" size={20} color={colors.text2} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder=""
                placeholderTextColor={colors.text2}
                value={identifier}
                onChangeText={setIdentifier}
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.bg2,
                  borderColor: colors.border
                }
              ]}
            >
              <Ionicons name="lock-closed" size={20} color={colors.text2} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder=""
                placeholderTextColor={colors.text2}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.text2}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot password text (static for UI) */}
          <View style={{ alignItems: 'flex-end', marginBottom: 20, marginTop: -8 }}>
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Forgot password?</Text>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Biometric Login */}
          {biometricAvailable && (
            <TouchableOpacity
              style={[
                styles.biometricButton,
                {
                  backgroundColor: colors.bg2,
                  borderColor: colors.border
                }
              ]}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Ionicons name="finger-print" size={24} color={colors.primary} />
              <Text style={[styles.biometricText, { color: colors.text }]}>
                Login with Biometric
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text2 }]}>
            By continuing, you agree to AAMS{' '}
            <Text style={{ color: colors.primary }}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: colors.primary }}>Privacy Policy</Text>
          </Text>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  header: {
    marginBottom: 32
  },
  badgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 6
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22
  },
  errorBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  form: {
    marginBottom: 20
  },
  demoContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8
  },
  demoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3
  },
  demoRole: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2
  },
  demoEmail: {
    fontSize: 12
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8
  },
  input: {
    flex: 1,
    fontSize: 16
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  biometricButton: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 8
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    alignItems: 'center',
    marginTop: 10
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20
  }
});
