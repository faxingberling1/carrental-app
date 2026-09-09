import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { Booking, Vehicle } from '../../types';
import { Badge } from '../common/Badge';

interface ActiveRentalModalProps {
  visible: boolean;
  booking?: Booking;
  vehicle?: Vehicle;
  onClose: () => void;
  onExtendRental?: (bookingId: string, additionalDays: number) => void;
}

export const ActiveRentalModal: React.FC<ActiveRentalModalProps> = ({
  visible,
  booking,
  vehicle,
  onClose,
  onExtendRental,
}) => {
  if (!booking) return null;

  const [activeTab, setActiveTab] = useState<'status' | 'agreement'>('status');
  const [extendedDays, setExtendedDays] = useState<number | null>(null);

  const vehicleName = booking.vehicleName || 'Mercedes-Benz G63 AMG';
  const vehicleImage = booking.vehicleImage || vehicle?.coverImage || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80';
  const showroomName = booking.showroomName || 'Apex Luxury Motors';
  const fuelPercent = vehicle?.telematics?.fuelLevelPercent || 86;
  const odometer = vehicle?.telematics?.odometerKm || 12480;
  const plateNumber = vehicle?.plateNumber || 'CA • 9VEL77';
  const locationAddress = vehicle?.telematics?.currentAddress || 'Sunset Blvd, Beverly Hills, CA';

  const handleCopyCode = () => {
    const msg = `Booking code ${booking.bookingCode} copied to clipboard!`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Copied!', msg);
    }
  };



  const handleExtend = (days: number) => {
    setExtendedDays(days);
    if (onExtendRental) {
      onExtendRental(booking.id, days);
    }
    const cost = days * booking.rateApplied;
    const msg = `Extended rental by +${days} day(s) for $${cost.toLocaleString()}! New return date updated.`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Rental Extended!', msg);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Modal Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerLivePulse} />
            <Text style={styles.headerTitle}>Active Lease Hub</Text>
          </View>
          <TouchableOpacity onPress={handleCopyCode} style={styles.codePill} activeOpacity={0.8}>
            <Text style={styles.codePillText}>{booking.bookingCode}</Text>
            <Ionicons name="copy-outline" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Vehicle Hero Showcase Card */}
          <View style={styles.vehicleHeroCard}>
            <Image source={{ uri: vehicleImage }} style={styles.vehicleHeroImage} contentFit="cover" />
            <View style={styles.vehicleHeroOverlay} />

            <View style={styles.vehicleHeroContent}>
              <View style={styles.vehicleHeroTopBadges}>
                <View style={styles.activeStatusPill}>
                  <View style={styles.activeStatusDot} />
                  <Text style={styles.activeStatusText}>ACTIVE RENTAL</Text>
                </View>
                <View style={styles.platePill}>
                  <Ionicons name="car-sport" size={11} color={Colors.textMuted} />
                  <Text style={styles.plateText}>{plateNumber}</Text>
                </View>
              </View>

              <View style={styles.vehicleHeroBottom}>
                <Text style={styles.vehicleHeroName}>{vehicleName}</Text>
                <Text style={styles.vehicleHeroHost}>
                  Hosted by: <Text style={{ color: Colors.primary, fontWeight: '800' }}>{showroomName}</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Return Deadline Countdown Banner */}
          <View style={styles.returnScheduleBanner}>
            <View style={styles.returnLeftCol}>
              <View style={styles.returnIconBox}>
                <Ionicons name="time" size={20} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.returnLabel}>Scheduled Return Deadline</Text>
                <Text style={styles.returnDateValue}>
                  {extendedDays ? `Extended: Return on ${booking.endDate} (+${extendedDays}d)` : `Return by: ${booking.endDate}`}
                </Text>
              </View>
            </View>
            <View style={styles.returnBayChip}>
              <Text style={styles.returnBayChipText}>Bay #2 Dropoff</Text>
            </View>
          </View>

          {/* Sub Navigation Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'status' && styles.tabItemActive]}
              onPress={() => setActiveTab('status')}
            >
              <Ionicons
                name="speedometer"
                size={14}
                color={activeTab === 'status' ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.tabItemText, activeTab === 'status' && styles.tabItemTextActive]}>
                Diagnostics & Telematics
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'agreement' && styles.tabItemActive]}
              onPress={() => setActiveTab('agreement')}
            >
              <Ionicons
                name="document-text"
                size={14}
                color={activeTab === 'agreement' ? Colors.success : Colors.textMuted}
              />
              <Text style={[styles.tabItemText, activeTab === 'agreement' && styles.tabItemTextActive]}>
                Voucher Details
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: CONNECTED CAR DIAGNOSTICS & TELEMATICS */}
          {activeTab === 'status' && (
            <View style={styles.tabSection}>
              {/* Telematics Metrics Grid */}
              <View style={styles.metricsGrid}>
                {/* Metric 1: Fuel / Battery Level */}
                <View style={styles.metricCard}>
                  <View style={styles.metricCardHeader}>
                    <Text style={styles.metricCardLabel}>Fuel / Battery</Text>
                    <Ionicons name="flash" size={15} color={Colors.primary} />
                  </View>
                  <Text style={styles.metricCardValue}>{fuelPercent}%</Text>
                  <View style={styles.metricBarTrack}>
                    <View style={[styles.metricBarFill, { width: `${fuelPercent}%`, backgroundColor: Colors.primary }]} />
                  </View>
                  <Text style={styles.metricCardSub}>≈ 490 km range</Text>
                </View>

                {/* Metric 2: Odometer Mileage */}
                <View style={styles.metricCard}>
                  <View style={styles.metricCardHeader}>
                    <Text style={styles.metricCardLabel}>Odometer</Text>
                    <Ionicons name="speedometer" size={15} color={Colors.secondary} />
                  </View>
                  <Text style={styles.metricCardValue}>{odometer.toLocaleString()} km</Text>
                  <Text style={[styles.metricCardSub, { marginTop: 14 }]}>
                    Plan: Unlimited Daily
                  </Text>
                </View>

                {/* Metric 3: Tire Pressure */}
                <View style={styles.metricCard}>
                  <View style={styles.metricCardHeader}>
                    <Text style={styles.metricCardLabel}>Tire Pressure</Text>
                    <Ionicons name="disc" size={15} color={Colors.success} />
                  </View>
                  <Text style={[styles.metricCardValue, { color: Colors.success }]}>36 PSI</Text>
                  <Text style={[styles.metricCardSub, { marginTop: 14 }]}>
                    All 4 Tires Optimal
                  </Text>
                </View>

                {/* Metric 4: Engine Status */}
                <View style={styles.metricCard}>
                  <View style={styles.metricCardHeader}>
                    <Text style={styles.metricCardLabel}>Ignition & Security</Text>
                    <Ionicons name="shield-checkmark" size={15} color={Colors.primary} />
                  </View>
                  <Text style={[styles.metricCardValue, { color: Colors.white, fontSize: Typography.sizes.sm + 1 }]}>
                    Armed & Locked
                  </Text>
                  <Text style={[styles.metricCardSub, { marginTop: 14 }]}>
                    GPS Radar Guard Active
                  </Text>
                </View>
              </View>

              {/* Live Vehicle Location Display */}
              <View style={styles.locationCard}>
                <View style={styles.locationHeaderRow}>
                  <View style={styles.locationIconBox}>
                    <Ionicons name="navigate-circle" size={20} color={Colors.secondary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.locationTitle}>Vehicle GPS Live Position</Text>
                    <Text style={styles.locationAddressText} numberOfLines={2}>
                      {locationAddress}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.mapPinBtn}
                    onPress={() => {
                      const url = Platform.select({
                        ios: `maps:0,0?q=${encodeURIComponent(locationAddress)}`,
                        android: `geo:0,0?q=${encodeURIComponent(locationAddress)}`,
                        default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationAddress)}`,
                      });
                      if (url) Linking.openURL(url);
                    }}
                  >
                    <Ionicons name="map" size={14} color={Colors.secondary} />
                    <Text style={styles.mapPinBtnText}>Map</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Handover Quality Inspection Badge */}
              <View style={styles.inspectionCard}>
                <View style={styles.inspectionTitleRow}>
                  <Ionicons name="ribbon" size={18} color={Colors.primary} />
                  <Text style={styles.inspectionTitle}>12-Point Handover Inspection Verified</Text>
                </View>
                <Text style={styles.inspectionDesc}>
                  Exterior paint, tire tread, AC sanitization, and full fuel tank were digitally inspected and signed off by {showroomName} prior to key release.
                </Text>
              </View>
            </View>
          )}



          {/* TAB 3: DIGITAL VOUCHER & LEASE AGREEMENT */}
          {activeTab === 'agreement' && (
            <View style={styles.tabSection}>
              <Text style={styles.sectionHeading}>Official Rental Digital Voucher</Text>
              <Text style={styles.sectionSub}>
                Authorized agreement between renter and verified showroom host.
              </Text>

              {/* Voucher Specs Breakdown */}
              <View style={styles.voucherBox}>
                <View style={styles.voucherRow}>
                  <Text style={styles.voucherKey}>Booking Reference</Text>
                  <Text style={styles.voucherValHighlight}>{booking.bookingCode}</Text>
                </View>

                <View style={styles.voucherRow}>
                  <Text style={styles.voucherKey}>Rental Plan</Text>
                  <Text style={styles.voucherVal}>
                    {booking.rentalPlan === 'monthly' ? 'Monthly Lease (30-day term)' : 'Daily Rental'}
                  </Text>
                </View>

                <View style={styles.voucherRow}>
                  <Text style={styles.voucherKey}>Rate Applied</Text>
                  <Text style={styles.voucherVal}>${booking.rateApplied} / day</Text>
                </View>

                <View style={styles.voucherRow}>
                  <Text style={styles.voucherKey}>Total Paid Amount</Text>
                  <Text style={styles.voucherValBold}>${booking.totalAmount.toLocaleString()}</Text>
                </View>

                <View style={styles.voucherRow}>
                  <Text style={styles.voucherKey}>Refundable Security Deposit</Text>
                  <Text style={[styles.voucherVal, { color: Colors.success, fontWeight: '700' }]}>
                    ${booking.securityDeposit.toLocaleString()} (Hold Pre-Authorized)
                  </Text>
                </View>

                <View style={styles.voucherRow}>
                  <Text style={styles.voucherKey}>Insurance Coverage</Text>
                  <Text style={styles.voucherVal}>VIP Comprehensive (Zero Excess)</Text>
                </View>

                <View style={styles.voucherRow}>
                  <Text style={styles.voucherKey}>Key Handover Date</Text>
                  <Text style={styles.voucherVal}>{booking.startDate}</Text>
                </View>

                <View style={styles.voucherRow}>
                  <Text style={styles.voucherKey}>Scheduled Return Date</Text>
                  <Text style={styles.voucherValBold}>{booking.endDate}</Text>
                </View>
              </View>

              {/* Showroom Host Details */}
              <View style={styles.showroomHostCard}>
                <View style={styles.hostHeaderRow}>
                  <View style={styles.hostIconBox}>
                    <Ionicons name="business" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.hostName}>{showroomName}</Text>
                    <Text style={styles.hostAddress}>9400 Wilshire Blvd, Beverly Hills, CA</Text>
                  </View>
                  <Badge label="Host Dealership" variant="primary" size="sm" />
                </View>

                <View style={styles.hostActionRow}>
                  <TouchableOpacity
                    style={styles.hostActionBtn}
                    onPress={() => Linking.openURL('tel:+15553829901')}
                  >
                    <Ionicons name="call" size={14} color={Colors.primary} />
                    <Text style={styles.hostActionBtnText}>Call Concierge</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.hostActionBtn}
                    onPress={() => {
                      const url = 'https://www.google.com/maps/search/?api=1&query=Apex+Luxury+Motors';
                      Linking.openURL(url);
                    }}
                  >
                    <Ionicons name="navigate" size={14} color={Colors.secondary} />
                    <Text style={[styles.hostActionBtnText, { color: Colors.secondary }]}>Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Quick Lease Extension Pill Bar */}
          <View style={styles.extensionBlock}>
            <View style={styles.extensionHeader}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <Text style={styles.extensionTitle}>Need more time? 1-Tap Lease Extension</Text>
            </View>
            <View style={styles.extensionBtnRow}>
              {[1, 2, 3].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={styles.extendDayBtn}
                  onPress={() => handleExtend(days)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.extendDayBtnText}>+{days} Day (${(days * booking.rateApplied).toLocaleString()})</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom Dual Action Buttons */}
          <View style={styles.bottomActionRow}>
            <TouchableOpacity
              style={styles.conciergeCTA}
              onPress={() => Linking.openURL('tel:+15553829901')}
              activeOpacity={0.85}
            >
              <Ionicons name="call" size={16} color={Colors.textInverse} />
              <Text style={styles.conciergeCTAText}>VIP Concierge (24/7)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sosCTA}
              onPress={() => Linking.openURL('tel:911')}
              activeOpacity={0.85}
            >
              <Ionicons name="shield" size={16} color={Colors.danger} />
              <Text style={styles.sosCTAText}>Roadside SOS</Text>
            </TouchableOpacity>
          </View>
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLivePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  codePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  vehicleHeroCard: {
    height: 180,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  vehicleHeroImage: {
    width: '100%',
    height: '100%',
  },
  vehicleHeroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 16, 26, 0.65)',
  },
  vehicleHeroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  vehicleHeroTopBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  activeStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
  activeStatusText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  platePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  plateText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  vehicleHeroBottom: {
    backgroundColor: 'rgba(10, 15, 25, 0.8)',
    padding: 10,
    borderRadius: BorderRadius.md,
  },
  vehicleHeroName: {
    fontSize: Typography.sizes.lg,
    fontWeight: '900',
    color: Colors.white,
  },
  vehicleHeroHost: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  returnScheduleBanner: {
    backgroundColor: '#111827',
    borderRadius: BorderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  returnLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  returnIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  returnLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  returnDateValue: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 2,
  },
  returnBayChip: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  returnBayChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.secondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabItemText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  tabItemTextActive: {
    color: Colors.white,
    fontWeight: '800',
  },
  tabSection: {
    gap: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#111827',
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricCardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  metricCardValue: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.white,
  },
  metricBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  metricCardSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#111827',
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.secondaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  locationAddressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    fontWeight: '600',
    marginTop: 2,
  },
  mapPinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  mapPinBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
  },
  inspectionCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  inspectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  inspectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
  },
  inspectionDesc: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '900',
    color: Colors.white,
  },
  sectionSub: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    marginBottom: 6,
    lineHeight: 16,
  },

  voucherBox: {
    backgroundColor: '#111827',
    borderRadius: BorderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  voucherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  voucherKey: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  voucherVal: {
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    fontWeight: '600',
  },
  voucherValHighlight: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  voucherValBold: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.white,
    fontWeight: '800',
  },
  showroomHostCard: {
    backgroundColor: '#111827',
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  hostHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hostIconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostName: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  hostAddress: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  hostActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hostActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hostActionBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  extensionBlock: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginVertical: 10,
  },
  extensionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  extensionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
  },
  extensionBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  extendDayBtn: {
    flex: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  extendDayBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  bottomActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  conciergeCTA: {
    flex: 1.4,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  conciergeCTAText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  sosCTA: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  sosCTAText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.danger,
  },
});
