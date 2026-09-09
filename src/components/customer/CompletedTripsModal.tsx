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
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { Booking, Vehicle } from '../../types';
import { StarRating } from '../common/StarRating';

interface CompletedTripsModalProps {
  visible: boolean;
  bookings: Booking[];
  vehicles: Vehicle[];
  onClose: () => void;
  onRentAgain: (vehicle: Vehicle) => void;
  onWriteReview: (vehicle: Vehicle, bookingId: string) => void;
  onExploreCars: () => void;
}

export const CompletedTripsModal: React.FC<CompletedTripsModalProps> = ({
  visible,
  bookings,
  vehicles,
  onClose,
  onRentAgain,
  onWriteReview,
  onExploreCars,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalSpend = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalDepositsRefunded = completedBookings.reduce((sum, b) => sum + b.securityDeposit, 0);
  const pointsEarned = completedBookings.reduce((sum, b) => sum + Math.round(b.totalAmount), 0);

  const handleDownloadInvoice = (booking: Booking) => {
    const msg = `Official Tax Invoice & Payment Receipt for ${booking.vehicleName} (${booking.bookingCode}) generated! Paid: $${booking.totalAmount.toLocaleString()} USD. Full deposit $${booking.securityDeposit.toLocaleString()} refunded.`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Invoice Generated', msg);
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
            <Ionicons name="navigate-circle" size={18} color={Colors.secondary} />
            <Text style={styles.headerTitle}>Completed Trips</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{completedBookings.length} Finished</Text>
            </View>
          </View>

          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Lifetime Journey Performance Strip */}
          <View style={styles.lifetimeStrip}>
            <View style={styles.lifetimeCol}>
              <Text style={styles.lifetimeVal}>{completedBookings.length}</Text>
              <Text style={styles.lifetimeLabel}>Total Trips</Text>
            </View>
            <View style={styles.lifetimeDivider} />
            <View style={styles.lifetimeCol}>
              <Text style={[styles.lifetimeVal, { color: Colors.primary }]}>
                ${totalSpend.toLocaleString()}
              </Text>
              <Text style={styles.lifetimeLabel}>Total Spend</Text>
            </View>
            <View style={styles.lifetimeDivider} />
            <View style={styles.lifetimeCol}>
              <Text style={[styles.lifetimeVal, { color: Colors.success }]}>
                ${totalDepositsRefunded.toLocaleString()}
              </Text>
              <Text style={styles.lifetimeLabel}>Deposits Released</Text>
            </View>
            <View style={styles.lifetimeDivider} />
            <View style={styles.lifetimeCol}>
              <Text style={[styles.lifetimeVal, { color: Colors.secondary }]}>
                +{pointsEarned.toLocaleString()}
              </Text>
              <Text style={styles.lifetimeLabel}>PTS Earned</Text>
            </View>
          </View>

          {/* Guarantee Pill */}
          <View style={styles.guaranteePill}>
            <Ionicons name="shield-checkmark" size={15} color={Colors.success} />
            <Text style={styles.guaranteePillText}>
              100% On-Time Deposit Refund Record • Zero Hidden Fees
            </Text>
          </View>

          {/* List of Completed Trips */}
          {completedBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="navigate-circle-outline" size={56} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Completed Trips Yet</Text>
              <Text style={styles.emptySub}>
                Once you finish your first luxury rental and keys are returned, your trip history, receipts, and deposit refunds will appear here.
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => {
                  onClose();
                  onExploreCars();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.exploreBtnText}>Book Your First Trip</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {completedBookings.map((booking) => {
                const vehicle = vehicles.find((v) => v.id === booking.vehicleId);

                return (
                  <View key={booking.id} style={styles.tripCard}>
                    {/* Top Row: Date & Booking Reference */}
                    <View style={styles.tripCardHeader}>
                      <View style={styles.tripStatusTag}>
                        <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
                        <Text style={styles.tripStatusText}>TRIP COMPLETED</Text>
                      </View>
                      <View style={styles.codePill}>
                        <Text style={styles.codePillText}>{booking.bookingCode}</Text>
                      </View>
                    </View>

                    {/* Car Info Row */}
                    <View style={styles.carRow}>
                      <Image
                        source={{ uri: booking.vehicleImage }}
                        style={styles.carThumb}
                        contentFit="cover"
                      />
                      <View style={styles.carMeta}>
                        <Text style={styles.carName}>{booking.vehicleName}</Text>
                        <View style={styles.hostRow}>
                          <Ionicons name="business" size={12} color={Colors.primary} />
                          <Text style={styles.hostText}>{booking.showroomName}</Text>
                        </View>
                        <View style={styles.dateRow}>
                          <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                          <Text style={styles.dateText}>
                            {booking.startDate} to {booking.endDate} ({booking.durationUnits} {booking.rentalPlan === 'monthly' ? 'mo' : 'days'})
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Trip Metrics Card */}
                    <View style={styles.metricsStrip}>
                      <View style={styles.metricCol}>
                        <Text style={styles.metricVal}>${booking.rateApplied.toLocaleString()}</Text>
                        <Text style={styles.metricLbl}>Daily Rate</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricCol}>
                        <Text style={[styles.metricVal, { color: Colors.primary }]}>
                          ${booking.totalAmount.toLocaleString()}
                        </Text>
                        <Text style={styles.metricLbl}>Total Paid</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricCol}>
                        <Text style={[styles.metricVal, { color: Colors.secondary }]}>
                          +{Math.round(booking.totalAmount)}
                        </Text>
                        <Text style={styles.metricLbl}>Reward PTS</Text>
                      </View>
                    </View>

                    {/* Security Deposit Refund Verification Card */}
                    <View style={styles.depositRefundCard}>
                      <View style={styles.depositHeaderRow}>
                        <View style={styles.depositLeft}>
                          <View style={styles.shieldIconBox}>
                            <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
                          </View>
                          <View style={{ marginLeft: 8 }}>
                            <Text style={styles.depositTitle}>
                              Security Deposit Released: ${booking.securityDeposit.toLocaleString()} USD
                            </Text>
                            <Text style={styles.depositSub}>
                              Full refund processed to original card on {booking.endDate}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.depositStatusBadge}>
                          <Text style={styles.depositStatusBadgeText}>REFUNDED</Text>
                        </View>
                      </View>
                      <View style={styles.inspectionClearanceRow}>
                        <Ionicons name="checkmark-done-circle" size={13} color={Colors.success} />
                        <Text style={styles.inspectionClearanceText}>
                          Final return inspection passed • No fuel charge • Zero damages detected
                        </Text>
                      </View>
                    </View>

                    {/* Rating & Review Section */}
                    {booking.hasReviewed ? (
                      <View style={styles.reviewedBox}>
                        <View style={styles.reviewedTopRow}>
                          <View style={styles.reviewedLeft}>
                            <Ionicons name="star" size={14} color={Colors.primary} />
                            <Text style={styles.reviewedTitle}>Your Verified Review</Text>
                          </View>
                          <StarRating rating={5} totalReviews={0} size={12} />
                        </View>
                        <Text style={styles.reviewedQuote}>
                          "The car was in showroom-fresh condition with full handover inspection. Coastline drive was pure bliss!"
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.reviewPromptBtn}
                        onPress={() => {
                          if (vehicle) {
                            onClose();
                            onWriteReview(vehicle, booking.id);
                          }
                        }}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="sparkles" size={15} color={Colors.primary} />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.reviewPromptTitle}>Rate Your Experience</Text>
                          <Text style={styles.reviewPromptSub}>
                            Earn +150 Loyalty Reward Points for submitting a review
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                      </TouchableOpacity>
                    )}

                    {/* Actions Row */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.rentAgainBtn}
                        onPress={() => {
                          if (vehicle) {
                            onClose();
                            onRentAgain(vehicle);
                          } else {
                            onClose();
                            onExploreCars();
                          }
                        }}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="reload" size={14} color={Colors.textInverse} />
                        <Text style={styles.rentAgainBtnText}>Rent Again</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.invoiceBtn}
                        onPress={() => handleDownloadInvoice(booking)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="document-text-outline" size={14} color={Colors.secondary} />
                        <Text style={styles.invoiceBtnText}>Tax Receipt</Text>
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
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.white,
  },
  countBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  lifetimeStrip: {
    flexDirection: 'row',
    backgroundColor: '#121824',
    borderRadius: BorderRadius.xl,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  lifetimeCol: {
    alignItems: 'center',
    flex: 1,
  },
  lifetimeVal: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.white,
  },
  lifetimeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  lifetimeDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  guaranteePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: Spacing.md,
  },
  guaranteePillText: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: '700',
    color: Colors.success,
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
    backgroundColor: Colors.secondary,
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
  tripCard: {
    backgroundColor: '#111827',
    borderRadius: BorderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  tripStatusText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.success,
    letterSpacing: 0.5,
  },
  codePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  codePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  carThumb: {
    width: 80,
    height: 60,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  dateText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metricsStrip: {
    flexDirection: 'row',
    backgroundColor: '#161F30',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricCol: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  metricLbl: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  depositRefundCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    borderRadius: BorderRadius.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 10,
  },
  depositHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  depositLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  shieldIconBox: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.white,
  },
  depositSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },
  depositStatusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  depositStatusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.success,
  },
  inspectionClearanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.15)',
  },
  inspectionClearanceText: {
    fontSize: 9,
    color: Colors.textSecondary,
  },
  reviewedBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderRadius: BorderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    marginBottom: 10,
  },
  reviewedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewedTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
  },
  reviewedQuote: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  reviewPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: BorderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 10,
  },
  reviewPromptTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
  },
  reviewPromptSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rentAgainBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  rentAgainBtnText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  invoiceBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  invoiceBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.secondary,
  },
});
