import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { useApp } from '../../context/AppContext';
import { Showroom } from '../../types';
import { Badge } from './Badge';
import { DriverProfileModal } from '../customer/DriverProfileModal';
import { SettingsModal } from './SettingsModal';
import { RewardEconomyModal } from '../customer/RewardEconomyModal';
import { useUser } from '@clerk/clerk-expo';

interface HeaderProps {
  onOpenBookings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBookings }) => {
  const { user: clerkUser } = useUser();
  const {
    userRole,
    currentUser,
    showrooms,
    currentShowroomId,
    setCurrentShowroomId,
    currentShowroom,
    bookings,
    vehicles,
  } = useApp();

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isRewardsVisible, setIsRewardsVisible] = useState(false);

  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'active' || b.status === 'pending'
  ).length;

  const showroomVehicles = vehicles.filter(
    (v) => !currentShowroom || v.showroomId === currentShowroom.id
  );
  const rentedFleetCount = showroomVehicles.filter((v) => v.status === 'rented').length;

  return (
    <View style={styles.headerContainer}>
      {/* Bento Grid Top Container */}
      <View style={styles.bentoGrid}>
        {/* Bento Cell 1: Driver Personal Information & Identity (Left Main Card) */}
        <TouchableOpacity
          style={styles.bentoProfileCard}
          activeOpacity={0.88}
          onPress={() => setIsProfileVisible(true)}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  clerkUser?.imageUrl ||
                  currentUser?.avatarUrl ||
                  (userRole === 'customer'
                    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
              }}
              style={styles.avatarImage}
              contentFit="cover"
            />
            <View style={styles.avatarLiveIndicator} />
          </View>

          <View style={styles.profileTextCol}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName} numberOfLines={1}>
                {userRole === 'customer'
                  ? clerkUser?.fullName || currentUser?.name || 'Alexander Hayes'
                  : currentShowroom?.name || 'Apex Luxury Motors'}
              </Text>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={userRole === 'customer' ? Colors.primary : Colors.secondary}
              />
            </View>

            {/* Driver License & Personal Information Pill Row */}
            <View style={styles.profileMetaRow}>
              {userRole === 'customer' ? (
                <>
                  <View style={styles.licensePill}>
                    <Ionicons name="id-card" size={11} color={Colors.primary} />
                    <Text style={styles.licensePillText} numberOfLines={1}>
                      {currentUser?.driverLicenseNumber || 'DL-9088214-B'}
                    </Text>
                  </View>
                  <View style={styles.driverVerifiedTag}>
                    <Ionicons name="shield-checkmark" size={10} color={Colors.success} />
                    <Text style={styles.driverVerifiedText}>Verified</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.dealerTierBadge}>
                    <Ionicons name="shield-checkmark" size={10} color={Colors.secondary} />
                    <Text style={styles.dealerTierText}>CERTIFIED HOST</Text>
                  </View>
                  <Text style={styles.verifiedMetaText}>• {currentShowroom?.city}</Text>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Bento Cell 2: Quick Status Metric & Actions (Right Card) */}
        <View style={styles.bentoMetricCard}>
          {userRole === 'customer' ? (
            <TouchableOpacity
              style={styles.metricItemContent}
              activeOpacity={0.8}
              onPress={() => setIsRewardsVisible(true)}
            >
              <View style={styles.metricIconRow}>
                <Ionicons name="gift" size={13} color={Colors.primary} />
                <Text style={styles.metricLabel}>Rewards</Text>
                <Ionicons name="chevron-forward" size={10} color={Colors.primary} />
              </View>
              <Text style={styles.metricValue}>
                {currentUser?.loyaltyPoints || 3450} <Text style={styles.metricUnit}>pts</Text>
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.metricItemContent}>
              <View style={styles.metricIconRow}>
                <View style={styles.greenPulseDot} />
                <Text style={styles.metricLabel}>On Road</Text>
              </View>
              <Text style={[styles.metricValue, { color: Colors.secondary }]}>
                {rentedFleetCount} <Text style={styles.metricUnit}>cars</Text>
              </Text>
            </View>
          )}

          {/* Quick Actions in Metric Cell: Bookings & Settings (Gear Icon) */}
          <View style={styles.metricActionIcons}>
            <TouchableOpacity
              style={styles.iconActionBtn}
              activeOpacity={0.8}
              onPress={onOpenBookings}
            >
              <Ionicons name="receipt-outline" size={16} color={Colors.text} />
              {activeBookingsCount > 0 && (
                <View style={styles.miniBadgeCount}>
                  <Text style={styles.miniBadgeCountText}>{activeBookingsCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Replaced Signout button with Settings (Gear Icon) button */}
            <TouchableOpacity
              style={[styles.iconActionBtn, styles.settingsActionBtn]}
              activeOpacity={0.8}
              onPress={() => setIsSettingsVisible(true)}
            >
              <Ionicons name="settings-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Showroom Dealership Context (Only visible when logged in as Showroom Owner) */}
      {userRole === 'showroom_owner' && (
        <View style={styles.dealerLocationBar}>
          <View style={styles.dealerLocationInfo}>
            <View style={styles.activeDot} />
            <Text style={styles.managingText}>Managing Fleet: </Text>
            <Text style={styles.dealerNameText} numberOfLines={1}>
              {currentShowroom?.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.switchDealerBtn}
            activeOpacity={0.8}
            onPress={() => setIsPickerVisible(true)}
          >
            <Ionicons name="swap-horizontal" size={13} color={Colors.primary} />
            <Text style={styles.switchDealerBtnText}>Switch Dealer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Driver Personal Information & License Modal */}
      <DriverProfileModal
        visible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
      />

      {/* Reward Economy Modal */}
      <RewardEconomyModal
        visible={isRewardsVisible}
        onClose={() => setIsRewardsVisible(false)}
      />

      {/* Account Settings Modal (Gear Icon) */}
      <SettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        onOpenDriverProfile={() => setIsProfileVisible(true)}
      />

      {/* Showroom Switcher Modal */}
      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Showroom Dealership</Text>
              <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Switch active showroom to inspect individual fleet inventory, telemetry, and bookings.
            </Text>

            <FlatList
              data={showrooms}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = item.id === currentShowroomId;
                return (
                  <TouchableOpacity
                    style={[
                      styles.showroomItem,
                      isSelected && styles.showroomItemSelected,
                    ]}
                    onPress={() => {
                      setCurrentShowroomId(item.id);
                      setIsPickerVisible(false);
                    }}
                  >
                    <View style={styles.showroomItemLeft}>
                      <View style={styles.showroomItemIcon}>
                        <Ionicons
                          name="business"
                          size={18}
                          color={isSelected ? Colors.primary : Colors.textSecondary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.showroomItemName,
                            isSelected && { color: Colors.primary },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.showroomItemCity}>
                          {item.city} • {item.totalCars} Fleet Vehicles
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0A0E17',
    paddingTop: Platform.OS === 'ios' ? 48 : 14,
    paddingBottom: 10,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  bentoProfileCard: {
    flex: 1.55,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121824',
    borderRadius: BorderRadius.lg,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  bentoBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.36,
  },
  bentoBgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 17, 28, 0.72)',
  },
  bentoBgOverlayMetric: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 17, 28, 0.76)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarLiveIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    borderWidth: 1.5,
    borderColor: '#121824',
  },
  profileTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  profileName: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  licensePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    maxWidth: '65%',
  },
  licensePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.3,
  },
  driverVerifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  driverVerifiedText: {
    fontSize: 9,
    color: Colors.success,
    fontWeight: '700',
  },
  dealerTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(6, 182, 212, 0.16)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  dealerTierText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  verifiedMetaText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
  },
  bentoMetricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121824',
    borderRadius: BorderRadius.lg,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    position: 'relative',
  },
  metricItemContent: {
    flex: 1,
  },
  metricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 2,
  },
  metricUnit: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  metricActionIcons: {
    gap: 6,
    marginLeft: 6,
  },
  iconActionBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  settingsActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  miniBadgeCount: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.primary,
    width: 13,
    height: 13,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBadgeCountText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  dealerLocationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121824',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginTop: 6,
  },
  dealerLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  managingText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  dealerNameText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.primary,
    fontWeight: '800',
    flexShrink: 1,
  },
  switchDealerBtn: {
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
  switchDealerBtnText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.white,
  },
  modalSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginVertical: Spacing.sm,
  },
  showroomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  showroomItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  showroomItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  showroomItemIcon: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  showroomItemName: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  showroomItemCity: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
