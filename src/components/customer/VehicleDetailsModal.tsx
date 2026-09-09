import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { Vehicle, RentalPlan } from '../../types';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { StarRating } from '../common/StarRating';

interface VehicleDetailsModalProps {
  vehicle: Vehicle | null;
  visible: boolean;
  onClose: () => void;
  onOpenBooking: (vehicle: Vehicle, plan: RentalPlan) => void;
  onOpenReview: (vehicle: Vehicle) => void;
}

const { width } = Dimensions.get('window');

export const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({
  vehicle,
  visible,
  onClose,
  onOpenBooking,
  onOpenReview,
}) => {
  const { reviews, activeRentalPlan, setActiveRentalPlan } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<RentalPlan>(activeRentalPlan);

  if (!vehicle) return null;

  const vehicleReviews = reviews.filter((r) => r.vehicleId === vehicle.id);

  const dailyEquivalent = Math.round(vehicle.monthlyRate / 30);
  const savingsPct = Math.round(
    ((vehicle.dailyRate * 30 - vehicle.monthlyRate) / (vehicle.dailyRate * 30)) * 100
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Sticky Header with Close Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <View style={styles.headerRight}>
            <Badge label={vehicle.status} status={vehicle.status} size="sm" />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Gallery / Image Carousel */}
          <View style={styles.carouselContainer}>
            <Image
              source={{ uri: vehicle.images[activeImageIndex] || vehicle.coverImage }}
              style={styles.carouselImage}
              contentFit="cover"
              transition={300}
            />
            {vehicle.images.length > 1 && (
              <View style={styles.thumbnailsRow}>
                {vehicle.images.map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setActiveImageIndex(idx)}
                    style={[
                      styles.thumbBtn,
                      activeImageIndex === idx && styles.thumbBtnActive,
                    ]}
                  >
                    <Image source={{ uri: img }} style={styles.thumbImage} contentFit="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Title & Showroom Pill */}
          <View style={styles.section}>
            <View style={styles.categoryRow}>
              <Badge label={vehicle.category} variant="primary" size="sm" />
              <Badge label={vehicle.color} variant="neutral" size="sm" />
              <Text style={styles.plateText}>Plate: {vehicle.plateNumber}</Text>
            </View>

            <Text style={styles.vehicleName}>
              {vehicle.brand} {vehicle.model}
            </Text>
            <Text style={styles.vehicleYear}>{vehicle.year} Model • Verified Fleet Unit</Text>

            {/* Showroom mini card */}
            <View style={styles.showroomBanner}>
              <View style={styles.showroomBannerLeft}>
                <View style={styles.showroomIcon}>
                  <Ionicons name="business" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.showroomName}>{vehicle.showroomName}</Text>
                  <Text style={styles.showroomCity}>{vehicle.showroomCity}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => Linking.openURL('tel:+15553829901')}
              >
                <Ionicons name="call" size={14} color={Colors.primary} />
                <Text style={styles.contactBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pricing Model Selector: Daily vs Monthly */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Choose Rental Plan</Text>
            <View style={styles.planSelectorRow}>
              {/* Daily Plan Card */}
              <TouchableOpacity
                style={[
                  styles.planOptionCard,
                  selectedPlan === 'daily' && styles.planOptionCardSelected,
                ]}
                onPress={() => setSelectedPlan('daily')}
                activeOpacity={0.85}
              >
                <View style={styles.planOptionHeader}>
                  <Text
                    style={[
                      styles.planOptionTitle,
                      selectedPlan === 'daily' && { color: Colors.primary },
                    ]}
                  >
                    Daily Basis
                  </Text>
                  {selectedPlan === 'daily' && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                  )}
                </View>
                <View style={styles.planPriceRow}>
                  <Text style={styles.planCurrency}>$</Text>
                  <Text style={styles.planPriceNumber}>{vehicle.dailyRate}</Text>
                  <Text style={styles.planPeriod}>/day</Text>
                </View>
                <Text style={styles.planSubtext}>Flexible short trips & weekends</Text>
              </TouchableOpacity>

              {/* Monthly Plan Card */}
              <TouchableOpacity
                style={[
                  styles.planOptionCard,
                  selectedPlan === 'monthly' && styles.planOptionCardSelected,
                ]}
                onPress={() => setSelectedPlan('monthly')}
                activeOpacity={0.85}
              >
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>SAVE {savingsPct}%</Text>
                </View>
                <View style={styles.planOptionHeader}>
                  <Text
                    style={[
                      styles.planOptionTitle,
                      selectedPlan === 'monthly' && { color: Colors.primary },
                    ]}
                  >
                    Monthly Basis
                  </Text>
                  {selectedPlan === 'monthly' && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                  )}
                </View>
                <View style={styles.planPriceRow}>
                  <Text style={styles.planCurrency}>$</Text>
                  <Text style={styles.planPriceNumber}>{vehicle.monthlyRate.toLocaleString()}</Text>
                  <Text style={styles.planPeriod}>/mo</Text>
                </View>
                <Text style={styles.planSubtext}>${dailyEquivalent}/day equivalent</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Performance & Specifications Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Performance & Specifications</Text>
            <View style={styles.specsGrid}>
              <View style={styles.specBox}>
                <Ionicons name="flash-outline" size={22} color={Colors.primary} />
                <Text style={styles.specBoxValue}>{vehicle.specs.acceleration}</Text>
                <Text style={styles.specBoxLabel}>0-100 km/h</Text>
              </View>
              <View style={styles.specBox}>
                <Ionicons name="speedometer-outline" size={22} color={Colors.secondary} />
                <Text style={styles.specBoxValue}>{vehicle.specs.horsepower} HP</Text>
                <Text style={styles.specBoxLabel}>Horsepower</Text>
              </View>
              <View style={styles.specBox}>
                <Ionicons name="hardware-chip-outline" size={22} color={Colors.primary} />
                <Text style={styles.specBoxValue}>{vehicle.specs.engine}</Text>
                <Text style={styles.specBoxLabel}>Engine</Text>
              </View>
              <View style={styles.specBox}>
                <Ionicons name="git-branch-outline" size={22} color={Colors.secondary} />
                <Text style={styles.specBoxValue}>{vehicle.specs.transmission}</Text>
                <Text style={styles.specBoxLabel}>Transmission</Text>
              </View>
              <View style={styles.specBox}>
                <Ionicons name="flame-outline" size={22} color={Colors.warning} />
                <Text style={styles.specBoxValue}>{vehicle.specs.fuelType}</Text>
                <Text style={styles.specBoxLabel}>Fuel Type</Text>
              </View>
              <View style={styles.specBox}>
                <Ionicons name="people-outline" size={22} color={Colors.success} />
                <Text style={styles.specBoxValue}>{vehicle.specs.seats} Passengers</Text>
                <Text style={styles.specBoxLabel}>Capacity</Text>
              </View>
            </View>
          </View>

          {/* Rental Terms & Security Deposit */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Rental Conditions & Deposit</Text>
            <View style={styles.conditionsCard}>
              <View style={styles.conditionItem}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
                <Text style={styles.conditionText}>
                  Refundable Security Deposit: <Text style={{ color: Colors.white, fontWeight: '700' }}>${vehicle.securityDeposit}</Text>
                </Text>
              </View>
              <View style={styles.conditionItem}>
                <Ionicons name="navigate-outline" size={16} color={Colors.secondary} />
                <Text style={styles.conditionText}>
                  Daily Mileage Limit: <Text style={{ color: Colors.white, fontWeight: '700' }}>{vehicle.specs.mileageLimitPerDay} km/day</Text> (Extra: $0.50/km)
                </Text>
              </View>
              <View style={styles.conditionItem}>
                <Ionicons name="id-card-outline" size={16} color={Colors.primary} />
                <Text style={styles.conditionText}>
                  Requirements: Valid Driver's License & Passport / ID
                </Text>
              </View>
            </View>
          </View>

          {/* Vehicle Features */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Key Features</Text>
            <View style={styles.featuresList}>
              {vehicle.features.map((feat, idx) => (
                <View key={idx} style={styles.featurePill}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews & Ratings Section */}
          <View style={styles.section}>
            <View style={styles.reviewsHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>Reviews & Ratings</Text>
                <View style={styles.overallRatingRow}>
                  <StarRating
                    rating={vehicle.ratingAvg}
                    totalReviews={vehicle.totalReviews}
                    showCount
                    size={16}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => onOpenReview(vehicle)}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={14} color={Colors.primary} />
                <Text style={styles.writeReviewBtnText}>Rate Car</Text>
              </TouchableOpacity>
            </View>

            {vehicleReviews.length === 0 ? (
              <Text style={styles.noReviewsText}>
                No reviews yet for this vehicle. Be the first to rent and leave feedback!
              </Text>
            ) : (
              vehicleReviews.map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewUserRow}>
                    <Image
                      source={{ uri: rev.customerAvatar }}
                      style={styles.reviewerAvatar}
                      contentFit="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewerName}>{rev.customerName}</Text>
                      <View style={styles.reviewerSubRow}>
                        <StarRating rating={rev.rating} size={12} />
                        <Text style={styles.reviewDate}> • {rev.date}</Text>
                      </View>
                    </View>
                    {rev.verifiedRental && (
                      <View style={styles.verifiedRenterBadge}>
                        <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                        <Text style={styles.verifiedRenterText}>Verified Renter</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.reviewComment}>{rev.comment}</Text>

                  {/* Showroom official reply if any */}
                  {rev.showroomReply && (
                    <View style={styles.showroomReplyBox}>
                      <View style={styles.replyHeader}>
                        <Ionicons name="business" size={12} color={Colors.primary} />
                        <Text style={styles.replyTitle}>Showroom Host Response:</Text>
                      </View>
                      <Text style={styles.replyText}>{rev.showroomReply}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Sticky Bottom Booking Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomPriceInfo}>
            <Text style={styles.bottomRateLabel}>
              {selectedPlan === 'monthly' ? 'Monthly Rate' : 'Daily Rate'}
            </Text>
            <View style={styles.bottomRateRow}>
              <Text style={styles.bottomCurrency}>$</Text>
              <Text style={styles.bottomAmount}>
                {selectedPlan === 'monthly'
                  ? vehicle.monthlyRate.toLocaleString()
                  : vehicle.dailyRate}
              </Text>
              <Text style={styles.bottomUnit}>
                {selectedPlan === 'monthly' ? '/month' : '/day'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.bottomBookBtn,
              vehicle.status !== 'available' && styles.bottomBookBtnDisabled,
            ]}
            disabled={vehicle.status !== 'available'}
            onPress={() => onOpenBooking(vehicle, selectedPlan)}
            activeOpacity={0.85}
          >
            <Text style={styles.bottomBookBtnText}>
              {vehicle.status === 'available' ? 'Reserve Now' : 'Currently Unavailable'}
            </Text>
            {vehicle.status === 'available' && (
              <Ionicons name="arrow-forward" size={18} color={Colors.textInverse} />
            )}
          </TouchableOpacity>
        </View>
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
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
    maxWidth: '60%',
  },
  headerRight: {
    width: 70,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  carouselContainer: {
    width: '100%',
    backgroundColor: Colors.surfaceElevated,
  },
  carouselImage: {
    width: '100%',
    height: 250,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: 8,
    backgroundColor: Colors.surface,
  },
  thumbBtn: {
    width: 60,
    height: 44,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.transparent,
  },
  thumbBtnActive: {
    borderColor: Colors.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  plateText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  vehicleName: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '900',
    color: Colors.white,
  },
  vehicleYear: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  showroomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
  },
  showroomBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  showroomIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showroomName: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  showroomCity: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  contactBtnText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: Typography.sizes.md + 1,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 10,
  },
  planSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  planOptionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  planOptionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  saveBadge: {
    position: 'absolute',
    top: -9,
    right: 10,
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  saveBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  planOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  planOptionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planCurrency: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
  },
  planPriceNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: '900',
    color: Colors.white,
  },
  planPeriod: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginLeft: 2,
  },
  planSubtext: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    marginTop: 4,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  specBox: {
    width: '48.5%',
    backgroundColor: '#121824',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
  },
  specBoxValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  specBoxLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  conditionsCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textSecondary,
    flex: 1,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text,
    fontWeight: '600',
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  overallRatingRow: {
    marginTop: 2,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  writeReviewBtnText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  noReviewsText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  reviewerName: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  reviewerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  verifiedRenterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  verifiedRenterText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '700',
  },
  reviewComment: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  showroomReplyBox: {
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: BorderRadius.sm,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  replyTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  replyText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceInfo: {
    flex: 1,
  },
  bottomRateLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  bottomRateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomCurrency: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.primary,
  },
  bottomAmount: {
    fontSize: Typography.sizes.xxl,
    fontWeight: '900',
    color: Colors.white,
    marginLeft: 2,
  },
  bottomUnit: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginLeft: 3,
  },
  bottomBookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomBookBtnDisabled: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bottomBookBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.textInverse,
  },
});
