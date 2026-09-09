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
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { useApp } from '../../context/AppContext';

interface RewardEconomyModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: 'store' | 'economy' | 'vouchers';
}

interface RewardItem {
  id: string;
  title: string;
  category: 'Discount' | 'Perk' | 'Experience';
  pointsCost: number;
  discountValue: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const REWARDS_CATALOG: RewardItem[] = [
  {
    id: 'rew-0',
    title: '$25 Instant Rental Voucher',
    category: 'Discount',
    pointsCost: 250,
    discountValue: '$25 Off',
    description: 'Instant discount voucher valid on any daily or weekend booking.',
    icon: 'ticket',
    color: Colors.primary,
  },
  {
    id: 'rew-1',
    title: '$50 Rental Discount Voucher',
    category: 'Discount',
    pointsCost: 500,
    discountValue: '$50 Off',
    description: 'Applicable immediately on any daily or monthly vehicle rental.',
    icon: 'pricetag',
    color: Colors.primary,
  },
  {
    id: 'rew-2',
    title: 'Free VIP Doorstep Valet Delivery',
    category: 'Perk',
    pointsCost: 400,
    discountValue: 'Free Delivery ($75 value)',
    description: 'Valet concierge delivers the car directly to your hotel or residence.',
    icon: 'car',
    color: Colors.secondary,
  },
  {
    id: 'rew-3',
    title: 'Zero Security Deposit Waiver',
    category: 'Perk',
    pointsCost: 1200,
    discountValue: 'Deposit Waived',
    description: 'Waive the upfront refundable deposit hold on any luxury SUV or sports car.',
    icon: 'shield-checkmark',
    color: Colors.success,
  },
  {
    id: 'rew-4',
    title: '$150 Off Exotic Weekend Lease',
    category: 'Discount',
    pointsCost: 1500,
    discountValue: '$150 Off',
    description: 'Valid for Ferrari, Lamborghini, Porsche 911, and AMG rentals.',
    icon: 'sparkles',
    color: Colors.primary,
  },
  {
    id: 'rew-5',
    title: '1 Complimentary Free Rental Day',
    category: 'Perk',
    pointsCost: 2500,
    discountValue: '1 Free Day (Up to $400)',
    description: 'Enjoy 24 hours complimentary on any SUV, Sedan, or EV of your choice.',
    icon: 'gift',
    color: Colors.secondary,
  },
  {
    id: 'rew-6',
    title: 'Supercar Track & Chauffeur Pass',
    category: 'Experience',
    pointsCost: 4000,
    discountValue: 'VIP Track Pass',
    description: 'Full-access private track launch experience with a professional racing driver.',
    icon: 'flame',
    color: Colors.danger,
  },
  {
    id: 'rew-7',
    title: '48-Hour Exotic Weekend Dream Drive',
    category: 'Experience',
    pointsCost: 8000,
    discountValue: '2 Full Days Exotic',
    description: 'Complete weekend rental of Ferrari F8 Tributo or Lamborghini Huracán EVO.',
    icon: 'trophy',
    color: Colors.primary,
  },
];

interface SimulatorPreset {
  id: string;
  name: string;
  type: 'daily' | 'monthly';
  daysOrMonths: number;
  ratePerUnit: number;
  sub: string;
}

const SIMULATOR_PRESETS: SimulatorPreset[] = [
  {
    id: 'sim-1',
    name: 'Weekend Sports Car',
    type: 'daily',
    daysOrMonths: 3,
    ratePerUnit: 250,
    sub: '3 Days @ $250/day ($750 total)',
  },
  {
    id: 'sim-2',
    name: '1-Week Luxury SUV Trip',
    type: 'daily',
    daysOrMonths: 7,
    ratePerUnit: 180,
    sub: '7 Days @ $180/day ($1,260 total)',
  },
  {
    id: 'sim-3',
    name: '1-Month Executive Sedan Lease',
    type: 'monthly',
    daysOrMonths: 1,
    ratePerUnit: 2800,
    sub: '1 Month Lease @ $2,800/mo',
  },
  {
    id: 'sim-4',
    name: '1-Month Supercar Exotic Lease',
    type: 'monthly',
    daysOrMonths: 1,
    ratePerUnit: 7500,
    sub: '1 Month Lease @ $7,500/mo',
  },
];

export const RewardEconomyModal: React.FC<RewardEconomyModalProps> = ({
  visible,
  onClose,
  initialTab = 'store',
}) => {
  const { currentUser, claimedRewards, redeemReward } = useApp();
  const [activeTab, setActiveTab] = useState<'store' | 'economy' | 'vouchers'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Discount' | 'Perk' | 'Experience'>('All');
  const [selectedSimulatorPreset, setSelectedSimulatorPreset] = useState<string>('sim-1');

  // Sync tab when initialTab changes or modal opens
  React.useEffect(() => {
    if (visible && initialTab) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const userPoints = currentUser?.loyaltyPoints || 3450;
  const targetPoints = 5000;
  const progressPercent = Math.min(100, Math.round((userPoints / targetPoints) * 100));

  const filteredRewards = selectedCategory === 'All'
    ? REWARDS_CATALOG
    : REWARDS_CATALOG.filter((r) => r.category === selectedCategory);

  const activePreset = SIMULATOR_PRESETS.find((p) => p.id === selectedSimulatorPreset) || SIMULATOR_PRESETS[0];
  const totalSpend = activePreset.daysOrMonths * activePreset.ratePerUnit;
  const baseRatePerDollar = activePreset.type === 'monthly' ? 15 : 10;
  const basePointsEarned = totalSpend * baseRatePerDollar;
  const goldBonusMultiplier = 0.25; // 25% Gold member bonus
  const tierBonusPoints = Math.round(basePointsEarned * goldBonusMultiplier);
  const totalPointsEarned = basePointsEarned + tierBonusPoints;
  const dollarEquivalentEarned = (totalPointsEarned / 10).toFixed(2);

  const handleRedeem = (item: RewardItem) => {
    if (userPoints < item.pointsCost) {
      const msg = `You need ${item.pointsCost - userPoints} more points to avail this reward. Rent cars, leases, or write reviews to earn points!`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Insufficient Points', msg);
      }
      return;
    }

    const success = redeemReward(item.title, item.pointsCost, item.discountValue);
    if (success) {
      const msg = `Successfully availed ${item.title}! A promo voucher code has been added to your Active Vouchers.`;
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Reward Claimed!', msg);
      }
      setActiveTab('vouchers');
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
          <View style={styles.headerTitleRow}>
            <Ionicons name="sparkles" size={16} color={Colors.primary} />
            <Text style={styles.headerTitle}>Veloce Reward Economy</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Bento Hero Tile: User Points & Tier Progress */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroPointsLabel}>AVAILABLE BALANCE</Text>
                <View style={styles.heroPointsValueRow}>
                  <Text style={styles.heroPointsNumber}>{userPoints.toLocaleString()}</Text>
                  <Text style={styles.heroPointsUnit}>PTS</Text>
                </View>
                <Text style={styles.heroDollarEquiv}>
                  ≈ ${(userPoints / 10).toFixed(2)} USD in rental credits
                </Text>
              </View>

              <View style={styles.tierBadgeBox}>
                <Ionicons name="sparkles" size={16} color={Colors.primary} />
                <Text style={styles.tierBadgeTitle}>VIP GOLD</Text>
                <Text style={styles.tierMultiplier}>1.25x Earning Boost</Text>
              </View>
            </View>

            {/* Tier Progress toward VIP Platinum */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressLabel}>Progress to VIP Platinum (5,000 pts)</Text>
                <Text style={styles.progressPercent}>{progressPercent}%</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <View style={styles.nextPerkRow}>
                <Ionicons name="lock-open-outline" size={12} color={Colors.primary} />
                <Text style={styles.nextPerkText}>
                  {5000 - userPoints > 0
                    ? `${(5000 - userPoints).toLocaleString()} pts needed for Zero Deposit Waiver on any Supercar`
                    : 'VIP Platinum unlocked! Enjoy Zero Deposit & Free Valet Delivery'}
                </Text>
              </View>
            </View>
          </View>

          {/* Sub Navigation Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'store' && styles.tabItemActive]}
              onPress={() => setActiveTab('store')}
            >
              <Ionicons
                name="gift"
                size={14}
                color={activeTab === 'store' ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.tabItemText, activeTab === 'store' && styles.tabItemTextActive]}>
                Avail Perks ({REWARDS_CATALOG.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'economy' && styles.tabItemActive]}
              onPress={() => setActiveTab('economy')}
            >
              <Ionicons
                name="help-buoy"
                size={14}
                color={activeTab === 'economy' ? Colors.secondary : Colors.textMuted}
              />
              <Text style={[styles.tabItemText, activeTab === 'economy' && styles.tabItemTextActive]}>
                How It Works
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'vouchers' && styles.tabItemActive]}
              onPress={() => setActiveTab('vouchers')}
            >
              <Ionicons
                name="receipt"
                size={14}
                color={activeTab === 'vouchers' ? Colors.success : Colors.textMuted}
              />
              <Text style={[styles.tabItemText, activeTab === 'vouchers' && styles.tabItemTextActive]}>
                My Vouchers ({claimedRewards.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: REWARDS CATALOG (WHAT CAN BE AVAILED) */}
          {activeTab === 'store' && (
            <View style={styles.storeContainer}>
              <View style={styles.storeSectionHeader}>
                <View>
                  <Text style={styles.sectionHeading}>What Can Be Availed</Text>
                  <Text style={styles.sectionSub}>
                    Redeem points for cash discounts, zero-deposit waivers, and exotic supercar experiences.
                  </Text>
                </View>
              </View>

              {/* Category Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryFiltersRow}
              >
                {(['All', 'Discount', 'Perk', 'Experience'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryFilterChip,
                      selectedCategory === cat && styles.categoryFilterChipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryFilterText,
                        selectedCategory === cat && styles.categoryFilterTextActive,
                      ]}
                    >
                      {cat === 'All' ? 'All Rewards' : cat === 'Discount' ? 'Cash Discounts' : cat === 'Perk' ? 'VIP Perks & Waivers' : 'Track & Exotic'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredRewards.map((item) => {
                const canAfford = userPoints >= item.pointsCost;
                return (
                  <View key={item.id} style={styles.rewardCard}>
                    <View style={styles.rewardCardLeft}>
                      <View style={[styles.rewardIconBox, { backgroundColor: `${item.color}20`, borderColor: `${item.color}40` }]}>
                        <Ionicons name={item.icon} size={22} color={item.color} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={styles.categoryBadgeRow}>
                          <Text style={[styles.categoryPill, { color: item.color, borderColor: `${item.color}40` }]}>
                            {item.category.toUpperCase()}
                          </Text>
                          <Text style={styles.valueChip}>{item.discountValue}</Text>
                        </View>
                        <Text style={styles.rewardTitle}>{item.title}</Text>
                        <Text style={styles.rewardDesc}>{item.description}</Text>
                      </View>
                    </View>

                    <View style={styles.rewardCardBottom}>
                      <View style={styles.costCol}>
                        <Text style={styles.costLabel}>Required Cost:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                          <Text style={styles.costValue}>{item.pointsCost.toLocaleString()}</Text>
                          <Text style={styles.costUnit}>pts</Text>
                          <Text style={styles.costDollarEquiv}>(${item.pointsCost / 10})</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.redeemBtn,
                          !canAfford && styles.redeemBtnDisabled,
                        ]}
                        onPress={() => handleRedeem(item)}
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.redeemBtnText,
                            !canAfford && styles.redeemBtnTextDisabled,
                          ]}
                        >
                          {canAfford ? 'Avail Reward' : `Need ${item.pointsCost - userPoints} pts`}
                        </Text>
                        {canAfford && (
                          <Ionicons name="arrow-forward" size={14} color={Colors.textInverse} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* TAB 2: HOW THE ECONOMY WORKS */}
          {activeTab === 'economy' && (
            <View style={styles.economyContainer}>
              <Text style={styles.sectionHeading}>How The Reward Economy Works</Text>
              <Text style={styles.sectionSub}>
                Every rental dollar spent, vehicle cared for, and verified review earns real currency usable across any showroom.
              </Text>

              {/* Core Economy Rate Banner */}
              <View style={styles.economyRateBanner}>
                <View style={styles.economyRatePill}>
                  <Ionicons name="cash" size={18} color={Colors.primary} />
                  <Text style={styles.economyRateText}>
                    100 Loyalty Points = <Text style={{ color: Colors.white, fontWeight: '900' }}>$10.00 USD</Text> in Rental Value
                  </Text>
                </View>
                <Text style={styles.economyRateSub}>
                  No blackout dates. Redeem anytime directly on vehicle checkouts or showroom counters.
                </Text>
              </View>

              {/* Earning Channels */}
              <Text style={[styles.sectionHeading, { fontSize: Typography.sizes.sm + 1, marginTop: 14 }]}>
                1. Ways to Earn Points
              </Text>

              <View style={styles.ruleCard}>
                <View style={[styles.ruleIcon, { backgroundColor: Colors.primaryGlow }]}>
                  <Ionicons name="car-sport" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.ruleTitle}>Daily Car Rentals</Text>
                  <Text style={styles.ruleDesc}>
                    Earn <Text style={{ color: Colors.primary, fontWeight: '800' }}>10 pts per $1 spent</Text> on all daily rentals (e.g., $300 rental = 3,000 pts = $30 credit).
                  </Text>
                </View>
              </View>

              <View style={styles.ruleCard}>
                <View style={[styles.ruleIcon, { backgroundColor: Colors.secondaryGlow }]}>
                  <Ionicons name="calendar" size={22} color={Colors.secondary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.ruleTitle}>Monthly Leases (50% Booster)</Text>
                  <Text style={styles.ruleDesc}>
                    Earn <Text style={{ color: Colors.secondary, fontWeight: '800' }}>15 pts per $1 spent</Text> on monthly long-term leases (e.g., $3,000 lease = 45,000 pts = $450 credit).
                  </Text>
                </View>
              </View>

              <View style={styles.ruleCard}>
                <View style={[styles.ruleIcon, { backgroundColor: 'rgba(236, 72, 153, 0.18)' }]}>
                  <Ionicons name="star" size={22} color="#EC4899" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.ruleTitle}>Verified Showroom Reviews</Text>
                  <Text style={styles.ruleDesc}>
                    Earn <Text style={{ color: '#EC4899', fontWeight: '800' }}>150 pts bonus</Text> every time you review a vehicle's cleanliness, condition, and dealership service.
                  </Text>
                </View>
              </View>

              <View style={styles.ruleCard}>
                <View style={[styles.ruleIcon, { backgroundColor: Colors.successGlow }]}>
                  <Ionicons name="shield-checkmark" size={22} color={Colors.success} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.ruleTitle}>Clean Return & Full Tank/Battery</Text>
                  <Text style={styles.ruleDesc}>
                    Earn <Text style={{ color: Colors.success, fontWeight: '800' }}>200 pts bonus</Text> upon return inspection when car interior is clean and fuel/battery is full.
                  </Text>
                </View>
              </View>

              <View style={styles.ruleCard}>
                <View style={[styles.ruleIcon, { backgroundColor: 'rgba(139, 92, 246, 0.18)' }]}>
                  <Ionicons name="people" size={22} color="#A78BFA" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.ruleTitle}>Driver Referral Program</Text>
                  <Text style={styles.ruleDesc}>
                    Invite friends with your driver referral code: both get <Text style={{ color: '#A78BFA', fontWeight: '800' }}>500 pts ($50 value)</Text> upon completion of their first booking.
                  </Text>
                </View>
              </View>

              {/* Interactive Points Simulator */}
              <Text style={[styles.sectionHeading, { fontSize: Typography.sizes.sm + 1, marginTop: 18 }]}>
                2. Points Calculator & Simulator
              </Text>
              <Text style={styles.sectionSub}>
                Select a rental scenario to estimate total points and reward currency you will earn with your VIP Gold boost.
              </Text>

              <View style={styles.simulatorCard}>
                <Text style={styles.simulatorTitle}>Choose Rental Scenario:</Text>
                <View style={styles.presetsGrid}>
                  {SIMULATOR_PRESETS.map((preset) => {
                    const isSelected = preset.id === selectedSimulatorPreset;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        style={[
                          styles.presetBtn,
                          isSelected && styles.presetBtnActive,
                        ]}
                        onPress={() => setSelectedSimulatorPreset(preset.id)}
                      >
                        <Text style={[styles.presetName, isSelected && styles.presetNameActive]}>
                          {preset.name}
                        </Text>
                        <Text style={styles.presetSub}>{preset.sub}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.simCalcResults}>
                  <View style={styles.simResultRow}>
                    <Text style={styles.simResultLabel}>Rental Spend</Text>
                    <Text style={styles.simResultVal}>${totalSpend.toLocaleString()}</Text>
                  </View>
                  <View style={styles.simResultRow}>
                    <Text style={styles.simResultLabel}>Base Points ({baseRatePerDollar} pts / $1)</Text>
                    <Text style={styles.simResultVal}>{basePointsEarned.toLocaleString()} pts</Text>
                  </View>
                  <View style={styles.simResultRow}>
                    <Text style={[styles.simResultLabel, { color: Colors.primary }]}>
                      VIP Gold Bonus (+25% multiplier)
                    </Text>
                    <Text style={[styles.simResultVal, { color: Colors.primary }]}>
                      +{tierBonusPoints.toLocaleString()} pts
                    </Text>
                  </View>
                  <View style={styles.simDivider} />
                  <View style={styles.simTotalRow}>
                    <View>
                      <Text style={styles.simTotalLabel}>Total Points Credited</Text>
                      <Text style={styles.simTotalSub}>Immediately ready to avail rewards</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.simTotalPoints}>{totalPointsEarned.toLocaleString()} PTS</Text>
                      <Text style={styles.simTotalDollar}>≈ ${dollarEquivalentEarned} USD Discount</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Tier Matrix Table */}
              <Text style={[styles.sectionHeading, { fontSize: Typography.sizes.sm + 1, marginTop: 18 }]}>
                3. Membership Tier Privileges
              </Text>
              <View style={styles.tierMatrixCard}>
                <View style={styles.tierMatrixRow}>
                  <Text style={styles.tierMatrixColName}>Tier</Text>
                  <Text style={styles.tierMatrixColPoints}>Points Needed</Text>
                  <Text style={styles.tierMatrixColPerks}>Exclusive Perks</Text>
                </View>

                <View style={styles.tierMatrixItem}>
                  <Text style={[styles.tierColTitle, { color: Colors.textMuted }]}>Silver</Text>
                  <Text style={styles.tierColSub}>0 - 999 pts</Text>
                  <Text style={styles.tierColPerksText}>1.0x Base points rate</Text>
                </View>

                <View style={[styles.tierMatrixItem, { backgroundColor: 'rgba(245, 158, 11, 0.09)' }]}>
                  <Text style={[styles.tierColTitle, { color: Colors.primary }]}>VIP Gold (Current)</Text>
                  <Text style={styles.tierColSub}>1,000 - 4,999 pts</Text>
                  <Text style={styles.tierColPerksText}>1.25x Earning boost, 5% rate discount, VIP support</Text>
                </View>

                <View style={styles.tierMatrixItem}>
                  <Text style={[styles.tierColTitle, { color: Colors.secondary }]}>VIP Platinum</Text>
                  <Text style={styles.tierColSub}>5,000 - 9,999 pts</Text>
                  <Text style={styles.tierColPerksText}>1.50x Boost, Free Valet Delivery & Zero Deposit</Text>
                </View>

                <View style={styles.tierMatrixItem}>
                  <Text style={[styles.tierColTitle, { color: '#E2E8F0' }]}>Centurion Black</Text>
                  <Text style={styles.tierColSub}>10,000+ pts</Text>
                  <Text style={styles.tierColPerksText}>2.0x Boost, Supercar class upgrade, 24/7 Butler</Text>
                </View>
              </View>
            </View>
          )}

          {/* TAB 3: MY ACTIVE VOUCHERS */}
          {activeTab === 'vouchers' && (
            <View style={styles.vouchersContainer}>
              <Text style={styles.sectionHeading}>Active Claimed Vouchers</Text>
              <Text style={styles.sectionSub}>
                Copy and apply these promo codes during digital booking checkout, or present them to showroom staff at key handover.
              </Text>

              {claimedRewards.length === 0 ? (
                <View style={styles.emptyVouchersBox}>
                  <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyVouchersTitle}>No Claimed Vouchers Yet</Text>
                  <Text style={styles.emptyVouchersSub}>
                    Browse the "Avail Perks" catalog tab to redeem your points for vouchers!
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyCTA}
                    onPress={() => setActiveTab('store')}
                  >
                    <Text style={styles.emptyCTAText}>Browse Available Rewards</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                claimedRewards.map((v) => (
                  <View key={v.id} style={styles.voucherCard}>
                    <View style={styles.voucherHeader}>
                      <Text style={styles.voucherTitle}>{v.title}</Text>
                      <View style={styles.voucherDiscountTag}>
                        <Text style={styles.voucherDiscountText}>{v.discountValue}</Text>
                      </View>
                    </View>

                    <View style={styles.voucherCodeBox}>
                      <Text style={styles.voucherCodeLabel}>PROMO CODE:</Text>
                      <Text style={styles.voucherCodeValue}>{v.code}</Text>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => {
                          if (Platform.OS === 'web') {
                            window.alert(`Copied voucher promo code: ${v.code}`);
                          } else {
                            Alert.alert('Copied!', `Voucher code ${v.code} copied to clipboard.`);
                          }
                        }}
                      >
                        <Ionicons name="copy-outline" size={14} color={Colors.primary} />
                        <Text style={styles.copyBtnText}>Copy</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.voucherDateText}>
                      Claimed: {v.date} • Spent {v.pointsSpent} pts • Valid across all partner showrooms
                    </Text>
                  </View>
                ))
              )}
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroPointsLabel: {
    fontSize: Typography.sizes.xs - 1,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  heroPointsValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 2,
  },
  heroPointsNumber: {
    fontSize: Typography.sizes.hero,
    fontWeight: '900',
    color: Colors.white,
  },
  heroPointsUnit: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.primary,
  },
  heroDollarEquiv: {
    fontSize: Typography.sizes.xs,
    color: Colors.success,
    fontWeight: '700',
  },
  tierBadgeBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  tierBadgeTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 2,
  },
  tierMultiplier: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  progressContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  progressPercent: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  nextPerkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextPerkText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
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
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  tabItemTextActive: {
    color: Colors.white,
    fontWeight: '800',
  },
  storeContainer: {
    gap: 12,
  },
  storeSectionHeader: {
    marginBottom: 4,
  },
  categoryFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
  },
  categoryFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryFilterChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: Colors.primary,
  },
  categoryFilterText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  categoryFilterTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.white,
  },
  sectionSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginBottom: 6,
    lineHeight: 18,
  },
  rewardCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rewardCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rewardIconBox: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryPill: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  valueChip: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.white,
    fontWeight: '700',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  rewardTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  rewardDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 3,
    lineHeight: 16,
  },
  rewardCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
    marginTop: 10,
  },
  costCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  costLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  costValue: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.primary,
  },
  costUnit: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  costDollarEquiv: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '700',
  },
  redeemBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  redeemBtnDisabled: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  redeemBtnText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  redeemBtnTextDisabled: {
    color: Colors.textMuted,
  },
  economyContainer: {
    gap: 12,
  },
  economyRateBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  economyRatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  economyRateText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.primary,
  },
  economyRateSub: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ruleIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
  },
  ruleDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  simulatorCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  simulatorTitle: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    width: '48.5%',
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: Colors.primary,
  },
  presetName: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.white,
  },
  presetNameActive: {
    color: Colors.primary,
  },
  presetSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 3,
  },
  simCalcResults: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  simResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  simResultLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  simResultVal: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.white,
  },
  simDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 8,
  },
  simTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simTotalLabel: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '900',
    color: Colors.white,
  },
  simTotalSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },
  simTotalPoints: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.primary,
  },
  simTotalDollar: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.success,
    marginTop: 1,
  },
  tierMatrixCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tierMatrixRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tierMatrixColName: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  tierMatrixColPoints: {
    flex: 1.2,
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  tierMatrixColPerks: {
    flex: 2,
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  tierMatrixItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tierColTitle: {
    flex: 1,
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
  },
  tierColSub: {
    flex: 1.2,
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  tierColPerksText: {
    flex: 2,
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  vouchersContainer: {
    gap: 12,
  },
  emptyVouchersBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyVouchersTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 10,
  },
  emptyVouchersSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  emptyCTA: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  emptyCTAText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  voucherCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voucherTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.white,
    flex: 1,
  },
  voucherDiscountTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  voucherDiscountText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
  },
  voucherCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 6,
  },
  voucherCodeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  voucherCodeValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: '900',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  voucherDateText: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
