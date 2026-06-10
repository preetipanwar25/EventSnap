export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ATTENDEE" | "ORGANIZER" | "VENDOR" | "SPONSOR" | "ADMIN" | "VENUE_PROVIDER";
  status: "ACTIVE" | "SUSPENDED";
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface BoothApplication {
  id: string;
  eventId: string;
  eventTitle: string;
  boothId: string;
  boothName: string;
  vendorId: string;
  vendorName: string;
  category: string;
  price: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentTerms: "FULL" | "DEPOSIT";
  amountPaid: number;
  documents: string[];
  timestamp: string;
}

export interface SponsorApplication {
  id: string;
  eventId: string;
  eventTitle: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  sponsorId: string;
  companyName: string;
  logoUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  timestamp: string;
  deliverables: { name: string; completed: boolean }[];
}

export interface VendorLead {
  id: string;
  vendorId: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  timestamp: string;
}

export interface VendorSale {
  id: string;
  vendorId: string;
  eventId: string;
  productName: string;
  amount: number;
  timestamp: string;
}

export interface SponsorPackage {
  id: string;
  name: string;
  price: number;
  benefits: string[];
}

export interface SponsorInterest {
  id: string;
  eventId: string;
  eventTitle: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: "PENDING" | "VERIFIED" | "APPROVED" | "DECLINED";
  timestamp: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  price: number;
  ticketInventory: number;
  ticketsSold: number;
  status: "UPCOMING" | "ONGOING" | "CANCELLED";
  category: string;
  imageUrl: string;
  venueId?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  isSponsored?: boolean;
  organizerId?: string;
  sponsorPackages?: SponsorPackage[];
  moderationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  ticketClasses?: { name: string; price: number; inventory: number; sold: number }[];
}

export interface Review {
  id: string;
  targetType: "EVENT" | "VENUE" | "VENDOR" | "SITE";
  targetId: string;
  targetName: string;
  authorName: string;
  authorRole: "CUSTOMER" | "VENDOR" | "VENUE_PROVIDER";
  rating: number;
  comment: string;
  date: string;
  status: "APPROVED" | "FLAGGED_ABUSIVE" | "HIDDEN";
}

export interface OrganizerProfile {
  id: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  status: "PENDING" | "VERIFIED";
}

export interface VenueProviderProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: "PENDING" | "VERIFIED";
}

export interface Venue {
  id: string;
  providerId: string;
  name: string;
  type: "Convention Center" | "Hotel" | "Banquet Hall" | "Stadium" | "Conference Room" | "Outdoor Venue";
  description: string;
  location: string;
  capacity: number;
  services: string[]; // e.g. ["Catering", "AV Setup", "Staging", "Valet Parking", "Security"]
  parkingSpots: number;
  availableDates: string[]; // YYYY-MM-DD
  imageUrl: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;

  // NEW ENHANCED VENUE ATTRIBUTES
  status?: "Active" | "Inactive" | "Under Renovation";
  country?: string;
  timezone?: string;
  minCapacity?: number;
  seatingCapacity?: number;
  standingCapacity?: number;
  roomsCount?: number;
  floorArea?: number;
  layoutTypes?: ("Theater" | "Classroom" | "U-Shape" | "Banquet" | "Boardroom")[];
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
  alternateContact?: string;
  website?: string;
  rentalCost?: number;
  currency?: string;
  costPerHour?: number;
  costPerDay?: number;
  securityDeposit?: number;
  taxInfo?: string;
  cancellationPolicy?: string;
  parkingAvailable?: boolean;
  parkingCapacity?: number;
  wifiAvailable?: boolean;
  wifiSpeed?: number;
  avEquipment?: boolean;
  projectors?: boolean;
  soundSystem?: boolean;
  stage?: boolean;
  airConditioning?: boolean;
  cateringAvailable?: boolean;
  kitchenAccess?: boolean;
  greenRooms?: boolean;
  wheelchairAccessible?: boolean;
  restroomsCount?: number;
  powerBackup?: boolean;
  setupTime?: number;
  cleanupTime?: number;
  loadingDock?: boolean;
  freightElevator?: boolean;
  vendorRestrictions?: string;
  noiseRestrictions?: string;
  photos?: string[];
  videos?: string[];
  floorPlans?: string[];
  virtualTourUrl?: string;
  fireSafetyCertified?: boolean;
  insuranceDetails?: string;
  emergencyExitsCount?: number;
  securityAvailable?: boolean;
  accessibilityCompliance?: boolean;
  blockedDates?: string[];
  maintenanceSchedule?: { date: string; reason: string }[];
  peakSeasonFlag?: boolean;
  avgRating?: number;
  reviewsCount?: number;
  internalNotes?: string;
  preferredVenueFlag?: boolean;
  documents?: { id: string; name: string; type: string; fileUrl: string; expiryDate?: string }[];
}

export interface VenueBooking {
  id: string;
  venueId: string;
  eventId: string;
  eventTitle: string;
  date: string; // YYYY-MM-DD
  status: "CONFIRMED" | "CANCELLED";
}

export interface PromoCode {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  value: number;
  description: string;
  usageLimit: number;
  usageCount: number;
}

export interface Order {
  id: string;
  eventId: string;
  eventTitle: string;
  quantity: number;
  totalAmount: number;
  promoApplied: string | null;
  status: "PAID" | "PENDING" | "FAILED" | "CANCELLED";
  timestamp: string;
  paymentGateway: "Stripe" | "PayPal";
  idempotencyKey: string;
  type: "TICKET" | "BOOTH" | "SPONSOR";
  boothId?: string;
  boothName?: string;
  vendorBusinessName?: string;
  paymentTerms?: "FULL" | "DEPOSIT";
  amountPaid?: number;
  remainingBalance?: number;
  ticketClass?: string;
}

export interface Booth {
  id: string;
  eventId: string;
  name: string;
  type: "STANDARD" | "FOOD_TRUCK";
  category: string; // e.g. Tech, Crafts, Mexican, Italian, Desserts, Beverages
  price: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  vendorBusinessName?: string;
  paymentTerms?: "FULL" | "DEPOSIT";
  amountPaid?: number;
}

export interface VendorProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  status: "PENDING" | "VERIFIED";
  availableDates?: string[];
  pricing?: number;
}

export interface LogMessage {
  time: string;
  service: string;
  message: string;
  type: "info" | "success" | "error" | "event";
}
