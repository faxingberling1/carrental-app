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

interface ActiveRentalsListModalProps {
  visible: boolean;
  bookings: Booking[];
  vehicles: Vehicle[];
  onClose: () => void;
  onSelectBooking: (booking: Booking) => void;
  onExploreCars: () => void;
  onExtendBooking?: (bookingId: string, days: number) => void;
}

export const ActiveRentalsListModal: React.FC<ActiveRentalsListModalProps> = ({
  visible,
  bookings,
  vehicles,
  onClose,
  onSelectBooking,
  onExploreCars,
  onExtendBooking,
}) => {
  const [filter, setFilter] = useState<'all' | 'daily' | 'monthly'>('all');

  const activeBookings = bookings.filter((b) => b.status === 'active');
  const filteredBookings = activeBookings.filter((b) => {
    if (filter === 'daily') return b.rentalPlan === 'daily';
    if (filter === 'monthly') return b.rentalPlan === 'monthly';
    return true;
  });

  const handleCopyCode = (code: string) => {
    const msg = `Booking code ${code} copied to clipboard!`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Copied!', msg);
    }
  };

  const handleQuickExtend = (booking: Booking, days: number) => {
    if (onExtendBooking) {
      onExtendBooking(booking.id, days);
    }
    const cost = days * booking.rateApplied;
    const msg = `Lease extended by +${days} day(s) for $${cost.toLocaleString()}! New return date updated.`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Lease Extended!', msg);
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <View style={styles.livePulseDot} />
            <Text style={styles.headerTitle}>Active Rentals</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{activeBookings.length} Active</Text>
            </View>
          </View>

          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Summary Banner */}
          <View style={styles.summaryBanner}>
            <View style={styles.summaryLeft}>
              <View style={styles.summaryIconBox}>
                <Ionicons name="key" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.summaryTitle}>Current Fleet in Your Possession</Text>
                <Text style={styles.summarySub}>
                  Live telematics, roadside SOS, return bays, and digital lease vouchers.
                </Text>
              </View>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filtersRow}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
              onPress={() => setFilter('all')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                All Active ({activeBookings.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filter === 'daily' && styles.filterChipActive]}
              onPress={() => setFilter('daily')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, filter === 'daily' && styles.filterTextActive]}>
                Daily Leases ({activeBookings.filter((b) => b.rentalPlan === 'daily').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, filter === 'monthly' && styles.filterChipActive]}
              onPress={() => setFilter('monthly')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, filter === 'monthly' && styles.filterTextActive]}>
                Monthly Leases ({activeBookings.filter((b) => b.rentalPlan === 'monthly').length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active Rentals List */}
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Active Rentals</Text>
              <Text style={styles.emptySub}>
                You do not have any vehicle leases active under this category right now.
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => {
                  onClose();
                  onExploreCars();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.exploreBtnText}>Browse Available Fleet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {filteredBookings.map((booking) => {
                const vehicle = vehicles.find((v) => v.id === booking.vehicleId);
                const isMonthly = booking.rentalPlan === 'monthly';
                const fuelLevel = vehicle?.telematics?.fuelLevelPercent || (isMonthly ? 92 : 86);
                const odometer = vehicle?.telematics?.odometerKm || (isMonthly ? 18450 : 12480);
                const address = vehicle?.telematics?.currentAddress || (isMonthly ? 'Wilshire Blvd, Santa Monica, CA' : 'Sunset Blvd, Beverly Hills, CA');
                const plate = vehicle?.plateNumber || (isMonthly ? 'CA • 7RS900' : 'CA • 9VEL77');

                return (
                  <View key={booking.id} style={styles.rentalCard}>
                    {/* Card Top: Status & Booking Code */}
                    <View style={styles.cardHeader}>
                      <View style={styles.liveTagRow}>
                        <View style={styles.livePulseGreen} />
                        <Text style={styles.liveTagText}>ACTIVE LEASE</Text>
                        <View style={styles.planChip}>
                          <Text style={styles.planChipText}>
                            {isMonthly ? 'Monthly Subscription' : 'Daily Rental'}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.codeButton}
                        onPress={() => handleCopyCode(booking.bookingCode)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.codeText}>{booking.bookingCode}</Text>
                        <Ionicons name="copy-outline" size={12} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>

                    {/* Car Image + Details Row */}
                    <View style={styles.carRow}>
                      <Image
                        source={{ uri: booking.vehicleImage }}
                        style={styles.carThumb}
                        contentFit="cover"
                      />
                      <View style={styles.carMeta}>
                        <Text style={styles.carName}>{booking.vehicleName}</Text>
                        <View style={styles.hostRow}>
                          <Ionicons name="business" size={13} color={Colors.primary} />
                          <Text style={styles.hostText}>Host: {booking.showroomName}</Text>
                        </View>
                        <View style={styles.plateRow}>
                          <Ionicons name="car-sport-outline" size={12} color={Colors.textMuted} />
                          <Text style={styles.plateText}>{plate}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Return Deadline Countdown Banner */}
                    <View style={styles.deadlineRow}>
                      <View style={styles.deadlineLeft}>
                        <Ionicons name="time" size={15} color={Colors.secondary} />
                        <Text style={styles.deadlineLabel}>Scheduled Return:</Text>
                        <Text style={styles.deadlineValue}>{booking.endDate}</Text>
                      </View>
                      <View style={styles.bayBadge}>
                        <Text style={styles.bayBadgeText}>Bay Dropoff #2</Text>
                      </View>
                    </View>

                    {/* Quick Telematics Strip */}
                    <View style={styles.telematicsStrip}>
                      <View style={styles.telemetricItem}>
                        <Ionicons
                          name={vehicle?.specs.fuelType === 'Electric' ? 'battery-charging' : 'speedometer'}
                          size={13}
                          color={Colors.primary}
                        />
                        <Text style={styles.telemetricText}>{fuelLevel}% Level</Text>
                      </View>
                      <View style={styles.telemetricDivider} />
                      <View style={styles.telemetricItem}>
                        <Ionicons name="navigate-outline" size={13} color={Colors.secondary} />
                        <Text style={styles.telemetricText}>{odometer.toLocaleString()} km</Text>
                      </View>
                      <View style={styles.telemetricDivider} />
                      <View style={styles.telemetricItem}>
                        <Ionicons name="shield-checkmark" size={13} color={Colors.success} />
                        <Text style={styles.telemetricText}>Armed & Guarded</Text>
                      </View>
                    </View>

                    {/* Location Pin */}
                    <View style={styles.locationRow}>
                      <Ionicons name="location-sharp" size={13} color={Colors.textMuted} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {address}
                      </Text>
                    </View>

                    {/* Price & Deposit Line */}
                    <View style={styles.financialRow}>
                      <Text style={styles.financialText}>
                        Rate: <Text style={{ color: Colors.white, fontWeight: '700' }}>${booking.rateApplied.toLocaleString()}/{isMonthly ? 'mo' : 'day'}</Text>
                      </Text>
                      <Text style={styles.financialText}>
                        Deposit Hold: <Text style={{ color: Colors.warning, fontWeight: '700' }}>${booking.securityDeposit.toLocaleString()}</Text>
                      </Text>
                      <Text style={styles.financialText}>
                        Total: <Text style={{ color: Colors.primary, fontWeight: '800' }}>${booking.totalAmount.toLocaleString()}</Text>
                      </Text>
                    </View>

                    {/* Card Actions */}
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={styles.viewHubBtn}
                        onPress={() => {
                          onClose();
                          onSelectBooking(booking);
                        }}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="hardware-chip-outline" size={15} color={Colors.textInverse} />
                        <Text style={styles.viewHubBtnText}>View Hub & Telematics</Text>
                        <Ionicons name="chevron-forward" size={14} color={Colors.textInverse} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.hostCallBtn}
                        onPress={() => Linking.openURL('tel:+15553829901')}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="call" size={14} color={Colors.textSecondary} />
                        <Text style={styles.hostCallBtnText}>Concierge</Text>
                      </TouchableOpacity>
                    </View>

                    {/* 1-Tap Quick Extend Buttons */}
                    <View style={styles.extendBar}>
                      <Text style={styles.extendBarLabel}>Quick Extend:</Text>
                      <TouchableOpacity
                        style={styles.extendPill}
                        onPress={() => handleQuickExtend(booking, 1)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.extendPillText}>+1 Day</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.extendPill}
                        onPress={() => handleQuickExtend(booking, 2)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.extendPillText}>+2 Days</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.extendPill}
                        onPress={() => handleQuickExtend(booking, 3)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.extendPillText}>+3 Days</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#0F1623',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.white,
  },
  countBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  summaryBanner: {
    backgroundColor: '#121824',
    borderRadius: BorderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: Spacing.md,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  summaryTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '900',
    color: Colors.white,
  },
  summarySub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  filterChip: {
    backgroundColor: '#121824',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  filterTextActive: {
    color: Colors.textInverse,
    fontWeight: '800',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121824',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 14,
  },
  emptySub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 18,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  exploreBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  cardsList: {
    gap: Spacing.md,
  },
  rentalCard: {
    backgroundColor: '#111827',
    borderRadius: BorderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.secondary,
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  planChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  planChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  codeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  codeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  carThumb: {
    width: 84,
    height: 64,
    borderRadius: BorderRadius.md,
  },
  carMeta: {
    flex: 1,
    marginLeft: 12,
  },
  carName: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  hostText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  plateText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  deadlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161F30',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  deadlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  deadlineValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.white,
  },
  bayBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  bayBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.secondary,
  },
  telematicsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    marginBottom: 8,
  },
  telemetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  telemetricDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  telemetricText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  locationText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
  },
  financialText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  viewHubBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  viewHubBtnText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  hostCallBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  hostCallBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  extendBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  extendBarLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  extendPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  extendPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
});
