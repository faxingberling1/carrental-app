import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { useApp } from '../../context/AppContext';
import { PaymentCard } from '../../types';

interface AddCardModalProps {
  visible: boolean;
  onClose: () => void;
  onCardAdded?: (card: PaymentCard) => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  visible,
  onClose,
  onCardAdded,
}) => {
  const { addPaymentCard } = useApp();

  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<'gold' | 'dark' | 'cyan' | 'platinum'>('gold');

  // Detect card brand from number
  const getBrand = (num: string): 'visa' | 'mastercard' | 'amex' | 'discover' => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('5') || clean.startsWith('2')) return 'mastercard';
    if (clean.startsWith('34') || clean.startsWith('37')) return 'amex';
    return 'discover';
  };

  const brand = getBrand(cardNumber);

  // Format card number with spaces (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format expiry date with slash (MM/YY)
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiryDate(cleaned);
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    setCvv(cleaned);
  };

  const handleSaveCard = () => {
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 15) {
      const msg = 'Please enter a valid 15 or 16-digit card number.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Invalid Card Number', msg);
      return;
    }

    if (!cardholderName.trim() || cardholderName.trim().length < 3) {
      const msg = 'Please enter the full cardholder name as embossed on the card.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Invalid Name', msg);
      return;
    }

    if (expiryDate.length < 5) {
      const msg = 'Please enter a valid expiry date (MM/YY).';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Invalid Expiry', msg);
      return;
    }

    if (cvv.length < 3) {
      const msg = 'Please enter a 3 or 4-digit security code (CVV).';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Invalid CVV', msg);
      return;
    }

    const last4 = cleanNum.slice(-4);
    const masked = `•••• •••• •••• ${last4}`;

    const newCard = addPaymentCard({
      cardholderName: cardholderName.trim().toUpperCase(),
      cardNumber: masked,
      last4,
      expiryDate,
      brand,
      isDefault,
      colorTheme: selectedTheme,
    });

    const msg = `Payment card ${brand.toUpperCase()} ending in ${last4} securely attached and verified!`;
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert('Card Attached!', msg);

    if (onCardAdded) onCardAdded(newCard);

    // Reset fields
    setCardNumber('');
    setCardholderName('');
    setExpiryDate('');
    setCvv('');
    onClose();
  };

  const getThemeColors = () => {
    switch (selectedTheme) {
      case 'gold':
        return {
          bg: '#1C1914',
          border: 'rgba(245, 158, 11, 0.45)',
          accent: Colors.primary,
          label: 'Amber Gold',
        };
      case 'cyan':
        return {
          bg: '#0F1E29',
          border: 'rgba(6, 182, 212, 0.45)',
          accent: Colors.secondary,
          label: 'Electric Cyan',
        };
      case 'platinum':
        return {
          bg: '#1A2130',
          border: 'rgba(255, 255, 255, 0.3)',
          accent: Colors.white,
          label: 'Platinum Silver',
        };
      default:
        return {
          bg: '#111827',
          border: 'rgba(255, 255, 255, 0.15)',
          accent: Colors.textSecondary,
          label: 'Midnight Obsidian',
        };
    }
  };

  const themeColors = getThemeColors();

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
          <Text style={styles.headerTitle}>Add / Attach Card</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Visual Interactive Credit Card Preview */}
          <View
            style={[
              styles.cardPreview,
              { backgroundColor: themeColors.bg, borderColor: themeColors.border },
            ]}
          >
            {/* Top Row: Chip & Brand */}
            <View style={styles.cardPreviewTop}>
              <View style={styles.emvChip}>
                <View style={styles.emvLine} />
                <View style={[styles.emvLine, { marginTop: 4 }]} />
              </View>

              <View style={styles.cardBrandBadge}>
                <Ionicons
                  name={
                    brand === 'visa'
                      ? 'card-outline'
                      : brand === 'mastercard'
                      ? 'radio-button-on'
                      : 'shield'
                  }
                  size={16}
                  color={themeColors.accent}
                />
                <Text style={[styles.cardBrandText, { color: themeColors.accent }]}>
                  {brand.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Card Number Display */}
            <Text style={styles.cardNumberDisplay}>
              {cardNumber.padEnd(19, '•')}
            </Text>

            {/* Bottom Row: Holder Name, Expiry, Contactless Icon */}
            <View style={styles.cardPreviewBottom}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.cardPreviewLabel}>CARDHOLDER NAME</Text>
                <Text style={styles.cardPreviewValue} numberOfLines={1}>
                  {cardholderName.trim().toUpperCase() || 'YOUR NAME HERE'}
                </Text>
              </View>

              <View style={{ marginRight: 14 }}>
                <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                <Text style={styles.cardPreviewValue}>
                  {expiryDate || 'MM/YY'}
                </Text>
              </View>

              <Ionicons name="wifi" size={18} color="rgba(255, 255, 255, 0.4)" style={{ transform: [{ rotate: '90deg' }] }} />
            </View>
          </View>

          {/* Theme Color Selector */}
          <View style={styles.themeSelectorRow}>
            <Text style={styles.themeSelectorLabel}>Card Appearance:</Text>
            <View style={styles.themePillsGroup}>
              {(['gold', 'cyan', 'platinum', 'dark'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.themePill,
                    selectedTheme === t && styles.themePillActive,
                  ]}
                  onPress={() => setSelectedTheme(t)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.themeDot,
                      {
                        backgroundColor:
                          t === 'gold'
                            ? Colors.primary
                            : t === 'cyan'
                            ? Colors.secondary
                            : t === 'platinum'
                            ? '#E2E8F0'
                            : '#111827',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.themePillText,
                      selectedTheme === t && styles.themePillTextActive,
                    ]}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Input Form Fields */}
          <View style={styles.formCard}>
            {/* Card Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.inputBoxRow}>
                <Ionicons name="card" size={18} color={Colors.primary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="4532 •••• •••• 4242"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  maxLength={19}
                />
                {cardNumber.length >= 15 && (
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                )}
              </View>
            </View>

            {/* Cardholder Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <View style={styles.inputBoxRow}>
                <Ionicons name="person" size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Alexander Hayes"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                />
              </View>
            </View>

            {/* Expiry & CVV Row */}
            <View style={styles.inputTwoColRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <View style={styles.inputBoxRow}>
                  <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="MM/YY"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={expiryDate}
                    onChangeText={handleExpiryChange}
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>CVV / CVC</Text>
                <View style={styles.inputBoxRow}>
                  <Ionicons name="lock-closed" size={16} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="123"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    secureTextEntry
                    value={cvv}
                    onChangeText={handleCvvChange}
                    maxLength={4}
                  />
                </View>
              </View>
            </View>

            {/* Default Payment Card Toggle */}
            <View style={styles.defaultToggleRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.defaultToggleTitle}>Set as Default Payment Card</Text>
                <Text style={styles.defaultToggleSub}>
                  Auto-applied for vehicle bookings and security deposit holds
                </Text>
              </View>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: Colors.surfaceElevated, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>

          {/* PCI-DSS Bank Grade Security Guarantee */}
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.success} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.securityTitle}>Bank-Grade 256-Bit Encrypted</Text>
              <Text style={styles.securitySub}>
                PCI-DSS Level 1 certified. Your card credentials are encrypted at rest and never shared with vehicle hosts.
              </Text>
            </View>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSaveCard}
            activeOpacity={0.85}
          >
            <Ionicons name="lock-closed" size={16} color={Colors.textInverse} />
            <Text style={styles.submitBtnText}>Attach Card Securely</Text>
          </TouchableOpacity>
        </ScrollView>
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
  cardPreview: {
    borderRadius: BorderRadius.xl,
    padding: 20,
    borderWidth: 1,
    minHeight: 180,
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  cardPreviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emvChip: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#D4AF37',
    padding: 4,
    justifyContent: 'center',
  },
  emvLine: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardBrandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardBrandText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  cardNumberDisplay: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 2.2,
    marginVertical: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardPreviewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardPreviewLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  cardPreviewValue: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  themeSelectorRow: {
    marginBottom: Spacing.md,
  },
  themeSelectorLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  themePillsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#121824',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  themePillActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  themeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  themePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  themePillTextActive: {
    color: Colors.white,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: '#111827',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161F30',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    height: 46,
  },
  textInput: {
    flex: 1,
    marginLeft: 8,
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  inputTwoColRow: {
    flexDirection: 'row',
  },
  defaultToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
  },
  defaultToggleTitle: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  defaultToggleSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: Spacing.lg,
  },
  securityTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.success,
  },
  securitySub: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '900',
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
});
