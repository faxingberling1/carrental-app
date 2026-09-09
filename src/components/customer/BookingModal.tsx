import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { Vehicle, RentalPlan, Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { AddCardModal } from './AddCardModal';

interface BookingModalProps {
  vehicle: Vehicle | null;
  initialPlan: RentalPlan;
  visible: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  vehicle,
  initialPlan,
  visible,
  onClose,
  onBookingSuccess,
}) => {
  const { createBooking, paymentCards } = useApp();

  const [plan, setPlan] = useState<RentalPlan>(initialPlan);
  const [daysCount, setDaysCount] = useState<number>(3);
  const [monthsCount, setMonthsCount] = useState<number>(1);
  const [pickupType, setPickupType] = useState<'showroom_pickup' | 'doorstep_delivery'>('showroom_pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  const [customerName, setCustomerName] = useState('Alexander Hayes');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 234-8890');
  const [licenseNumber, setLicenseNumber] = useState('DL-9088214-B');
  const [selectedCardId, setSelectedCardId] = useState<string>(paymentCards.find(c => c.isDefault)?.id || paymentCards[0]?.id || '');
  const [isAddCardVisible, setIsAddCardVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Sync initialPlan when modal opens
  React.useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  if (!vehicle) return null;

  const isDaily = plan === 'daily';
  const duration = isDaily ? daysCount : monthsCount;
  const rateApplied = isDaily ? vehicle.dailyRate : vehicle.monthlyRate;
  const rentalTotal = duration * rateApplied;
  const deliveryFee = pickupType === 'doorstep_delivery' ? 50 : 0;
  const totalDue = rentalTotal + deliveryFee + vehicle.securityDeposit;

  const handleConfirm = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please provide your name and phone number.');
      } else {
        Alert.alert('Missing Info', 'Please provide your name and contact phone number.');
      }
      return;
    }

    if (pickupType === 'doorstep_delivery' && !deliveryAddress.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter your delivery address.');
      } else {
        Alert.alert('Missing Address', 'Please provide delivery address for doorstep handover.');
      }
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    if (isDaily) {
      endDate.setDate(startDate.getDate() + daysCount);
    } else {
      endDate.setMonth(startDate.getMonth() + monthsCount);
    }

    const booking = createBooking({
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      vehicleImage: vehicle.coverImage,
      showroomId: vehicle.showroomId,
      showroomName: vehicle.showroomName,
      customerName,
      customerPhone,
      rentalPlan: plan,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      durationUnits: duration,
      rateApplied,
      totalAmount: rentalTotal + deliveryFee,
      securityDeposit: vehicle.securityDeposit,
      status: 'active',
      pickupType,
      deliveryAddress: pickupType === 'doorstep_delivery' ? deliveryAddress : undefined,
    });

    setCreatedBooking(booking);
    setIsSuccessModalVisible(true);
  };

  const handleDone = () => {
    setIsSuccessModalVisible(false);
    onClose();
    if (createdBooking) {
      onBookingSuccess(createdBooking);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reserve Vehicle</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Vehicle mini summary */}
          <View style={styles.vehicleSummaryCard}>
            <Image
              source={{ uri: vehicle.coverImage }}
              style={styles.vehicleThumb}
              contentFit="cover"
            />
            <View style={styles.vehicleSummaryDetails}>
              <Text style={styles.vehicleBrand}>{vehicle.brand}</Text>
              <Text style={styles.vehicleName} numberOfLines={1}>
                {vehicle.model}
              </Text>
              <Text style={styles.vehicleShowroom}>
                Host: <Text style={{ color: Colors.primary }}>{vehicle.showroomName}</Text>
              </Text>
              <View style={styles.badgeRow}>
                <Badge label={vehicle.category} variant="primary" size="sm" />
                <Badge label={vehicle.specs.transmission} variant="neutral" size="sm" />
              </View>
            </View>
          </View>

          {/* Rental Duration Model Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select Rental Basis</Text>
            <View style={styles.planSwitchRow}>
              <TouchableOpacity
                style={[
                  styles.planSwitchBtn,
                  isDaily && styles.planSwitchBtnActive,
                ]}
                onPress={() => setPlan('daily')}
              >
                <Text
                  style={[
                    styles.planSwitchText,
                    isDaily && styles.planSwitchTextActive,
                  ]}
                >
                  Daily Basis (${vehicle.dailyRate}/day)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planSwitchBtn,
                  !isDaily && styles.planSwitchBtnActive,
                ]}
                onPress={() => setPlan('monthly')}
              >
                <Text
                  style={[
                    styles.planSwitchText,
                    !isDaily && styles.planSwitchTextActive,
                  ]}
                >
                  Monthly Basis (${vehicle.monthlyRate.toLocaleString()}/mo)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stepper for duration */}
            <View style={styles.stepperContainer}>
              <Text style={styles.stepperLabel}>
                {isDaily ? 'Rental Period (Days)' : 'Rental Period (Months)'}:
              </Text>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => {
                    if (isDaily) {
                      if (daysCount > 1) setDaysCount(daysCount - 1);
                    } else {
                      if (monthsCount > 1) setMonthsCount(monthsCount - 1);
                    }
                  }}
                >
                  <Ionicons name="remove" size={18} color={Colors.white} />
                </TouchableOpacity>

                <Text style={styles.stepperValue}>
                  {duration} {isDaily ? (duration === 1 ? 'Day' : 'Days') : (duration === 1 ? 'Month' : 'Months')}
                </Text>

                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => {
                    if (isDaily) {
                      if (daysCount < 60) setDaysCount(daysCount + 1);
                    } else {
                      if (monthsCount < 12) setMonthsCount(monthsCount + 1);
                    }
                  }}
                >
                  <Ionicons name="add" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Handover & Delivery Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Handover Preference</Text>
            <View style={styles.deliveryOptions}>
              <TouchableOpacity
                style={[
                  styles.deliveryOptionCard,
                  pickupType === 'showroom_pickup' && styles.deliveryOptionCardActive,
                ]}
                onPress={() => setPickupType('showroom_pickup')}
              >
                <View style={styles.deliveryOptionHeader}>
                  <Ionicons
                    name="business"
                    size={20}
                    color={pickupType === 'showroom_pickup' ? Colors.primary : Colors.textMuted}
                  />
                  <Text style={styles.deliveryOptionTitle}>Showroom Pickup</Text>
                  <Text style={styles.deliveryFreeText}>FREE</Text>
                </View>
                <Text style={styles.deliverySubtext}>
                  Pick up at {vehicle.showroomName} ({vehicle.showroomCity})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deliveryOptionCard,
                  pickupType === 'doorstep_delivery' && styles.deliveryOptionCardActive,
                ]}
                onPress={() => setPickupType('doorstep_delivery')}
              >
                <View style={styles.deliveryOptionHeader}>
                  <Ionicons
                    name="car"
                    size={20}
                    color={pickupType === 'doorstep_delivery' ? Colors.primary : Colors.textMuted}
                  />
                  <Text style={styles.deliveryOptionTitle}>Doorstep Delivery</Text>
                  <Text style={styles.deliveryFeeText}>+$50</Text>
                </View>
                <Text style={styles.deliverySubtext}>
                  Showroom valet will bring the car directly to your address
                </Text>
              </TouchableOpacity>
            </View>

            {pickupType === 'doorstep_delivery' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Address / Hotel</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 84 Ocean Drive, Marina Tower #24"
                  placeholderTextColor={Colors.textMuted}
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                />
              </View>
            )}
          </View>

          {/* Customer Identification */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Renter Details</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Full Name as on Driver's License"
                placeholderTextColor={Colors.textMuted}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Phone Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={customerPhone}
                onChangeText={setCustomerPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Driver's License / ID Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="License ID #"
                placeholderTextColor={Colors.textMuted}
                value={licenseNumber}
                onChangeText={setLicenseNumber}
              />
            </View>
          </View>

          {/* Payment & Security Deposit Card */}
          <View style={styles.section}>
            <View style={styles.paymentHeaderRow}>
              <Text style={styles.sectionTitle}>4. Payment & Deposit Hold</Text>
              <TouchableOpacity
                style={styles.addCardMiniBtn}
                onPress={() => setIsAddCardVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={13} color={Colors.primary} />
                <Text style={styles.addCardMiniBtnText}>Attach Card</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardsPickerList}>
              {paymentCards.map((card) => {
                const isSelected = (selectedCardId || paymentCards[0]?.id) === card.id;
                return (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.cardPickerItem,
                      isSelected && styles.cardPickerItemActive,
                    ]}
                    onPress={() => setSelectedCardId(card.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardPickerLeft}>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={16}
                        color={isSelected ? Colors.primary : Colors.textMuted}
                      />
                      <View style={styles.cardBrandBadge}>
                        <Text style={styles.cardBrandBadgeText}>{card.brand.toUpperCase()}</Text>
                      </View>
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.cardPickerTitle}>•••• {card.last4}</Text>
                        <Text style={styles.cardPickerSub}>Exp {card.expiryDate}</Text>
                      </View>
                    </View>
                    {card.isDefault && (
                      <View style={styles.defaultChip}>
                        <Text style={styles.defaultChipText}>DEFAULT</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.depositHoldNotice}>
              <Ionicons name="lock-closed" size={13} color={Colors.success} />
              <Text style={styles.depositHoldText}>
                Pre-authorizes ${vehicle.securityDeposit.toLocaleString()} deposit hold on selected card. Released automatically upon return inspection.
              </Text>
            </View>
          </View>

          {/* Pricing Breakdown Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Price Summary</Text>
            <View style={styles.receiptCard}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>
                  {isDaily ? `Daily Rate (${daysCount} days × $${rateApplied})` : `Monthly Rate (${monthsCount} mo × $${rateApplied})`}
                </Text>
                <Text style={styles.receiptValue}>${rentalTotal.toLocaleString()}</Text>
              </View>

              {pickupType === 'doorstep_delivery' && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Doorstep Delivery Valet</Text>
                  <Text style={styles.receiptValue}>$50.00</Text>
                </View>
              )}

              <View style={styles.receiptRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.receiptLabel}>Refundable Security Deposit</Text>
                  <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
                </View>
                <Text style={styles.receiptValue}>${vehicle.securityDeposit.toLocaleString()}</Text>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptRowTotal}>
                <View>
                  <Text style={styles.receiptTotalLabel}>Total Due</Text>
                  <Text style={styles.receiptTotalSubtext}>Includes refundable deposit</Text>
                </View>
                <Text style={styles.receiptTotalValue}>${totalDue.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Confirmation Action */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmBtnText}>Confirm & Book</Text>
            <Ionicons name="checkmark-circle" size={20} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Success Modal */}
        <Modal
          visible={isSuccessModalVisible}
          transparent
          animationType="fade"
          onRequestClose={handleDone}
        >
          <View style={styles.successOverlay}>
            <View style={styles.successCard}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-sharp" size={36} color={Colors.textInverse} />
              </View>
              <Text style={styles.successTitle}>Reservation Confirmed!</Text>
              <Text style={styles.successVoucher}>
                Booking Code: <Text style={{ color: Colors.primary }}>{createdBooking?.bookingCode}</Text>
              </Text>
              <Text style={styles.successMessage}>
                Your vehicle has been booked with {vehicle.showroomName}. A confirmation voucher with GPS pickup instructions has been issued.
              </Text>

              <View style={styles.successDetailsBox}>
                <Text style={styles.successDetailLine}>
                  🚗 Vehicle: <Text style={{ color: Colors.white, fontWeight: '700' }}>{vehicle.brand} {vehicle.model}</Text>
                </Text>
                <Text style={styles.successDetailLine}>
                  📅 Plan: <Text style={{ color: Colors.white, fontWeight: '700' }}>{isDaily ? `${daysCount} Days (Daily)` : `${monthsCount} Month(s)`}</Text>
                </Text>
                <Text style={styles.successDetailLine}>
                  🏢 Showroom: <Text style={{ color: Colors.primary, fontWeight: '700' }}>{vehicle.showroomName}</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={styles.successActionBtn}
                onPress={handleDone}
              >
                <Text style={styles.successActionBtnText}>View In My Bookings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add / Attach Card Sub-Modal */}
        <AddCardModal
          visible={isAddCardVisible}
          onClose={() => setIsAddCardVisible(false)}
          onCardAdded={(card) => setSelectedCardId(card.id)}
        />
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
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surfaceElevated,
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
    paddingBottom: 110,
  },
  vehicleSummaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  vehicleThumb: {
    width: 90,
    height: 75,
    borderRadius: BorderRadius.sm,
  },
  vehicleSummaryDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  vehicleBrand: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  vehicleName: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
  },
  vehicleShowroom: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  planSwitchRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planSwitchBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  planSwitchBtnActive: {
    backgroundColor: Colors.primary,
  },
  planSwitchText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  planSwitchTextActive: {
    color: Colors.textInverse,
    fontWeight: '800',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperValue: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
    minWidth: 70,
    textAlign: 'center',
  },
  deliveryOptions: {
    gap: 10,
  },
  deliveryOptionCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deliveryOptionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
  },
  deliveryOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryOptionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
  },
  deliveryFreeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.success,
  },
  deliveryFeeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
  },
  deliverySubtext: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 4,
    marginLeft: 28,
  },
  inputGroup: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  receiptCard: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptLabel: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textSecondary,
  },
  receiptValue: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.white,
    fontWeight: '700',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  receiptRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTotalLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
  },
  receiptTotalSubtext: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
  },
  receiptTotalValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '900',
    color: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  successCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '900',
    color: Colors.white,
  },
  successVoucher: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginTop: 4,
  },
  successMessage: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textMuted,
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 18,
  },
  successDetailsBox: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: BorderRadius.md,
    width: '100%',
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  successDetailLine: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textSecondary,
  },
  successActionBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  successActionBtnText: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  paymentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addCardMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  addCardMiniBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  cardsPickerList: {
    gap: 8,
    marginBottom: 8,
  },
  cardPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPickerItemActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
  },
  cardPickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBrandBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginLeft: 8,
  },
  cardBrandBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.white,
  },
  cardPickerTitle: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  cardPickerSub: {
    fontSize: 9,
    color: Colors.textMuted,
  },
  defaultChip: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  defaultChipText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.primary,
  },
  depositHoldNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  depositHoldText: {
    fontSize: 9,
    color: Colors.success,
    flex: 1,
    lineHeight: 14,
  },
});
