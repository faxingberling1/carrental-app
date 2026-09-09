import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { Showroom } from '../../types';
import { StarRating } from '../common/StarRating';
import { Badge } from '../common/Badge';

interface ShowroomCardProps {
  showroom: Showroom;
  onSelect: () => void;
  isSelected?: boolean;
}

export const ShowroomCard: React.FC<ShowroomCardProps> = ({
  showroom,
  onSelect,
  isSelected = false,
}) => {
  const handleCall = () => {
    Linking.openURL(`tel:${showroom.phone}`);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
      ]}
      activeOpacity={0.9}
      onPress={onSelect}
    >
      {/* Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: showroom.bannerUrl }}
          style={styles.banner}
          contentFit="cover"
        />
        <View style={styles.bannerOverlay} />

        {/* Top Badges */}
        <View style={styles.topRow}>
          <Badge label={showroom.city} variant="info" size="sm" />
          {showroom.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
              <Text style={styles.verifiedText}>Verified Dealer</Text>
            </View>
          )}
        </View>

        {/* Logo Avatar */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: showroom.logoUrl }}
            style={styles.logo}
            contentFit="cover"
          />
        </View>
      </View>

      {/* Body Info */}
      <View style={styles.body}>
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {showroom.name}
          </Text>
          <Text style={styles.tagline} numberOfLines={1}>
            {showroom.tagline}
          </Text>
        </View>

        <View style={styles.ratingAddressRow}>
          <StarRating
            rating={showroom.ratingAvg}
            totalReviews={showroom.totalReviews}
            showCount
            size={13}
          />
          <Text style={styles.fleetCount}>
            • <Text style={{ color: Colors.primary, fontWeight: '700' }}>{showroom.totalCars}</Text> Fleet Cars
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.addressText} numberOfLines={1}>
            {showroom.address}
          </Text>
        </View>

        {/* Action Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={14} color={Colors.textSecondary} />
            <Text style={styles.callBtnText}>Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.browseBtn,
              isSelected && styles.browseBtnSelected,
            ]}
            onPress={onSelect}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.browseBtnText,
                isSelected && styles.browseBtnTextSelected,
              ]}
            >
              {isSelected ? 'Viewing Fleet' : 'Explore Fleet'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={13}
              color={isSelected ? Colors.textInverse : Colors.primary}
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
  cardSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  bannerContainer: {
    height: 110,
    width: '100%',
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.4)',
  },
  topRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 24, 36, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  verifiedText: {
    color: Colors.primary,
    fontSize: Typography.sizes.xs - 1,
    fontWeight: '800',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -16,
    left: 14,
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.surface,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  body: {
    paddingTop: 22,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerInfo: {
    marginBottom: 6,
  },
  name: {
    fontSize: Typography.sizes.md + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  tagline: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ratingAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 6,
  },
  fleetCount: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 12,
  },
  addressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  callBtnText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  browseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 6,
  },
  browseBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  browseBtnText: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.primary,
    fontWeight: '800',
  },
  browseBtnTextSelected: {
    color: Colors.textInverse,
  },
});
