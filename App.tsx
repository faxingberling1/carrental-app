import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { Colors, BorderRadius, Typography, Spacing } from './src/components/ui/Theme';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { Header } from './src/components/common/Header';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignUpScreen } from './src/screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { CustomerDashboardScreen } from './src/screens/CustomerDashboardScreen';
import { CustomerHomeScreen } from './src/screens/CustomerHomeScreen';
import { CustomerBookingsView } from './src/components/customer/CustomerBookingsView';
import { ShowroomDashboardScreen } from './src/screens/ShowroomDashboardScreen';
import { VehicleDetailsModal } from './src/components/customer/VehicleDetailsModal';
import { BookingModal } from './src/components/customer/BookingModal';
import { ReviewModal } from './src/components/customer/ReviewModal';
import { AddVehicleModal } from './src/components/showroom/AddVehicleModal';
import { Vehicle, RentalPlan } from './src/types';

function MainAppContent() {
  const { userRole, bookings, isAuthenticated, authScreen } = useApp();

  // Customer navigation state: dashboard, explore, bookings
  const [customerTab, setCustomerTab] = useState<'dashboard' | 'explore' | 'bookings'>('dashboard');

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isBookingVisible, setIsBookingVisible] = useState(false);
  const [bookingRentalPlan, setBookingRentalPlan] = useState<RentalPlan>('daily');
  const [isReviewVisible, setIsReviewVisible] = useState(false);
  const [reviewVehicle, setReviewVehicle] = useState<Vehicle | null>(null);
  const [reviewBookingId, setReviewBookingId] = useState<string | undefined>(undefined);
  const [isAddVehicleVisible, setIsAddVehicleVisible] = useState(false);

  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'active' || b.status === 'pending'
  ).length;

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsVisible(true);
  };

  const handleRentVehicle = (vehicle: Vehicle, plan: RentalPlan) => {
    setSelectedVehicle(vehicle);
    setBookingRentalPlan(plan);
    setIsBookingVisible(true);
  };

  const handleOpenReview = (vehicle: Vehicle, bookingId?: string) => {
    setReviewVehicle(vehicle);
    setReviewBookingId(bookingId);
    setIsReviewVisible(true);
  };

  // If user is not authenticated, render Authentication Stack
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        {authScreen === 'login' && <LoginScreen />}
        {authScreen === 'signup' && <SignUpScreen />}
        {authScreen === 'forgot_password' && <ForgotPasswordScreen />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Top Application Header */}
      <Header onOpenBookings={() => setCustomerTab('bookings')} />

      {/* Main Viewport */}
      <View style={styles.mainContainer}>
        {userRole === 'customer' ? (
          <>
            {customerTab === 'dashboard' && (
              <CustomerDashboardScreen
                onNavigateExplore={() => setCustomerTab('explore')}
                onNavigateBookings={() => setCustomerTab('bookings')}
                onSelectVehicle={handleSelectVehicle}
                onRentVehicle={handleRentVehicle}
              />
            )}

            {customerTab === 'explore' && (
              <CustomerHomeScreen
                onSelectVehicle={handleSelectVehicle}
                onRentVehicle={handleRentVehicle}
              />
            )}

            {customerTab === 'bookings' && (
              <CustomerBookingsView
                onOpenReview={handleOpenReview}
                onExploreCars={() => setCustomerTab('explore')}
              />
            )}

            {/* Customer Bottom Navigation Bar */}
            <View style={styles.bottomNav}>
              <TouchableOpacity
                style={[
                  styles.bottomNavItem,
                  customerTab === 'dashboard' && styles.bottomNavItemActive,
                ]}
                onPress={() => setCustomerTab('dashboard')}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="grid"
                  size={20}
                  color={customerTab === 'dashboard' ? Colors.primary : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.bottomNavText,
                    customerTab === 'dashboard' && styles.bottomNavTextActive,
                  ]}
                >
                  Dashboard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bottomNavItem,
                  customerTab === 'explore' && styles.bottomNavItemActive,
                ]}
                onPress={() => setCustomerTab('explore')}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="car-sport"
                  size={20}
                  color={customerTab === 'explore' ? Colors.primary : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.bottomNavText,
                    customerTab === 'explore' && styles.bottomNavTextActive,
                  ]}
                >
                  Explore Fleet
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bottomNavItem,
                  customerTab === 'bookings' && styles.bottomNavItemActive,
                ]}
                onPress={() => setCustomerTab('bookings')}
                activeOpacity={0.85}
              >
                <View style={{ position: 'relative' }}>
                  <Ionicons
                    name="receipt-outline"
                    size={20}
                    color={customerTab === 'bookings' ? Colors.primary : Colors.textMuted}
                  />
                  {activeBookingsCount > 0 && (
                    <View style={styles.navBadge}>
                      <Text style={styles.navBadgeText}>{activeBookingsCount}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.bottomNavText,
                    customerTab === 'bookings' && styles.bottomNavTextActive,
                  ]}
                >
                  Reservations
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <ShowroomDashboardScreen
            onAddVehicle={() => setIsAddVehicleVisible(true)}
          />
        )}
      </View>

      {/* Vehicle Details Modal */}
      <VehicleDetailsModal
        vehicle={selectedVehicle}
        visible={isDetailsVisible}
        onClose={() => setIsDetailsVisible(false)}
        onOpenBooking={(v, plan) => {
          setIsDetailsVisible(false);
          handleRentVehicle(v, plan);
        }}
        onOpenReview={(v) => {
          setIsDetailsVisible(false);
          handleOpenReview(v);
        }}
      />

      {/* Booking Modal */}
      <BookingModal
        vehicle={selectedVehicle}
        initialPlan={bookingRentalPlan}
        visible={isBookingVisible}
        onClose={() => setIsBookingVisible(false)}
        onBookingSuccess={() => {
          setCustomerTab('bookings');
        }}
      />

      {/* Review & Rating Modal */}
      <ReviewModal
        vehicle={reviewVehicle}
        bookingId={reviewBookingId}
        visible={isReviewVisible}
        onClose={() => setIsReviewVisible(false)}
      />

      {/* Showroom Add Vehicle Modal */}
      <AddVehicleModal
        visible={isAddVehicleVisible}
        onClose={() => setIsAddVehicleVisible(false)}
      />
    </SafeAreaView>
  );
}

const tokenCache = {
  async getToken(key: string) {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      }
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.setItem(key, value);
        return;
      }
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function App() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <AppProvider>
          <MainAppContent />
        </AppProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  bottomNavItemActive: {},
  bottomNavText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  bottomNavTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  navBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBadgeText: {
    fontSize: 9,
    color: Colors.textInverse,
    fontWeight: '900',
  },
});
