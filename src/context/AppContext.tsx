import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  User,
  Showroom,
  Vehicle,
  Booking,
  Review,
  RentalPlan,
  VehicleStatus,
  TelematicsData,
  PaymentCard,
} from '../types';
import {
  INITIAL_SHOWROOMS,
  INITIAL_VEHICLES,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
} from '../data/mockData';

export type AuthScreenType = 'login' | 'signup' | 'forgot_password';

export const DEMO_CUSTOMER: User = {
  id: 'usr-cust-1',
  name: 'Alexander Hayes',
  email: 'alex.hayes@viprenter.com',
  phone: '+1 (555) 234-8890',
  role: 'customer',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  driverLicenseNumber: 'DL-9088214-B',
  driverLicenseInfo: {
    licenseNumber: 'DL-9088214-B',
    expiryDate: '2029-10-18',
    issueCountry: 'California, USA',
    licenseClass: 'Class C (Passenger & Sport GT)',
    status: 'verified',
    digitalCardId: 'VR-DL-448109',
    dateOfBirth: '1992-06-14',
    emergencyContact: '+1 (555) 902-1144 (Sarah Hayes)',
    nationality: 'United States',
  },
  loyaltyPoints: 3450,
  membershipTier: 'Gold',
};

export const DEMO_SHOWROOM_OWNER: User = {
  id: 'usr-owner-1',
  name: 'Marcus Sterling',
  email: 'marcus@apexluxury.com',
  phone: '+1 (555) 382-9901',
  role: 'showroom_owner',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  loyaltyPoints: 0,
  membershipTier: 'VIP Platinum',
  showroomId: 'sr-1',
  showroomName: 'Apex Luxury Motors',
};

export interface ClaimedReward {
  id: string;
  title: string;
  code: string;
  pointsSpent: number;
  date: string;
  discountValue: string;
}

interface AppContextType {
  // Auth State
  currentUser: User | null;
  isAuthenticated: boolean;
  authScreen: AuthScreenType;
  setAuthScreen: (screen: AuthScreenType) => void;
  login: (email: string, role: UserRole) => void;
  loginWithSocial: (provider: 'google' | 'apple', role: UserRole) => void;
  signup: (userData: Partial<User> & { showroomDetails?: Partial<Showroom> }) => void;
  logout: () => void;

  // Reward Economy
  claimedRewards: ClaimedReward[];
  redeemReward: (title: string, pointsCost: number, discountValue: string) => boolean;

  // Role & Showroom State
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  showrooms: Showroom[];
  vehicles: Vehicle[];
  bookings: Booking[];
  reviews: Review[];
  currentShowroomId: string;
  setCurrentShowroomId: (id: string) => void;
  currentShowroom: Showroom | undefined;
  activeRentalPlan: RentalPlan;
  setActiveRentalPlan: (plan: RentalPlan) => void;
  
  // Actions
  addVehicle: (vehicleData: Omit<Vehicle, 'id' | 'ratingAvg' | 'totalReviews' | 'telematics'>) => void;
  updateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>) => Booking;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  addReview: (reviewData: Omit<Review, 'id' | 'date'>) => void;
  replyToReview: (reviewId: string, replyText: string) => void;
  
  // Live Tracking Simulator
  isSimulatingTracking: boolean;
  setIsSimulatingTracking: (simulate: boolean) => void;
  selectedTrackingVehicleId: string | null;
  setSelectedTrackingVehicleId: (id: string | null) => void;

  // Payment Cards & Processing
  paymentCards: PaymentCard[];
  addPaymentCard: (cardData: Omit<PaymentCard, 'id'>) => PaymentCard;
  removePaymentCard: (cardId: string) => void;
  setDefaultPaymentCard: (cardId: string) => void;

  // Preferences
  currency: 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD';
  setCurrency: (c: 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD') => void;
  language: string;
  setLanguage: (l: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Start with demo customer authenticated by default for instant delight, can easily log out to test login page
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_CUSTOMER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authScreen, setAuthScreen] = useState<AuthScreenType>('login');

  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [showrooms, setShowrooms] = useState<Showroom[]>(INITIAL_SHOWROOMS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [currentShowroomId, setCurrentShowroomId] = useState<string>('sr-1');
  const [activeRentalPlan, setActiveRentalPlan] = useState<RentalPlan>('daily');
  
  const [isSimulatingTracking, setIsSimulatingTracking] = useState<boolean>(true);
  const [selectedTrackingVehicleId, setSelectedTrackingVehicleId] = useState<string | null>('v-2');

  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([
    {
      id: 'card-1',
      cardholderName: 'Alexander Hayes',
      cardNumber: '•••• •••• •••• 4242',
      last4: '4242',
      expiryDate: '12/28',
      brand: 'visa',
      isDefault: true,
      colorTheme: 'gold',
    },
    {
      id: 'card-2',
      cardholderName: 'Alexander Hayes',
      cardNumber: '•••• •••• •••• 8891',
      last4: '8891',
      expiryDate: '08/29',
      brand: 'mastercard',
      isDefault: false,
      colorTheme: 'cyan',
    },
  ]);

  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD'>('USD');
  const [language, setLanguage] = useState<string>('English');

  const addPaymentCard = (cardData: Omit<PaymentCard, 'id'>): PaymentCard => {
    const newCard: PaymentCard = {
      ...cardData,
      id: `card-${Date.now()}`,
    };
    setPaymentCards((prev) => {
      if (newCard.isDefault) {
        return [...prev.map((c) => ({ ...c, isDefault: false })), newCard];
      }
      return [...prev, newCard];
    });
    return newCard;
  };

  const removePaymentCard = (cardId: string) => {
    setPaymentCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const setDefaultPaymentCard = (cardId: string) => {
    setPaymentCards((prev) =>
      prev.map((c) => ({ ...c, isDefault: c.id === cardId }))
    );
  };

  const [claimedRewards, setClaimedRewards] = useState<ClaimedReward[]>([
    {
      id: 'rw-1',
      title: '$50 Off Weekend Lease Voucher',
      code: 'VELOCE-50OFF-9821',
      pointsSpent: 500,
      date: 'Aug 28, 2026',
      discountValue: '$50 Off',
    },
  ]);

  const redeemReward = (title: string, pointsCost: number, discountValue: string): boolean => {
    if (!currentUser || currentUser.loyaltyPoints < pointsCost) {
      return false;
    }
    const newReward: ClaimedReward = {
      id: `rw-${Date.now()}`,
      title,
      code: `VELOCE-${Math.floor(1000 + Math.random() * 9000)}-VIP`,
      pointsSpent: pointsCost,
      date: 'Today',
      discountValue,
    };
    setClaimedRewards((prev) => [newReward, ...prev]);
    setCurrentUser((prev) =>
      prev
        ? {
            ...prev,
            loyaltyPoints: prev.loyaltyPoints - pointsCost,
          }
        : null
    );
    return true;
  };

  const currentShowroom = showrooms.find((s) => s.id === currentShowroomId) || showrooms[0];

  // Sync userRole when currentUser changes
  const login = (email: string, role: UserRole) => {
    if (role === 'showroom_owner') {
      setCurrentUser({
        ...DEMO_SHOWROOM_OWNER,
        email: email || DEMO_SHOWROOM_OWNER.email,
      });
      setUserRole('showroom_owner');
      setCurrentShowroomId('sr-1');
    } else {
      setCurrentUser({
        ...DEMO_CUSTOMER,
        email: email || DEMO_CUSTOMER.email,
      });
      setUserRole('customer');
    }
    setIsAuthenticated(true);
  };

  const loginWithSocial = (provider: 'google' | 'apple', role: UserRole) => {
    const isGoogle = provider === 'google';
    const socialName = isGoogle ? 'Google Verified User' : 'Apple ID Member';
    const socialAvatar = isGoogle
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80';

    if (role === 'showroom_owner') {
      setCurrentUser({
        ...DEMO_SHOWROOM_OWNER,
        name: `${socialName} (Dealer)`,
        avatarUrl: socialAvatar,
      });
      setUserRole('showroom_owner');
      setCurrentShowroomId('sr-1');
    } else {
      setCurrentUser({
        ...DEMO_CUSTOMER,
        name: socialName,
        avatarUrl: socialAvatar,
      });
      setUserRole('customer');
    }
    setIsAuthenticated(true);
  };

  const signup = (userData: Partial<User> & { showroomDetails?: Partial<Showroom> }) => {
    const role = userData.role || 'customer';
    
    if (role === 'showroom_owner') {
      // Create new showroom if provided
      const newShowroomId = `sr-${Date.now()}`;
      const newShowroom: Showroom = {
        id: newShowroomId,
        name: userData.showroomDetails?.name || 'Exclusive Premier Motors',
        tagline: userData.showroomDetails?.tagline || 'Luxury & Performance Fleet',
        logoUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=200&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        city: userData.showroomDetails?.city || 'Downtown Central',
        address: userData.showroomDetails?.address || '100 Boulevard Park',
        phone: userData.phone || '+1 (555) 789-0011',
        email: userData.email || 'dealer@premiermotors.com',
        ratingAvg: 5.0,
        totalReviews: 0,
        verified: true,
        totalCars: 0,
        workingHours: '09:00 AM - 09:00 PM',
        latitude: 25.1972,
        longitude: 55.2744,
      };

      setShowrooms((prev) => [newShowroom, ...prev]);
      setCurrentShowroomId(newShowroomId);

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: userData.name || 'Dealership Owner',
        email: userData.email || 'owner@dealership.com',
        phone: userData.phone || '+1 (555) 000-0000',
        role: 'showroom_owner',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        loyaltyPoints: 0,
        membershipTier: 'VIP Platinum',
        showroomId: newShowroomId,
        showroomName: newShowroom.name,
      };
      setCurrentUser(newUser);
      setUserRole('showroom_owner');
    } else {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: userData.name || 'New Member',
        email: userData.email || 'member@rentals.com',
        phone: userData.phone || '+1 (555) 123-4567',
        role: 'customer',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        driverLicenseNumber: userData.driverLicenseNumber || 'DL-PENDING',
        loyaltyPoints: 500, // Welcome bonus!
        membershipTier: 'Silver',
      };
      setCurrentUser(newUser);
      setUserRole('customer');
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthScreen('login');
  };

  // Live GPS Telemetry Simulator: moves moving vehicles and updates fuel/odometer
  useEffect(() => {
    if (!isSimulatingTracking) return;

    const interval = setInterval(() => {
      setVehicles((prevVehicles) =>
        prevVehicles.map((car) => {
          if (car.status === 'rented') {
            const latDelta = (Math.random() - 0.48) * 0.0012;
            const lngDelta = (Math.random() - 0.48) * 0.0012;
            const newSpeed = Math.floor(45 + Math.random() * 40);
            const headingDelta = (Math.random() - 0.5) * 15;
            const newHeading = Math.abs((car.telematics.headingAngle + headingDelta) % 360);

            return {
              ...car,
              telematics: {
                ...car.telematics,
                latitude: car.telematics.latitude + latDelta,
                longitude: car.telematics.longitude + lngDelta,
                speedKmH: newSpeed,
                ignition: true,
                headingAngle: newHeading,
                lastUpdated: 'Just now (Live)',
                odometerKm: car.telematics.odometerKm + 0.1,
              },
            };
          }
          return car;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulatingTracking]);

  const addVehicle = (
    vehicleData: Omit<Vehicle, 'id' | 'ratingAvg' | 'totalReviews' | 'telematics'>
  ) => {
    const parentShowroom = showrooms.find((s) => s.id === vehicleData.showroomId) || currentShowroom;
    
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `v-${Date.now()}`,
      ratingAvg: 5.0,
      totalReviews: 0,
      telematics: {
        latitude: parentShowroom.latitude + (Math.random() - 0.5) * 0.005,
        longitude: parentShowroom.longitude + (Math.random() - 0.5) * 0.005,
        speedKmH: 0,
        fuelLevelPercent: 100,
        odometerKm: 120,
        ignition: false,
        lastUpdated: 'Just added',
        currentAddress: `${parentShowroom.name} Fleet Bay`,
        headingAngle: 0,
      },
    };

    setVehicles((prev) => [newVehicle, ...prev]);

    setShowrooms((prev) =>
      prev.map((sr) =>
        sr.id === vehicleData.showroomId ? { ...sr, totalCars: sr.totalCars + 1 } : sr
      )
    );
  };

  const updateVehicleStatus = (vehicleId: string, status: VehicleStatus) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              status,
              telematics: {
                ...v.telematics,
                speedKmH: status === 'rented' ? 55 : 0,
                ignition: status === 'rented',
                lastUpdated: 'Just updated',
              },
            }
          : v
      )
    );
  };

  const createBooking = (
    bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>
  ): Booking => {
    const newBooking: Booking = {
      ...bookingData,
      id: `bk-${Date.now()}`,
      bookingCode: `CR-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      status: 'active',
      hasReviewed: false,
    };

    setBookings((prev) => [newBooking, ...prev]);
    updateVehicleStatus(bookingData.vehicleId, 'rented');

    // Add loyalty points to customer
    if (currentUser) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              loyaltyPoints: prev.loyaltyPoints + Math.round(bookingData.totalAmount * 0.1),
            }
          : null
      );
    }

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          if (status === 'completed' || status === 'cancelled') {
            updateVehicleStatus(b.vehicleId, 'available');
          }
          return { ...b, status };
        }
        return b;
      })
    );
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'Today',
    };

    setReviews((prev) => [newReview, ...prev]);

    setVehicles((prev) =>
      prev.map((car) => {
        if (car.id === reviewData.vehicleId) {
          const newTotal = car.totalReviews + 1;
          const newAvg = Number(
            ((car.ratingAvg * car.totalReviews + reviewData.rating) / newTotal).toFixed(2)
          );
          return { ...car, ratingAvg: newAvg, totalReviews: newTotal };
        }
        return car;
      })
    );

    if (reviewData.bookingId) {
      setBookings((prev) =>
        prev.map((b) => (b.id === reviewData.bookingId ? { ...b, hasReviewed: true } : b))
      );
    }
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, showroomReply: replyText } : r))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authScreen,
        setAuthScreen,
        login,
        loginWithSocial,
        signup,
        logout,
        claimedRewards,
        redeemReward,
        userRole,
        setUserRole,
        showrooms,
        vehicles,
        bookings,
        reviews,
        currentShowroomId,
        setCurrentShowroomId,
        currentShowroom,
        activeRentalPlan,
        setActiveRentalPlan,
        addVehicle,
        updateVehicleStatus,
        createBooking,
        updateBookingStatus,
        addReview,
        replyToReview,
        isSimulatingTracking,
        setIsSimulatingTracking,
        selectedTrackingVehicleId,
        setSelectedTrackingVehicleId,
        paymentCards,
        addPaymentCard,
        removePaymentCard,
        setDefaultPaymentCard,
        currency,
        setCurrency,
        language,
        setLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
