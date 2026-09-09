import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { Booking, Vehicle } from '../../types';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

interface CustomerBookingsViewProps {
  onOpenReview: (vehicle: Vehicle, bookingId: string) => void;
  onExploreCars: () => void;
}

export const CustomerBookingsView: React.FC<CustomerBookingsViewProps> = ({
  onOpenReview,
  onExploreCars,
}) => {
  const { bookings, vehicles } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Rental Reservations</Text>
        <Text style={styles.subtitle}>
          Track your ongoing vehicle bookings, keys handover, and receipts
        </Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={54} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Reservations Yet</Text>
          <Text style={styles.emptySubtext}>
            Browse our verified dealer showrooms and book a luxury SUV, sports coupe, or economy car today.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={onExploreCars}
            activeOpacity={0.85}
          >
            <Text style={styles.exploreBtnText}>Browse Available Vehicles</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const vehicle = vehicles.find((v) => v.id === item.vehicleId);

            return (
              <View style={styles.bookingCard}>
                {/* Top Row: Booking Code & Status */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.bookingCodeLabel}>Booking ID</Text>
                    <Text style={styles.bookingCode}>{item.bookingCode}</Text>
                  </View>
                  <Badge
                    label={item.status}
                    variant={
                      item.status === 'active'
                        ? 'info'
                        : item.status === 'completed'
                        ? 'success'
                        : 'warning'
                    }
                    size="sm"
                  />
                </View>

                {/* Car info row */}
                <View style={styles.carRow}>
                  <Image
                    source={{ uri: item.vehicleImage }}
                    style={styles.carThumb}
                    contentFit="cover"
                  />
                  <View style={styles.carInfo}>
                    <Text style={styles.vehicleName} numberOfLines={1}>
                      {item.vehicleName}
                    </Text>
                    <View style={styles.showroomTag}>
                      <Ionicons name="business" size={12} color={Colors.primary} />
                      <Text style={styles.showroomText}>{item.showroomName}</Text>
                    </View>
                    <View style={styles.planBadgeRow}>
                      <Badge
                        label={item.rentalPlan === 'monthly' ? 'Monthly Plan' : 'Daily Plan'}
                        variant="primary"
                        size="sm"
                      />
                      <Text style={styles.durationText}>
                        {item.durationUnits} {item.rentalPlan === 'monthly' ? 'Month(s)' : 'Day(s)'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Dates & Pickup */}
                <View style={styles.datesBox}>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>Start Date</Text>
                    <Text style={styles.dateValue}>{item.startDate}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>Return Date</Text>
                    <Text style={styles.dateValue}>{item.endDate}</Text>
                  </View>
                </View>

                {/* Price & Deposit Summary */}
                <View style={styles.pricingSummary}>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceSubLabel}>Rental Total</Text>
                    <Text style={styles.priceAmount}>${item.totalAmount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceSubLabel}>Deposit (Refundable)</Text>
                    <Text style={styles.priceAmount}>${item.securityDeposit.toLocaleString()}</Text>
                  </View>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceSubLabel}>Handover</Text>
                    <Text style={styles.priceAmount}>
                      {item.pickupType === 'showroom_pickup' ? 'Showroom' : 'Delivery'}
                    </Text>
                  </View>
                </View>

                {/* Card Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtnOutline}
                    onPress={() => Linking.openURL('tel:+15553829901')}
                  >
                    <Ionicons name="call" size={14} color={Colors.textSecondary} />
                    <Text style={styles.actionBtnOutlineText}>Contact Showroom</Text>
                  </TouchableOpacity>

                  {vehicle && !item.hasReviewed && (
                    <TouchableOpacity
                      style={styles.actionBtnPrimary}
                      onPress={() => onOpenReview(vehicle, item.id)}
                    >
                      <Ionicons name="star" size={14} color={Colors.textInverse} />
                      <Text style={styles.actionBtnPrimaryText}>Rate Vehicle</Text>
                    </TouchableOpacity>
                  )}

                  {item.hasReviewed && (
                    <View style={styles.reviewedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                      <Text style={styles.reviewedText}>Reviewed</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: '900',
    color: Colors.white,
  },
  subtitle: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textMuted,
    marginTop: 2,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },
  exploreBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  exploreBtnText: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingCodeLabel: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  bookingCode: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.primary,
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  carThumb: {
    width: 80,
    height: 60,
    borderRadius: BorderRadius.sm,
  },
  carInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleName: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
  },
  showroomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  showroomText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  planBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  durationText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  datesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: BorderRadius.md,
    marginBottom: 12,
  },
  dateCol: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
  },
  dateValue: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 2,
  },
  pricingSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginBottom: 12,
  },
  priceItem: {
    alignItems: 'flex-start',
  },
  priceSubLabel: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
  },
  priceAmount: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnOutlineText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  actionBtnPrimaryText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  reviewedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: BorderRadius.md,
  },
  reviewedText: {
    fontSize: Typography.sizes.xs,
    color: Colors.success,
    fontWeight: '700',
  },
});
