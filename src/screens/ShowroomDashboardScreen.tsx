import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../components/ui/Theme';
import { useApp } from '../context/AppContext';
import { ShowroomFleetList } from '../components/showroom/ShowroomFleetList';
import { FleetTrackingMap } from '../components/showroom/FleetTrackingMap';
import { ShowroomBookingsView } from '../components/showroom/ShowroomBookingsView';
import { Badge } from '../components/common/Badge';

interface ShowroomDashboardScreenProps {
  onAddVehicle: () => void;
}

type ShowroomTab = 'overview' | 'fleet' | 'tracking' | 'bookings';

export const ShowroomDashboardScreen: React.FC<ShowroomDashboardScreenProps> = ({
  onAddVehicle,
}) => {
  const {
    currentShowroom,
    vehicles,
    bookings,
    setSelectedTrackingVehicleId,
    logout,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ShowroomTab>('overview');

  const showroomVehicles = vehicles.filter(
    (v) => !currentShowroom || v.showroomId === currentShowroom.id
  );

  const rentedCount = showroomVehicles.filter((v) => v.status === 'rented').length;
  const availableCount = showroomVehicles.filter((v) => v.status === 'available').length;
  const maintenanceCount = showroomVehicles.filter((v) => v.status === 'maintenance').length;
  const pendingBookings = bookings.filter(
    (b) => (!currentShowroom || b.showroomId === currentShowroom.id) && b.status === 'pending'
  );

  const utilizationRate = showroomVehicles.length > 0
    ? Math.round((rentedCount / showroomVehicles.length) * 100)
    : 0;

  // Calculate estimated monthly revenue based on rented cars
  const estimatedMonthlyRevenue = showroomVehicles.reduce((acc, car) => {
    return car.status === 'rented' ? acc + car.monthlyRate : acc;
  }, 19800);

  const handleTrackVehicle = (vehicleId: string) => {
    setSelectedTrackingVehicleId(vehicleId);
    setActiveTab('tracking');
  };

  return (
    <View style={styles.container}>
      {/* Dealership Profile Banner */}
      <View style={styles.dealershipBanner}>
        <View style={styles.dealershipLeft}>
          <View style={styles.dealershipIcon}>
            <Ionicons name="business" size={24} color={Colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.dealershipNameRow}>
              <Text style={styles.dealershipName} numberOfLines={1}>
                {currentShowroom?.name || 'Showroom Host Hub'}
              </Text>
              <Badge label="Verified Dealer" variant="primary" size="sm" />
            </View>
            <Text style={styles.dealershipCity}>
              {currentShowroom?.city} • {currentShowroom?.address}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={16} color={Colors.danger} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Module Navigation Tabs */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'overview' && styles.navItemActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons
            name="grid"
            size={15}
            color={activeTab === 'overview' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.navItemText, activeTab === 'overview' && styles.navItemTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'fleet' && styles.navItemActive]}
          onPress={() => setActiveTab('fleet')}
        >
          <Ionicons
            name="car-sport"
            size={15}
            color={activeTab === 'fleet' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.navItemText, activeTab === 'fleet' && styles.navItemTextActive]}>
            Fleet ({showroomVehicles.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'tracking' && styles.navItemActive]}
          onPress={() => setActiveTab('tracking')}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons
              name="navigate"
              size={15}
              color={activeTab === 'tracking' ? Colors.secondary : Colors.textMuted}
            />
            {rentedCount > 0 && <View style={styles.navLiveDot} />}
          </View>
          <Text
            style={[
              styles.navItemText,
              activeTab === 'tracking' && { color: Colors.secondary, fontWeight: '800' },
            ]}
          >
            GPS Radar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'bookings' && styles.navItemActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons
              name="calendar"
              size={15}
              color={activeTab === 'bookings' ? Colors.primary : Colors.textMuted}
            />
            {pendingBookings.length > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>{pendingBookings.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navItemText, activeTab === 'bookings' && styles.navItemTextActive]}>
            Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab View Content */}
      <View style={styles.tabContent}>
        {activeTab === 'overview' && (
          <ScrollView
            style={styles.overviewScroll}
            contentContainerStyle={styles.overviewScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* KPI Cards Grid */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <Text style={styles.kpiLabel}>Est. Monthly Revenue</Text>
                  <Ionicons name="trending-up" size={16} color={Colors.success} />
                </View>
                <Text style={styles.kpiValue}>${estimatedMonthlyRevenue.toLocaleString()}</Text>
                <Text style={styles.kpiSub}>+14.8% vs last month</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <Text style={styles.kpiLabel}>Fleet Utilization</Text>
                  <Ionicons name="pie-chart" size={16} color={Colors.secondary} />
                </View>
                <Text style={[styles.kpiValue, { color: Colors.secondary }]}>{utilizationRate}%</Text>
                <Text style={styles.kpiSub}>{rentedCount} of {showroomVehicles.length} cars active</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <Text style={styles.kpiLabel}>Available in Bay</Text>
                  <Ionicons name="car" size={16} color={Colors.success} />
                </View>
                <Text style={[styles.kpiValue, { color: Colors.success }]}>{availableCount}</Text>
                <Text style={styles.kpiSub}>Ready for instant lease</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <Text style={styles.kpiLabel}>Customer Rating</Text>
                  <Ionicons name="star" size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.kpiValue, { color: Colors.primary }]}>
                  {currentShowroom?.ratingAvg.toFixed(2) || '4.92'}
                </Text>
                <Text style={styles.kpiSub}>{currentShowroom?.totalReviews || 128} verified reviews</Text>
              </View>
            </View>

            {/* Urgent Operational Alerts */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>Operational Priorities</Text>
            </View>

            <View style={styles.alertCard}>
              <View style={styles.alertIconCol}>
                <Ionicons name="notifications" size={20} color={Colors.primary} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  {pendingBookings.length > 0
                    ? `${pendingBookings.length} Customer Booking(s) Waiting for Handover`
                    : '1 Vehicle Returning Today'}
                </Text>
                <Text style={styles.alertSub}>
                  {pendingBookings.length > 0
                    ? 'Review renter driver license & prep keys for customer arrival.'
                    : 'Inspection team scheduled for Mercedes G63 AMG return.'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.alertActionBtn}
                onPress={() => setActiveTab('bookings')}
              >
                <Text style={styles.alertActionBtnText}>View</Text>
              </TouchableOpacity>
            </View>

            {maintenanceCount > 0 && (
              <View style={[styles.alertCard, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                <View style={styles.alertIconCol}>
                  <Ionicons name="construct" size={20} color={Colors.danger} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{maintenanceCount} Car(s) In Scheduled Maintenance</Text>
                  <Text style={styles.alertSub}>Oil change & brake inspection underway in service bay.</Text>
                </View>
                <TouchableOpacity
                  style={[styles.alertActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}
                  onPress={() => setActiveTab('fleet')}
                >
                  <Text style={[styles.alertActionBtnText, { color: Colors.danger }]}>Bay</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Fast Dealership Actions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>Fast Showroom Actions</Text>
            </View>

            <View style={styles.fastActionsRow}>
              <TouchableOpacity
                style={styles.fastActionBtn}
                onPress={onAddVehicle}
                activeOpacity={0.85}
              >
                <View style={[styles.fastActionIcon, { backgroundColor: Colors.primaryGlow }]}>
                  <Ionicons name="add-circle" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.fastActionTitle}>Add Vehicle</Text>
                <Text style={styles.fastActionSub}>New daily/monthly car</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fastActionBtn}
                onPress={() => setActiveTab('tracking')}
                activeOpacity={0.85}
              >
                <View style={[styles.fastActionIcon, { backgroundColor: Colors.secondaryGlow }]}>
                  <Ionicons name="map" size={24} color={Colors.secondary} />
                </View>
                <Text style={styles.fastActionTitle}>Live GPS Map</Text>
                <Text style={styles.fastActionSub}>Monitor fleet telematics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fastActionBtn}
                onPress={() => setActiveTab('bookings')}
                activeOpacity={0.85}
              >
                <View style={[styles.fastActionIcon, { backgroundColor: Colors.successGlow }]}>
                  <Ionicons name="key" size={24} color={Colors.success} />
                </View>
                <Text style={styles.fastActionTitle}>Handovers Desk</Text>
                <Text style={styles.fastActionSub}>Check-in & returns</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {activeTab === 'fleet' && (
          <ShowroomFleetList
            onAddVehicle={onAddVehicle}
            onTrackVehicle={handleTrackVehicle}
          />
        )}

        {activeTab === 'tracking' && <FleetTrackingMap />}

        {activeTab === 'bookings' && <ShowroomBookingsView />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  dealershipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dealershipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dealershipIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  dealershipNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dealershipName: {
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    color: Colors.white,
    maxWidth: '65%',
  },
  dealershipCity: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutBtnText: {
    fontSize: Typography.sizes.xs,
    color: Colors.danger,
    fontWeight: '700',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginVertical: 8,
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    gap: 5,
  },
  navItemActive: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navItemText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  navItemTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  navLiveDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
  navBadge: {
    position: 'absolute',
    top: -3,
    right: -6,
    backgroundColor: Colors.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBadgeText: {
    fontSize: 8,
    color: Colors.textInverse,
    fontWeight: '900',
  },
  tabContent: {
    flex: 1,
  },
  overviewScroll: {
    flex: 1,
  },
  overviewScrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 40,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: '900',
    color: Colors.white,
  },
  kpiSub: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    marginVertical: 8,
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 10,
  },
  alertIconCol: {
    marginRight: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  alertSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  alertActionBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  alertActionBtnText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  fastActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  fastActionBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fastActionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fastActionTitle: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
  },
  fastActionSub: {
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
