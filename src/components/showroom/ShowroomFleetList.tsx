import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { Vehicle, VehicleStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { StarRating } from '../common/StarRating';

interface ShowroomFleetListProps {
  onAddVehicle: () => void;
  onTrackVehicle: (vehicleId: string) => void;
}

export const ShowroomFleetList: React.FC<ShowroomFleetListProps> = ({
  onAddVehicle,
  onTrackVehicle,
}) => {
  const { vehicles, currentShowroom, updateVehicleStatus } = useApp();

  const showroomVehicles = vehicles.filter(
    (v) => !currentShowroom || v.showroomId === currentShowroom.id
  );

  const statuses: VehicleStatus[] = ['available', 'rented', 'maintenance', 'reserved'];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Showroom Fleet Inventory</Text>
          <Text style={styles.subtitle}>
            {showroomVehicles.length} vehicles hosted in {currentShowroom?.name}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAddVehicle}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={Colors.textInverse} />
          <Text style={styles.addBtnText}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={showroomVehicles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.topRow}>
              <Image source={{ uri: item.coverImage }} style={styles.thumb} contentFit="cover" />
              <View style={styles.carDetails}>
                <Text style={styles.brand}>{item.brand}</Text>
                <Text style={styles.model}>{item.model}</Text>
                <Text style={styles.plate}>Plate: {item.plateNumber} • {item.year}</Text>

                <View style={styles.ratesRow}>
                  <Text style={styles.rateHighlight}>${item.dailyRate}<Text style={styles.rateUnit}>/day</Text></Text>
                  <Text style={styles.rateDivider}>•</Text>
                  <Text style={styles.rateHighlight}>${item.monthlyRate.toLocaleString()}<Text style={styles.rateUnit}>/mo</Text></Text>
                </View>

                <View style={styles.starsRow}>
                  <StarRating rating={item.ratingAvg} totalReviews={item.totalReviews} showCount size={11} />
                </View>
              </View>
            </View>

            {/* Quick Status Bar */}
            <View style={styles.statusSection}>
              <Text style={styles.statusSectionLabel}>Status Control:</Text>
              <View style={styles.statusPillsRow}>
                {statuses.map((st) => {
                  const isActive = item.status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.statusPill,
                        isActive && {
                          backgroundColor:
                            st === 'available'
                              ? Colors.success
                              : st === 'rented'
                              ? Colors.secondary
                              : st === 'maintenance'
                              ? Colors.danger
                              : Colors.primary,
                          borderColor: Colors.transparent,
                        },
                      ]}
                      onPress={() => updateVehicleStatus(item.id, st)}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          isActive && { color: Colors.textInverse, fontWeight: '800' },
                        ]}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.cardBottomRow}>
              <View style={styles.telemetryQuick}>
                <Ionicons
                  name="navigate"
                  size={12}
                  color={item.status === 'rented' ? Colors.secondary : Colors.textMuted}
                />
                <Text style={styles.telemetryQuickText} numberOfLines={1}>
                  {item.telematics.currentAddress}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.trackBtn}
                onPress={() => onTrackVehicle(item.id)}
              >
                <Ionicons name="map" size={13} color={Colors.primary} />
                <Text style={styles.trackBtnText}>Live GPS</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: '900',
    color: Colors.white,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  addBtnText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  thumb: {
    width: 85,
    height: 70,
    borderRadius: BorderRadius.sm,
  },
  carDetails: {
    flex: 1,
    marginLeft: 12,
  },
  brand: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  model: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
  },
  plate: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  ratesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  rateHighlight: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: Colors.white,
  },
  rateUnit: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  rateDivider: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  starsRow: {
    marginTop: 4,
  },
  statusSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginBottom: 10,
  },
  statusSectionLabel: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  statusPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusPillText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    padding: 8,
    borderRadius: BorderRadius.sm,
  },
  telemetryQuick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  telemetryQuickText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  trackBtnText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
});
