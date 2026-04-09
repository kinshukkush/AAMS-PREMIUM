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
  Alert
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

  const [email, setEmail] = useState('student@aams.demo');
  const [password, setPassword] = useState('Student@123');
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
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      await login(email, password);
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
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: colors.primary }
            ]}
          >
            <Ionicons name="fingerprint" size={40} color="#ffffff" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>AAMS</Text>
          <Text style={[styles.subtitle, { color: colors.text2 }]}>
            Automated Attendance System
          </Text>
        </View>

        {/* Error message */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}>
            <Text style={{ color: '#dc2626' }}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={20} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
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
                placeholder="student@aams.demo"
                placeholderTextColor={colors.text2}
                value={email}
                onChangeText={setEmail}
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
                placeholder="••••••••"
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

          {/* Demo Credentials */}
          <TouchableOpacity onPress={() => { setEmail('student@aams.demo'); setPassword('Student@123'); }}>
            <Text style={[styles.link, { color: colors.primary }]}>
              Demo: student@aams.demo / Student@123
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
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
              <Ionicons name="fingerprint" size={24} color={colors.primary} />
              <Text style={[styles.biometricText, { color: colors.text }]}>
                Login with Biometric
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text2 }]}>
            Don't have an account?
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={[styles.footerLink, { color: colors.primary }]}>
              Register here
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    alignItems: 'center',
    marginBottom: 40
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14
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
    marginBottom: 40
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
  link: {
    fontSize: 12,
    textDecorationLine: 'underline',
    marginBottom: 16
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  biometricButton: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
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
    alignItems: 'center'
  },
  footerText: {
    fontSize: 14,
    marginBottom: 4
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});
