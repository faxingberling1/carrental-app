import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { useApp } from '../../context/AppContext';
import { AddCardModal } from '../customer/AddCardModal';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenDriverProfile?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onOpenDriverProfile,
}) => {
  const { isLoaded: isAuthLoaded, isSignedIn: isClerkSignedIn, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const {
    currentUser,
    userRole,
    logout,
    paymentCards,
    removePaymentCard,
    setDefaultPaymentCard,
    currency,
    setCurrency,
    language,
    setLanguage,
  } = useApp();

  // Notification & Security States
  const [pushEnabled, setPushEnabled] = useState(true);
  const [returnReminders, setReturnReminders] = useState(true);
  const [telematicsAlerts, setTelematicsAlerts] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  // Sub-modal states
  const [isAddCardVisible, setIsAddCardVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [isFaqModalVisible, setIsFaqModalVisible] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // FAQ Accordion State
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const handleSignOut = async () => {
    onClose();
    try {
      if (isClerkSignedIn) {
        await signOut();
      }
    } catch (e) {
      console.log('Clerk sign out info:', e);
    }
    logout();
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      const msg = 'Please enter your current password.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Missing Field', msg);
      return;
    }
    if (newPassword.length < 8) {
      const msg = 'New password must be at least 8 characters long.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Password Too Short', msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = 'New password and confirmation do not match.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Mismatch', msg);
      return;
    }

    const msg = 'Your account password has been updated securely.';
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert('Success', msg);

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordModalVisible(false);
  };

  const handleRemoveCard = (cardId: string, last4: string) => {
    if (paymentCards.length <= 1) {
      const msg = 'You must have at least one active card attached for vehicle security deposits.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Cannot Remove Card', msg);
      return;
    }

    const confirmMsg = `Are you sure you want to detach card ending in ${last4}?`;
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        removePaymentCard(cardId);
      }
    } else {
      Alert.alert('Detach Card', confirmMsg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Detach', style: 'destructive', onPress: () => removePaymentCard(cardId) },
      ]);
    }
  };

  const currencies: { code: 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD'; name: string; symbol: string }[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  ];

  const languages = ['English', 'Français', 'Español', 'Deutsch', 'العربية'];

  const faqs = [
    {
      q: 'How does the refundable security deposit work?',
      a: 'A pre-authorization hold is placed on your default attached credit card upon key release. Once the vehicle passes the 12-point return inspection with matching fuel/battery, the hold is instantly released in full.',
    },
    {
      q: 'What is the daily mileage allowance policy?',
      a: 'All rentals come with a generous daily mileage limit (typically 250 km/day for exotics, 300 km/day for luxury SUVs). Additional distance is billed at a flat rate of $0.50/km.',
    },
    {
      q: 'How do I request 24/7 Roadside Assistance?',
      a: 'Tap the Roadside SOS button anywhere in the app or call +1 (800) 555-ROAD. All leases include complimentary flat tire repair, battery jumpstart, and towing.',
    },
    {
      q: 'Can I extend my ongoing rental lease?',
      a: 'Yes! Open your Active Rental Hub on the customer dashboard and tap the 1-Tap Lease Extension buttons (+1, +2, or +3 days) to extend your reservation seamlessly.',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Settings</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Driver License Quick Card */}
          {userRole === 'customer' && (
            <TouchableOpacity
              style={styles.driverIdBanner}
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                if (onOpenDriverProfile) onOpenDriverProfile();
              }}
            >
              <View style={styles.driverIdLeft}>
                <View style={styles.idIconCircle}>
                  <Ionicons name="id-card" size={20} color={Colors.primary} />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.driverIdTitle}>Driver's License & Identity</Text>
                  <Text style={styles.driverIdSub}>
                    {currentUser?.driverLicenseNumber || 'DL-9088214-B'} • Verified & Active
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}

          {/* Clerk Authentication Card */}
          <View style={styles.clerkAuthCard}>
            <View style={styles.clerkAuthLeft}>
              <View style={styles.clerkIconBox}>
                <Ionicons name="shield-checkmark" size={20} color="#6C47FF" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.clerkTitle}>Clerk Authentication</Text>
                  <View style={[styles.clerkBadge, isClerkSignedIn ? styles.clerkBadgeActive : styles.clerkBadgeDemo]}>
                    <Text style={styles.clerkBadgeText}>
                      {isClerkSignedIn ? 'LIVE SESSION' : 'READY / DEMO'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.clerkEmail} numberOfLines={1}>
                  {clerkUser?.primaryEmailAddress?.emailAddress || currentUser?.email || 'Authenticated User'}
                </Text>
                {clerkUser?.id && (
                  <Text style={styles.clerkUserId} numberOfLines={1}>
                    ID: {clerkUser.id}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Payment Methods & Attached Cards */}
          <View style={styles.settingsGroup}>
            <View style={styles.groupHeadingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupHeading}>Payment Methods & Cards</Text>
                <Text style={styles.groupSub}>
                  Attached cards for instant bookings & security deposit holds
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addCardSmallBtn}
                onPress={() => setIsAddCardVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={14} color={Colors.textInverse} />
                <Text style={styles.addCardSmallBtnText}>Add Card</Text>
              </TouchableOpacity>
            </View>

            {/* List of Attached Cards */}
            <View style={styles.cardsList}>
              {paymentCards.map((card) => {
                const isVisa = card.brand === 'visa';
                const isMastercard = card.brand === 'mastercard';

                return (
                  <View key={card.id} style={styles.cardItem}>
                    <View style={styles.cardItemLeft}>
                      <View style={styles.cardBrandIconBox}>
                        <Ionicons
                          name={isVisa ? 'card' : isMastercard ? 'radio-button-on' : 'shield'}
                          size={18}
                          color={isVisa ? Colors.primary : Colors.secondary}
                        />
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.cardItemBrand}>
                            {card.brand.toUpperCase()} •••• {card.last4}
                          </Text>
                          {card.isDefault && (
                            <View style={styles.defaultPill}>
                              <Text style={styles.defaultPillText}>DEFAULT</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.cardItemExpiry}>
                          Expires {card.expiryDate} • {card.cardholderName}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardItemRight}>
                      {!card.isDefault && (
                        <TouchableOpacity
                          style={styles.makeDefaultBtn}
                          onPress={() => setDefaultPaymentCard(card.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.makeDefaultText}>Set Default</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.deleteCardBtn}
                        onPress={() => handleRemoveCard(card.id, card.last4)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Attach New Card CTA Box */}
            <TouchableOpacity
              style={styles.attachCardDashedBox}
              onPress={() => setIsAddCardVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="card-outline" size={18} color={Colors.primary} />
              <Text style={styles.attachCardDashedText}>+ Attach New Credit or Debit Card</Text>
            </TouchableOpacity>
          </View>

          {/* Preferences: Notifications & Alerts */}
          <View style={styles.settingsGroup}>
            <Text style={styles.groupHeading}>Notifications & Alerts</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Rental Return Reminders</Text>
                <Text style={styles.settingSub}>Alerts 2 hours before scheduled handover</Text>
              </View>
              <Switch
                value={returnReminders}
                onValueChange={(val) => {
                  setReturnReminders(val);
                  if (Platform.OS === 'web') {
                    // silent state update
                  }
                }}
                trackColor={{ false: Colors.surfaceElevated, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSub}>Booking confirmations and voucher receipts</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: Colors.surfaceElevated, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Fleet Geofence Alerts</Text>
                <Text style={styles.settingSub}>Alert if vehicle crosses city / boundary limit</Text>
              </View>
              <Switch
                value={telematicsAlerts}
                onValueChange={setTelematicsAlerts}
                trackColor={{ false: Colors.surfaceElevated, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>

          {/* Security & Access */}
          <View style={styles.settingsGroup}>
            <Text style={styles.groupHeading}>Security & Access</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Biometric Face ID / Touch ID</Text>
                <Text style={styles.settingSub}>Require biometric verification for vehicle bookings</Text>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={(val) => {
                  setBiometricsEnabled(val);
                  const msg = val ? 'Biometric security activated.' : 'Biometric security deactivated.';
                  if (Platform.OS === 'web') window.alert(msg);
                }}
                trackColor={{ false: Colors.surfaceElevated, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => setIsPasswordModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.linkRowLeft}>
                <Ionicons name="key-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.linkRowText}>Change Account Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Regional Preferences */}
          <View style={styles.settingsGroup}>
            <Text style={styles.groupHeading}>Currency & Region</Text>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => setIsCurrencyModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.linkRowLeft}>
                <Ionicons name="cash-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.linkRowText}>Currency Display</Text>
              </View>
              <View style={styles.valueRow}>
                <Text style={styles.valueBadge}>{currency} ($)</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => setIsLanguageModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.linkRowLeft}>
                <Ionicons name="language-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.linkRowText}>Language</Text>
              </View>
              <View style={styles.valueRow}>
                <Text style={styles.valueBadge}>{language}</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Support & Policies */}
          <View style={styles.settingsGroup}>
            <Text style={styles.groupHeading}>Support & Policies</Text>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => setIsFaqModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.linkRowLeft}>
                <Ionicons name="help-circle-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.linkRowText}>Help & Roadside FAQ</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => setIsTermsModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.linkRowLeft}>
                <Ionicons name="document-text-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.linkRowText}>Rental Terms & Deposit Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Sign Out Button in Settings */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
            <Text style={styles.signOutBtnText}>Sign Out from Veloce</Text>
          </TouchableOpacity>

          <Text style={styles.appVersionText}>Veloce Rentals v2.4.0 • Build 5702</Text>
        </ScrollView>

        {/* 1. Add Card Modal */}
        <AddCardModal
          visible={isAddCardVisible}
          onClose={() => setIsAddCardVisible(false)}
        />

        {/* 2. Change Password Modal */}
        <Modal
          visible={isPasswordModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setIsPasswordModalVisible(false)}
        >
          <View style={styles.dialogOverlay}>
            <View style={styles.dialogCard}>
              <View style={styles.dialogHeader}>
                <Text style={styles.dialogTitle}>Change Account Password</Text>
                <TouchableOpacity
                  onPress={() => setIsPasswordModalVisible(false)}
                  style={styles.dialogCloseBtn}
                >
                  <Ionicons name="close" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.dialogBody}>
                <View style={styles.dialogInputGroup}>
                  <Text style={styles.dialogLabel}>Current Password</Text>
                  <TextInput
                    style={styles.dialogInput}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                </View>

                <View style={styles.dialogInputGroup}>
                  <Text style={styles.dialogLabel}>New Password</Text>
                  <TextInput
                    style={styles.dialogInput}
                    placeholder="Min 8 characters"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>

                <View style={styles.dialogInputGroup}>
                  <Text style={styles.dialogLabel}>Confirm New Password</Text>
                  <TextInput
                    style={styles.dialogInput}
                    placeholder="Repeat new password"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                <TouchableOpacity
                  style={styles.dialogPrimaryBtn}
                  onPress={handleChangePassword}
                  activeOpacity={0.85}
                >
                  <Text style={styles.dialogPrimaryBtnText}>Update Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 3. Currency Selector Modal */}
        <Modal
          visible={isCurrencyModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setIsCurrencyModalVisible(false)}
        >
          <View style={styles.dialogOverlay}>
            <View style={styles.dialogCard}>
              <View style={styles.dialogHeader}>
                <Text style={styles.dialogTitle}>Select Currency Display</Text>
                <TouchableOpacity
                  onPress={() => setIsCurrencyModalVisible(false)}
                  style={styles.dialogCloseBtn}
                >
                  <Ionicons name="close" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.selectorList}>
                {currencies.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.selectorItem,
                      currency === c.code && styles.selectorItemActive,
                    ]}
                    onPress={() => {
                      setCurrency(c.code);
                      setIsCurrencyModalVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.selectorLeft}>
                      <Text style={styles.selectorSymbol}>{c.symbol}</Text>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.selectorItemTitle}>{c.code}</Text>
                        <Text style={styles.selectorItemSub}>{c.name}</Text>
                      </View>
                    </View>
                    {currency === c.code && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* 4. Language Selector Modal */}
        <Modal
          visible={isLanguageModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setIsLanguageModalVisible(false)}
        >
          <View style={styles.dialogOverlay}>
            <View style={styles.dialogCard}>
              <View style={styles.dialogHeader}>
                <Text style={styles.dialogTitle}>Select Language</Text>
                <TouchableOpacity
                  onPress={() => setIsLanguageModalVisible(false)}
                  style={styles.dialogCloseBtn}
                >
                  <Ionicons name="close" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.selectorList}>
                {languages.map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[
                      styles.selectorItem,
                      language === l && styles.selectorItemActive,
                    ]}
                    onPress={() => {
                      setLanguage(l);
                      setIsLanguageModalVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectorItemTitle}>{l}</Text>
                    {language === l && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* 5. Help & Roadside FAQ Modal */}
        <Modal
          visible={isFaqModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsFaqModalVisible(false)}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => setIsFaqModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Help & Roadside FAQ</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.faqHeroBox}>
                <Ionicons name="shield-checkmark" size={28} color={Colors.primary} />
                <Text style={styles.faqHeroTitle}>24/7 VIP Concierge & Assistance</Text>
                <Text style={styles.faqHeroSub}>
                  Instant answers regarding deposits, roadside dispatch, and return procedures.
                </Text>
              </View>

              <View style={styles.faqList}>
                {faqs.map((f, i) => {
                  const isOpen = expandedFaqIndex === i;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={styles.faqCard}
                      onPress={() => setExpandedFaqIndex(isOpen ? null : i)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.faqQuestionRow}>
                        <Text style={styles.faqQuestionText}>{f.q}</Text>
                        <Ionicons
                          name={isOpen ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={Colors.primary}
                        />
                      </View>
                      {isOpen && (
                        <View style={styles.faqAnswerBox}>
                          <Text style={styles.faqAnswerText}>{f.a}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* 6. Rental Terms & Deposit Policy Modal */}
        <Modal
          visible={isTermsModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsTermsModalVisible(false)}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => setIsTermsModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Rental Terms & Policies</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.termsCard}>
                <Text style={styles.termsSectionTitle}>1. Security Deposit Pre-Authorization</Text>
                <Text style={styles.termsText}>
                  All vehicle rentals require an authorized credit card hold. This hold is processed automatically via our PCI-DSS compliant payment gateway and will be released immediately after the vehicle return inspection is certified by the hosting showroom.
                </Text>

                <Text style={styles.termsSectionTitle}>2. Driver Eligibility</Text>
                <Text style={styles.termsText}>
                  Renters must possess a valid, government-issued driver's license for at least 2 consecutive years. For exotic and supercar tiers, renters must be at least 25 years old.
                </Text>

                <Text style={styles.termsSectionTitle}>3. Fuel & Charging Condition</Text>
                <Text style={styles.termsText}>
                  Vehicles must be returned with an equivalent fuel or battery charge level as recorded at handover. Refueling fees apply if returned below handover level.
                </Text>

                <Text style={styles.termsSectionTitle}>4. Cancellation Grace Period</Text>
                <Text style={styles.termsText}>
                  Free cancellation is guaranteed up to 24 hours prior to scheduled handover. Cancellations made within 24 hours are subject to a 1-day rental rate fee.
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 60,
    backgroundColor: '#0F1623',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.md + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  driverIdBanner: {
    backgroundColor: '#121824',
    padding: 14,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  driverIdLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  idIconCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverIdTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
  },
  driverIdSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  clerkAuthCard: {
    backgroundColor: '#0F1322',
    padding: 14,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(108, 71, 255, 0.4)',
  },
  clerkAuthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clerkIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(108, 71, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 71, 255, 0.3)',
  },
  clerkTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
  },
  clerkBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  clerkBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  clerkBadgeDemo: {
    backgroundColor: 'rgba(108, 71, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(108, 71, 255, 0.4)',
  },
  clerkBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  clerkEmail: {
    fontSize: Typography.sizes.xs,
    color: '#A5B4FC',
    marginTop: 2,
    fontWeight: '600',
  },
  clerkUserId: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  settingsGroup: {
    backgroundColor: '#111827',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  groupHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupHeading: {
    fontSize: Typography.sizes.xs,
    fontWeight: '900',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  groupSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addCardSmallBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  addCardSmallBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  cardsList: {
    gap: 8,
    marginBottom: 10,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161F30',
    padding: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  cardBrandIconBox: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardItemBrand: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  defaultPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  defaultPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.primary,
  },
  cardItemExpiry: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  makeDefaultBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  makeDefaultText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  deleteCardBtn: {
    padding: 4,
  },
  attachCardDashedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
  },
  attachCardDashedText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingTextCol: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  settingSub: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  linkRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkRowText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.white,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueBadge: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  signOutBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.danger,
  },
  appVersionText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111827',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  dialogTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
  },
  dialogCloseBtn: {
    padding: 4,
  },
  dialogBody: {
    gap: 12,
  },
  dialogInputGroup: {
    gap: 4,
  },
  dialogLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  dialogInput: {
    backgroundColor: '#161F30',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 44,
    color: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dialogPrimaryBtn: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: BorderRadius.md,
    marginTop: 6,
  },
  dialogPrimaryBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  selectorList: {
    gap: 8,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161F30',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  selectorItemActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorSymbol: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.primary,
    width: 24,
    textAlign: 'center',
  },
  selectorItemTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
  },
  selectorItemSub: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
  },
  faqHeroBox: {
    backgroundColor: '#121824',
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  faqHeroTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 8,
  },
  faqHeroSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  faqList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: '#111827',
    borderRadius: BorderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
    flex: 1,
    marginRight: 10,
  },
  faqAnswerBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  faqAnswerText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  termsCard: {
    backgroundColor: '#111827',
    borderRadius: BorderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  termsSectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.primary,
  },
  termsText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
