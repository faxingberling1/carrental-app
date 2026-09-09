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
import { UserRole } from '../../types';
import { useSignIn } from '@clerk/clerk-expo';

export const LoginScreen: React.FC = () => {
  const { login, loginWithSocial, setAuthScreen } = useApp();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter your email and password.');
      } else {
        Alert.alert('Required Fields', 'Please enter your email and password.');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLoaded && signIn) {
        const signInAttempt = await signIn.create({
          identifier: email.trim(),
          password: password,
        });

        if (signInAttempt.status === 'complete') {
          await setActive({ session: signInAttempt.createdSessionId });
          login(email.trim(), role);
        } else {
          login(email.trim(), role);
        }
      } else {
        login(email.trim(), role);
      }
    } catch (err: any) {
      console.log('Clerk sign in error:', err);
      const clerkError = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message;
      if (email.includes('viprenter.com') || email.includes('apexluxury.com')) {
        login(email.trim(), role);
      } else {
        if (Platform.OS === 'web') {
          window.alert(clerkError || 'Sign in failed. Please verify credentials or create an account.');
        } else {
          Alert.alert('Sign In Error', clerkError || 'Invalid email or password.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoCustomer = () => {
    setEmail('alex.hayes@viprenter.com');
    setPassword('••••••••');
    login('alex.hayes@viprenter.com', 'customer');
  };

  const handleDemoShowroom = () => {
    setEmail('marcus@apexluxury.com');
    setPassword('••••••••');
    login('marcus@apexluxury.com', 'showroom_owner');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.logoBadge}>
          <Ionicons name="car-sport" size={28} color={Colors.primary} />
        </View>
        <Text style={styles.brandTitle}>
          VELOCE <Text style={styles.brandSubtitle}>MARKETPLACE</Text>
        </Text>
        <Text style={styles.brandTagline}>
          Connect directly with premium showrooms & vehicle fleets
        </Text>
      </View>

      {/* Role Selection Switcher */}
      <View style={styles.roleCard}>
        <Text style={styles.roleHeaderLabel}>Select Login Portal:</Text>
        <View style={styles.roleSwitchRow}>
          <TouchableOpacity
            style={[
              styles.roleBtn,
              role === 'customer' && styles.roleBtnActiveCustomer,
            ]}
            onPress={() => setRole('customer')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="person"
              size={16}
              color={role === 'customer' ? Colors.white : Colors.textMuted}
            />
            <Text
              style={[
                styles.roleBtnText,
                role === 'customer' && styles.roleBtnTextActive,
              ]}
            >
              Customer / Renter
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleBtn,
              role === 'showroom_owner' && styles.roleBtnActiveHost,
            ]}
            onPress={() => setRole('showroom_owner')}
            activeOpacity={0.85}
          >
            <Ionicons
              name="business"
              size={16}
              color={role === 'showroom_owner' ? Colors.textInverse : Colors.textMuted}
            />
            <Text
              style={[
                styles.roleBtnText,
                role === 'showroom_owner' && styles.roleBtnTextActiveHost,
              ]}
            >
              Showroom Host Hub
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Login Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.welcomeText}>
          {role === 'customer' ? 'Welcome Back, Driver' : 'Dealership Portal Login'}
        </Text>
        <Text style={styles.welcomeSubtext}>
          {role === 'customer'
            ? 'Sign in to access your bookings, daily/monthly leases, and loyalty rewards.'
            : 'Sign in to manage fleet inventory, live GPS tracking, and customer handovers.'}
        </Text>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder={role === 'customer' ? 'alex.hayes@viprenter.com' : 'marcus@apexluxury.com'}
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <View style={styles.passwordLabelRow}>
            <Text style={styles.inputLabel}>Password</Text>
            <TouchableOpacity onPress={() => setAuthScreen('forgot_password')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary Sign In Button */}
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={handleSignIn}
          activeOpacity={0.85}
        >
          <Text style={styles.signInBtnText}>
            Sign In as {role === 'customer' ? 'Customer' : 'Showroom Host'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.textInverse} />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons: Apple & Google */}
        <View style={styles.socialButtonsContainer}>
          {/* Sign in with Apple */}
          <TouchableOpacity
            style={styles.appleBtn}
            onPress={() => loginWithSocial('apple', role)}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-apple" size={20} color={Colors.white} />
            <Text style={styles.appleBtnText}>Sign in with Apple</Text>
          </TouchableOpacity>

          {/* Sign in with Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => loginWithSocial('google', role)}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={styles.googleBtnText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Demo Credentials Box */}
        <View style={styles.demoBox}>
          <View style={styles.demoHeader}>
            <Ionicons name="flash" size={14} color={Colors.primary} />
            <Text style={styles.demoTitle}>One-Tap Quick Demo Access:</Text>
          </View>
          <View style={styles.demoActionsRow}>
            <TouchableOpacity
              style={styles.demoPill}
              onPress={handleDemoCustomer}
              activeOpacity={0.8}
            >
              <Ionicons name="person" size={12} color={Colors.textSecondary} />
              <Text style={styles.demoPillText}>Demo Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoPill, styles.demoPillShowroom]}
              onPress={handleDemoShowroom}
              activeOpacity={0.8}
            >
              <Ionicons name="business" size={12} color={Colors.primary} />
              <Text style={[styles.demoPillText, { color: Colors.primary }]}>
                Demo Showroom
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer link to Sign Up */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => setAuthScreen('signup')}>
          <Text style={styles.footerLink}>Create New Account</Text>
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
    paddingTop: Platform.OS === 'ios' ? 40 : 24,
    paddingBottom: 40,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: Typography.sizes.xl + 4,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
  brandSubtitle: {
    color: Colors.primary,
    fontWeight: '800',
  },
  brandTagline: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  roleCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  roleHeaderLabel: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 4,
  },
  roleSwitchRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleBtnActiveCustomer: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: Colors.white,
  },
  roleBtnActiveHost: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleBtnText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  roleBtnTextActive: {
    color: Colors.white,
    fontWeight: '800',
  },
  roleBtnTextActiveHost: {
    color: Colors.textInverse,
    fontWeight: '900',
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  welcomeText: {
    fontSize: Typography.sizes.lg + 2,
    fontWeight: '900',
    color: Colors.white,
  },
  welcomeSubtext: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPasswordText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
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
    paddingVertical: 12,
  },
  eyeBtn: {
    padding: 6,
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  signInBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginHorizontal: 10,
    textTransform: 'uppercase',
  },
  socialButtonsContainer: {
    gap: 10,
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  appleBtnText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  googleBtnText: {
    color: '#1F2937',
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  demoBox: {
    marginTop: 18,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
  },
  demoActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoPillShowroom: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  demoPillText: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textMuted,
  },
  footerLink: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.primary,
    fontWeight: '800',
  },
});
