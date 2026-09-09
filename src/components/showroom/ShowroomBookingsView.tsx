import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/Theme';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';

export const ShowroomBookingsView: React.FC = () => {
  const { bookings, currentShowroom, updateBookingStatus } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  const showroomBookings = bookings.filter(
    (b) => !currentShowroom || b.showroomId === currentShowroom.id
  );

  const filteredList = showroomBookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const handleAction = (booking: Booking, newStatus: Booking['status']) => {
    updateBookingStatus(booking.id, newStatus);
    const msg =
      newStatus === 'active'
        ? `Booking ${booking.bookingCode} marked as Handed Over & Active.`
        : `Booking ${booking.bookingCode} completed and deposit released.`;

    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Booking Updated', msg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Showroom Bookings Desk</Text>
        <Text style={styles.subtitle}>
          Manage customer rentals, key handovers, and deposit returns
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'pending', 'active', 'completed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, filter === tab && styles.tabBtnActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabBtnText, filter === tab && styles.tabBtnTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} (
              {showroomBookings.filter((b) => (tab === 'all' ? true : b.status === tab)).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Bookings In This Category</Text>
          <Text style={styles.emptySubtext}>
            Customer reservations will appear here with customer contact and delivery requests.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.bookingCode}>{item.bookingCode}</Text>
                  <Text style={styles.customerName}>
                    Renter: <Text style={{ color: Colors.white, fontWeight: '700' }}>{item.customerName}</Text>
                  </Text>
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

              <View style={styles.carRow}>
                <Image source={{ uri: item.vehicleImage }} style={styles.thumb} contentFit="cover" />
                <View style={styles.carInfo}>
                  <Text style={styles.vehicleName}>{item.vehicleName}</Text>
                  <Text style={styles.planInfo}>
                    {item.rentalPlan === 'monthly' ? 'Monthly Plan' : 'Daily Plan'} • {item.durationUnits}{' '}
                    {item.rentalPlan === 'monthly' ? 'Month(s)' : 'Day(s)'}
                  </Text>
                  <Text style={styles.rateInfo}>
                    Total: <Text style={{ color: Colors.primary, fontWeight: '700' }}>${item.totalAmount.toLocaleString()}</Text> | Deposit: ${item.securityDeposit}
                  </Text>
                </View>
              </View>

              {/* Handover type */}
              <View style={styles.deliveryBadgeRow}>
                <Ionicons
                  name={item.pickupType === 'doorstep_delivery' ? 'car' : 'business'}
                  size={14}
                  color={Colors.secondary}
                />
                <Text style={styles.deliveryBadgeText}>
                  {item.pickupType === 'doorstep_delivery'
                    ? `Doorstep Delivery: ${item.deliveryAddress || 'Address on file'}`
                    : 'Showroom Self-Pickup'}
                </Text>
              </View>

              {/* Dates */}
              <View style={styles.datesRow}>
                <Text style={styles.datesText}>
                  📅 {item.startDate} to {item.endDate}
                </Text>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${item.customerPhone}`)}
                >
                  <Ionicons name="call" size={13} color={Colors.primary} />
                  <Text style={styles.callBtnText}>Call Renter</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons depending on status */}
              <View style={styles.actionsRow}>
                {item.status === 'pending' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
                    onPress={() => handleAction(item, 'active')}
                  >
                    <Text style={styles.actionBtnTextDark}>Handover Keys & Activate</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'active' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                    onPress={() => handleAction(item, 'completed')}
                  >
                    <Ionicons name="checkmark-done" size={16} color={Colors.textInverse} />
                    <Text style={styles.actionBtnTextDark}>Complete Return & Refund Deposit</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'completed' && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.completedBadgeText}>Rental Closed • Deposit Released</Text>
                  </View>
                )}
              </View>
            </View>
          )}
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
    paddingBottom: Spacing.xs,
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginVertical: 10,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  tabBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bookingCode: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.primary,
  },
  customerName: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  thumb: {
    width: 64,
    height: 48,
    borderRadius: BorderRadius.sm,
  },
  carInfo: {
    flex: 1,
    marginLeft: 10,
  },
  vehicleName: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  planInfo: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rateInfo: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deliveryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    padding: 8,
    borderRadius: BorderRadius.sm,
    marginBottom: 8,
  },
  deliveryBadgeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
    flex: 1,
    fontWeight: '600',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  datesText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  callBtnText: {
    fontSize: Typography.sizes.xs - 1,
    color: Colors.primary,
    fontWeight: '700',
  },
  actionsRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  actionBtnTextDark: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '900',
    color: Colors.textInverse,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  completedBadgeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.success,
    fontWeight: '700',
  },
});
