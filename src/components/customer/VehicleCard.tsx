import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { Vehicle, RentalPlan } from '../../types';
import { Badge } from '../common/Badge';
import { StarRating } from '../common/StarRating';

interface VehicleCardProps {
  vehicle: Vehicle;
  activeRentalPlan: RentalPlan;
  onPress: () => void;
  onRentPress: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  activeRentalPlan,
  onPress,
  onRentPress,
}) => {
  const isMonthly = activeRentalPlan === 'monthly';

  // Calculate daily equivalent of monthly rate to show savings
  const dailyEquivalent = Math.round(vehicle.monthlyRate / 30);
  const percentSaved = Math.round(
    ((vehicle.dailyRate * 30 - vehicle.monthlyRate) / (vehicle.dailyRate * 30)) * 100
  );

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Vehicle Image with Overlay Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: vehicle.coverImage }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.imageGradientOverlay} />

        {/* Top Badges */}
        <View style={styles.topBadgeRow}>
          <Badge label={vehicle.category} variant="primary" size="sm" />
          <Badge
            label={vehicle.status}
            status={vehicle.status}
            size="sm"
          />
        </View>

        {/* Showroom pill at bottom of image */}
        <View style={styles.showroomPill}>
          <Ionicons name="business" size={12} color={Colors.primary} style={{ marginRight: 4 }} />
          <Text style={styles.showroomPillText} numberOfLines={1}>
            {vehicle.showroomName}
          </Text>
          <Ionicons name="checkmark-circle" size={12} color={Colors.secondary} style={{ marginLeft: 3 }} />
        </View>
      </View>

      {/* Content Body */}
      <View style={styles.content}>
        {/* Title & Rating */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.brandText}>{vehicle.brand}</Text>
            <Text style={styles.modelText} numberOfLines={1}>
              {vehicle.model} <Text style={styles.yearText}>'{vehicle.year.toString().slice(-2)}</Text>
            </Text>
          </View>
          <StarRating
            rating={vehicle.ratingAvg}
            totalReviews={vehicle.totalReviews}
            showCount
            size={13}
          />
        </View>

        {/* Specs Pills */}
        <View style={styles.specsRow}>
          <View style={styles.specChip}>
            <Ionicons name="speedometer-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.specs.transmission.slice(0, 4)}</Text>
          </View>
          <View style={styles.specChip}>
            <Ionicons name="flame-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.specs.fuelType}</Text>
          </View>
          <View style={styles.specChip}>
            <Ionicons name="people-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.specs.seats} Seats</Text>
          </View>
          <View style={styles.specChip}>
            <Ionicons name="flash-outline" size={13} color={Colors.primary} />
            <Text style={[styles.specText, { color: Colors.primary }]}>{vehicle.specs.acceleration}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Price & Action Row */}
        <View style={styles.priceRow}>
          <View style={styles.priceBlock}>
            {isMonthly ? (
              <>
                <View style={styles.rateHighlightRow}>
                  <Text style={styles.currency}>$</Text>
                  <Text style={styles.mainRate}>{vehicle.monthlyRate.toLocaleString()}</Text>
                  <Text style={styles.rateUnit}>/month</Text>
                </View>
                <View style={styles.savingsPill}>
                  <Ionicons name="trending-down" size={12} color={Colors.success} style={{ marginRight: 3 }} />
                  <Text style={styles.savingsText}>Save {percentSaved}% (${dailyEquivalent}/day)</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.rateHighlightRow}>
                  <Text style={styles.currency}>$</Text>
                  <Text style={styles.mainRate}>{vehicle.dailyRate}</Text>
                  <Text style={styles.rateUnit}>/day</Text>
                </View>
                <Text style={styles.alternativeRate}>
                  Monthly: ${vehicle.monthlyRate.toLocaleString()} (${dailyEquivalent}/day)
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.rentBtn,
              vehicle.status !== 'available' && styles.rentBtnDisabled,
            ]}
            onPress={vehicle.status === 'available' ? onRentPress : onPress}
            activeOpacity={0.85}
          >
            <Text style={styles.rentBtnText}>
              {vehicle.status === 'available' ? 'Rent Now' : 'Details'}
            </Text>
            <Ionicons
              name={vehicle.status === 'available' ? 'arrow-forward' : 'chevron-forward'}
              size={15}
              color={Colors.textInverse}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  imageContainer: {
    height: 190,
    width: '100%',
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(9, 13, 22, 0.45)',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showroomPill: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 24, 36, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxWidth: '85%',
  },
  showroomPillText: {
    color: Colors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  brandText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modelText: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 1,
  },
  yearText: {
    color: Colors.textMuted,
    fontWeight: '500',
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBlock: {
    flex: 1,
  },
  rateHighlightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: 2,
  },
  mainRate: {
    fontSize: Typography.sizes.xl,
    fontWeight: '900',
    color: Colors.white,
  },
  rateUnit: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginLeft: 3,
    fontWeight: '600',
  },
  alternativeRate: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    marginTop: 2,
  },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  savingsText: {
    fontSize: Typography.sizes.xs,
    color: Colors.success,
    fontWeight: '700',
  },
  rentBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rentBtnDisabled: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rentBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.textInverse,
  },
});
