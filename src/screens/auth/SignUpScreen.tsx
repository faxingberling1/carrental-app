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
import { useSignUp } from '@clerk/clerk-expo';
import { Modal } from 'react-native';

export const SignUpScreen: React.FC = () => {
  const { signup, loginWithSocial, setAuthScreen } = useApp();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [role, setRole] = useState<UserRole>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [driverLicense, setDriverLicense] = useState('');

  // Showroom specific fields
  const [showroomName, setShowroomName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // Clerk verification states
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please complete all required fields.');
      } else {
        Alert.alert('Required Fields', 'Please complete your name, email, and password.');
      }
      return;
    }

    if (role === 'showroom_owner' && (!showroomName.trim() || !city.trim())) {
      if (Platform.OS === 'web') {
        window.alert('Please provide your Showroom Name and City.');
      } else {
        Alert.alert('Showroom Details Required', 'Please provide your Showroom Name and City.');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLoaded && signUp) {
        const names = fullName.trim().split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ') || 'User';

        await signUp.create({
          emailAddress: email.trim(),
          password: password,
          firstName,
          lastName,
        });

        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
        const msg = `Verification code sent to ${email.trim()}! Please check your email inbox.`;
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Verification Code Sent', msg);
      } else {
        signup({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || '+1 (555) 123-4567',
          role,
          driverLicenseNumber: driverLicense.trim() || undefined,
          showroomDetails:
            role === 'showroom_owner'
              ? {
                  name: showroomName.trim(),
                  city: city.trim(),
                  address: address.trim() || `${city} Central Auto Park`,
                }
              : undefined,
        });
      }
    } catch (err: any) {
      console.log('Clerk sign up error:', err);
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Error signing up with Clerk.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Registration Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!isLoaded || !signUp) return;
    if (!verificationCode.trim()) {
      const msg = 'Please enter the 6-digit verification code sent to your email.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Required', msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        signup({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || '+1 (555) 123-4567',
          role,
          driverLicenseNumber: driverLicense.trim() || undefined,
          showroomDetails:
            role === 'showroom_owner'
              ? {
                  name: showroomName.trim(),
                  city: city.trim(),
                  address: address.trim() || `${city} Central Auto Park`,
                }
              : undefined,
        });
      } else {
        const msg = 'Verification not complete yet. Please check the code and retry.';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Verification Pending', msg);
      }
    } catch (err: any) {
      console.log('Verification code error:', err);
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Invalid verification code.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Verification Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
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
        <Text style={styles.headerTitle}>Create New Account</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Role Selection */}
      <View style={styles.roleCard}>
        <Text style={styles.roleHeaderLabel}>Select Account Type:</Text>
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
              Renter (Customer)
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
              Showroom Dealership
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Registration Form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          {role === 'customer'
            ? 'Join Veloce Rentals Community'
            : 'Register Your Showroom Dealership'}
        </Text>
        <Text style={styles.formSubtitle}>
          {role === 'customer'
            ? 'Access exotic, luxury, and daily vehicles across top certified showrooms.'
            : 'List your vehicle fleet, receive bookings on daily & monthly basis, and track telematics.'}
        </Text>

        {/* Full Name / Contact Person */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {role === 'customer' ? 'Full Name' : 'Owner / General Manager Name'}
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder={role === 'customer' ? 'Alexander Hayes' : 'Marcus Sterling'}
              placeholderTextColor={Colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        {/* Showroom specific fields */}
        {role === 'showroom_owner' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dealership / Showroom Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Paramount Prestige Motors"
                  placeholderTextColor={Colors.textMuted}
                  value={showroomName}
                  onChangeText={setShowroomName}
                />
              </View>
            </View>

            <View style={styles.rowTwo}>
              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>City / Location</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Dubai"
                    placeholderTextColor={Colors.textMuted}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.inputLabel}>Dealership Address</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Grand Blvd 400"
                    placeholderTextColor={Colors.textMuted}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>
            </View>
          </>
        )}

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {role === 'customer' ? 'Personal Email' : 'Business Email'}
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="name@domain.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Phone & License Row */}
        <View style={styles.rowTwo}>
          <View style={styles.flexOne}>
            <Text style={styles.inputLabel}>Mobile Phone</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={Colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {role === 'customer' && (
            <View style={styles.flexOne}>
              <Text style={styles.inputLabel}>Driver License #</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="DL-XXXXX"
                  placeholderTextColor={Colors.textMuted}
                  value={driverLicense}
                  onChangeText={setDriverLicense}
                />
              </View>
            </View>
          )}
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Create a strong password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Submit Register Button */}
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={handleRegister}
          activeOpacity={0.85}
        >
          <Text style={styles.registerBtnText}>
            {role === 'customer' ? 'Create Customer Account' : 'Register Showroom'}
          </Text>
          <Ionicons name="checkmark-circle" size={18} color={Colors.textInverse} />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or register with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Options */}
        <View style={styles.socialButtonsRow}>
          <TouchableOpacity
            style={styles.appleSocialBtn}
            onPress={() => loginWithSocial('apple', role)}
          >
            <Ionicons name="logo-apple" size={18} color={Colors.white} />
            <Text style={styles.socialBtnText}>Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.googleSocialBtn}
            onPress={() => loginWithSocial('google', role)}
          >
            <Ionicons name="logo-google" size={16} color="#EA4335" />
            <Text style={[styles.socialBtnText, { color: '#1F2937' }]}>Google</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer link to Login */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setAuthScreen('login')}>
          <Text style={styles.footerLink}>Sign In to Account</Text>
        </TouchableOpacity>
      </View>

      {/* Clerk Email Code Verification Modal */}
      <Modal
        visible={pendingVerification}
        animationType="fade"
        transparent
        onRequestClose={() => setPendingVerification(false)}
      >
        <View style={styles.verifyModalOverlay}>
          <View style={styles.verifyModalCard}>
            <View style={styles.verifyIconCircle}>
              <Ionicons name="mail-open" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.verifyTitle}>Verify Your Email</Text>
            <Text style={styles.verifySub}>
              We sent a 6-digit confirmation code to <Text style={{ color: Colors.white, fontWeight: '700' }}>{email}</Text>. Enter it below to complete Clerk signup:
            </Text>

            <TextInput
              style={styles.verifyInput}
              placeholder="123456"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              maxLength={6}
              value={verificationCode}
              onChangeText={setVerificationCode}
            />

            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={handleVerifyCode}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.verifyBtnText}>
                {isSubmitting ? 'Verifying...' : 'Complete Registration'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.verifyCancelBtn}
              onPress={() => setPendingVerification(false)}
            >
              <Text style={styles.verifyCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  formTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '900',
    color: Colors.white,
  },
  formSubtitle: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 18,
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
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  flexOne: {
    flex: 1,
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  registerBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  appleSocialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  googleSocialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  socialBtnText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.white,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
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
  verifyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  verifyModalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  verifyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  verifyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  verifySub: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  verifyInput: {
    width: '100%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 6,
    paddingVertical: 12,
    marginBottom: 16,
  },
  verifyBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  verifyBtnText: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  verifyCancelBtn: {
    paddingVertical: 8,
  },
  verifyCancelText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
