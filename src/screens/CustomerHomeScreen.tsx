import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../components/ui/Theme';
import { useApp } from '../context/AppContext';
import { VehicleCategory, Vehicle, Showroom, RentalPlan } from '../types';
import { VehicleCard } from '../components/customer/VehicleCard';
import { ShowroomCard } from '../components/customer/ShowroomCard';

interface CustomerHomeScreenProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
  onRentVehicle: (vehicle: Vehicle, plan: RentalPlan) => void;
}

const CATEGORIES: VehicleCategory[] = [
  'All',
  'SUV',
  'Luxury',
  'Sports',
  'Electric',
  'Sedan',
  'Economy',
];

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  onSelectVehicle,
  onRentVehicle,
}) => {
  const {
    vehicles,
    showrooms,
    activeRentalPlan,
    setActiveRentalPlan,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('All');
  const [selectedShowroomId, setSelectedShowroomId] = useState<string | null>(null);

  // Filter vehicles
  const filteredVehicles = vehicles.filter((car) => {
    // Search query filter
    const matchesSearch =
      searchQuery.trim() === '' ||
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.showroomName.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategory === 'All' || car.category === selectedCategory;

    // Showroom filter
    const matchesShowroom =
      !selectedShowroomId || car.showroomId === selectedShowroomId;

    return matchesSearch && matchesCategory && matchesShowroom;
  });

  const selectedShowroomObj = showrooms.find((s) => s.id === selectedShowroomId);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Premium Vehicles from <Text style={{ color: Colors.primary }}>Verified Showrooms</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Rent directly from certified dealers. Daily getaways or discounted monthly leases.
          </Text>

          {/* Daily vs Monthly Pricing Plan Switcher */}
          <View style={styles.planSwitchContainer}>
            <TouchableOpacity
              style={[
                styles.planSwitchBtn,
                activeRentalPlan === 'daily' && styles.planSwitchBtnActive,
              ]}
              onPress={() => setActiveRentalPlan('daily')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={activeRentalPlan === 'daily' ? Colors.textInverse : Colors.textMuted}
              />
              <Text
                style={[
                  styles.planSwitchText,
                  activeRentalPlan === 'daily' && styles.planSwitchTextActive,
                ]}
              >
                Daily Rentals
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planSwitchBtn,
                activeRentalPlan === 'monthly' && styles.planSwitchBtnActive,
              ]}
              onPress={() => setActiveRentalPlan('monthly')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="sparkles-outline"
                size={16}
                color={activeRentalPlan === 'monthly' ? Colors.textInverse : Colors.textMuted}
              />
              <Text
                style={[
                  styles.planSwitchText,
                  activeRentalPlan === 'monthly' && styles.planSwitchTextActive,
                ]}
              >
                Monthly Leases (Save up to 45%)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Porsche, Mercedes, Showrooms..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Featured Showrooms Carousel */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Partner Showrooms</Text>
            <Text style={styles.sectionSubtitle}>
              Browse vehicle collections by verified dealership
            </Text>
          </View>
          {selectedShowroomId && (
            <TouchableOpacity
              style={styles.clearFilterBtn}
              onPress={() => setSelectedShowroomId(null)}
            >
              <Text style={styles.clearFilterText}>View All</Text>
              <Ionicons name="close" size={13} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.showroomsList}
        >
          {showrooms.map((sr) => (
            <View key={sr.id} style={styles.showroomCardWrapper}>
              <ShowroomCard
                showroom={sr}
                isSelected={selectedShowroomId === sr.id}
                onSelect={() =>
                  setSelectedShowroomId((prev) => (prev === sr.id ? null : sr.id))
                }
              />
            </View>
          ))}
        </ScrollView>

        {/* Categories Bar */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      isSelected && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Showroom filter alert banner */}
        {selectedShowroomObj && (
          <View style={styles.showroomActiveNotice}>
            <Ionicons name="business" size={16} color={Colors.primary} />
            <Text style={styles.showroomActiveNoticeText}>
              Filtering by showroom: <Text style={{ color: Colors.white, fontWeight: '700' }}>{selectedShowroomObj.name}</Text>
            </Text>
            <TouchableOpacity onPress={() => setSelectedShowroomId(null)}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Vehicles Feed */}
        <View style={styles.vehiclesSection}>
          <View style={styles.feedHeaderRow}>
            <Text style={styles.feedTitle}>
              Available Fleet ({filteredVehicles.length})
            </Text>
            <Text style={styles.feedPriceIndicator}>
              Displaying {activeRentalPlan === 'monthly' ? 'Monthly' : 'Daily'} Rates
            </Text>
          </View>

          {filteredVehicles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Matching Vehicles</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search criteria, category filters, or select all showrooms.
              </Text>
            </View>
          ) : (
            filteredVehicles.map((car) => (
              <VehicleCard
                key={car.id}
                vehicle={car}
                activeRentalPlan={activeRentalPlan}
                onPress={() => onSelectVehicle(car)}
                onRentPress={() => onRentVehicle(car, activeRentalPlan)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: Typography.sizes.xl + 2,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.xs + 1,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },
  planSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  planSwitchBtnActive: {
    backgroundColor: Colors.primary,
  },
  planSwitchText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  planSwitchTextActive: {
    color: Colors.textInverse,
    fontWeight: '900',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: Typography.sizes.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md + 1,
    fontWeight: '800',
    color: Colors.white,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  clearFilterText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  showroomsList: {
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  showroomCardWrapper: {
    width: 290,
  },
  categoriesContainer: {
    marginVertical: 12,
  },
  categoriesRow: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  showroomActiveNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: Spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  showroomActiveNoticeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  vehiclesSection: {
    paddingHorizontal: Spacing.md,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.white,
  },
  feedPriceIndicator: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginTop: 20,
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
});
