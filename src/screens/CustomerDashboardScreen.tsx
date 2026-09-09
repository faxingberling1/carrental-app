import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../components/ui/Theme';
import { useApp } from '../context/AppContext';
import { Booking, Vehicle, RentalPlan } from '../types';
import { Badge } from '../components/common/Badge';
import { RewardEconomyModal } from '../components/customer/RewardEconomyModal';
import { ActiveRentalModal } from '../components/customer/ActiveRentalModal';
import { ActiveRentalsListModal } from '../components/customer/ActiveRentalsListModal';
import { CompletedTripsModal } from '../components/customer/CompletedTripsModal';

interface CustomerDashboardScreenProps {
  onNavigateExplore: () => void;
  onNavigateBookings: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onRentVehicle: (vehicle: Vehicle, plan: RentalPlan) => void;
}

export const CustomerDashboardScreen: React.FC<CustomerDashboardScreenProps> = ({
  onNavigateExplore,
  onNavigateBookings,
  onSelectVehicle,
  onRentVehicle,
}) => {
  const { currentUser, bookings, vehicles } = useApp();
  const [isRewardsModalVisible, setIsRewardsModalVisible] = useState(false);
  const [rewardsInitialTab, setRewardsInitialTab] = useState<'store' | 'economy' | 'vouchers'>('store');

  const openRewards = (tab: 'store' | 'economy' | 'vouchers' = 'store') => {
    setRewardsInitialTab(tab);
    setIsRewardsModalVisible(true);
  };

  const activeBooking = bookings.find((b) => b.status === 'active');
  const activeBookingVehicle = vehicles.find((v) => v.id === activeBooking?.vehicleId);
  const [isActiveRentalModalVisible, setIsActiveRentalModalVisible] = useState(false);
  const [isActiveRentalsListVisible, setIsActiveRentalsListVisible] = useState(false);
  const [isCompletedTripsVisible, setIsCompletedTripsVisible] = useState(false);
  const [selectedActiveBooking, setSelectedActiveBooking] = useState<Booking | null>(null);
  const completedTrips = bookings.filter((b) => b.status === 'completed').length;
  const recommendedVehicles = vehicles.slice(0, 4);
  const userPoints = currentUser?.loyaltyPoints || 3450;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Dashboard Top Greeting Pill */}
      <View style={styles.dashboardWelcomeRow}>
        <View style={styles.welcomeTextCol}>
          <Text style={styles.welcomeGreeting}>Welcome to Your Drive Desk</Text>
          <Text style={styles.welcomeSub}>
            Manage active leases, loyalty rewards, and VIP concierge assistance.
          </Text>
        </View>
        <View style={styles.goldPillTag}>
          <Ionicons name="sparkles" size={11} color={Colors.primary} />
          <Text style={styles.goldPillTagText}>VIP GOLD</Text>
        </View>
      </View>

      {/* KPI Stats Row (Bento Style) */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statBox}
          activeOpacity={0.8}
          onPress={() => setIsActiveRentalsListVisible(true)}
        >
          <View style={styles.statIconRow}>
            <Ionicons name="key" size={16} color={Colors.primary} />
            <Text style={styles.statVal}>{bookings.filter((b) => b.status === 'active').length}</Text>
          </View>
          <Text style={styles.statLabel}>Active Rentals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statBox}
          activeOpacity={0.8}
          onPress={() => setIsCompletedTripsVisible(true)}
        >
          <View style={styles.statIconRow}>
            <Ionicons name="navigate-circle" size={16} color={Colors.secondary} />
            <Text style={styles.statVal}>{completedTrips}</Text>
          </View>
          <Text style={styles.statLabel}>Completed Trips</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statBox, styles.statBoxHighlighted]}
          activeOpacity={0.8}
          onPress={() => openRewards('store')}
        >
          <View style={styles.statIconRow}>
            <Ionicons name="sparkles" size={16} color={Colors.primary} />
            <Text style={[styles.statVal, { color: Colors.primary }]}>
              {userPoints}
            </Text>
          </View>
          <View style={styles.rewardTapRow}>
            <Text style={styles.statLabel}>Reward Points</Text>
            <Ionicons name="arrow-forward" size={10} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Active Ongoing Rental Widget */}
      {activeBooking ? (
        <TouchableOpacity
          style={styles.activeRentalCard}
          activeOpacity={0.92}
          onPress={() => setIsActiveRentalModalVisible(true)}
        >
          <View style={styles.activeRentalHeader}>
            <View style={styles.livePulseRow}>
              <View style={styles.livePulseDot} />
              <Text style={styles.activeRentalTitle}>Ongoing Active Rental</Text>
            </View>
            <View style={styles.activePillRight}>
              <Text style={styles.voucherCode}>{activeBooking.bookingCode}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} style={{ marginLeft: 2 }} />
            </View>
          </View>

          <View style={styles.activeRentalBody}>
            <Image
              source={{ uri: activeBooking.vehicleImage }}
              style={styles.activeCarThumb}
              contentFit="cover"
            />
            <View style={styles.activeCarDetails}>
              <Text style={styles.activeCarName}>{activeBooking.vehicleName}</Text>
              <Text style={styles.activeShowroom}>
                Host: <Text style={{ color: Colors.primary }}>{activeBooking.showroomName}</Text>
              </Text>

              <View style={styles.countdownBadge}>
                <Ionicons name="time" size={13} color={Colors.secondary} />
                <Text style={styles.countdownText}>
                  Return by: <Text style={{ color: Colors.white, fontWeight: '700' }}>{activeBooking.endDate}</Text>
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.activeCardActions}>
            <TouchableOpacity
              style={styles.activeBtnPrimary}
              onPress={() => setIsActiveRentalModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="receipt-outline" size={15} color={Colors.textInverse} />
              <Text style={styles.activeBtnPrimaryText}>View Digital Voucher</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.activeBtnOutline}
              onPress={() => Linking.openURL('tel:+15553829901')}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={14} color={Colors.textSecondary} />
              <Text style={styles.activeBtnOutlineText}>Concierge</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.noActiveRentalBox}>
          <Ionicons name="car-sport" size={28} color={Colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.noActiveTitle}>Ready for your next journey?</Text>
            <Text style={styles.noActiveSub}>
              Browse luxury, sports, and electric vehicles on daily or monthly rates.
            </Text>
          </View>
          <TouchableOpacity style={styles.rentNowCTA} onPress={onNavigateExplore}>
            <Text style={styles.rentNowCTAText}>Explore</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Featured Reward Economy Bento Card (How It Works & Avail Perks) */}
      <View style={styles.rewardEconomyBentoCard}>
        {/* Top Row: Title, Tier, Points Balance */}
        <View style={styles.rewardTopRow}>
          <View style={styles.rewardBrandCol}>
            <View style={styles.rewardHeaderTitleRow}>
              <View style={styles.rewardGiftIconBox}>
                <Ionicons name="gift" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.rewardEconomyTitle}>Veloce Reward Economy</Text>
                <Text style={styles.rewardEconomySub}>100 Points = $10 USD rental discount</Text>
              </View>
            </View>
          </View>

          <View style={styles.rewardBalanceCol}>
            <View style={styles.rewardPointsBadge}>
              <Ionicons name="sparkles" size={11} color={Colors.primary} />
              <Text style={styles.rewardPointsBadgeText}>{userPoints.toLocaleString()} PTS</Text>
            </View>
            <Text style={styles.rewardDollarValue}>≈ ${(userPoints / 10).toFixed(2)} USD Credit</Text>
          </View>
        </View>

        {/* Tier Progress Bar: Gold to Platinum */}
        <View style={styles.rewardTierProgressBlock}>
          <View style={styles.rewardTierHeaderRow}>
            <View style={styles.rewardTierLeftRow}>
              <Text style={styles.rewardTierCurrent}>VIP GOLD MEMBER</Text>
              <Text style={styles.rewardTierMultiplier}>• 1.25x Earning Multiplier</Text>
            </View>
            <Text style={styles.rewardTierRemaining}>
              {5000 - userPoints > 0 ? `${(5000 - userPoints).toLocaleString()} pts to Platinum` : 'Platinum Unlocked'}
            </Text>
          </View>
          <View style={styles.rewardProgressBarTrack}>
            <View style={[styles.rewardProgressBarFill, { width: `${Math.min(100, Math.round((userPoints / 5000) * 100))}%` }]} />
          </View>
        </View>

        {/* Earning Rules Quick Tags Row */}
        <View style={styles.rewardRulesPillsRow}>
          <View style={styles.rewardRulePill}>
            <Ionicons name="car-sport" size={11} color={Colors.primary} />
            <Text style={styles.rewardRulePillText}>10 pts / $1 Daily</Text>
          </View>
          <View style={styles.rewardRulePill}>
            <Ionicons name="calendar" size={11} color={Colors.secondary} />
            <Text style={styles.rewardRulePillText}>15 pts / $1 Monthly</Text>
          </View>
          <View style={styles.rewardRulePill}>
            <Ionicons name="star" size={11} color="#EC4899" />
            <Text style={styles.rewardRulePillText}>+150 Review Bonus</Text>
          </View>
          <View style={styles.rewardRulePill}>
            <Ionicons name="shield-checkmark" size={11} color={Colors.success} />
            <Text style={styles.rewardRulePillText}>Zero Deposit Perk</Text>
          </View>
        </View>

        {/* Action Dual Buttons: Avail Perks & How It Works */}
        <View style={styles.rewardActionRow}>
          <TouchableOpacity
            style={styles.availPerksBtnPrimary}
            activeOpacity={0.85}
            onPress={() => openRewards('store')}
          >
            <Ionicons name="gift" size={14} color={Colors.textInverse} />
            <Text style={styles.availPerksBtnPrimaryText}>Avail Perks (8 Available)</Text>
            <Ionicons name="arrow-forward" size={12} color={Colors.textInverse} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.howItWorksBtnSecondary}
            activeOpacity={0.85}
            onPress={() => openRewards('economy')}
          >
            <Ionicons name="help-buoy-outline" size={13} color={Colors.primary} />
            <Text style={styles.howItWorksBtnSecondaryText}>How It Works</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Action Shortcuts Grid (Solid Cards with Clean Themed Accents) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading}>Fast Access</Text>
      </View>

      <View style={styles.quickActionsGrid}>
        {/* Card 1: Browse Fleet */}
        <TouchableOpacity
          style={[styles.quickActionCard, styles.quickActionCardGold]}
          onPress={onNavigateExplore}
          activeOpacity={0.85}
        >
          <View style={styles.cardTopActionRow}>
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.18)', borderColor: 'rgba(245, 158, 11, 0.35)' }]}>
              <Ionicons name="search" size={20} color={Colors.primary} />
            </View>
            <View style={styles.cardCornerCircle}>
              <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.quickActionTitle}>Browse Fleet</Text>
          <Text style={styles.quickActionSub}>Showrooms & cars</Text>
        </TouchableOpacity>

        {/* Card 2: My Bookings */}
        <TouchableOpacity
          style={[styles.quickActionCard, styles.quickActionCardCyan]}
          onPress={onNavigateBookings}
          activeOpacity={0.85}
        >
          <View style={styles.cardTopActionRow}>
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.18)', borderColor: 'rgba(6, 182, 212, 0.35)' }]}>
              <Ionicons name="receipt" size={20} color={Colors.secondary} />
            </View>
            <View style={styles.cardCornerCircle}>
              <Ionicons name="arrow-forward" size={12} color={Colors.secondary} />
            </View>
          </View>
          <Text style={styles.quickActionTitle}>My Bookings</Text>
          <Text style={styles.quickActionSub}>Vouchers & receipts</Text>
        </TouchableOpacity>

        {/* Card 3: Roadside SOS */}
        <TouchableOpacity
          style={[styles.quickActionCard, styles.quickActionCardDanger]}
          onPress={() => Linking.openURL('tel:911')}
          activeOpacity={0.85}
        >
          <View style={styles.cardTopActionRow}>
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.18)', borderColor: 'rgba(239, 68, 68, 0.35)' }]}>
              <Ionicons name="shield" size={20} color={Colors.danger} />
            </View>
            <View style={styles.emergencyPulsePill}>
              <View style={styles.livePulseDotRed} />
              <Text style={styles.emergency247Text}>24/7</Text>
            </View>
          </View>
          <Text style={styles.quickActionTitle}>Roadside SOS</Text>
          <Text style={styles.quickActionSub}>Emergency assistance</Text>
        </TouchableOpacity>

        {/* Card 4: Monthly Leases */}
        <TouchableOpacity
          style={[styles.quickActionCard, styles.quickActionCardSuccess]}
          onPress={onNavigateExplore}
          activeOpacity={0.85}
        >
          <View style={styles.cardTopActionRow}>
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.18)', borderColor: 'rgba(16, 185, 129, 0.35)' }]}>
              <Ionicons name="pricetags" size={20} color={Colors.success} />
            </View>
            <View style={styles.savePill}>
              <Text style={styles.savePillText}>-45%</Text>
            </View>
          </View>
          <Text style={styles.quickActionTitle}>Monthly Leases</Text>
          <Text style={styles.quickActionSub}>Save up to 45%</Text>
        </TouchableOpacity>
      </View>

      {/* Recommended Vehicles Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading}>Recommended For You</Text>
        <TouchableOpacity onPress={onNavigateExplore}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recVehiclesRow}>
        {recommendedVehicles.map((car) => (
          <TouchableOpacity
            key={car.id}
            style={styles.recCard}
            onPress={() => onSelectVehicle(car)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: car.coverImage }} style={styles.recImage} contentFit="cover" />
            <View style={styles.recBody}>
              <Text style={styles.recBrand}>{car.brand}</Text>
              <Text style={styles.recModel} numberOfLines={1}>{car.model}</Text>
              <View style={styles.recPriceRow}>
                <Text style={styles.recPrice}>${car.dailyRate}<Text style={styles.recUnit}>/day</Text></Text>
                <TouchableOpacity
                  style={styles.recRentBtn}
                  onPress={() => onRentVehicle(car, 'daily')}
                >
                  <Text style={styles.recRentBtnText}>Rent</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reward Economy Modal */}
      <RewardEconomyModal
        visible={isRewardsModalVisible}
        onClose={() => setIsRewardsModalVisible(false)}
        initialTab={rewardsInitialTab}
      />

      {/* Active Ongoing Rental Detailed Modal */}
      <ActiveRentalModal
        visible={isActiveRentalModalVisible}
        booking={selectedActiveBooking || activeBooking}
        vehicle={vehicles.find((v) => v.id === (selectedActiveBooking || activeBooking)?.vehicleId) || activeBookingVehicle}
        onClose={() => {
          setIsActiveRentalModalVisible(false);
          setSelectedActiveBooking(null);
        }}
      />

      {/* Active Rentals List Hub Modal */}
      <ActiveRentalsListModal
        visible={isActiveRentalsListVisible}
        bookings={bookings}
        vehicles={vehicles}
        onClose={() => setIsActiveRentalsListVisible(false)}
        onSelectBooking={(b) => {
          setSelectedActiveBooking(b);
          setIsActiveRentalModalVisible(true);
        }}
        onExploreCars={onNavigateExplore}
      />

      {/* Completed Trips Archive Modal */}
      <CompletedTripsModal
        visible={isCompletedTripsVisible}
        bookings={bookings}
        vehicles={vehicles}
        onClose={() => setIsCompletedTripsVisible(false)}
        onRentAgain={(v) => onSelectVehicle(v)}
        onWriteReview={() => onNavigateBookings()}
        onExploreCars={onNavigateExplore}
      />
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
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  cardBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.18,
  },
  cardBgImageCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.48,
  },
  cardBgOverlayDark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 24, 36, 0.9)',
  },
  cardBgOverlayStrong: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 18, 28, 0.94)',
  },
  cardBgOverlayCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 17, 28, 0.64)',
  },
  cardBgOverlayGold: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 24, 36, 0.91)',
  },
  dashboardWelcomeRow: {
    backgroundColor: '#121824',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  welcomeTextCol: {
    flex: 1,
    marginRight: 10,
  },
  welcomeGreeting: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.white,
  },
  welcomeSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  goldPillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  goldPillTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#121824',
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statBoxHighlighted: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statVal: {
    fontSize: Typography.sizes.lg,
    fontWeight: '900',
    color: Colors.white,
  },
  statLabel: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  rewardTapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeRentalCard: {
    backgroundColor: '#121824',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    marginBottom: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  activeRentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  livePulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  activeRentalTitle: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  voucherCode: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '800',
  },
  activePillRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeRentalBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeCarThumb: {
    width: 80,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  activeCarDetails: {
    flex: 1,
    marginLeft: 12,
  },
  activeCarName: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
  },
  activeShowroom: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  countdownText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  activeCardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  activeBtnPrimary: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  activeBtnPrimaryText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  activeBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  activeBtnOutlineText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  noActiveRentalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  noActiveTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
  },
  noActiveSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rentNowCTA: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  rentNowCTAText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  rewardEconomyBentoCard: {
    backgroundColor: '#111827',
    borderRadius: BorderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    marginBottom: Spacing.md,
  },
  rewardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rewardBrandCol: {
    flex: 1,
    marginRight: 10,
  },
  rewardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rewardGiftIconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },
  rewardEconomyTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '900',
    color: Colors.white,
  },
  rewardEconomySub: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rewardBalanceCol: {
    alignItems: 'flex-end',
  },
  rewardPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  rewardPointsBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '900',
    color: Colors.primary,
  },
  rewardDollarValue: {
    fontSize: 9,
    color: Colors.success,
    fontWeight: '700',
    marginTop: 3,
  },
  rewardTierProgressBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
  },
  rewardTierHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rewardTierLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardTierCurrent: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  rewardTierMultiplier: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  rewardTierRemaining: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  rewardProgressBarTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rewardProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  rewardRulesPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  rewardRulePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rewardRulePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  rewardActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  availPerksBtnPrimary: {
    flex: 1.3,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  availPerksBtnPrimaryText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  howItWorksBtnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  howItWorksBtnSecondaryText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.white,
  },
  seeAllText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.primary,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.md,
  },
  quickActionCard: {
    width: '48.5%',
    backgroundColor: '#111827',
    borderRadius: BorderRadius.xl,
    padding: 14,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  quickActionCardGold: {
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  quickActionCardCyan: {
    borderColor: 'rgba(6, 182, 212, 0.35)',
  },
  quickActionCardDanger: {
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  quickActionCardSuccess: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  cardTopActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardCornerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyPulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  livePulseDotRed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.danger,
  },
  emergency247Text: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.danger,
  },
  savePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  savePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.success,
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quickActionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 8,
  },
  quickActionSub: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    marginTop: 2,
  },
  recVehiclesRow: {
    gap: 12,
  },
  recCard: {
    width: 175,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recImage: {
    width: '100%',
    height: 100,
  },
  recBody: {
    padding: 10,
  },
  recBrand: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  recModel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 1,
  },
  recPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  recPrice: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
  },
  recUnit: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  recRentBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  recRentBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
});
