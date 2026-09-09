import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../../components/ui/Theme';
import { useApp } from '../../context/AppContext';

export const ForgotPasswordScreen: React.FC = () => {
  const { setAuthScreen, login } = useApp();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('749182');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = () => {
    if (!email.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter your registered email address.');
      } else {
        Alert.alert('Email Required', 'Please enter your registered email address.');
      }
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(code);
    setOtpCode(code); // Pre-fill for ultra-convenient demo!
    setStep('verify');
  };

  const handleResetPassword = () => {
    if (!otpCode.trim() || !newPassword.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter the 6-digit code and your new password.');
      } else {
        Alert.alert('Incomplete', 'Please enter the 6-digit code and your new password.');
      }
      return;
    }

    if (newPassword !== confirmPassword) {
      if (Platform.OS === 'web') {
        window.alert('Passwords do not match.');
      } else {
        Alert.alert('Password Mismatch', 'Passwords do not match.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      window.alert('Password successfully reset! Signing you in...');
    } else {
      Alert.alert('Success', 'Your password has been reset.');
    }

    login(email, 'customer');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setAuthScreen('login')}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.iconCenter}>
        <View style={styles.lockBadge}>
          <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
        </View>
      </View>

      <View style={styles.card}>
        {step === 'request' ? (
          <>
            <Text style={styles.cardTitle}>Forgot Your Password?</Text>
            <Text style={styles.cardSubtitle}>
              Enter your registered email address. We'll send a 6-digit verification code to reset your account password.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Registered Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="alex.hayes@viprenter.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSendCode}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Send 6-Digit Code</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.textInverse} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>Enter Verification Code</Text>
            <Text style={styles.cardSubtitle}>
              We sent a verification code to <Text style={{ color: Colors.primary, fontWeight: '700' }}>{email || 'your email'}</Text>.
            </Text>

            {/* Simulated Notification Box */}
            <View style={styles.simulatedBox}>
              <Ionicons name="notifications-outline" size={16} color={Colors.success} />
              <Text style={styles.simulatedText}>
                Demo OTP Code: <Text style={styles.codeText}>{simulatedCode}</Text> (Pre-filled)
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>6-Digit Code</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { letterSpacing: 4, fontWeight: '800' }]}
                  placeholder="123456"
                  placeholderTextColor={Colors.textMuted}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter new password"
                  placeholderTextColor={Colors.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Re-enter new password"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleResetPassword}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Reset Password & Sign In</Text>
              <Ionicons name="checkmark-circle" size={18} color={Colors.textInverse} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={() => handleSendCode()}
            >
              <Text style={styles.resendText}>Didn't receive code? Resend</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => setAuthScreen('login')}>
          <Text style={styles.footerLink}>← Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '900',
    color: Colors.white,
  },
  iconCenter: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  lockBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: Typography.sizes.lg + 1,
    fontWeight: '900',
    color: Colors.white,
  },
  cardSubtitle: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  simulatedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 12,
  },
  simulatedText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  codeText: {
    color: Colors.success,
    fontWeight: '900',
    letterSpacing: 2,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    paddingVertical: 11,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  primaryBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  resendText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerLink: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: '800',
  },
});
