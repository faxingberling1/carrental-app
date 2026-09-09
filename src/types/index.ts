export type UserRole = 'customer' | 'showroom_owner';

export interface DriverLicenseInfo {
  licenseNumber: string;
  expiryDate: string;
  issueCountry: string;
  licenseClass: string;
  status: 'verified' | 'pending' | 'expired';
  digitalCardId: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  nationality?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl: string;
  driverLicenseNumber?: string;
  driverLicenseInfo?: DriverLicenseInfo;
  loyaltyPoints: number;
  membershipTier: 'Silver' | 'Gold' | 'VIP Platinum';
  showroomId?: string; // If showroom owner
  showroomName?: string;
}


export type VehicleCategory = 'All' | 'SUV' | 'Sedan' | 'Luxury' | 'Sports' | 'Electric' | 'Economy';

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export type RentalPlan = 'daily' | 'monthly';

export interface VehicleSpecs {
  transmission: 'Automatic' | 'Manual';
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  seats: number;
  engine: string;
  horsepower: number;
  acceleration: string; // e.g. "0-100 km/h in 4.2s"
  mileageLimitPerDay: number; // in km
}

export interface TelematicsData {
  latitude: number;
  longitude: number;
  speedKmH: number;
  fuelLevelPercent: number; // 0-100
  odometerKm: number;
  ignition: boolean; // true = Engine ON
  lastUpdated: string;
  currentAddress: string;
  headingAngle: number; // 0 - 360 degrees
  batteryHealthPercent?: number;
}

export interface Vehicle {
  id: string;
  showroomId: string;
  showroomName: string;
  showroomCity: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  category: Exclude<VehicleCategory, 'All'>;
  dailyRate: number;
  monthlyRate: number;
  securityDeposit: number;
  specs: VehicleSpecs;
  features: string[];
  images: string[];
  coverImage: string;
  status: VehicleStatus;
  ratingAvg: number;
  totalReviews: number;
  telematics: TelematicsData;
  color: string;
}

export interface Showroom {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  bannerUrl: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  ratingAvg: number;
  totalReviews: number;
  verified: boolean;
  totalCars: number;
  workingHours: string;
  latitude: number;
  longitude: number;
}

export interface Booking {
  id: string;
  bookingCode: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  showroomId: string;
  showroomName: string;
  customerName: string;
  customerPhone: string;
  rentalPlan: RentalPlan;
  startDate: string; // ISO date string or YYYY-MM-DD
  endDate: string;
  durationUnits: number; // days or months
  rateApplied: number;
  totalAmount: number;
  securityDeposit: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  pickupType: 'showroom_pickup' | 'doorstep_delivery';
  deliveryAddress?: string;
  createdAt: string;
  hasReviewed?: boolean;
}

export interface Review {
  id: string;
  bookingId?: string;
  vehicleId: string;
  showroomId: string;
  customerName: string;
  customerAvatar: string;
  rating: number; // 1-5
  conditionRating: number;
  serviceRating: number;
  cleanlinessRating: number;
  comment: string;
  date: string;
  showroomReply?: string;
  verifiedRental: boolean;
}

export interface PaymentCard {
  id: string;
  cardholderName: string;
  cardNumber: string; // e.g. "•••• •••• •••• 4242"
  last4: string;
  expiryDate: string; // "MM/YY"
  brand: 'visa' | 'mastercard' | 'amex' | 'discover';
  isDefault: boolean;
  colorTheme?: 'dark' | 'gold' | 'cyan' | 'platinum';
}
