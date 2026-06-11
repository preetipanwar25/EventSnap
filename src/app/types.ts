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

  // ORGANIZER CONSOLE ENHANCEMENTS
  code?: string;
  eventStatus?: "Draft" | "Planning" | "Published" | "Registration Open" | "Registration Closed" | "In Progress" | "Completed" | "Cancelled";
  endDate?: string;
  timezone?: string;
  registrationOpenDate?: string;
  registrationCloseDate?: string;
  roomAssignment?: string;
  virtualLink?: string;
  maxCapacity?: number;
  waitlistEnabled?: boolean;
  waitlistCapacity?: number;
  registrationRequired?: boolean;
  eventType?: "In-Person" | "Virtual" | "Hybrid";
  currency?: string;
  targetAudience?: string;
  industry?: string;
  experienceLevel?: string;
  eligibility?: string;
  bannerUrl?: string;
  logoUrl?: string;
  themeColor?: string;
  websiteUrl?: string;
  budget?: number;
  actualCost?: number;
  sponsorshipTarget?: number;
  terms?: string;
  privacyPolicy?: string;
  consentRequired?: boolean;
  npsScore?: number;
  feedbackScore?: number;

  // EXHIBITOR & BOOTH & VENDOR CONFIGURATION
  exhibitorRegEnabled?: boolean;
  exhibitorRegStartDate?: string;
  exhibitorRegEndDate?: string;
  maxExhibitors?: number;
  exhibitorApprovalRequired?: boolean;
  exhibitorCategoriesAllowed?: string[];

  totalBoothCount?: number;
  boothTypesAllowed?: ("Standard" | "Premium" | "Corner" | "Island" | "Outdoor")[];
  boothPricing?: { type: "Standard" | "Premium" | "Corner" | "Island" | "Outdoor"; price: number }[];
  boothAssignmentStrategy?: "Self-Select" | "Organizer Assigned";
  boothMapUrl?: string;

  vendorRegEnabled?: boolean;
  foodTruckRegEnabled?: boolean;
  maxFoodTrucks?: number;
  maxVendors?: number;
  vendorApprovalWorkflowEnabled?: boolean;
  foodSafetyDocRequired?: boolean;
  businessLicenseRequired?: boolean;
  insuranceRequired?: boolean;

  electricityAvailable?: boolean;
  waterHookupAvailable?: boolean;
  wasteDisposalAvailable?: boolean;
  internetAvailable?: boolean;
  
  // Child records simulations
  sessions?: { id: string; name: string; startTime: string; endTime: string; speakerId: string; room: string; capacity: number }[];
  speakers?: { id: string; name: string; email: string; phone: string; bio: string; avatarUrl: string }[];
  registrations?: { id: string; name: string; email: string; status: "Approved" | "Rejected" | "Pending" | "Waitlisted"; date: string; checkedIn: boolean }[];
  foodTrucks?: { id: string; name: string; cuisine: string; permitNumber: string; powerRequired: string; waterRequired: boolean; spot: string; status: "Approved" | "Rejected" | "Pending"; menu?: string; insuranceCertificate?: string; dimensions?: string; arrivalWindow?: string }[];
  vendors?: { id: string; name: string; category: string; taxId: string; license: string; space: string; status: "Approved" | "Rejected" | "Pending" }[];
  exhibitors?: { id: string; companyName: string; contactName: string; email: string; phone: string; website: string; industry: string; status: "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected" | "Checked In" | "Pending"; boothRequested?: string; boothAssigned?: string; productsServices?: string; logoUrl?: string }[];
  documents?: { id: string; name: string; type: string; fileUrl: string; expiryDate?: string }[];
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
  type: "STANDARD" | "FOOD_TRUCK" | "Standard" | "Premium" | "Corner" | "Island" | "Outdoor";
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
