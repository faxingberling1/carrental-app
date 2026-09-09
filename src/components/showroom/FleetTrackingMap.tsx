import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { Badge } from '../common/Badge';

const { width } = Dimensions.get('window');

export const FleetTrackingMap: React.FC = () => {
  const {
    vehicles,
    currentShowroom,
    isSimulatingTracking,
    setIsSimulatingTracking,
    selectedTrackingVehicleId,
    setSelectedTrackingVehicleId,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | 'rented' | 'available'>('all');

  // Filter showroom's fleet or all active
  const showroomVehicles = vehicles.filter(
    (v) => !currentShowroom || v.showroomId === currentShowroom.id
  );

  const filteredVehicles = showroomVehicles.filter((v) => {
    if (filterStatus === 'all') return true;
    return v.status === filterStatus;
  });

  const selectedVehicle: Vehicle =
    filteredVehicles.find((v) => v.id === selectedTrackingVehicleId) ||
    filteredVehicles[0] ||
    vehicles[0];

  const telematics = selectedVehicle?.telematics;

  return (
    <View style={styles.container}>
      {/* Top Header & Simulation Controls */}
      <View style={styles.topControlRow}>
        <View>
          <Text style={styles.moduleTitle}>Live Fleet GPS & Telematics</Text>
          <Text style={styles.moduleSubtitle}>
            {currentShowroom?.name || 'All Showrooms'} • {showroomVehicles.length} Tracked Units
          </Text>
        </View>

        {/* Live Simulator Toggle */}
        <TouchableOpacity
          style={[
            styles.simBtn,
            isSimulatingTracking && styles.simBtnActive,
          ]}
          onPress={() => setIsSimulatingTracking(!isSimulatingTracking)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.pulseDot,
              isSimulatingTracking && styles.pulseDotActive,
            ]}
          />
          <Text
            style={[
              styles.simBtnText,
              isSimulatingTracking && styles.simBtnTextActive,
            ]}
          >
            {isSimulatingTracking ? 'Live GPS Active' : 'Simulation Paused'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips: All, On Road (Rented), In Showroom */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'all' && styles.filterChipTextActive]}>
            All Fleet ({showroomVehicles.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'rented' && styles.filterChipActive]}
          onPress={() => setFilterStatus('rented')}
        >
          <View style={[styles.statusDot, { backgroundColor: Colors.secondary }]} />
          <Text style={[styles.filterChipText, filterStatus === 'rented' && styles.filterChipTextActive]}>
            On Road ({showroomVehicles.filter((v) => v.status === 'rented').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'available' && styles.filterChipActive]}
          onPress={() => setFilterStatus('available')}
        >
          <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
          <Text style={[styles.filterChipText, filterStatus === 'available' && styles.filterChipTextActive]}>
            In Showroom ({showroomVehicles.filter((v) => v.status === 'available').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Simulated Radar & GPS Map View */}
      <View style={styles.mapCanvas}>
        {/* Dark Grid Lines & City Road Representation */}
        <View style={styles.gridLineHorizontal1} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical1} />
        <View style={styles.gridLineVertical2} />
        <View style={styles.expresswayDiagonal} />

        {/* Showroom Hub Pin */}
        <View style={styles.hubMarker}>
          <View style={styles.hubMarkerPulse} />
          <Ionicons name="business" size={14} color={Colors.white} />
          <Text style={styles.hubMarkerLabel}>HQ Showroom</Text>
        </View>

        {/* Simulated Geofence Circle */}
        <View style={styles.geofenceCircle} />

        {/* Vehicle Pins Scattered across the Grid */}
        {filteredVehicles.map((car, index) => {
          const isSelected = car.id === selectedVehicle?.id;
          const isMoving = car.status === 'rented';

          // Offset positions nicely on canvas
          const leftPercent = 20 + ((index * 27) % 65);
          const topPercent = 22 + ((index * 33) % 55);

          return (
            <TouchableOpacity
              key={car.id}
              style={[
                styles.vehicleMapMarker,
                { left: `${leftPercent}%`, top: `${topPercent}%` },
                isSelected && styles.vehicleMapMarkerSelected,
              ]}
              onPress={() => setSelectedTrackingVehicleId(car.id)}
              activeOpacity={0.8}
            >
              {isMoving && <View style={styles.movingPingRing} />}
              <View
                style={[
                  styles.markerIconCircle,
                  isMoving ? styles.markerMoving : car.status === 'maintenance' ? styles.markerMaint : styles.markerIdle,
                ]}
              >
                <Ionicons
                  name={isMoving ? 'navigate' : 'car'}
                  size={12}
                  color={Colors.white}
                  style={isMoving ? { transform: [{ rotate: `${car.telematics.headingAngle || 0}deg` }] } : undefined}
                />
              </View>

              <View style={styles.markerBadge}>
                <Text style={styles.markerPlate}>{car.brand} {car.model.split(' ')[0]}</Text>
                {isMoving && (
                  <Text style={styles.markerSpeed}>{car.telematics.speedKmH} km/h</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Overlay Telematics Floating Card */}
        {selectedVehicle && telematics && (
          <View style={styles.floatingHUD}>
            <View style={styles.hudTopRow}>
              <View style={styles.hudCarInfo}>
                <Text style={styles.hudCarTitle}>
                  {selectedVehicle.brand} {selectedVehicle.model}
                </Text>
                <Text style={styles.hudPlate}>Plate: {selectedVehicle.plateNumber}</Text>
              </View>
              <Badge
                label={selectedVehicle.status === 'rented' ? 'Moving • Active' : selectedVehicle.status}
                variant={selectedVehicle.status === 'rented' ? 'info' : 'success'}
                size="sm"
              />
            </View>

            <View style={styles.hudAddressRow}>
              <Ionicons name="location-sharp" size={14} color={Colors.primary} />
              <Text style={styles.hudAddressText} numberOfLines={1}>
                {telematics.currentAddress}
              </Text>
            </View>

            {/* Telematics Metrics Grid */}
            <View style={styles.telemetryGrid}>
              <View style={styles.telemetryBox}>
                <View style={styles.telemetryIconRow}>
                  <Ionicons name="speedometer" size={14} color={Colors.secondary} />
                  <Text style={styles.telemetryLabel}>Speed</Text>
                </View>
                <Text style={styles.telemetryVal}>{telematics.speedKmH} <Text style={styles.unit}>km/h</Text></Text>
              </View>

              <View style={styles.telemetryBox}>
                <View style={styles.telemetryIconRow}>
                  <Ionicons
                    name={selectedVehicle.specs.fuelType === 'Electric' ? 'battery-charging' : 'flame'}
                    size={14}
                    color={Colors.success}
                  />
                  <Text style={styles.telemetryLabel}>
                    {selectedVehicle.specs.fuelType === 'Electric' ? 'Battery' : 'Fuel'}
                  </Text>
                </View>
                <Text style={styles.telemetryVal}>{telematics.fuelLevelPercent}%</Text>
              </View>

              <View style={styles.telemetryBox}>
                <View style={styles.telemetryIconRow}>
                  <Ionicons name="power" size={14} color={telematics.ignition ? Colors.success : Colors.danger} />
                  <Text style={styles.telemetryLabel}>Ignition</Text>
                </View>
                <Text
                  style={[
                    styles.telemetryVal,
                    { color: telematics.ignition ? Colors.success : Colors.textMuted },
                  ]}
                >
                  {telematics.ignition ? 'ON' : 'OFF'}
                </Text>
              </View>

              <View style={styles.telemetryBox}>
                <View style={styles.telemetryIconRow}>
                  <Ionicons name="git-commit" size={14} color={Colors.textSecondary} />
                  <Text style={styles.telemetryLabel}>Odometer</Text>
                </View>
                <Text style={styles.telemetryVal}>{Math.round(telematics.odometerKm)} <Text style={styles.unit}>km</Text></Text>
              </View>
            </View>

            <View style={styles.lastUpdatedRow}>
              <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.lastUpdatedText}>
                Telemetry Signal: {telematics.lastUpdated} • Coordinates: {telematics.latitude.toFixed(4)}°N, {telematics.longitude.toFixed(4)}°E
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Vehicle Quick Switcher Carousel */}
      <View style={styles.carouselContainer}>
        <Text style={styles.carouselTitle}>Select Fleet Vehicle to Track:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
          {filteredVehicles.map((car) => {
            const isSelected = car.id === selectedVehicle?.id;
            return (
              <TouchableOpacity
                key={car.id}
                style={[
                  styles.vehicleCardMini,
                  isSelected && styles.vehicleCardMiniSelected,
                ]}
                onPress={() => setSelectedTrackingVehicleId(car.id)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: car.coverImage }} style={styles.miniThumb} contentFit="cover" />
                <View style={styles.miniInfo}>
                  <Text style={styles.miniName} numberOfLines={1}>{car.brand} {car.model}</Text>
                  <View style={styles.miniSubRow}>
                    <Text style={styles.miniPlate}>{car.plateNumber}</Text>
                    <View
                      style={[
                        styles.miniDot,
                        {
                          backgroundColor:
                            car.status === 'rented'
                              ? Colors.secondary
                              : car.status === 'available'
                              ? Colors.success
                              : Colors.danger,
                        },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  moduleTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '900',
    color: Colors.white,
  },
  moduleSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  simBtnActive: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  pulseDotActive: {
    backgroundColor: Colors.success,
  },
  simBtnText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  simBtnTextActive: {
    color: Colors.success,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  filterChipText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  mapCanvas: {
    flex: 1,
    minHeight: 340,
    backgroundColor: '#0D131F',
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridLineHorizontal1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    top: '65%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineVertical1: {
    position: 'absolute',
    left: '35%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineVertical2: {
    position: 'absolute',
    left: '70%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  expresswayDiagonal: {
    position: 'absolute',
    top: -40,
    left: '10%',
    width: 4,
    height: '140%',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    transform: [{ rotate: '42deg' }],
  },
  geofenceCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderStyle: 'dashed',
    top: '15%',
    left: '20%',
  },
  hubMarker: {
    position: 'absolute',
    top: '42%',
    left: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubMarkerPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  hubMarkerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: 'rgba(18, 24, 36, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
  vehicleMapMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  vehicleMapMarkerSelected: {
    zIndex: 20,
    transform: [{ scale: 1.15 }],
  },
  movingPingRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 182, 212, 0.35)',
  },
  markerIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  markerMoving: {
    backgroundColor: Colors.secondary,
  },
  markerIdle: {
    backgroundColor: Colors.success,
  },
  markerMaint: {
    backgroundColor: Colors.danger,
  },
  markerBadge: {
    backgroundColor: 'rgba(15, 20, 31, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  markerPlate: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
  },
  markerSpeed: {
    fontSize: 8,
    color: Colors.secondary,
    fontWeight: '700',
  },
  floatingHUD: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(18, 24, 36, 0.95)',
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  hudTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hudCarInfo: {
    flex: 1,
    marginRight: 8,
  },
  hudCarTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.white,
  },
  hudPlate: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
  hudAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 6,
  },
  hudAddressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 6,
  },
  telemetryBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  telemetryIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  telemetryLabel: {
    fontSize: 9,
    color: Colors.textMuted,
  },
  telemetryVal: {
    fontSize: Typography.sizes.sm,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 2,
  },
  unit: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  lastUpdatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  lastUpdatedText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  carouselContainer: {
    paddingVertical: Spacing.sm,
  },
  carouselTitle: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
    marginBottom: 6,
  },
  carouselContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  vehicleCardMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 170,
  },
  vehicleCardMiniSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  miniThumb: {
    width: 44,
    height: 34,
    borderRadius: BorderRadius.sm,
  },
  miniInfo: {
    flex: 1,
    marginLeft: 8,
  },
  miniName: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.white,
  },
  miniSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  miniPlate: {
    fontSize: 9,
    color: Colors.textMuted,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
