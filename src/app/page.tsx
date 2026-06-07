"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Check,
  X,
  Shield,
  Plus,
  RefreshCw,
  BarChart2,
  ShieldCheck,
  Mail,
  Phone,
  Zap,
  ArrowRight,
  Gift,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Grid,
  Award,
  Lock,
  Smartphone,
  Info,
  Store,
  Filter,
  Layers,
  DollarSign,
  UserCheck,
  ShieldAlert,
  Sun,
  Moon,
  Trash2,
  Edit2,
  ArrowLeft,
  Star
} from "lucide-react";

// Types definition
interface SponsorPackage {
  id: string;
  name: string;
  price: number;
  benefits: string[];
}

interface SponsorInterest {
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

interface Event {
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
}

interface Review {
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

interface OrganizerProfile {
  id: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  status: "PENDING" | "VERIFIED";
}

interface VenueProviderProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: "PENDING" | "VERIFIED";
}

interface Venue {
  id: string;
  providerId: string;
  name: string;
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
}

interface VenueBooking {
  id: string;
  venueId: string;
  eventId: string;
  eventTitle: string;
  date: string; // YYYY-MM-DD
  status: "CONFIRMED" | "CANCELLED";
}

interface PromoCode {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  value: number;
  description: string;
  usageLimit: number;
  usageCount: number;
}

interface Order {
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
  type: "TICKET" | "BOOTH";
  boothId?: string;
  boothName?: string;
  vendorBusinessName?: string;
  paymentTerms?: "FULL" | "DEPOSIT";
  amountPaid?: number;
  remainingBalance?: number;
}

interface Booth {
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

interface VendorProfile {
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

interface LogMessage {
  time: string;
  service: string;
  message: string;
  type: "info" | "success" | "error" | "event";
}

// US States Dropdown constant
const US_STATES = [
  { code: "", name: "Select State" },
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "Washington D.C." }
];

// Zipcode Lookup Database
const ZIP_LOOKUP: Record<string, { city: string; state: string; lat: number; lng: number }> = {
  "94103": { city: "San Francisco", state: "CA", lat: 37.7726, lng: -122.4098 },
  "80465": { city: "Morrison", state: "CO", lat: 39.6536, lng: -105.1911 },
  "94573": { city: "Rutherford", state: "CA", lat: 38.4582, lng: -122.4228 },
  "94558": { city: "Napa", state: "CA", lat: 38.2975, lng: -122.2869 },
  "98101": { city: "Seattle", state: "WA", lat: 47.6062, lng: -122.3321 },
  "10001": { city: "New York", state: "NY", lat: 40.7501, lng: -73.9996 },
  "90210": { city: "Beverly Hills", state: "CA", lat: 34.0736, lng: -118.4004 },
  "30301": { city: "Atlanta", state: "GA", lat: 33.7490, lng: -84.3880 },
  "60601": { city: "Chicago", state: "IL", lat: 41.8781, lng: -87.6298 },
  "75201": { city: "Dallas", state: "TX", lat: 32.7767, lng: -96.7970 },
  "33101": { city: "Miami", state: "FL", lat: 25.7617, lng: -80.1918 },
  "02108": { city: "Boston", state: "MA", lat: 42.3584, lng: -71.0598 },
  "78701": { city: "Austin", state: "TX", lat: 30.2672, lng: -97.7431 },
  "85001": { city: "Phoenix", state: "AZ", lat: 33.4484, lng: -112.0740 },
  "89101": { city: "Las Vegas", state: "NV", lat: 36.1699, lng: -115.1398 },
  "20001": { city: "Washington", state: "DC", lat: 38.9072, lng: -77.0369 }
};

// Initial Sample Data
const initialEvents: Event[] = [
  {
    id: "evt-1",
    title: "Global Tech Summit 2026",
    description: "Join 10,000+ developers, tech leaders, and innovators for the year's most significant cloud architecture and AI monolithic application design summit.",
    location: "San Francisco Center & Virtual",
    date: "June 25, 2026",
    price: 299,
    ticketInventory: 150,
    ticketsSold: 84,
    status: "UPCOMING",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    venueId: "vn-1",
    city: "San Francisco",
    state: "CA",
    zipcode: "94103",
    latitude: 37.7726,
    longitude: -122.4098,
    isSponsored: true,
    sponsorPackages: [
      { id: "sp-gold-evt-1", name: "Gold Corporate Sponsor", price: 5000, benefits: ["Logo on Stage Banner", "Premium Exhibition Booth", "10 VIP Tickets"] },
      { id: "sp-silver-evt-1", name: "Silver Corporate Sponsor", price: 2500, benefits: ["Logo on Catalog Page", "Standard Exhibition Booth", "5 General Tickets"] }
    ]
  },
  {
    id: "evt-2",
    title: "Symphony Under the Stars",
    description: "An enchanting evening featuring live orchestration of classical masterpieces combined with modern synthwave, set under a clear starlit sky.",
    location: "Red Rocks Amphitheatre, CO",
    date: "July 12, 2026",
    price: 85,
    ticketInventory: 350,
    ticketsSold: 312,
    status: "UPCOMING",
    category: "Music",
    imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80",
    venueId: "vn-2",
    city: "Morrison",
    state: "CO",
    zipcode: "80465",
    latitude: 39.6536,
    longitude: -105.1911
  },
  {
    id: "evt-3",
    title: "International Food & Wine Festival",
    description: "Taste gourmet dishes from award-winning world chefs and sample rare vintage wines curated by world-class sommeliers.",
    location: "Napa Valley, California",
    date: "August 05, 2026",
    price: 150,
    ticketInventory: 200,
    ticketsSold: 110,
    status: "UPCOMING",
    category: "Food & Drink",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80",
    venueId: "vn-3",
    city: "Rutherford",
    state: "CA",
    zipcode: "94573",
    latitude: 38.4582,
    longitude: -122.4228,
    isSponsored: true
  }
];

const initialPromoCodes: PromoCode[] = [
  { code: "WELCOME10", discountType: "PERCENTAGE", value: 10, description: "10% off for new users", usageLimit: 500, usageCount: 242 },
  { code: "AURA50", discountType: "PERCENTAGE", value: 50, description: "Special 50% discount on tech events", usageLimit: 50, usageCount: 15 },
  { code: "EARLYBIRD", discountType: "FIXED", value: 30, description: "$30 off early bookings", usageLimit: 100, usageCount: 98 }
];

const initialBooths: Booth[] = [
  { id: "bth-1", eventId: "evt-1", name: "Premium Tech Booth #101", type: "STANDARD", category: "Tech Showcase", price: 800, status: "AVAILABLE" },
  { id: "bth-2", eventId: "evt-1", name: "Standard Booth #102", type: "STANDARD", category: "Apparel & Swag", price: 450, status: "SOLD", vendorBusinessName: "DevThreads Co.", paymentTerms: "FULL", amountPaid: 450 },
  { id: "bth-3", eventId: "evt-1", name: "Catering Spot #FT1", type: "FOOD_TRUCK", category: "Mexican", price: 600, status: "AVAILABLE" },
  { id: "bth-4", eventId: "evt-1", name: "Catering Spot #FT2", type: "FOOD_TRUCK", category: "Beverages", price: 500, status: "AVAILABLE" },
  
  { id: "bth-5", eventId: "evt-2", name: "Merchandise Tent #M1", type: "STANDARD", category: "Crafts", price: 300, status: "AVAILABLE" },
  { id: "bth-6", eventId: "evt-2", name: "Gourmet Catering Spot #G1", type: "FOOD_TRUCK", category: "Italian", price: 700, status: "SOLD", vendorBusinessName: "Luigi's Woodfired Pizza", paymentTerms: "DEPOSIT", amountPaid: 175 },
  { id: "bth-7", eventId: "evt-2", name: "Beverage Booth #G2", type: "FOOD_TRUCK", category: "Beverages", price: 500, status: "AVAILABLE" },
  
  { id: "bth-8", eventId: "evt-3", name: "Artisanal Cheese Stall #A1", type: "STANDARD", category: "Crafts", price: 400, status: "AVAILABLE" },
  { id: "bth-9", eventId: "evt-3", name: "Napa Bistro Spot #A2", type: "FOOD_TRUCK", category: "Italian", price: 750, status: "AVAILABLE" },
  { id: "bth-10", eventId: "evt-3", name: "Dessert Truck Spot #FT3", type: "FOOD_TRUCK", category: "Desserts", price: 550, status: "AVAILABLE" }
];

const initialVendorProfiles: VendorProfile[] = [
  { 
    id: "vnd-1", 
    businessName: "DevThreads Co.", 
    ownerName: "Jane Smith", 
    email: "jane@devthreads.com", 
    phone: "+1 555-0192", 
    category: "Apparel & Swag", 
    status: "VERIFIED",
    availableDates: ["2026-06-25", "2026-07-12", "2026-08-05", "2026-09-20", "2026-10-10", "2026-10-20"],
    pricing: 300
  },
  { 
    id: "vnd-2", 
    businessName: "Luigi's Woodfired Pizza", 
    ownerName: "Luigi Rossini", 
    email: "luigi@woodfiredpizza.it", 
    phone: "+1 555-8833", 
    category: "Italian", 
    status: "VERIFIED",
    availableDates: ["2026-07-12", "2026-08-05", "2026-10-10", "2026-10-20"],
    pricing: 450
  }
];

const initialVenueProviders: VenueProviderProfile[] = [
  { id: "vp-1", companyName: "SF Bay Area Venues", contactName: "Sarah Connor", email: "sarah@sfvenues.com", phone: "+1 555-9011", status: "VERIFIED" },
  { id: "vp-2", companyName: "Colorado Parks & Arenas", contactName: "David Miller", email: "david@coparks.org", phone: "+1 555-3022", status: "VERIFIED" },
  { id: "vp-3", companyName: "Napa Luxury Vineyards", contactName: "Elena Rostova", email: "elena@napavineyards.com", phone: "+1 555-7033", status: "VERIFIED" }
];

const initialVenues: Venue[] = [
  {
    id: "vn-1",
    providerId: "vp-1",
    name: "San Francisco Center",
    description: "State-of-the-art modern convention center with high-density AV capabilities, configurable presentation rooms, and premium security controls.",
    location: "747 Howard St, San Francisco, CA 94103",
    capacity: 5000,
    services: ["AV Setup", "Staging", "Security", "Catering"],
    parkingSpots: 450,
    availableDates: ["2026-06-25", "2026-06-26", "2026-08-15", "2026-10-10"],
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    city: "San Francisco",
    state: "CA",
    zipcode: "94103",
    latitude: 37.7726,
    longitude: -122.4098
  },
  {
    id: "vn-2",
    providerId: "vp-2",
    name: "Red Rocks Amphitheatre",
    description: "World-famous outdoor geological open-air concert stage, providing unmatched natural acoustics and expansive amphitheater staging.",
    location: "18300 W Alameda Pkwy, Morrison, CO 80465",
    capacity: 9500,
    services: ["Staging", "Security", "AV Setup"],
    parkingSpots: 1200,
    availableDates: ["2026-07-12", "2026-07-13", "2026-09-05"],
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop&q=80",
    city: "Morrison",
    state: "CO",
    zipcode: "80465",
    latitude: 39.6536,
    longitude: -105.1911
  },
  {
    id: "vn-3",
    providerId: "vp-3",
    name: "Napa Valley Vineyard Estate",
    description: "Stunning boutique winery estate featuring scenic lawn settings, gourmet in-house catering services, and premium valet parking accommodations.",
    location: "1290 Rutherford Rd, Rutherford, CA 94573",
    capacity: 1200,
    services: ["Catering", "Valet Parking", "Security", "Staging"],
    parkingSpots: 300,
    availableDates: ["2026-08-05", "2026-08-06", "2026-09-20"],
    imageUrl: "https://images.unsplash.com/photo-1543418219-44e30b057fc5?w=800&auto=format&fit=crop&q=80",
    city: "Rutherford",
    state: "CA",
    zipcode: "94573",
    latitude: 38.4582,
    longitude: -122.4228
  }
];

const initialVenueBookings: VenueBooking[] = [
  { id: "vb-1", venueId: "vn-1", eventId: "evt-1", eventTitle: "Global Tech Summit 2026", date: "2026-06-25", status: "CONFIRMED" },
  { id: "vb-2", venueId: "vn-2", eventId: "evt-2", eventTitle: "Symphony Under the Stars", date: "2026-07-12", status: "CONFIRMED" },
  { id: "vb-3", venueId: "vn-3", eventId: "evt-3", eventTitle: "International Food & Wine Festival", date: "2026-08-05", status: "CONFIRMED" }
];

const initialReviews: Review[] = [
  {
    id: "rev-1",
    targetType: "EVENT",
    targetId: "evt-1",
    targetName: "Global Tech Summit 2026",
    authorName: "Jane Doe",
    authorRole: "CUSTOMER",
    rating: 5,
    comment: "This tech summit was absolutely amazing! Loved the AI monolith discussions.",
    date: "2026-06-05",
    status: "APPROVED"
  },
  {
    id: "rev-2",
    targetType: "EVENT",
    targetId: "evt-1",
    targetName: "Global Tech Summit 2026",
    authorName: "Bob Smith",
    authorRole: "CUSTOMER",
    rating: 4,
    comment: "Great organization and networking, but parking was a bit congested.",
    date: "2026-06-05",
    status: "APPROVED"
  },
  {
    id: "rev-3",
    targetType: "EVENT",
    targetId: "evt-2",
    targetName: "Symphony Under the Stars",
    authorName: "Alice Johnson",
    authorRole: "CUSTOMER",
    rating: 5,
    comment: "Red Rocks + classical music = pure heaven! Will definitely go again.",
    date: "2026-06-05",
    status: "APPROVED"
  },
  {
    id: "rev-4",
    targetType: "VENUE",
    targetId: "vn-1",
    targetName: "San Francisco Center",
    authorName: "John Tech",
    authorRole: "VENDOR",
    rating: 4,
    comment: "Very modern venue, high quality AV, but food catering queues were long.",
    date: "2026-06-05",
    status: "APPROVED"
  },
  {
    id: "rev-5",
    targetType: "VENUE",
    targetId: "vn-2",
    targetName: "Red Rocks Amphitheatre",
    authorName: "Music Lover",
    authorRole: "CUSTOMER",
    rating: 5,
    comment: "Unbelievable natural acoustics, clean facilities, helpful staff.",
    date: "2026-06-05",
    status: "APPROVED"
  },
  {
    id: "rev-6",
    targetType: "VENDOR",
    targetId: "vnd-1",
    targetName: "DevThreads Co.",
    authorName: "Attendee 1",
    authorRole: "CUSTOMER",
    rating: 5,
    comment: "Great shirt quality and excellent customer service!",
    date: "2026-06-05",
    status: "APPROVED"
  },
  {
    id: "rev-7",
    targetType: "SITE",
    targetId: "site",
    targetName: "Site Experience",
    authorName: "User 12",
    authorRole: "CUSTOMER",
    rating: 5,
    comment: "This event portal has a super sleek UI! Glassmorphism is stunning.",
    date: "2026-06-05",
    status: "APPROVED"
  },
  {
    id: "rev-8",
    targetType: "SITE",
    targetId: "site",
    targetName: "Site Experience",
    authorName: "User Abusive",
    authorRole: "CUSTOMER",
    rating: 1,
    comment: "This site is a total scam and fake cheat!",
    date: "2026-06-05",
    status: "FLAGGED_ABUSIVE"
  }
];

// Dynamically generate 500 sample events, venues, booths, and venue bookings across the US
(() => {
  const cityKeys = Object.keys(ZIP_LOOKUP);

  const categories = [
    "Technology",
    "Music",
    "Food & Drink",
    "Business",
    "Sports",
    "Art & Design",
    "Science & Space",
    "Gaming",
    "Health & Wellness",
    "Community"
  ];

  const images = [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1543418219-44e30b057fc5?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=800&auto=format&fit=crop&q=80"
  ];

  const startDate = new Date("2026-06-01");
  const providers = ["vp-1", "vp-2", "vp-3"];
  
  // Make sure each city in ZIP_LOOKUP has a corresponding venue
  cityKeys.forEach((zip, index) => {
    const zipData = ZIP_LOOKUP[zip];
    const venueId = `vn-gen-${index + 1}`;
    if (!initialVenues.some(v => v.city === zipData.city)) {
      initialVenues.push({
        id: venueId,
        providerId: providers[index % providers.length],
        name: `${zipData.city} Grand Center`,
        description: `State-of-the-art modern events hall and convention center in ${zipData.city}, featuring high-speed amenities, AV setup, and extensive vendor staging.`,
        location: `${200 + index * 15} Main Street, ${zipData.city}, ${zipData.state} ${zip}`,
        capacity: 1000 + (index * 600) % 8000,
        services: ["AV Setup", "Security", "Staging", "Catering"],
        parkingSpots: 150 + (index * 90) % 900,
        availableDates: [],
        imageUrl: images[index % images.length],
        city: zipData.city,
        state: zipData.state,
        zipcode: zip,
        latitude: zipData.lat,
        longitude: zipData.lng
      });
    }
  });

  const eventNames = [
    "Tech Expo", "Jazz Festival", "Beer & Wine Garden", "Startup Summit", "Charity Marathon",
    "Art Gallery Gala", "Space & Tech Summit", "Gaming Arena Tournament", "Yoga & Mindfulness Workshop", "Farmers Market & Crafts",
    "Classical Orchestra", "Food Truck Fiesta", "Gourmet Tasting Dinner", "Blockchain Forum", "Mental Health Summit",
    "Industrial Design Expo", "Indie Rock Night", "Independent Film Festival", "Regional Science Fair", "Stand-up Comedy Gala",
    "AI Monolith Symposium", "Opera Under the Stars", "Cheese & Wine Festival", "IoT Builders Hackathon", "Metaverse Showcase"
  ];

  const descriptions = [
    "An interactive showcase gathering developers, enthusiasts, and innovators for workshops, keynote panels, and swags.",
    "A premium community experience featuring a curated list of live performances, food setups, and local promotional booths.",
    "Join community leaders and passionate individuals for a day of sharing, networking, and celebrating local crafts.",
    "Celebrate talent and creativity with live demonstrations, local food trucks, and interactive vendor stalls."
  ];

  // We already have evt-1, evt-2, evt-3
  for (let i = 4; i <= 500; i++) {
    const category = categories[i % categories.length];
    const cityZip = cityKeys[i % cityKeys.length];
    const zipData = ZIP_LOOKUP[cityZip];
    const venue = initialVenues.find(v => v.city === zipData.city) || initialVenues[0];

    // Spread events over the next 180 days
    const eventTimeMs = startDate.getTime() + (i * 12 * 60 * 60 * 1000); // 12 hours spacing
    const eventDate = new Date(eventTimeMs);
    const dateYmd = eventDate.toISOString().split("T")[0];
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric"
    });

    // Add availability to venue
    if (!venue.availableDates.includes(dateYmd)) {
      venue.availableDates.push(dateYmd);
    }

    const eventId = `evt-${i}`;
    const title = `${zipData.city} ${eventNames[i % eventNames.length]}`;

    initialEvents.push({
      id: eventId,
      title: title,
      description: `${descriptions[i % descriptions.length]} Hosted at the beautiful ${venue.name}.`,
      location: `${venue.name}, ${zipData.city}, ${zipData.state}`,
      date: formattedDate,
      price: 20 + (i * 9) % 280,
      ticketInventory: 100 + (i * 30) % 500,
      ticketsSold: (i * 7) % 90,
      status: "UPCOMING",
      category: category,
      imageUrl: images[i % images.length],
      venueId: venue.id,
      city: zipData.city,
      state: zipData.state,
      zipcode: cityZip,
      latitude: zipData.lat,
      longitude: zipData.lng,
      isSponsored: (i % 8 === 0),
      sponsorPackages: [
        { id: `sp-gold-${eventId}`, name: "Gold Sponsor", price: 1500, benefits: ["Logo on web catalog", "1 Free booth space", "3 VIP Passes"] },
        { id: `sp-silver-${eventId}`, name: "Silver Sponsor", price: 800, benefits: ["Logo on web catalog", "2 General Passes"] }
      ]
    });

    // Add Venue Booking
    initialVenueBookings.push({
      id: `vb-gen-${i}`,
      venueId: venue.id,
      eventId: eventId,
      eventTitle: title,
      date: dateYmd,
      status: "CONFIRMED"
    });

    // Add 4 Booths per event
    for (let b = 1; b <= 4; b++) {
      initialBooths.push({
        id: `bth-gen-${i}-${b}`,
        eventId: eventId,
        name: `Booth #${100 + b} (${b <= 2 ? "Standard" : "Food Truck Slot"})`,
        type: b <= 2 ? "STANDARD" : "FOOD_TRUCK",
        category: b <= 2 ? "Promotional" : "Food & Beverages",
        price: 300 + b * 100,
        status: "AVAILABLE"
      });
    }
  }
})();

// Helper to check for abusive keywords
const containsAbusiveContent = (text: string) => {
  const lowercase = text.toLowerCase();
  return ["scam", "spam", "abuse", "fake"].some(word => lowercase.includes(word));
};

// Helper to render star ratings out of 5
const renderStars = (rating: number) => {
  const rounded = Math.round(rating * 10) / 10;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5 text-amber-400 select-none" title={`Rating: ${rounded} / 5`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`full-${i}`} className="text-xs sm:text-sm">★</span>
      ))}
      {hasHalf && (
        <span className="text-xs sm:text-sm relative overflow-hidden inline-block w-[0.5em] select-none text-amber-400">
          ★
          <span className="absolute top-0 left-[0.5em] w-[0.5em] text-slate-600 select-none">★</span>
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`empty-${i}`} className="text-xs sm:text-sm text-slate-600">★</span>
      ))}
      {rating > 0 && (
        <span className="text-[10px] text-[var(--text-secondary)] ml-1 font-mono font-bold">
          {rounded.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Helper to normalize any date string to YYYY-MM-DD format
const normalizeDateToYmd = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (e) {}
  return "";
};

// Helper functions for location parsing and geocoding
const parseLocationDetails = (locStr: string) => {
  const zipMatches = locStr.match(/\b\d{5}\b/g);
  const zipcode = zipMatches ? zipMatches[zipMatches.length - 1] : "";

  // Check Zip Lookup
  if (zipcode && ZIP_LOOKUP[zipcode]) {
    const data = ZIP_LOOKUP[zipcode];
    return {
      city: data.city,
      state: data.state,
      zipcode: zipcode,
      latitude: data.lat,
      longitude: data.lng
    };
  }

  const stateMatch = locStr.match(/,\s*\b([A-Z]{2})\b/i) || locStr.match(/\b([A-Z]{2})\s+\d{5}\b/i);
  const state = stateMatch ? stateMatch[1].toUpperCase() : "";

  let city = "";
  const parts = locStr.split(",");
  if (parts.length >= 2) {
    const possibleCity = parts[parts.length - 2].trim();
    if (possibleCity.length > 2) {
      city = possibleCity;
    }
  } else {
    if (locStr.toLowerCase().includes("san francisco")) city = "San Francisco";
    else if (locStr.toLowerCase().includes("napa") || locStr.toLowerCase().includes("rutherford")) city = "Rutherford";
    else if (locStr.toLowerCase().includes("morrison")) city = "Morrison";
    else if (locStr.toLowerCase().includes("seattle")) city = "Seattle";
    else if (locStr.toLowerCase().includes("denver")) city = "Denver";
  }

  let latitude = 37.7749; // Default San Francisco
  let longitude = -122.4194;

  const lowerLoc = locStr.toLowerCase();
  if (lowerLoc.includes("sf") || lowerLoc.includes("san francisco") || zipcode === "94103") {
    latitude = 37.7726;
    longitude = -122.4098;
  } else if (lowerLoc.includes("napa") || lowerLoc.includes("rutherford") || zipcode === "94573" || zipcode === "94558") {
    latitude = 38.4582;
    longitude = -122.4228;
  } else if (lowerLoc.includes("morrison") || lowerLoc.includes("red rocks") || zipcode === "80465") {
    latitude = 39.6536;
    longitude = -105.1911;
  } else if (lowerLoc.includes("seattle") || zipcode.startsWith("98")) {
    latitude = 47.6062;
    longitude = -122.3321;
  } else if (lowerLoc.includes("denver") || zipcode.startsWith("80")) {
    latitude = 39.7392;
    longitude = -104.9903;
  } else if (lowerLoc.includes("co") || lowerLoc.includes("colorado")) {
    latitude = 39.6536;
    longitude = -105.1911;
  } else {
    latitude = 35.0 + Math.random() * 10;
    longitude = -120.0 + Math.random() * 40;
  }

  return { city, state, zipcode, latitude, longitude };
};

const getDistanceInMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function Home() {
  // Theme State
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);

  // Synchronize Theme
  useEffect(() => {
    // Read theme from local storage or default to dark
    const storedTheme = localStorage.getItem("theme") as "dark" | "light";
    const initialTheme = storedTheme || "dark";
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === null) return;
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle Theme helper
  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  // Application State
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [booths, setBooths] = useState<Booth[]>(initialBooths);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendorProfiles, setVendorProfiles] = useState<VendorProfile[]>(initialVendorProfiles);
  
  // Venue & Venue Provider States
  const [venueProviders, setVenueProviders] = useState<VenueProviderProfile[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("venueProviders");
      return saved ? JSON.parse(saved) : initialVenueProviders;
    }
    return initialVenueProviders;
  });

  const [venues, setVenues] = useState<Venue[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("venues");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length >= initialVenues.length) return parsed;
      }
    }
    return initialVenues;
  });

  const [venueBookings, setVenueBookings] = useState<VenueBooking[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("venueBookings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length >= initialVenueBookings.length) return parsed;
      }
    }
    return initialVenueBookings;
  });
  
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("reviews");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length >= initialReviews.length) return parsed;
      }
    }
    return initialReviews;
  });

  useEffect(() => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }, [reviews]);

  // Review Form Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetType, setReviewTargetType] = useState<"EVENT" | "VENUE" | "VENDOR" | "SITE">("EVENT");
  const [reviewTargetId, setReviewTargetId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAuthorName, setReviewAuthorName] = useState("");
  const [reviewAuthorEmail, setReviewAuthorEmail] = useState("");
  const [reviewOtpInput, setReviewOtpInput] = useState("");
  const [reviewOtpError, setReviewOtpError] = useState<string | null>(null);
  const [reviewVerificationStep, setReviewVerificationStep] = useState<"form" | "otp" | "verified">("form");

  // Admin Review Filter states
  const [adminReviewTypeFilter, setAdminReviewTypeFilter] = useState<string>("ALL");
  const [adminReviewStatusFilter, setAdminReviewStatusFilter] = useState<string>("ALL");
  const [adminReviewRatingFilter, setAdminReviewRatingFilter] = useState<string>("ALL");
  const [adminReviewSearch, setAdminReviewSearch] = useState<string>("");

  useEffect(() => {
    if (reviewTargetType === "SITE") {
      setReviewTargetId("site");
    } else if (reviewTargetType === "EVENT") {
      if (events.length > 0) setReviewTargetId(events[0].id);
    } else if (reviewTargetType === "VENUE") {
      if (venues.length > 0) setReviewTargetId(venues[0].id);
    } else if (reviewTargetType === "VENDOR") {
      if (vendorProfiles.length > 0) setReviewTargetId(vendorProfiles[0].id);
    }
  }, [reviewTargetType, events, venues, vendorProfiles]);

  const handleVerifyAndSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewOtpError(null);

    const isVendor = activeVendorProfile !== null;
    const isVenueProvider = activeVenueProvider !== null;

    if (!reviewComment.trim()) {
      setReviewOtpError("Please write a comment.");
      return;
    }

    if (!isVendor && !isVenueProvider) {
      if (!reviewAuthorName.trim() || !reviewAuthorEmail.trim()) {
        setReviewOtpError("Name and Email are required.");
        return;
      }
      if (reviewVerificationStep === "form") {
        setReviewVerificationStep("otp");
        return;
      }
    }

    if (!isVendor && !isVenueProvider && reviewVerificationStep === "otp") {
      if (reviewOtpInput !== "123456") {
        setReviewOtpError("Invalid verification code. Please use 123456.");
        return;
      }
    }

    // Abusive words check
    const isAbusive = containsAbusiveContent(reviewComment);
    const status = isAbusive ? "FLAGGED_ABUSIVE" : "APPROVED";

    let authorRole: "CUSTOMER" | "VENDOR" | "VENUE_PROVIDER" = "CUSTOMER";
    let finalAuthorName = reviewAuthorName.trim();
    if (isVendor && activeVendorProfile) {
      authorRole = "VENDOR";
      finalAuthorName = activeVendorProfile.ownerName || activeVendorProfile.businessName;
    } else if (isVenueProvider && activeVenueProvider) {
      authorRole = "VENUE_PROVIDER";
      finalAuthorName = activeVenueProvider.contactName || activeVenueProvider.companyName;
    }

    let finalTargetName = "Site Experience";
    if (reviewTargetType === "EVENT") {
      const ev = events.find(item => item.id === reviewTargetId);
      if (ev) finalTargetName = ev.title;
    } else if (reviewTargetType === "VENUE") {
      const vn = venues.find(item => item.id === reviewTargetId);
      if (vn) finalTargetName = vn.name;
    } else if (reviewTargetType === "VENDOR") {
      const vp = vendorProfiles.find(item => item.id === reviewTargetId);
      if (vp) finalTargetName = vp.businessName;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      targetType: reviewTargetType,
      targetId: reviewTargetId,
      targetName: finalTargetName,
      authorName: finalAuthorName || "Anonymous User",
      authorRole,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split("T")[0],
      status
    };

    if (isAbusive) {
      addSagaLog("Moderator-Service", `Auto-flagged review from ${finalAuthorName} for abusive keywords.`, "error");
    } else {
      addSagaLog("Moderator-Service", `Review submitted by ${finalAuthorName} (Status: APPROVED).`, "success");
    }

    setReviews(prev => [...prev, newReview]);
    setShowReviewModal(false);
    
    // Reset
    setReviewTargetType("EVENT");
    setReviewTargetId("");
    setReviewRating(5);
    setReviewComment("");
    setReviewAuthorName("");
    setReviewAuthorEmail("");
    setReviewOtpInput("");
    setReviewVerificationStep("form");
  };

  const runAbusiveScanChecker = () => {
    let flaggedCount = 0;
    const updatedReviews = reviews.map(r => {
      if (containsAbusiveContent(r.comment) && r.status !== "FLAGGED_ABUSIVE") {
        flaggedCount++;
        return { ...r, status: "FLAGGED_ABUSIVE" as const };
      }
      return r;
    });
    if (flaggedCount > 0) {
      setReviews(updatedReviews);
      addSagaLog("Moderator-Service", `Automated scanner flagged ${flaggedCount} abusive reviews containing bad words.`, "error");
    } else {
      addSagaLog("Moderator-Service", `Automated scanner check complete. No new abusive reviews found.`, "success");
    }
  };
  
  // Dynamic average rating calculators (ignores hidden or abusive reviews)
  const getAverageRating = (targetType: "EVENT" | "VENUE" | "VENDOR" | "SITE", targetId: string) => {
    const activeReviews = reviews.filter(
      r => r.targetType === targetType && r.targetId === targetId && r.status === "APPROVED"
    );
    if (activeReviews.length === 0) return 0;
    const sum = activeReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / activeReviews.length) * 10) / 10;
  };

  const getReviewCount = (targetType: "EVENT" | "VENUE" | "VENDOR" | "SITE", targetId: string) => {
    return reviews.filter(
      r => r.targetType === targetType && r.targetId === targetId && r.status === "APPROVED"
    ).length;
  };
  
  // Navigation & Tab state
  const [activeTab, setActiveTab] = useState<"catalog" | "my-tickets" | "admin" | "saga" | "venues" | "organizer">("catalog");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(initialEvents[0]);
  const [bookingMode, setBookingMode] = useState<"TICKET" | "BOOTH">("BOOTH");
  // Event Detail Page overlay
  const [showEventDetailPage, setShowEventDetailPage] = useState(false);
  const [detailPageEvent, setDetailPageEvent] = useState<Event | null>(null);

  // Organizer Profile State
  const [organizerProfiles, setOrganizerProfiles] = useState<OrganizerProfile[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("organizerProfiles");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("organizerProfiles", JSON.stringify(organizerProfiles));
  }, [organizerProfiles]);

  const [activeOrganizerProfile, setActiveOrganizerProfile] = useState<OrganizerProfile | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("activeOrganizerProfile");
      if (saved) return JSON.parse(saved);
    }
    return null;
  });

  useEffect(() => {
    if (activeOrganizerProfile) {
      localStorage.setItem("activeOrganizerProfile", JSON.stringify(activeOrganizerProfile));
    } else {
      localStorage.removeItem("activeOrganizerProfile");
    }
  }, [activeOrganizerProfile]);

  // Organizer Registration Form Wizard state
  const [organizerRegStep, setOrganizerRegStep] = useState<"form" | "otp">("form");
  const [regOrgName, setRegOrgName] = useState("");
  const [regOrgContactName, setRegOrgContactName] = useState("");
  const [regOrgEmail, setRegOrgEmail] = useState("");
  const [regOrgPhone, setRegOrgPhone] = useState("");
  const [organizerOtpInput, setOrganizerOtpInput] = useState("");
  const [organizerOtpError, setOrganizerOtpError] = useState<string | null>(null);
  const [pendingOrganizerProfile, setPendingOrganizerProfile] = useState<OrganizerProfile | null>(null);

  // Selected vendors for event creation/edit
  const [orgSelectedVendorIds, setOrgSelectedVendorIds] = useState<string[]>([]);
  // Organizer edit event ID (if updating an event)
  const [orgEditingEventId, setOrgEditingEventId] = useState<string | null>(null);
  
  // Active Vendor Profile state
  const [activeVendorProfile, setActiveVendorProfile] = useState<VendorProfile | null>(null);
  
  // Vendor Registration Form Wizard state
  const [vendorRegStep, setVendorRegStep] = useState<"form" | "otp">("form");
  const [regBusinessName, setRegBusinessName] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCategory, setRegCategory] = useState("Technology");
  const [vendorOtpInput, setVendorOtpInput] = useState("");
  const [vendorOtpError, setVendorOtpError] = useState<string | null>(null);
  const [pendingVendorProfile, setPendingVendorProfile] = useState<VendorProfile | null>(null);

  // Vendor Edit Profile state
  const [isEditingVendorProfile, setIsEditingVendorProfile] = useState(false);
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCategory, setEditCategory] = useState("");


  const [activeVenueProvider, setActiveVenueProvider] = useState<VenueProviderProfile | null>(null);
  
  // Venue Provider Registration State
  const [vpRegStep, setVpRegStep] = useState<"form" | "otp">("form");
  const [vpRegCompanyName, setVpRegCompanyName] = useState("");
  const [vpRegContactName, setVpRegContactName] = useState("");
  const [vpRegEmail, setVpRegEmail] = useState("");
  const [vpRegPhone, setVpRegPhone] = useState("");
  const [vpOtpInput, setVpOtpInput] = useState("");
  const [vpOtpError, setVpOtpError] = useState<string | null>(null);
  const [pendingVenueProvider, setPendingVenueProvider] = useState<VenueProviderProfile | null>(null);

  // Sponsorship States
  const [sponsorInterests, setSponsorInterests] = useState<SponsorInterest[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sponsorInterests");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("sponsorInterests", JSON.stringify(sponsorInterests));
  }, [sponsorInterests]);

  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorSelectedEvent, setSponsorSelectedEvent] = useState<Event | null>(null);
  const [sponsorSelectedPackage, setSponsorSelectedPackage] = useState<SponsorPackage | null>(null);
  
  // Sponsor Application Form fields
  const [sponsorCompanyName, setSponsorCompanyName] = useState("");
  const [sponsorContactName, setSponsorContactName] = useState("");
  const [sponsorEmail, setSponsorEmail] = useState("");
  const [sponsorPhone, setSponsorPhone] = useState("");
  const [sponsorOtpInput, setSponsorOtpInput] = useState("");
  const [sponsorOtpError, setSponsorOtpError] = useState<string | null>(null);
  const [sponsorStep, setSponsorStep] = useState<"form" | "otp" | "success">("form");

  // State for adding sponsor packages in the Organizer/Admin Event Creator form
  const [orgEventSponsorPackages, setOrgEventSponsorPackages] = useState<SponsorPackage[]>([]);
  const [newPackageName, setNewPackageName] = useState("");
  const [newPackagePrice, setNewPackagePrice] = useState("");
  const [newPackageBenefits, setNewPackageBenefits] = useState(""); // Comma separated


  // New Venue Creation Form State
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueDesc, setNewVenueDesc] = useState("");
  const [newVenueLoc, setNewVenueLoc] = useState("");
  const [newVenueCapacity, setNewVenueCapacity] = useState("");
  const [newVenueParking, setNewVenueParking] = useState("");
  const [newVenueServices, setNewVenueServices] = useState<string[]>([]);
  const [newVenueDates, setNewVenueDates] = useState<string[]>([]);
  const [newVenueImageUrl, setNewVenueImageUrl] = useState("");
  const [newVenueCity, setNewVenueCity] = useState("");
  const [newVenueState, setNewVenueState] = useState("");
  const [newVenueZipcode, setNewVenueZipcode] = useState("");
  const [newVenueLat, setNewVenueLat] = useState("");
  const [newVenueLng, setNewVenueLng] = useState("");
  
  // Interactive Calendar State
  const [currentCalMonth, setCurrentCalMonth] = useState(5); // June
  const [currentCalYear] = useState(2026);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  // Admin selected venue for event creation
  const [adminSelectedVenueId, setAdminSelectedVenueId] = useState<string>("none");

  // Synchronize Venues to localStorage
  useEffect(() => {
    localStorage.setItem("venueProviders", JSON.stringify(venueProviders));
  }, [venueProviders]);

  useEffect(() => {
    localStorage.setItem("venues", JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem("venueBookings", JSON.stringify(venueBookings));
  }, [venueBookings]);

  // Filters for Booth Booking
  const [boothTypeFilter, setBoothTypeFilter] = useState<"ALL" | "STANDARD" | "FOOD_TRUCK">("ALL");
  const [boothCategoryFilter, setBoothCategoryFilter] = useState<string>("ALL");
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);

  // Booking Checkout State
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [appliedPromo, setAppliedPromo] = useState<string>("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<"Stripe" | "PayPal">("Stripe");
  const [paymentTerms, setPaymentTerms] = useState<"FULL" | "DEPOSIT">("FULL");
  
  // User Security State
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [is2FaVerified, setIs2FaVerified] = useState(false);
  const [show2FaModal, setShow2FaModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [temp2FaSecret, setTemp2FaSecret] = useState("JBSWY3DPEHPK3PXP"); // Seed secret
  
  // Checkout & SAGA Orchestration State
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "mfa" | "saga-running" | "success" | "failed">("form");
  const [sagaLogs, setSagaLogs] = useState<LogMessage[]>([]);
  const [sagaState, setSagaState] = useState<"idle" | "order-created" | "tickets-reserved" | "promo-applied" | "payment-initiated" | "completed" | "rollback-started" | "rollback-complete">("idle");
  const [sagaType, setSagaType] = useState<"TICKET" | "BOOTH" | "VENUE">("TICKET");
  const [simulatePaymentFailure, setSimulatePaymentFailure] = useState(false);
  const [newOrderId, setNewOrderId] = useState("");
  
  // Search & Filter state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [searchZip, setSearchZip] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchDateStart, setSearchDateStart] = useState("");
  const [searchDateEnd, setSearchDateEnd] = useState("");
  const [searchUseGeo, setSearchUseGeo] = useState(false);
  const [searchRadius, setSearchRadius] = useState(50); // miles
  const [catalogView, setCatalogView] = useState<"grid" | "calendar">("grid");
  const [catalogCalMonth, setCatalogCalMonth] = useState(5); // June (0-indexed)
  const [catalogCalYear, setCatalogCalYear] = useState(2026);
  const [selectedCatalogDay, setSelectedCatalogDay] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [showEventGeoOverrides, setShowEventGeoOverrides] = useState(false);
  const [showVenueGeoOverrides, setShowVenueGeoOverrides] = useState(false);

  // Filter events based on criteria
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // 1. Keyword search (matches title, description, category, or location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description.toLowerCase().includes(q);
        const matchCat = ev.category.toLowerCase().includes(q);
        const matchLoc = ev.location.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchLoc) {
          return false;
        }
      }

      // 2. Zipcode
      if (searchZip.trim()) {
        const z = searchZip.trim().toLowerCase();
        const evZip = (ev.zipcode || "").toLowerCase();
        if (!evZip.includes(z)) return false;
      }

      // 3. City
      if (searchCity.trim()) {
        const c = searchCity.trim().toLowerCase();
        const evCity = (ev.city || "").toLowerCase();
        if (!evCity.includes(c)) return false;
      }

      // 4. State
      if (searchState.trim()) {
        const s = searchState.trim().toLowerCase();
        const evState = (ev.state || "").toLowerCase();
        if (!evState.includes(s)) return false;
      }

      // 5. Date Range Check
      if (searchDateStart) {
        const startMs = new Date(searchDateStart).getTime();
        const evMs = new Date(ev.date).getTime();
        if (!isNaN(startMs) && !isNaN(evMs) && evMs < startMs) {
          return false;
        }
      }
      if (searchDateEnd) {
        const endMs = new Date(searchDateEnd).getTime();
        const evMs = new Date(ev.date).getTime();
        if (!isNaN(endMs) && !isNaN(evMs) && evMs > endMs) {
          return false;
        }
      }

      // 6. Geolocation search (near user coordinates)
      if (searchUseGeo && userCoords && ev.latitude !== undefined && ev.longitude !== undefined) {
        const dist = getDistanceInMiles(userCoords.latitude, userCoords.longitude, ev.latitude, ev.longitude);
        if (dist > searchRadius) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const aSpon = a.isSponsored ? 1 : 0;
      const bSpon = b.isSponsored ? 1 : 0;
      if (aSpon !== bSpon) {
        return bSpon - aSpon; // Sponsored first
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [events, searchQuery, searchZip, searchCity, searchState, searchDateStart, searchDateEnd, searchUseGeo, searchRadius, userCoords]);

  // Admin Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventLoc, setNewEventLoc] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventPrice, setNewEventPrice] = useState("");
  const [newEventInventory, setNewEventInventory] = useState("");
  const [newEventCategory, setNewEventCategory] = useState("Technology");
  const [newEventCity, setNewEventCity] = useState("");
  const [newEventState, setNewEventState] = useState("");
  const [newEventZipcode, setNewEventZipcode] = useState("");
  const [newEventLat, setNewEventLat] = useState("");
  const [newEventLng, setNewEventLng] = useState("");
  const [newEventIsSponsored, setNewEventIsSponsored] = useState(false);
  
  // Admin Booth Creator Form State
  const [adminBoothEventId, setAdminBoothEventId] = useState(initialEvents[0].id);
  const [adminBoothName, setAdminBoothName] = useState("");
  const [adminBoothType, setAdminBoothType] = useState<"STANDARD" | "FOOD_TRUCK">("STANDARD");
  const [adminBoothCategory, setAdminBoothCategory] = useState("Tech Showcase");
  const [adminBoothPrice, setAdminBoothPrice] = useState("");

  // Auto-fill parsed details for Event Location
  useEffect(() => {
    if (adminSelectedVenueId === "none") {
      const parsed = parseLocationDetails(newEventLoc);
      setNewEventCity(parsed.city);
      setNewEventState(parsed.state);
      setNewEventZipcode(parsed.zipcode);
      setNewEventLat(parsed.latitude.toString());
      setNewEventLng(parsed.longitude.toString());
    }
  }, [newEventLoc, adminSelectedVenueId]);

  // Auto-fill parsed details for Event Location when Venue is selected
  useEffect(() => {
    if (adminSelectedVenueId !== "none") {
      const vn = venues.find(v => v.id === adminSelectedVenueId);
      if (vn) {
        setNewEventCity(vn.city || "");
        setNewEventState(vn.state || "");
        setNewEventZipcode(vn.zipcode || "");
        setNewEventLat(vn.latitude ? vn.latitude.toString() : "");
        setNewEventLng(vn.longitude ? vn.longitude.toString() : "");
      }
    }
  }, [adminSelectedVenueId, venues]);

  // Auto-fill parsed details for Venue Location
  useEffect(() => {
    const parsed = parseLocationDetails(newVenueLoc);
    setNewVenueCity(parsed.city);
    setNewVenueState(parsed.state);
    setNewVenueZipcode(parsed.zipcode);
    setNewVenueLat(parsed.latitude.toString());
    setNewVenueLng(parsed.longitude.toString());
  }, [newVenueLoc]);

  // Auto-populate Search panel location fields on Zipcode change
  useEffect(() => {
    const zip = searchZip.trim();
    if (zip.length === 5 && ZIP_LOOKUP[zip]) {
      const data = ZIP_LOOKUP[zip];
      setSearchCity(data.city);
      setSearchState(data.state);
    }
  }, [searchZip]);

  // Auto-populate Event Creator fields on Zipcode change
  useEffect(() => {
    const zip = newEventZipcode.trim();
    if (zip.length === 5 && ZIP_LOOKUP[zip]) {
      const data = ZIP_LOOKUP[zip];
      setNewEventCity(data.city);
      setNewEventState(data.state);
      setNewEventLat(data.lat.toString());
      setNewEventLng(data.lng.toString());
    }
  }, [newEventZipcode]);

  // Auto-populate Venue Creator fields on Zipcode change
  useEffect(() => {
    const zip = newVenueZipcode.trim();
    if (zip.length === 5 && ZIP_LOOKUP[zip]) {
      const data = ZIP_LOOKUP[zip];
      setNewVenueCity(data.city);
      setNewVenueState(data.state);
      setNewVenueLat(data.lat.toString());
      setNewVenueLng(data.lng.toString());
    }
  }, [newVenueZipcode]);

  // Add log utility helper
  const addSagaLog = (service: string, message: string, type: "info" | "success" | "error" | "event" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setSagaLogs(prev => [...prev, { time: timestamp, service, message, type }]);
  };

  // Get categories available in current event booths
  const availableCategories = useMemo(() => {
    if (!selectedEvent) return [];
    const eventBooths = booths.filter(b => b.eventId === selectedEvent.id);
    const cats = eventBooths.map(b => b.category);
    return Array.from(new Set(cats));
  }, [selectedEvent, booths]);

  // Calculate Prices for tickets or booth
  const pricingDetails = useMemo(() => {
    if (!selectedEvent) return { subtotal: 0, discount: 0, total: 0, depositAmount: 0, remainingBalance: 0 };
    
    let subtotal = 0;
    if (bookingMode === "TICKET") {
      subtotal = selectedEvent.price * ticketQuantity;
    } else {
      subtotal = selectedBooth ? selectedBooth.price : 0;
    }

    let discount = 0;
    if (promoSuccess && appliedPromo) {
      const promo = promoCodes.find(p => p.code.toUpperCase() === appliedPromo.toUpperCase());
      if (promo) {
        if (promo.discountType === "PERCENTAGE") {
          discount = Math.round(subtotal * (promo.value / 100));
        } else {
          const discountMultiplier = bookingMode === "TICKET" ? ticketQuantity : 1;
          discount = Math.min(promo.value * discountMultiplier, subtotal);
        }
      }
    }
    
    const total = Math.max(0, subtotal - discount);
    const depositAmount = Math.round(total * 0.25);
    const remainingBalance = total - depositAmount;

    return { subtotal, discount, total, depositAmount, remainingBalance };
  }, [selectedEvent, ticketQuantity, bookingMode, selectedBooth, appliedPromo, promoSuccess, promoCodes]);

  // Filter booths based on user selections
  const filteredBooths = useMemo(() => {
    if (!selectedEvent) return [];
    return booths.filter(b => {
      if (b.eventId !== selectedEvent.id) return false;
      if (boothTypeFilter !== "ALL" && b.type !== boothTypeFilter) return false;
      if (boothCategoryFilter !== "ALL" && b.category !== boothCategoryFilter) return false;
      return true;
    });
  }, [selectedEvent, booths, boothTypeFilter, boothCategoryFilter]);

  // Handle Promo Verification
  const verifyPromo = () => {
    if (!appliedPromo) {
      setPromoError("Please enter a code");
      return;
    }
    const promo = promoCodes.find(p => p.code.toUpperCase() === appliedPromo.toUpperCase());
    if (!promo) {
      setPromoError("Invalid promotional code");
      setPromoSuccess(null);
    } else if (promo.usageCount >= promo.usageLimit) {
      setPromoError("Promotion limit reached");
      setPromoSuccess(null);
    } else {
      setPromoError(null);
      setPromoSuccess(`Code applied: ${promo.description}`);
    }
  };

  // Setup/Toggle 2FA
  const handleToggle2Fa = () => {
    if (is2FaEnabled) {
      setIs2FaEnabled(false);
      setIs2FaVerified(false);
    } else {
      setShow2FaModal(true);
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim() === "123456" || otpCode.trim() === "654321") {
      setIs2FaEnabled(true);
      setIs2FaVerified(true);
      setShow2FaModal(false);
      setOtpError(null);
      setOtpCode("");
    } else {
      setOtpError("Incorrect verification code. Try '123456'");
    }
  };

  // Vendor Registration Action
  const handleRegisterVendorProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regBusinessName || !regOwnerName || !regEmail || !regPhone) {
      alert("Please fill in all vendor registration fields.");
      return;
    }

    const newProfile: VendorProfile = {
      id: `vnd-${vendorProfiles.length + 1}`,
      businessName: regBusinessName,
      ownerName: regOwnerName,
      email: regEmail,
      phone: regPhone,
      category: regCategory,
      status: "PENDING",
      availableDates: ["2026-06-25", "2026-07-12", "2026-08-05", "2026-09-20", "2026-10-10", "2026-10-20"],
      pricing: 250
    };

    setPendingVendorProfile(newProfile);
    setVendorRegStep("otp");
    setVendorOtpInput("");
    setVendorOtpError(null);
  };

  // Vendor OTP Verification Action
  const handleVerifyVendorOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (vendorOtpInput.trim() === "987654") {
      if (pendingVendorProfile) {
        const verifiedProfile: VendorProfile = {
          ...pendingVendorProfile,
          status: "VERIFIED"
        };
        setVendorProfiles(prev => [...prev, verifiedProfile]);
        setActiveVendorProfile(verifiedProfile);
        setPendingVendorProfile(null);
        setVendorRegStep("form");
        
        // Populate edit profile values
        setEditOwnerName(verifiedProfile.ownerName);
        setEditEmail(verifiedProfile.email);
        setEditPhone(verifiedProfile.phone);
        setEditCategory(verifiedProfile.category);
        
        alert("Business Profile verified! You are now authorized to lease event spaces.");
      }
    } else {
      setVendorOtpError("Invalid verification code. Please enter '987654'.");
    }
  };

  // Vendor Profile Edit Update Action
  const handleUpdateVendorProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVendorProfile) return;

    const updatedProfile: VendorProfile = {
      ...activeVendorProfile,
      ownerName: editOwnerName,
      email: editEmail,
      phone: editPhone,
      category: editCategory
    };

    setActiveVendorProfile(updatedProfile);
    setVendorProfiles(prev => prev.map(p => p.id === activeVendorProfile.id ? updatedProfile : p));
    setIsEditingVendorProfile(false);
    alert("Vendor Business Profile successfully updated.");
  };

  // Venue Provider: Register Action
  const handleRegisterVenueProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vpRegCompanyName || !vpRegContactName || !vpRegEmail || !vpRegPhone) {
      alert("Please fill in all venue provider registration fields.");
      return;
    }

    const newProvider: VenueProviderProfile = {
      id: `vp-${venueProviders.length + 1}`,
      companyName: vpRegCompanyName,
      contactName: vpRegContactName,
      email: vpRegEmail,
      phone: vpRegPhone,
      status: "PENDING"
    };

    setPendingVenueProvider(newProvider);
    setVpRegStep("otp");
    setVpOtpInput("");
    setVpOtpError(null);
  };

  // Venue Provider: OTP Verification Action
  const handleVerifyVenueProviderOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (vpOtpInput.trim() === "555888") {
      if (pendingVenueProvider) {
        const verifiedProvider: VenueProviderProfile = {
          ...pendingVenueProvider,
          status: "VERIFIED"
        };
        setVenueProviders(prev => [...prev, verifiedProvider]);
        setActiveVenueProvider(verifiedProvider);
        setPendingVenueProvider(null);
        setVpRegStep("form");
        alert("Venue Provider profile verified successfully!");
      }
    } else {
      setVpOtpError("Invalid verification code. Please enter '555888'.");
    }
  };

  // Geolocation lookup trigger
  const handleToggleGeoLocation = () => {
    if (searchUseGeo) {
      setSearchUseGeo(false);
      return;
    }

    setIsGeoLoading(true);
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setSearchUseGeo(true);
          setIsGeoLoading(false);
        },
        (error) => {
          console.error("Geolocation access failed:", error);
          alert("Geolocation permission denied or failed. Falling back to simulated coordinates: San Francisco, CA.");
          // Fallback to San Francisco CA
          setUserCoords({
            latitude: 37.7726,
            longitude: -122.4098
          });
          setSearchUseGeo(true);
          setIsGeoLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      alert("Geolocation is not supported by your browser. Falling back to simulated coordinates: San Francisco, CA.");
      setUserCoords({
        latitude: 37.7726,
        longitude: -122.4098
      });
      setSearchUseGeo(true);
      setIsGeoLoading(false);
    }
  };

  // Venue Provider: List New Venue Action
  const handleCreateVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVenueProvider) return;
    if (!newVenueName || !newVenueLoc || !newVenueCapacity || !newVenueParking) {
      alert("Please fill in all required venue fields.");
      return;
    }

    const newVn: Venue = {
      id: `vn-${venues.length + 1}`,
      providerId: activeVenueProvider.id,
      name: newVenueName,
      description: newVenueDesc || "No description provided.",
      location: newVenueLoc,
      capacity: parseInt(newVenueCapacity),
      parkingSpots: parseInt(newVenueParking),
      services: newVenueServices,
      availableDates: newVenueDates,
      imageUrl: newVenueImageUrl || "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=800&auto=format&fit=crop&q=80",
      city: newVenueCity || undefined,
      state: newVenueState || undefined,
      zipcode: newVenueZipcode || undefined,
      latitude: newVenueLat ? parseFloat(newVenueLat) : undefined,
      longitude: newVenueLng ? parseFloat(newVenueLng) : undefined
    };

    setVenues(prev => [...prev, newVn]);
    alert(`Venue "${newVenueName}" successfully listed!`);

    // Reset Form
    setNewVenueName("");
    setNewVenueDesc("");
    setNewVenueLoc("");
    setNewVenueCapacity("");
    setNewVenueParking("");
    setNewVenueServices([]);
    setNewVenueDates([]);
    setNewVenueImageUrl("");
    setNewVenueCity("");
    setNewVenueState("");
    setNewVenueZipcode("");
    setNewVenueLat("");
    setNewVenueLng("");
  };

  // Run Saga Simulation for venue allocations
  const runSagaVenueAllocation = async (bookingId: string, vn: Venue, eventTitle: string, eventDate: string) => {
    setSagaLogs([]);
    setCheckoutStep("saga-running");
    setSagaType("VENUE");
    setActiveTab("saga");
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    setSagaState("order-created");
    addSagaLog("Event-Service", `Received venue allocation request for Event: "${eventTitle}". Booking ID: ${bookingId}`, "info");
    addSagaLog("Kafka-Broker", "Event [venue.allocation.requested] published to 'venue-events' topic.", "event");
    await delay(1200);

    setSagaState("tickets-reserved");
    addSagaLog("Venue-Service", `Consuming allocation request. Locking venue calendar row for "${vn.name}".`, "info");
    addSagaLog("Venue-Service", `Acquired MySQL lock (FOR UPDATE) on venue availability.`, "info");
    addSagaLog("Venue-Service", `Checked date availability for ${eventDate}: AVAILABLE.`, "success");
    addSagaLog("Kafka-Broker", "Event [venue.availability.locked] published to 'venue-events' topic.", "event");
    await delay(1200);

    setSagaState("promo-applied");
    addSagaLog("Contract-Service", `Validating venue amenities & capacity requirements (Expected Audience vs Max Capacity: ${vn.capacity}).`, "info");
    addSagaLog("Contract-Service", `All conditions met. Services selected: ${vn.services.join(", ")}.`, "success");
    addSagaLog("Kafka-Broker", "Event [venue.contract.validated] published to 'venue-events' topic.", "event");
    await delay(1200);

    setSagaState("payment-initiated");
    addSagaLog("Billing-Service", `Generating invoice for lease listing...`, "info");
    addSagaLog("Billing-Service", `Pre-authorizing venue lease fee. Transaction cleared. Reference vn_txn_${Math.floor(Math.random()*1000000)}`, "success");
    addSagaLog("Kafka-Broker", "Event [venue.billing.cleared] published to 'venue-events' topic.", "event");
    await delay(1200);

    setSagaState("completed");
    addSagaLog("Event-Service", `Consuming billing cleared event. Committing venue booking status to [CONFIRMED].`, "success");
    addSagaLog("Event-Service", `Event "${eventTitle}" is now active with venue "${vn.name}". SAGA complete.`, "success");
    addSagaLog("Kafka-Broker", "Event [event.published] published to 'event-events' topic.", "event");
    setCheckoutStep("success");
  };

  // Admin: Create Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate || !newEventPrice || !newEventInventory) {
      alert("Please fill in all required fields.");
      return;
    }

    let finalLocation = newEventLoc;
    let allocatedVenue: Venue | undefined = undefined;

    if (adminSelectedVenueId !== "none") {
      const vn = venues.find(v => v.id === adminSelectedVenueId);
      if (!vn) {
        alert("Selected venue not found.");
        return;
      }

      const normalizeDate = (d: string) => {
        try {
          const parsed = new Date(d);
          if (!isNaN(parsed.getTime())) {
            const y = parsed.getFullYear();
            const m = String(parsed.getMonth() + 1).padStart(2, "0");
            const day = String(parsed.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
          }
        } catch (err) {}
        return d.trim().toLowerCase();
      };

      const normalizedEventDate = normalizeDate(newEventDate);
      const isAvailable = vn.availableDates.some(availDate => normalizeDate(availDate) === normalizedEventDate);
      const isAlreadyBooked = venueBookings.some(b => b.venueId === vn.id && normalizeDate(b.date) === normalizedEventDate && b.status === "CONFIRMED");

      if (!isAvailable) {
        alert(`Warning: The venue "${vn.name}" does not list availability for date "${newEventDate}". Available dates: ${vn.availableDates.join(", ")}`);
        return;
      }

      if (isAlreadyBooked) {
        alert(`Error: The venue "${vn.name}" is already booked on "${newEventDate}".`);
        return;
      }

      finalLocation = `${vn.name}, ${vn.location}`;
      allocatedVenue = vn;
    } else {
      if (!newEventLoc) {
        alert("Please enter a location or select a venue.");
        return;
      }
    }

    const newEventId = `evt-${events.length + 1}`;
    const created: Event = {
      id: newEventId,
      title: newEventTitle,
      description: newEventDesc || "No description provided.",
      location: finalLocation,
      date: newEventDate,
      price: parseFloat(newEventPrice),
      ticketInventory: parseInt(newEventInventory),
      ticketsSold: 0,
      status: "UPCOMING",
      category: newEventCategory,
      imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80",
      venueId: allocatedVenue?.id,
      city: newEventCity || undefined,
      state: newEventState || undefined,
      zipcode: newEventZipcode || undefined,
      latitude: newEventLat ? parseFloat(newEventLat) : undefined,
      longitude: newEventLng ? parseFloat(newEventLng) : undefined,
      isSponsored: newEventIsSponsored,
      sponsorPackages: orgEventSponsorPackages
    };

    setEvents(prev => [created, ...prev]);
    setSelectedEvent(created);

    if (allocatedVenue) {
      const parseDateToYmd = (d: string) => {
        try {
          const parsed = new Date(d);
          if (!isNaN(parsed.getTime())) {
            const y = parsed.getFullYear();
            const m = String(parsed.getMonth() + 1).padStart(2, "0");
            const day = String(parsed.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
          }
        } catch (err) {}
        return d;
      };

      const ymdDate = parseDateToYmd(newEventDate);
      const bookingId = `vb-${venueBookings.length + 1}`;
      const newBooking: VenueBooking = {
        id: bookingId,
        venueId: allocatedVenue.id,
        eventId: newEventId,
        eventTitle: newEventTitle,
        date: ymdDate,
        status: "CONFIRMED"
      };
      setVenueBookings(prev => [...prev, newBooking]);
      runSagaVenueAllocation(bookingId, allocatedVenue, newEventTitle, newEventDate);
    } else {
      setActiveTab("catalog");
      alert("Event successfully created!");
    }

    // Reset Form
    setNewEventTitle("");
    setNewEventDesc("");
    setNewEventLoc("");
    setNewEventDate("");
    setNewEventPrice("");
    setNewEventInventory("");
    setAdminSelectedVenueId("none");
    setNewEventCity("");
    setNewEventState("");
    setNewEventZipcode("");
    setNewEventLat("");
    setNewEventLng("");
    setNewEventIsSponsored(false);
    setOrgEventSponsorPackages([]);
  };

  // Admin CRUD: Delete Event Action
  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event? This will release all ticket sales and booth rentals associated with this event.")) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setBooths(prev => prev.filter(b => b.eventId !== eventId));
      setOrders(prev => prev.filter(o => o.eventId !== eventId));
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(events.find(e => e.id !== eventId) || null);
      }
      alert("Event has been deleted from active catalogs.");
    }
  };

  // Admin: Create Booth/Catering Slot
  const handleCreateBooth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminBoothName || !adminBoothCategory || !adminBoothPrice) {
      alert("Please fill in all booth fields.");
      return;
    }

    const created: Booth = {
      id: `bth-${booths.length + 1}`,
      eventId: adminBoothEventId,
      name: adminBoothName,
      type: adminBoothType,
      category: adminBoothCategory,
      price: parseFloat(adminBoothPrice),
      status: "AVAILABLE"
    };

    setBooths(prev => [...prev, created]);
    alert("New booth slot successfully created and allocated to event!");
    
  };

  // Organizer: Register Profile Action
  const handleRegisterOrganizerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOrgName || !regOrgContactName || !regOrgEmail || !regOrgPhone) {
      alert("Please fill in all event organizer fields.");
      return;
    }

    const newProfile: OrganizerProfile = {
      id: `org-${organizerProfiles.length + 1}`,
      organizationName: regOrgName,
      contactName: regOrgContactName,
      email: regOrgEmail,
      phone: regOrgPhone,
      status: "PENDING"
    };

    setPendingOrganizerProfile(newProfile);
    setOrganizerRegStep("otp");
    setOrganizerOtpInput("");
    setOrganizerOtpError(null);
  };

  // Organizer: Verify OTP Action
  const handleVerifyOrganizerOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (organizerOtpInput.trim() === "123456") {
      if (pendingOrganizerProfile) {
        const verifiedProfile: OrganizerProfile = {
          ...pendingOrganizerProfile,
          status: "VERIFIED"
        };
        setOrganizerProfiles(prev => [...prev, verifiedProfile]);
        setActiveOrganizerProfile(verifiedProfile);
        setPendingOrganizerProfile(null);
        setOrganizerRegStep("form");
        
        alert("Organizer Profile verified! You are now authorized to publish and update events.");
      }
    } else {
      setOrganizerOtpError("Incorrect verification code. Try '123456'");
    }
  };

  // Sponsor handlers
  const handleAddSponsorPackage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newPackageName.trim() || !newPackagePrice.trim()) {
      alert("Please enter package name and price.");
      return;
    }
    const benefitsList = newPackageBenefits
      .split(",")
      .map(b => b.trim())
      .filter(b => b.length > 0);
    const newPkg: SponsorPackage = {
      id: `pkg-${Date.now()}`,
      name: newPackageName,
      price: parseFloat(newPackagePrice) || 0,
      benefits: benefitsList
    };
    setOrgEventSponsorPackages(prev => [...prev, newPkg]);
    setNewPackageName("");
    setNewPackagePrice("");
    setNewPackageBenefits("");
  };

  const handleRemoveSponsorPackage = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOrgEventSponsorPackages(prev => prev.filter(p => p.id !== id));
  };

  const handleSponsorSubmitInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorCompanyName.trim() || !sponsorContactName.trim() || !sponsorEmail.trim() || !sponsorPhone.trim()) {
      alert("Please fill in all details.");
      return;
    }
    setSponsorStep("otp");
    setSponsorOtpInput("");
    setSponsorOtpError(null);
  };

  const handleVerifySponsorOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (sponsorOtpInput.trim() === "123456") {
      if (sponsorSelectedEvent && sponsorSelectedPackage) {
        const interest: SponsorInterest = {
          id: `sp-int-${Date.now()}`,
          eventId: sponsorSelectedEvent.id,
          eventTitle: sponsorSelectedEvent.title,
          packageId: sponsorSelectedPackage.id,
          packageName: sponsorSelectedPackage.name,
          packagePrice: sponsorSelectedPackage.price,
          companyName: sponsorCompanyName,
          contactName: sponsorContactName,
          email: sponsorEmail,
          phone: sponsorPhone,
          status: "VERIFIED",
          timestamp: new Date().toLocaleString()
        };
        setSponsorInterests(prev => [interest, ...prev]);
        addSagaLog("Sponsorship-Service", `Verified sponsor interest from ${sponsorCompanyName} for event: ${sponsorSelectedEvent.title}`, "success");
        setSponsorStep("success");
      }
    } else {
      setSponsorOtpError("Invalid verification token. Try '123456'");
    }
  };


  // Organizer: Save / Update Event Action (Creates or Updates Event + automates Booth allocation)
  const handleOrganizerSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganizerProfile) {
      alert("Please sign in as an organizer first.");
      return;
    }
    if (!newEventTitle || !newEventDate || !newEventPrice || !newEventInventory) {
      alert("Please fill in all required fields.");
      return;
    }

    let finalLocation = newEventLoc;
    let allocatedVenue: Venue | undefined = undefined;

    if (adminSelectedVenueId !== "none") {
      const vn = venues.find(v => v.id === adminSelectedVenueId);
      if (!vn) {
        alert("Selected venue not found.");
        return;
      }

      const normalizeDate = (d: string) => {
        try {
          const parsed = new Date(d);
          if (!isNaN(parsed.getTime())) {
            const y = parsed.getFullYear();
            const m = String(parsed.getMonth() + 1).padStart(2, "0");
            const day = String(parsed.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
          }
        } catch (err) {}
        return d.trim().toLowerCase();
      };

      const normalizedEventDate = normalizeDate(newEventDate);
      const isAvailable = vn.availableDates.some(availDate => normalizeDate(availDate) === normalizedEventDate);
      
      const isAlreadyBooked = venueBookings.some(b => 
        b.venueId === vn.id && 
        normalizeDate(b.date) === normalizedEventDate && 
        b.status === "CONFIRMED" &&
        b.eventId !== orgEditingEventId
      );

      if (!isAvailable) {
        alert(`Warning: The venue "${vn.name}" does not list availability for date "${newEventDate}". Available dates: ${vn.availableDates.join(", ")}`);
        return;
      }

      if (isAlreadyBooked) {
        alert(`Error: The venue "${vn.name}" is already booked on "${newEventDate}".`);
        return;
      }

      finalLocation = `${vn.name}, ${vn.location}`;
      allocatedVenue = vn;
    } else {
      if (!newEventLoc) {
        alert("Please enter a location or select a venue.");
        return;
      }
    }

    const targetEventId = orgEditingEventId || `evt-${events.length + 1}`;
    
    const targetEvent: Event = {
      id: targetEventId,
      title: newEventTitle,
      description: newEventDesc || "No description provided.",
      location: finalLocation,
      date: newEventDate,
      price: parseFloat(newEventPrice),
      ticketInventory: parseInt(newEventInventory),
      ticketsSold: orgEditingEventId ? (events.find(ev => ev.id === orgEditingEventId)?.ticketsSold || 0) : 0,
      status: orgEditingEventId ? (events.find(ev => ev.id === orgEditingEventId)?.status || "UPCOMING") : "UPCOMING",
      category: newEventCategory,
      imageUrl: orgEditingEventId ? (events.find(ev => ev.id === orgEditingEventId)?.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80") : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80",
      venueId: allocatedVenue?.id,
      city: newEventCity || undefined,
      state: newEventState || undefined,
      zipcode: newEventZipcode || undefined,
      latitude: newEventLat ? parseFloat(newEventLat) : undefined,
      longitude: newEventLng ? parseFloat(newEventLng) : undefined,
      isSponsored: newEventIsSponsored,
      organizerId: activeOrganizerProfile.id,
      sponsorPackages: orgEventSponsorPackages
    };

    if (orgEditingEventId) {
      setEvents(prev => prev.map(ev => ev.id === orgEditingEventId ? targetEvent : ev));
      addSagaLog("Organizer-Service", `Updated event "${newEventTitle}" successfully.`, "success");
    } else {
      setEvents(prev => [targetEvent, ...prev]);
      addSagaLog("Organizer-Service", `Created new event "${newEventTitle}" successfully.`, "success");
    }

    if (allocatedVenue) {
      const parseDateToYmd = (d: string) => {
        try {
          const parsed = new Date(d);
          if (!isNaN(parsed.getTime())) {
            const y = parsed.getFullYear();
            const m = String(parsed.getMonth() + 1).padStart(2, "0");
            const day = String(parsed.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
          }
        } catch (err) {}
        return d;
      };

      const ymdDate = parseDateToYmd(newEventDate);
      const bookingId = `vb-${venueBookings.length + 1}`;
      
      setVenueBookings(prev => {
        const filtered = prev.filter(b => b.eventId !== targetEventId);
        const newBooking: VenueBooking = {
          id: bookingId,
          venueId: allocatedVenue!.id,
          eventId: targetEventId,
          eventTitle: newEventTitle,
          date: ymdDate,
          status: "CONFIRMED"
        };
        return [...filtered, newBooking];
      });
      runSagaVenueAllocation(bookingId, allocatedVenue, newEventTitle, newEventDate);
    } else {
      setVenueBookings(prev => prev.filter(b => b.eventId !== targetEventId));
    }

    setBooths(prev => {
      const filteredBooths = prev.filter(b => b.eventId !== targetEventId);
      const vendorBooths: Booth[] = orgSelectedVendorIds.map((vndId, idx) => {
        const vendor = vendorProfiles.find(v => v.id === vndId);
        const vendorPrice = vendor?.pricing || 250;
        const vendorCategory = vendor?.category || "Promotional";
        const isFood = ["Mexican", "Italian", "Desserts", "Beverages"].includes(vendorCategory);
        
        return {
          id: `bth-org-${targetEventId}-${idx}-${Date.now()}`,
          eventId: targetEventId,
          name: `Booth: ${vendor?.businessName || "Vendor"}`,
          type: isFood ? "FOOD_TRUCK" : "STANDARD",
          category: vendorCategory,
          price: vendorPrice,
          status: "SOLD",
          vendorBusinessName: vendor?.businessName,
          paymentTerms: "FULL",
          amountPaid: vendorPrice
        };
      });
      return [...filteredBooths, ...vendorBooths];
    });

    addSagaLog("Organizer-Service", `Allocated ${orgSelectedVendorIds.length} vendor booth spaces for event date ${newEventDate}.`, "success");

    setOrgEditingEventId(null);
    setNewEventTitle("");
    setNewEventDesc("");
    setNewEventLoc("");
    setNewEventDate("");
    setNewEventPrice("");
    setNewEventInventory("");
    setAdminSelectedVenueId("none");
    setNewEventCity("");
    setNewEventState("");
    setNewEventZipcode("");
    setNewEventLat("");
    setNewEventLng("");
    setNewEventIsSponsored(false);
    setOrgSelectedVendorIds([]);
    setOrgEventSponsorPackages([]);
    
    alert("Event saved successfully!");
  };

  // Run Saga Simulation for ticket purchases & booth bookings
  const runSagaCheckout = async (orderId: string, itemQuantity: number, eventObj: Event, appliedCode: string | null) => {
    setSagaLogs([]);
    setCheckoutStep("saga-running");
    setSagaType(bookingMode);
    setActiveTab("saga");
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    if (bookingMode === "TICKET") {
      // TICKET SAGA WORKFLOW
      setSagaState("order-created");
      addSagaLog("Order-Service", `Received attendee checkout request. Order ID: ${orderId}`, "info");
      addSagaLog("Kafka-Broker", "Event [order.created] published to 'order-events' topic.", "event");
      await delay(1200);

      setSagaState("tickets-reserved");
      addSagaLog("Ticket-Service", `Consuming order event. Allocating event inventory for: ${eventObj.title}`, "info");
      
      if (eventObj.ticketInventory - eventObj.ticketsSold < itemQuantity) {
        addSagaLog("Ticket-Service", `Inventory check failed! Required: ${itemQuantity}, Available: ${eventObj.ticketInventory - eventObj.ticketsSold}`, "error");
        addSagaLog("Kafka-Broker", "Event [tickets.reservation.failed] published to 'ticket-events' topic.", "event");
        await delay(1000);
        rollbackSaga("inventory-failure", orderId, itemQuantity, eventObj, appliedCode);
        return;
      }

      setEvents(prev => prev.map(e => e.id === eventObj.id ? { ...e, ticketsSold: e.ticketsSold + itemQuantity } : e));
      addSagaLog("Ticket-Service", `Acquired MySQL row lock (FOR UPDATE) on tickets table.`, "info");
      addSagaLog("Ticket-Service", `Optimistic version check verified. Reserved ${itemQuantity} ticket(s).`, "success");
      addSagaLog("Kafka-Broker", "Event [tickets.reserved] published to 'ticket-events' topic.", "event");
      await delay(1200);

      setSagaState("promo-applied");
      if (appliedCode) {
        addSagaLog("Promotion-Service", `Applying coupon: ${appliedCode}`, "info");
        setPromoCodes(prev => prev.map(p => p.code.toUpperCase() === appliedCode.toUpperCase() ? { ...p, usageCount: p.usageCount + 1 } : p));
        addSagaLog("Promotion-Service", `Coupon applied successfully.`, "success");
        addSagaLog("Kafka-Broker", "Event [promotion.applied] published to 'promotion-events' topic.", "event");
      }
      await delay(1000);

      setSagaState("payment-initiated");
      addSagaLog("Payment-Service", `Connecting to ${paymentGateway} SDK API...`, "info");
      addSagaLog("Payment-Service", `Posting capture request. Idempotency Key: IDEM-${orderId}`, "info");
      await delay(1500);

      if (simulatePaymentFailure) {
        addSagaLog("Payment-Service", `Gateway Error: Insufficient Funds. Transaction rejected.`, "error");
        addSagaLog("Kafka-Broker", "Event [payment.failed] published to 'payment-events' topic.", "event");
        await delay(1200);
        rollbackSaga("payment-failure", orderId, itemQuantity, eventObj, appliedCode);
      } else {
        addSagaLog("Payment-Service", `Payment transaction cleared. Reference ch_stripe_${Math.floor(Math.random()*1000000)}`, "success");
        addSagaLog("Kafka-Broker", "Event [payment.succeeded] published to 'payment-events' topic.", "event");
        await delay(1200);

        setSagaState("completed");
        addSagaLog("Order-Service", `Consuming payment cleared event. Setting order state to [PAID]. SAGA complete.`, "success");
        
        const finalOrder: Order = {
          id: orderId,
          eventId: eventObj.id,
          eventTitle: eventObj.title,
          quantity: itemQuantity,
          totalAmount: pricingDetails.total,
          promoApplied: appliedCode,
          status: "PAID",
          timestamp: new Date().toLocaleString(),
          paymentGateway,
          idempotencyKey: `IDEM-${orderId}`,
          type: "TICKET"
        };
        setOrders(prev => [finalOrder, ...prev]);

        addSagaLog("Notification-Service", `Sending email and SMS booking tokens...`, "info");
        addSagaLog("Notification-Service", `[EMAIL SENT] Sent HTML ticket attachment.`, "success");
        addSagaLog("Notification-Service", `[SMS SENT] Twilio booking token dispatched: TKT-${Math.floor(Math.random()*1000000)}`, "success");

        setCheckoutStep("success");
        setIsCheckingOut(false);
      }
    } else {
      // BOOTH SAGA WORKFLOW
      if (!selectedBooth || !activeVendorProfile) return;

      setSagaState("order-created");
      addSagaLog("Order-Service", `Received vendor booth booking checkout. Order ID: ${orderId}`, "info");
      
      // Verification check of vendor profile status
      addSagaLog("Order-Service", `Verifying active vendor registration state for Business: ${activeVendorProfile.businessName}...`, "info");
      if (activeVendorProfile.status !== "VERIFIED") {
        addSagaLog("Order-Service", `Verification Aborted: Vendor profile is in state [${activeVendorProfile.status}]. OTP verification required.`, "error");
        await delay(1000);
        rollbackSaga("vendor-unverified", orderId, 1, eventObj, appliedCode);
        return;
      }
      addSagaLog("Order-Service", `Vendor validation successful: Verified profile token detected.`, "success");
      addSagaLog("Kafka-Broker", "Event [booth.order.created] published to 'booth-events' topic.", "event");
      await delay(1200);

      setSagaState("tickets-reserved");
      addSagaLog("Booth-Service", `Consuming event. Checking slot availability: ${selectedBooth.name}`, "info");
      
      const freshBooth = booths.find(b => b.id === selectedBooth.id);
      if (!freshBooth || freshBooth.status !== "AVAILABLE") {
        addSagaLog("Booth-Service", `Booth booking conflict: Slot is already reserved or booked.`, "error");
        addSagaLog("Kafka-Broker", "Event [booth.reservation.failed] published to 'booth-events' topic.", "event");
        await delay(1000);
        rollbackSaga("booth-unavailable", orderId, 1, eventObj, appliedCode);
        return;
      }

      // Temporarily mark as reserved
      setBooths(prev => prev.map(b => b.id === selectedBooth.id ? { ...b, status: "RESERVED", vendorBusinessName: activeVendorProfile.businessName } : b));
      addSagaLog("Booth-Service", `Locked MySQL row: SELECT * FROM booths WHERE id = ? FOR UPDATE`, "info");
      addSagaLog("Booth-Service", `Booth successfully reserved. Row lock active.`, "success");
      addSagaLog("Kafka-Broker", "Event [booth.reserved] published to 'booth-events' topic.", "event");
      await delay(1200);

      setSagaState("promo-applied");
      if (appliedCode) {
        addSagaLog("Promotion-Service", `Validating vendor coupon: ${appliedCode}`, "info");
        setPromoCodes(prev => prev.map(p => p.code.toUpperCase() === appliedCode.toUpperCase() ? { ...p, usageCount: p.usageCount + 1 } : p));
        addSagaLog("Promotion-Service", `Vendor coupon applied.`, "success");
        addSagaLog("Kafka-Broker", "Event [promotion.applied] published to 'promotion-events' topic.", "event");
      }
      await delay(1000);

      setSagaState("payment-initiated");
      const chargeAmount = paymentTerms === "FULL" ? pricingDetails.total : pricingDetails.depositAmount;
      addSagaLog("Payment-Service", `Posting WebClient charge parameters to ${paymentGateway} endpoint...`, "info");
      addSagaLog("Payment-Service", `Charging payment amount: $${chargeAmount} (${paymentTerms === "FULL" ? "100% full payment" : "25% deposit downpayment"})`, "info");
      addSagaLog("Payment-Service", `Booth payment processing. Idempotency Key: IDEM-${orderId}`, "info");
      await delay(1500);

      if (simulatePaymentFailure) {
        addSagaLog("Payment-Service", `Gateway rejected payment charge request: Card Declined.`, "error");
        addSagaLog("Kafka-Broker", "Event [payment.failed] published to 'payment-events' topic.", "event");
        await delay(1200);
        rollbackSaga("payment-failure", orderId, 1, eventObj, appliedCode);
      } else {
        addSagaLog("Payment-Service", `Vendor payment cleared. Reference ch_stripe_vendor_${Math.floor(Math.random()*1000000)}`, "success");
        addSagaLog("Kafka-Broker", "Event [payment.succeeded] published to 'payment-events' topic.", "event");
        await delay(1200);

        setSagaState("completed");
        addSagaLog("Booth-Service", `Consuming payment success. Setting booth status to [SOLD] in MySQL.`, "success");
        setBooths(prev => prev.map(b => b.id === selectedBooth.id ? { 
          ...b, 
          status: "SOLD",
          paymentTerms,
          amountPaid: chargeAmount
        } : b));
        
        addSagaLog("Order-Service", `Saga finalized. Booth order updated to [PAID].`, "success");

        const finalOrder: Order = {
          id: orderId,
          eventId: eventObj.id,
          eventTitle: eventObj.title,
          quantity: 1,
          totalAmount: pricingDetails.total,
          promoApplied: appliedCode,
          status: "PAID",
          timestamp: new Date().toLocaleString(),
          paymentGateway,
          idempotencyKey: `IDEM-${orderId}`,
          type: "BOOTH",
          boothId: selectedBooth.id,
          boothName: selectedBooth.name,
          vendorBusinessName: activeVendorProfile.businessName,
          paymentTerms,
          amountPaid: chargeAmount,
          remainingBalance: paymentTerms === "FULL" ? 0 : pricingDetails.remainingBalance
        };
        setOrders(prev => [finalOrder, ...prev]);

        addSagaLog("Notification-Service", `Dispatching vendor onboarding documentation packets...`, "info");
        addSagaLog("Notification-Service", `[EMAIL SENT] Sent event layout map & vendor parking passes to ${activeVendorProfile.email}.`, "success");

        setCheckoutStep("success");
        setIsCheckingOut(false);
      }
    }
  };

  // Rollback SAGA (Compensating Transactions)
  const rollbackSaga = async (reason: string, orderId: string, itemQuantity: number, eventObj: Event, appliedCode: string | null) => {
    setSagaState("rollback-started");
    addSagaLog("Saga-Orchestrator", `SAGA FAILURE REASON: ${reason}. Triggering compensating rollbacks...`, "error");
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1000);

    if (bookingMode === "TICKET") {
      // Revert Tickets
      addSagaLog("Ticket-Service", `Reverting ticket reservations: restoring +${itemQuantity} tickets.`, "info");
      setEvents(prev => prev.map(e => e.id === eventObj.id ? { ...e, ticketsSold: e.ticketsSold - itemQuantity } : e));
      addSagaLog("Ticket-Service", `MySQL row lock released. Stock inventory synchronized.`, "success");
      await delay(1000);
    } else {
      // Revert Booth
      if (selectedBooth && activeVendorProfile) {
        addSagaLog("Booth-Service", `Reverting booth reservation: releasing slot ${selectedBooth.name}.`, "info");
        setBooths(prev => prev.map(b => b.id === selectedBooth.id ? { ...b, status: "AVAILABLE", vendorBusinessName: undefined } : b));
        addSagaLog("Booth-Service", `Booth marked back to [AVAILABLE] and row lock released.`, "success");
        await delay(1000);
      }
    }

    // Rollback Promo Code Usage
    if (appliedCode) {
      addSagaLog("Promotion-Service", `Reverting promo usage counter for: ${appliedCode}`, "info");
      setPromoCodes(prev => prev.map(p => p.code.toUpperCase() === appliedCode.toUpperCase() ? { ...p, usageCount: p.usageCount - 1 } : p));
      addSagaLog("Promotion-Service", `Promo counter decremented.`, "success");
      await delay(1000);
    }

    // Cancel Order
    addSagaLog("Order-Service", `Marking order status to [FAILED]. SAGA compensation completed.`, "error");
    
    const failedOrder: Order = {
      id: orderId,
      eventId: eventObj.id,
      eventTitle: eventObj.title,
      quantity: itemQuantity,
      totalAmount: pricingDetails.total,
      promoApplied: appliedCode,
      status: "FAILED",
      timestamp: new Date().toLocaleString(),
      paymentGateway,
      idempotencyKey: `IDEM-${orderId}`,
      type: bookingMode,
      boothId: selectedBooth?.id,
      boothName: selectedBooth?.name,
      vendorBusinessName: bookingMode === "BOOTH" ? activeVendorProfile?.businessName : undefined,
      paymentTerms,
      amountPaid: 0,
      remainingBalance: 0
    };
    setOrders(prev => [failedOrder, ...prev]);

    setSagaState("rollback-complete");
    setCheckoutStep("failed");
    setIsCheckingOut(false);
  };

  // Launch Checkout Dialog / 2FA check
  const startCheckout = () => {
    if (!selectedEvent) return;

    if (bookingMode === "TICKET") {
      const available = selectedEvent.ticketInventory - selectedEvent.ticketsSold;
      if (ticketQuantity > available) {
        alert("Not enough tickets available!");
        return;
      }
    } else {
      if (!activeVendorProfile || activeVendorProfile.status !== "VERIFIED") {
        alert("You must verify your Vendor Profile before booking event spaces!");
        return;
      }
      if (!selectedBooth) {
        alert("Please select an available booth slot!");
        return;
      }
    }

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setNewOrderId(orderId);

    if (is2FaEnabled) {
      setCheckoutStep("mfa");
    } else {
      runSagaCheckout(orderId, ticketQuantity, selectedEvent, appliedPromo ? appliedPromo : null);
    }
  };

  const verifyCheckoutMfa = () => {
    if (otpCode.trim() === "123456") {
      setOtpCode("");
      setOtpError(null);
      if (selectedEvent) {
        runSagaCheckout(newOrderId, ticketQuantity, selectedEvent, appliedPromo ? appliedPromo : null);
      }
    } else {
      setOtpError("Invalid OTP token. Please use '123456' for verification.");
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen relative bg-radial-glow overflow-x-hidden font-sans pb-24">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[150px] pointer-events-none"></div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 w-full glass border-b border-[var(--glass-border)] py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-sky-500 to-indigo-500 p-2 rounded-xl shadow-lg shadow-sky-500/20">
            <Zap className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-gradient font-outfit">
              AuraTickets
            </h1>
            <p className="text-[10px] text-sky-400 font-mono tracking-wider uppercase">Event DDD Monolith</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-[var(--glass-bg)] p-1.5 rounded-xl border border-[var(--glass-border)]">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom ${
              activeTab === "catalog" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab("my-tickets")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom flex items-center gap-1.5 ${
              activeTab === "my-tickets" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
            }`}
          >
            My Orders & Profiles
            {(orders.length) > 0 && (
              <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {orders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("venues")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom ${
              activeTab === "venues" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
            }`}
          >
            Venue Providers
          </button>
          <button
            onClick={() => setActiveTab("organizer")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom ${
              activeTab === "organizer" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
            }`}
          >
            Event Organizers
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom ${
              activeTab === "admin" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
            }`}
          >
            Admin Panel
          </button>
          <button
            onClick={() => setActiveTab("saga")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom flex items-center gap-1.5 ${
              activeTab === "saga" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${sagaState !== "idle" && sagaState !== "completed" && sagaState !== "rollback-complete" ? "animate-spin text-sky-400" : ""}`} />
            Saga Console
          </button>
        </nav>

        {/* Theme Select & 2FA Quick Badge */}
        <div className="flex items-center gap-3">
          
          {/* Light/Dark Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--glass-border)] transition-colors shadow-sm"
            aria-label="Toggle Dark/Light Mode"
          >
            {theme === "light" ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => setActiveTab("my-tickets")}
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all-custom ${
              is2FaEnabled 
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" 
                : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            2FA: {is2FaEnabled ? "Active" : "Disabled"}
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-8">
        
        {/* TAB 1: EVENT CATALOG & PURCHASING */}
        {activeTab === "catalog" && (
          <div className="space-y-6">

            {/* ── SPONSORED EVENTS SCROLL BANNER ── */}
            {(() => {
              const sponsoredEvents = events.filter(e => e.isSponsored).slice(0, 5);
              if (sponsoredEvents.length === 0) return null;
              // Duplicate for seamless infinite loop
              const track = [...sponsoredEvents, ...sponsoredEvents];
              return (
                <div className="relative w-full overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/5 via-[var(--glass-bg)] to-amber-500/5 backdrop-blur-xl shadow-lg shadow-amber-500/5">
                  {/* Header pill */}
                  <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                    <span className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                      <Award className="w-3 h-3" />
                      Featured &amp; Sponsored
                    </span>
                    <span className="text-[10px] text-amber-400/70 font-medium">Top sponsored events — hover to pause</span>
                    {/* Fade edges */}
                    <div className="ml-auto flex gap-1 text-amber-400/40">
                      <ChevronLeft className="w-3.5 h-3.5 animate-pulse" />
                      <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                  </div>

                  {/* Left / right fade masks */}
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[var(--bg-primary)] to-transparent" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[var(--bg-primary)] to-transparent" />

                  {/* Marquee track */}
                  <div className="overflow-hidden pb-3 px-2">
                    <div className="marquee-track gap-3">
                      {track.map((evt, idx) => {
                        const available = evt.ticketInventory - evt.ticketsSold;
                        return (
                          <div
                            key={`${evt.id}-${idx}`}
                            onClick={() => {
                              setSelectedEvent(evt);
                              setDetailPageEvent(evt);
                              setShowEventDetailPage(true);
                              setBookingMode("TICKET");
                              setTicketQuantity(1);
                            }}
                            className="cursor-pointer flex-shrink-0 w-64 rounded-xl overflow-hidden border border-amber-500/30 bg-[var(--glass-card-bg)] hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 group"
                          >
                            {/* Event image */}
                            <div className="relative h-28 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={evt.imageUrl}
                                alt={evt.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="absolute top-2 left-2">
                                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                                  ★ Sponsored
                                </span>
                              </div>
                              <div className="absolute bottom-2 right-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                                  available <= 0 ? "bg-rose-500 text-white" :
                                  available <= 15 ? "bg-amber-500 text-slate-950" :
                                  "bg-emerald-500/90 text-white"
                                }`}>
                                  {available <= 0 ? "SOLD OUT" : `${available} left`}
                                </span>
                              </div>
                            </div>
                            {/* Event info */}
                            <div className="p-3 space-y-1.5">
                              <p className="text-xs font-bold text-[var(--text-primary)] leading-tight line-clamp-1 group-hover:text-amber-300 transition-colors">
                                {evt.title}
                              </p>
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] min-w-0">
                                  <Calendar className="w-2.5 h-2.5 shrink-0 text-sky-400" />
                                  <span className="truncate">{evt.date}</span>
                                </div>
                                <span className="text-xs font-bold font-mono text-emerald-400 shrink-0">${evt.price}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-rose-400" />
                                <span className="truncate">{evt.location}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── MAIN 3-COLUMN GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Event List & Catalog Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold font-display tracking-tight text-[var(--text-primary)] font-outfit">Upcoming Events</h2>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">Select an event below to configure ticket options or vendor promotional booths.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setCatalogView("grid")}
                      className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs transition-all flex items-center gap-1 ${
                        catalogView === "grid"
                          ? "bg-sky-500 text-white shadow-sm font-medium"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatalogView("calendar")}
                      className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs transition-all flex items-center gap-1 ${
                        catalogView === "calendar"
                          ? "bg-sky-500 text-white shadow-sm font-medium"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                      title="Calendar View"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Calendar</span>
                    </button>
                  </div>
                  <span className="text-xs bg-[var(--input-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] px-3 py-1.5 rounded-lg font-mono">
                    Total: {filteredEvents.length} / {events.length} Events
                  </span>
                </div>
              </div>

              {/* Premium Search & Filter Panel */}
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Keyword search input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, category, keyword..."
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2.5 pl-4 pr-10 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/55 focus:outline-none focus:border-sky-500"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Quick Filters Toggles */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleToggleGeoLocation}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all-custom ${
                        searchUseGeo
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-[var(--glass-border)] bg-[var(--input-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {isGeoLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5" />
                      )}
                      {searchUseGeo ? `Near Me (${searchRadius}mi)` : "Near Me"}
                    </button>

                    {(searchQuery || searchCity || searchState || searchZip || searchDateStart || searchDateEnd || searchUseGeo) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchCity("");
                          setSearchState("");
                          setSearchZip("");
                          setSearchDateStart("");
                          setSearchDateEnd("");
                          setSearchUseGeo(false);
                          setUserCoords(null);
                        }}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Clear Filters"
                      >
                        <RefreshCw className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Advanced Filters */}
                <div className="border-t border-[var(--glass-border)] pt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">City</label>
                      <input
                        type="text"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        placeholder="e.g. San Francisco"
                        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">State</label>
                      <select
                        value={searchState}
                        onChange={(e) => setSearchState(e.target.value)}
                        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500 font-sans"
                      >
                        {US_STATES.map((st) => (
                          <option key={st.code} value={st.code} className="bg-[var(--node-bg)] text-[var(--text-primary)]">
                            {st.code ? `${st.code} - ${st.name}` : st.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Zipcode</label>
                      <input
                        type="text"
                        value={searchZip}
                        onChange={(e) => setSearchZip(e.target.value)}
                        placeholder="e.g. 94103"
                        maxLength={5}
                        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    {/* Date Range Pickers */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block font-semibold">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={searchDateStart}
                          onChange={(e) => setSearchDateStart(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-[10px] text-[var(--text-primary)] focus:outline-none focus:border-sky-500 font-sans"
                        />
                        <input
                          type="date"
                          value={searchDateEnd}
                          onChange={(e) => setSearchDateEnd(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-[10px] text-[var(--text-primary)] focus:outline-none focus:border-sky-500 font-sans"
                        />
                      </div>
                    </div>

                    {/* Radius Slider for Geolocation */}
                    {searchUseGeo && (
                      <div className="space-y-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] p-2 rounded-xl">
                        <div className="flex justify-between text-[9px] font-mono text-[var(--text-secondary)]">
                          <span>Search Radius:</span>
                          <span className="font-bold text-sky-400">{searchRadius} miles</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="500"
                          step="5"
                          value={searchRadius}
                          onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                          className="w-full h-1 bg-[var(--glass-border)] rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Cards Grid */}
              {/* Event Cards Grid */}
              {catalogView === "grid" && (
                filteredEvents.length === 0 ? (
                  <div className="glass rounded-2xl border border-[var(--glass-border)] p-12 text-center text-[var(--text-secondary)] space-y-4">
                    <Info className="w-12 h-12 text-slate-600 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">No events match your criteria</h3>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">Adjust search parameters or clear filters to view events.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredEvents.map(event => {
                      const availableStock = event.ticketInventory - event.ticketsSold;
                      const percentSold = Math.min(100, Math.round((event.ticketsSold / event.ticketInventory) * 100));
                      const isSelected = selectedEvent?.id === event.id;

                      return (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setTicketQuantity(1);
                            setSelectedBooth(null);
                            setAppliedPromo("");
                            setPromoSuccess(null);
                            setPromoError(null);
                            setBoothCategoryFilter("ALL");
                            setBoothTypeFilter("ALL");
                            setDetailPageEvent(event);
                            setShowEventDetailPage(true);
                          }}
                          className={`group rounded-2xl overflow-hidden glass-card cursor-pointer border transition-all-custom duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                            isSelected 
                              ? "border-sky-500 shadow-lg shadow-sky-500/10 scale-[1.01]" 
                              : event.isSponsored
                                ? "border-amber-500/40 shadow-lg shadow-amber-500/5 bg-gradient-to-br from-[var(--glass-card-bg)] to-amber-500/5 hover:border-amber-400"
                                : "border-[var(--card-border)] hover:border-sky-500/30 hover:shadow-sky-500/5"
                          }`}
                        >
                          <div className="relative h-44 w-full bg-[var(--input-bg)] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={event.imageUrl} 
                              alt={event.title} 
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-80"
                            />
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                              <span className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] text-sky-500 text-xs px-2.5 py-1 rounded-full font-medium">
                                {event.category}
                              </span>
                              {event.isSponsored && (
                                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                                  ★ Sponsored
                                </span>
                              )}
                            </div>
                            {availableStock <= 15 && availableStock > 0 && (
                              <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded animate-pulse">
                                Selling Fast!
                              </span>
                            )}
                            {availableStock === 0 && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="bg-rose-500/20 border border-rose-500 text-rose-300 font-bold uppercase tracking-widest text-sm px-4 py-1.5 rounded-lg shadow-xl shadow-rose-950/20">
                                  Sold Out
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-5">
                            <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-sky-300 transition-colors flex items-center gap-2">
                              {event.title}
                              {event.isSponsored && (
                                <span className="text-amber-400 text-sm" title="Sponsored Partner Event">★</span>
                              )}
                            </h3>
                            <div className="flex items-center mt-1 mb-2">
                              {(() => {
                                const rating = getAverageRating("EVENT", event.id);
                                const count = getReviewCount("EVENT", event.id);
                                return rating > 0 ? (
                                  <div className="flex items-center gap-1">
                                    {renderStars(rating)}
                                    <span className="text-[10px] text-[var(--text-secondary)] ml-1">({count})</span>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-[var(--text-secondary)]/70 italic">No ratings yet</span>
                                );
                              })()}
                            </div>
                            <p className="text-[var(--text-secondary)] text-xs mt-1 line-clamp-2 leading-relaxed">
                              {event.description}
                            </p>
   
                            <div className="space-y-2 mt-4">
                              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                                <span>{event.location}</span>
                              </div>
                            </div>
   
                            {/* Progress Stock Level */}
                            <div className="mt-5 pt-4 border-t border-[var(--glass-border)]">
                              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] mb-1">
                                <span className="font-medium">Ticket Inventory</span>
                                <span className="font-mono text-[var(--text-primary)] font-bold">{availableStock} / {event.ticketInventory} Left</span>
                              </div>
                              <div className="w-full bg-[var(--glass-border)] h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    percentSold > 85 ? "bg-rose-500" : percentSold > 60 ? "bg-amber-500" : "bg-sky-500"
                                  }`}
                                  style={{ width: `${percentSold}%` }}
                                />
                              </div>
                            </div>
   
                            <div className="flex items-center justify-between mt-4">
                              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-mono">Price</span>
                              <span className="text-2xl font-bold font-display text-[var(--text-primary)]">${event.price}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Event Catalog Calendar View */}
              {catalogView === "calendar" && (
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-6">
                  {/* Calendar Header with Navigation */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-sky-400" />
                      <h3 className="text-lg font-bold text-[var(--text-primary)] font-outfit">
                        {new Date(catalogCalYear, catalogCalMonth).toLocaleString("default", { month: "long" })} {catalogCalYear}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (catalogCalMonth === 0) {
                            setCatalogCalMonth(11);
                            setCatalogCalYear(prev => prev - 1);
                          } else {
                            setCatalogCalMonth(prev => prev - 1);
                          }
                          setSelectedCatalogDay(null);
                        }}
                        className="p-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown for Month selection */}
                      <select
                        value={catalogCalMonth}
                        onChange={(e) => {
                          setCatalogCalMonth(parseInt(e.target.value));
                          setSelectedCatalogDay(null);
                        }}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500 font-sans"
                      >
                        {Array.from({ length: 12 }).map((_, i) => (
                          <option key={i} value={i} className="bg-[var(--node-bg)] text-[var(--text-primary)]">
                            {new Date(2026, i).toLocaleString("default", { month: "long" })}
                          </option>
                        ))}
                      </select>

                      {/* Dropdown for Year selection */}
                      <select
                        value={catalogCalYear}
                        onChange={(e) => {
                          setCatalogCalYear(parseInt(e.target.value));
                          setSelectedCatalogDay(null);
                        }}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500 font-sans"
                      >
                        {[2025, 2026, 2027, 2028].map(y => (
                          <option key={y} value={y} className="bg-[var(--node-bg)] text-[var(--text-primary)]">
                            {y}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          if (catalogCalMonth === 11) {
                            setCatalogCalMonth(0);
                            setCatalogCalYear(prev => prev + 1);
                          } else {
                            setCatalogCalMonth(prev => prev + 1);
                          }
                          setSelectedCatalogDay(null);
                        }}
                        className="p-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Weekday Names Header */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="py-2">{day}</div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {/* Empty starting slots offset */}
                    {Array.from({ length: new Date(catalogCalYear, catalogCalMonth, 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square bg-slate-500/5 rounded-xl border border-dashed border-[var(--glass-border)] opacity-20 flex items-center justify-center text-[var(--text-secondary)] text-xs">
                        {/* prev month days overflow */}
                      </div>
                    ))}

                    {/* Active Month Days */}
                    {Array.from({ length: new Date(catalogCalYear, catalogCalMonth + 1, 0).getDate() }).map((_, i) => {
                      const dayNumber = i + 1;
                      const monthStr = String(catalogCalMonth + 1).padStart(2, "0");
                      const dayStr = String(dayNumber).padStart(2, "0");
                      const dateYmd = `${catalogCalYear}-${monthStr}-${dayStr}`;

                      // Find all events matching this date
                      const dayEvents = filteredEvents.filter(evt => {
                        const evtYmd = normalizeDateToYmd(evt.date);
                        return evtYmd === dateYmd;
                      });

                      const isSelected = selectedCatalogDay === dateYmd;

                      return (
                        <div
                          key={`day-${dayNumber}`}
                          onClick={() => {
                            setSelectedCatalogDay(dateYmd);
                            // If there is only one event, auto-select it!
                            if (dayEvents.length === 1) {
                              setSelectedEvent(dayEvents[0]);
                              setTicketQuantity(1);
                              setSelectedBooth(null);
                              setAppliedPromo("");
                              setPromoSuccess(null);
                              setPromoError(null);
                              setBoothCategoryFilter("ALL");
                              setBoothTypeFilter("ALL");
                              setDetailPageEvent(dayEvents[0]);
                              setShowEventDetailPage(true);
                            }
                          }}
                          className={`aspect-square p-1 rounded-xl border flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                            dayEvents.length > 0
                              ? "bg-indigo-500/10 border-indigo-500/35 hover:bg-indigo-500/20 text-indigo-400"
                              : "bg-[var(--glass-card-bg)] border-[var(--card-border)] hover:bg-[var(--glass-border)] text-[var(--text-primary)]"
                          } ${isSelected ? "ring-2 ring-sky-500 scale-[1.03] shadow-lg shadow-sky-500/10" : ""}`}
                        >
                          <span className="text-[10px] sm:text-xs font-mono font-bold self-start">{dayNumber}</span>
                          
                          {/* Event Indicators */}
                          <div className="w-full mt-auto space-y-1">
                            {/* Desktop: short tags */}
                            <div className="hidden md:flex flex-col gap-1">
                              {dayEvents.slice(0, 2).map(evt => (
                                <div
                                  key={evt.id}
                                  onClick={(e) => {
                                    e.stopPropagation(); // prevent double select
                                    setSelectedCatalogDay(dateYmd);
                                    setSelectedEvent(evt);
                                    setTicketQuantity(1);
                                    setSelectedBooth(null);
                                    setAppliedPromo("");
                                    setPromoSuccess(null);
                                    setPromoError(null);
                                    setBoothCategoryFilter("ALL");
                                    setBoothTypeFilter("ALL");
                                    setDetailPageEvent(evt);
                                    setShowEventDetailPage(true);
                                  }}
                                  className={`text-[8px] px-1 py-0.5 rounded font-sans truncate font-medium text-left border ${
                                    selectedEvent?.id === evt.id
                                      ? "bg-sky-500 text-white border-sky-400 shadow-sm"
                                      : evt.isSponsored
                                        ? "bg-amber-500/20 text-amber-200 border-amber-500/40 hover:bg-amber-500/30 font-bold"
                                        : "bg-indigo-500/25 text-indigo-200 border-indigo-500/30 hover:bg-indigo-500/40"
                                  }`}
                                  title={evt.title}
                                >
                                  {evt.isSponsored ? `★ ${evt.title}` : evt.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-[7px] text-[var(--text-secondary)] font-mono text-center font-bold">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>

                            {/* Mobile: dots */}
                            <div className="flex md:hidden justify-center gap-0.5">
                              {dayEvents.map(evt => (
                                <span
                                  key={evt.id}
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    selectedEvent?.id === evt.id 
                                      ? "bg-sky-400" 
                                      : evt.isSponsored
                                        ? "bg-amber-400"
                                        : "bg-indigo-400"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Day Event Listing Panel */}
                  {selectedCatalogDay && (() => {
                    const dayEvents = filteredEvents.filter(evt => normalizeDateToYmd(evt.date) === selectedCatalogDay);
                    return (
                      <div className="border-t border-[var(--glass-border)] pt-4 mt-2">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                            Events on <span className="font-mono text-sky-400 font-bold">{selectedCatalogDay}</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setSelectedCatalogDay(null)}
                            className="text-[10px] text-sky-400 hover:underline"
                          >
                            Clear Selection
                          </button>
                        </div>
                        {dayEvents.length === 0 ? (
                          <p className="text-xs text-[var(--text-secondary)] italic">No events scheduled for this date.</p>
                        ) : (
                          <div className="space-y-2">
                            {dayEvents.map(evt => {
                              const isSelected = selectedEvent?.id === evt.id;
                              return (
                                <div
                                  key={evt.id}
                                  onClick={() => {
                                    setSelectedEvent(evt);
                                    setTicketQuantity(1);
                                    setSelectedBooth(null);
                                    setAppliedPromo("");
                                    setPromoSuccess(null);
                                    setPromoError(null);
                                    setBoothCategoryFilter("ALL");
                                    setBoothTypeFilter("ALL");
                                    setDetailPageEvent(evt);
                                    setShowEventDetailPage(true);
                                  }}
                                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-sky-500/10 border-sky-500 text-[var(--text-primary)]"
                                      : evt.isSponsored
                                        ? "bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10"
                                        : "bg-[var(--glass-card-bg)] border-[var(--card-border)] hover:bg-[var(--glass-border)]"
                                  }`}
                                >
                                  <div>
                                    <h5 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                      {evt.title}
                                      {evt.isSponsored && (
                                        <span className="bg-amber-500/20 text-amber-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm border border-amber-500/35">★ SPONSORED</span>
                                      )}
                                    </h5>
                                    <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] mt-1">
                                      <span className={evt.isSponsored ? "text-amber-400 font-bold" : "text-sky-400 font-semibold"}>
                                        {evt.category}
                                      </span>
                                      <span>•</span>
                                      <span>{evt.location}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-bold text-[var(--text-primary)] font-mono block">${evt.price}</span>
                                    <span className="text-[9px] text-[var(--text-secondary)] font-mono">
                                      {evt.ticketInventory - evt.ticketsSold} left
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
 
            {/* Config & Checkout Details Panel */}
            <div className="space-y-6">
              
              {selectedEvent ? (
                <div className="space-y-6">
                  

                  {/* 🎟 Buy Tickets CTA — redirects to Event Details Page */}
                  <div className="glass rounded-2xl border border-sky-500/20 p-5 relative overflow-hidden space-y-3">
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                        <Ticket className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">Buy Attendee Tickets</h4>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Open the event details page to purchase tickets.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">${selectedEvent.price} / ticket</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        selectedEvent.ticketInventory - selectedEvent.ticketsSold <= 0
                          ? "bg-rose-500/10 text-rose-400"
                          : selectedEvent.ticketInventory - selectedEvent.ticketsSold <= 15
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {selectedEvent.ticketInventory - selectedEvent.ticketsSold <= 0
                          ? "SOLD OUT"
                          : `${selectedEvent.ticketInventory - selectedEvent.ticketsSold} left`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailPageEvent(selectedEvent);
                        setShowEventDetailPage(true);
                        setBookingMode("TICKET");
                      }}
                      disabled={selectedEvent.ticketInventory - selectedEvent.ticketsSold <= 0}
                      className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold py-2.5 rounded-xl shadow shadow-sky-500/20 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 font-outfit"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      View Details &amp; Buy Tickets
                    </button>
                  </div>

                  {/* MODE B: Vendor Booking Panel */}
                  {bookingMode === "BOOTH" && (
                    <div className="space-y-6">
                      
                      {/* Step B1: Profile Registration Wizard (Visible if unverified) */}
                      {!activeVendorProfile ? (
                        <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/25">
                              <ShieldAlert className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-[var(--text-primary)]">Vendor Verification Required</h4>
                              <p className="text-xs text-[var(--text-secondary)] mt-1">Please register and verify your business profile via OTP to access leasing catalog.</p>
                            </div>
                          </div>

                          {vendorRegStep === "form" ? (
                            <form onSubmit={handleRegisterVendorProfile} className="space-y-3 pt-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Business Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={regBusinessName}
                                  onChange={(e) => setRegBusinessName(e.target.value)}
                                  placeholder="e.g. Gourmet Pizza Co."
                                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Owner Name *</label>
                                  <input
                                    type="text"
                                    required
                                    value={regOwnerName}
                                    onChange={(e) => setRegOwnerName(e.target.value)}
                                    placeholder="e.g. Luigi Rossini"
                                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Category</label>
                                  <select
                                    value={regCategory}
                                    onChange={(e) => setRegCategory(e.target.value)}
                                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                                  >
                                    <option value="Mexican">Mexican Food</option>
                                    <option value="Italian">Italian Food</option>
                                    <option value="Desserts">Desserts</option>
                                    <option value="Beverages">Beverages</option>
                                    <option value="Tech Showcase">Tech Showcase</option>
                                    <option value="Crafts">Crafts & Art</option>
                                    <option value="Apparel">Apparel</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Email Address *</label>
                                  <input
                                    type="email"
                                    required
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    placeholder="vendor@company.com"
                                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Phone Number *</label>
                                  <input
                                    type="tel"
                                    required
                                    value={regPhone}
                                    onChange={(e) => setRegPhone(e.target.value)}
                                    placeholder="+1 555-0199"
                                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                                  />
                                </div>
                              </div>

                              <button
                                type="submit"
                                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 mt-2"
                              >
                                <Smartphone className="w-4 h-4" />
                                Send Verification OTP
                              </button>
                            </form>
                          ) : (
                            <form onSubmit={handleVerifyVendorOtp} className="space-y-4 pt-2">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                                  <label className="font-semibold">Verification Code</label>
                                  <span>Verification code: <strong>987654</strong></span>
                                </div>
                                <input
                                  type="text"
                                  required
                                  maxLength={6}
                                  value={vendorOtpInput}
                                  onChange={(e) => setVendorOtpInput(e.target.value)}
                                  placeholder="e.g. 987654"
                                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3 text-center text-lg tracking-widest text-[var(--text-primary)] placeholder-slate-705 font-mono font-bold w-full focus:outline-none focus:border-amber-500"
                                />
                                {vendorOtpError && (
                                  <p className="text-rose-400 text-xs text-center font-medium mt-1 flex items-center justify-center gap-1">
                                    <X className="w-3.5 h-3.5" /> {vendorOtpError}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => setVendorRegStep("form")}
                                  className="w-1/2 bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-xs py-2 rounded-xl text-[var(--text-primary)]"
                                >
                                  Back
                                </button>
                                <button
                                  type="submit"
                                  className="w-1/2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition"
                                >
                                  Verify OTP
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      ) : (
                        // Step B2: Verified Vendor Booking Console
                        <div className="space-y-6">
                          
                          {/* Active Verified Vendor Profile Badge */}
                          <div className="glass rounded-xl border border-emerald-500/25 bg-emerald-950/5 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                                <UserCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-[var(--text-primary)]">{activeVendorProfile.businessName}</h4>
                                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-bold">Verified Vendor</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveVendorProfile(null);
                                setSelectedBooth(null);
                              }}
                              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs"
                            >
                              Disconnect
                            </button>
                          </div>

                          {/* Rental Layout List */}
                          <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-6 relative overflow-hidden">
                            <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl"></div>

                            {/* Filters */}
                            <div className="space-y-3 p-3.5 bg-[var(--input-bg)] rounded-xl border border-[var(--glass-border)]">
                              <h5 className="text-[11px] font-bold uppercase text-[var(--text-secondary)] font-mono tracking-wider flex items-center gap-1">
                                <Filter className="w-3 h-3 text-sky-400" />
                                Layout Filters
                              </h5>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[9px] text-[var(--text-secondary)] font-semibold block uppercase">Type</span>
                                  <select
                                    value={boothTypeFilter}
                                    onChange={(e) => {
                                      setBoothTypeFilter(e.target.value as any);
                                      setSelectedBooth(null);
                                    }}
                                    className="bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg py-1 px-2 text-[11px] text-[var(--text-primary)] w-full focus:outline-none"
                                  >
                                    <option value="ALL">All Slots</option>
                                    <option value="STANDARD">Standard Booth</option>
                                    <option value="FOOD_TRUCK">Food Truck Spot</option>
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[9px] text-[var(--text-secondary)] font-semibold block uppercase">Category</span>
                                  <select
                                    value={boothCategoryFilter}
                                    onChange={(e) => {
                                      setBoothCategoryFilter(e.target.value);
                                      setSelectedBooth(null);
                                    }}
                                    className="bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg py-1 px-2 text-[11px] text-[var(--text-primary)] w-full focus:outline-none"
                                  >
                                    <option value="ALL">All Categories</option>
                                    {availableCategories.map(cat => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Booth Grid */}
                            <div className="space-y-2">
                              <label className="text-xs text-[var(--text-secondary)] font-medium block">Select Event Booth / Slot</label>
                              <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                                {filteredBooths.length === 0 ? (
                                  <div className="text-center text-xs text-[var(--text-secondary)] py-6 border border-dashed border-[var(--glass-border)] rounded-xl">
                                    No booths matching filters.
                                  </div>
                                ) : (
                                  filteredBooths.map(booth => {
                                    const isBoothSelected = selectedBooth?.id === booth.id;
                                    const isSold = booth.status === "SOLD";

                                    return (
                                      <div
                                        key={booth.id}
                                        onClick={() => {
                                          if (booth.status === "AVAILABLE") {
                                            setSelectedBooth(booth);
                                          }
                                        }}
                                        className={`p-3 rounded-xl border text-left transition-all flex justify-between items-center ${
                                          isSold
                                            ? "border-[var(--glass-border)] bg-[var(--glass-bg)] opacity-50 cursor-not-allowed text-[var(--text-secondary)]"
                                            : isBoothSelected
                                              ? "border-sky-500 bg-sky-950/20 text-[var(--text-primary)] ring-1 ring-sky-500/20 cursor-pointer"
                                              : "border-[var(--glass-border)] hover:border-[var(--text-secondary)]/30 bg-[var(--input-bg)] cursor-pointer text-[var(--text-primary)]"
                                        }`}
                                      >
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                                              booth.type === "FOOD_TRUCK" 
                                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                                                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                            }`}>
                                              {booth.type === "FOOD_TRUCK" ? "Food Truck" : "Booth"}
                                            </span>
                                            <span className="text-xs font-bold">{booth.name}</span>
                                          </div>
                                          
                                          <div className="flex gap-2 items-center text-[10px] text-[var(--text-secondary)] mt-1">
                                            <span>Category: <strong>{booth.category}</strong></span>
                                            {isSold && (
                                              <span className="text-[9px] text-slate-400 font-medium">({booth.vendorBusinessName})</span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="text-right flex items-center gap-2.5">
                                          <span className="text-xs font-mono font-bold">${booth.price}</span>
                                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                            isSold
                                              ? "border-rose-500/50 bg-rose-500/20 text-rose-400"
                                              : isBoothSelected
                                                ? "border-sky-500 bg-sky-500 text-white"
                                                : "border-slate-700 bg-transparent"
                                          }`}>
                                            {isSold ? <X className="w-2.5 h-2.5" /> : (isBoothSelected ? <Check className="w-2.5 h-2.5" /> : null)}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* Flexible Payment Terms Selector */}
                            {selectedBooth && (
                              <div className="space-y-2.5 pt-2 border-t border-[var(--glass-border)]">
                                <label className="text-xs text-[var(--text-secondary)] font-medium block">Select Payment Terms</label>
                                <div className="grid grid-cols-2 gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setPaymentTerms("FULL")}
                                    className={`py-3 px-3 rounded-xl border flex flex-col items-center justify-center transition-all-custom ${
                                      paymentTerms === "FULL" 
                                        ? "border-sky-500 bg-sky-500/10 text-sky-400 shadow shadow-sky-500/10" 
                                        : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]/20"
                                    }`}
                                  >
                                    <span className="text-xs font-bold">Pay in Full</span>
                                    <span className="text-[10px] font-mono mt-0.5 text-[var(--text-secondary)] font-medium">${pricingDetails.total} due now</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPaymentTerms("DEPOSIT")}
                                    className={`py-3 px-3 rounded-xl border flex flex-col items-center justify-center transition-all-custom ${
                                      paymentTerms === "DEPOSIT" 
                                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow shadow-indigo-500/10" 
                                        : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]/20"
                                    }`}
                                  >
                                    <span className="text-xs font-bold">Reserve with Deposit</span>
                                    <span className="text-[10px] font-mono mt-0.5 text-[var(--text-secondary)] font-medium">${pricingDetails.depositAmount} now (25%)</span>
                                  </button>
                                </div>
                              </div>
                            )}
 
                            {/* Promo Code Input */}
                            <div className="space-y-2 pt-2 border-t border-[var(--glass-border)]">
                              <label className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                                <Gift className="w-3.5 h-3.5 text-indigo-400" />
                                Promo Code
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={appliedPromo}
                                  onChange={(e) => {
                                    setAppliedPromo(e.target.value.toUpperCase());
                                    setPromoSuccess(null);
                                    setPromoError(null);
                                  }}
                                  placeholder="e.g. WELCOME10, AURA50"
                                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-sky-500 w-full font-mono uppercase"
                                />
                                <button
                                  type="button"
                                  onClick={verifyPromo}
                                  className="bg-[var(--input-bg)] border border-[var(--input-border)] hover:border-[var(--text-secondary)]/50 text-xs px-3.5 rounded-xl transition-all-custom text-[var(--text-primary)] font-medium"
                                >
                                  Apply
                                </button>
                              </div>
                              {promoError && <p className="text-rose-400 text-xs font-medium mt-1 flex items-center gap-1"><X className="w-3 h-3" />{promoError}</p>}
                              {promoSuccess && <p className="text-emerald-400 text-xs font-medium mt-1 flex items-center gap-1"><Check className="w-3 h-3" />{promoSuccess}</p>}
                            </div>
 
                            {/* Payment Gateway */}
                            <div className="space-y-2 pt-2 border-t border-[var(--glass-border)]">
                              <label className="text-xs text-[var(--text-secondary)] font-medium block">Select Payment Gateway</label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => setPaymentGateway("Stripe")}
                                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all-custom ${
                                    paymentGateway === "Stripe" 
                                      ? "border-sky-500 bg-sky-500/10 text-sky-400 shadow shadow-sky-500/10" 
                                      : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]/20"
                                  }`}
                                >
                                  <CreditCard className="w-4 h-4" />
                                  Stripe API
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPaymentGateway("PayPal")}
                                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all-custom ${
                                    paymentGateway === "PayPal" 
                                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow shadow-indigo-500/10" 
                                      : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]/20"
                                  }`}
                                >
                                  <Zap className="w-4 h-4" />
                                  PayPal Orders
                                </button>
                              </div>
                            </div>
 
                            {/* Payment Simulation Modifier */}
                            <div className="bg-[var(--glass-bg)] rounded-xl p-3 border border-[var(--glass-border)] flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-[var(--text-primary)] block">Simulate Payment Success?</span>
                                <span className="text-[10px] text-[var(--text-secondary)]">Toggle to trigger SAGA compensation rollback.</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSimulatePaymentFailure(!simulatePaymentFailure)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                  simulatePaymentFailure ? "bg-rose-500" : "bg-sky-500"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    simulatePaymentFailure ? "translate-x-6" : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Cost Summary */}
                            <div className="bg-[var(--input-bg)] rounded-xl p-4 border border-[var(--glass-border)] space-y-2 text-sm">
                              <div className="flex justify-between text-[var(--text-secondary)]">
                                <span>Booth Price</span>
                                <span className="font-mono text-[var(--text-primary)]">${pricingDetails.subtotal}</span>
                              </div>
                              {pricingDetails.discount > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                  <span>Discount Applied</span>
                                  <span className="font-mono">-${pricingDetails.discount}</span>
                                </div>
                              )}
                              
                              {paymentTerms === "DEPOSIT" ? (
                                <>
                                  <div className="flex justify-between text-indigo-400 font-bold border-t border-[var(--glass-border)] pt-2">
                                    <span>25% Deposit Due</span>
                                    <span className="font-mono">${pricingDetails.depositAmount}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-500 text-xs">
                                    <span>Remaining Balance Invoice</span>
                                    <span className="font-mono">${pricingDetails.remainingBalance}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex justify-between font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--glass-border)] text-base">
                                  <span>Total Amount Due</span>
                                  <span className="font-mono text-sky-400">${pricingDetails.total}</span>
                                </div>
                              )}
                            </div>

                            {/* Rent Booth Submit Button */}
                            <button
                              type="button"
                              onClick={startCheckout}
                              disabled={!selectedBooth}
                              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 font-outfit"
                            >
                              <Store className="w-4 h-4" />
                              Rent Booth Spot (Launch SAGA)
                            </button>

                            <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              Secured with RSA-256 JWT & Optional Two-Factor Auth
                            </p>

                          </div>

                        </div>
                      )}

                    </div>
                  )}

                  {/* Sponsorship Opportunities Card */}
                  <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl"></div>
                    
                    <div className="flex items-center gap-2 relative z-10">
                      <Award className="w-5 h-5 text-amber-400" />
                      <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Sponsorship Tiers</h4>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)]">Support this event to showcase your brand. Click "Show Interest" to apply.</p>

                    <div className="space-y-3">
                      {!selectedEvent.sponsorPackages || selectedEvent.sponsorPackages.length === 0 ? (
                        <p className="text-[10px] text-[var(--text-secondary)] italic text-center py-2">No sponsorship packages listed for this event.</p>
                      ) : (
                        selectedEvent.sponsorPackages.map(pkg => (
                          <div key={pkg.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[var(--text-primary)]">{pkg.name}</span>
                              <span className="font-mono text-amber-400 font-bold">${pkg.price}</span>
                            </div>
                            <ul className="text-[10px] text-[var(--text-secondary)] list-disc pl-4 space-y-1">
                              {pkg.benefits.map((b, idx) => (
                                  <li key={idx}>{b}</li>
                              ))}
                            </ul>
                            <button
                              type="button"
                              onClick={() => {
                                setSponsorSelectedEvent(selectedEvent);
                                setSponsorSelectedPackage(pkg);
                                setSponsorCompanyName("");
                                setSponsorContactName("");
                                setSponsorEmail("");
                                setSponsorPhone("");
                                setSponsorOtpInput("");
                                setSponsorOtpError(null);
                                setSponsorStep("form");
                                setShowSponsorModal(true);
                              }}
                              className="w-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 text-[10px] py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 font-outfit"
                            >
                              Show Interest
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-8 text-center text-[var(--text-secondary)]">
                  <p>Please select an event from the catalog to configure bookings.</p>
                </div>
              )}

              {/* Community Feedback Widget */}
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-4 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/5 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-start gap-2 relative z-10">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[var(--text-secondary)] font-mono tracking-wider">
                      Site Feedback
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {(() => {
                        const avg = getAverageRating("SITE", "site");
                        const cnt = getReviewCount("SITE", "site");
                        return (
                          <>
                            {renderStars(avg)}
                            <span className="text-[10px] text-[var(--text-secondary)] font-mono font-bold">({cnt})</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewTargetType("SITE");
                      setReviewTargetId("site");
                      setReviewRating(5);
                      setReviewComment("");
                      setReviewAuthorName("");
                      setReviewAuthorEmail("");
                      setReviewOtpInput("");
                      setReviewOtpError(null);
                      setReviewVerificationStep("form");
                      setShowReviewModal(true);
                    }}
                    className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-1.5 px-3 rounded-xl text-[10px] transition font-outfit shadow-sm shadow-sky-955"
                  >
                    Write a Review
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 relative z-10">
                  {(() => {
                    const siteReviews = reviews.filter(r => r.targetType === "SITE" && r.status === "APPROVED");
                    if (siteReviews.length === 0) {
                      return (
                        <p className="text-[11px] text-[var(--text-secondary)]/75 italic text-center py-4">
                          No site experience reviews yet. Be the first to write one!
                        </p>
                      );
                    }
                    return siteReviews.slice(-3).reverse().map(rev => (
                      <div key={rev.id} className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)] text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-[var(--text-primary)]">{rev.authorName}</span>
                          <span className="text-slate-500 font-mono">{rev.date}</span>
                        </div>
                        <div className="flex items-center">
                          {renderStars(rev.rating)}
                        </div>
                        <p className="text-[var(--text-secondary)] text-[11px] italic leading-relaxed">{rev.comment}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>

          </div>

        </div>
        )}

        {/* TAB 2: MY ORDERS & 2FA MANAGEMENT */}
        {activeTab === "my-tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Orders & Verification Details */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-3xl font-bold font-display text-[var(--text-primary)] font-outfit">My Order & Booking History</h2>
              
              {orders.length === 0 ? (
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-12 text-center text-[var(--text-secondary)] space-y-4">
                  <Ticket className="w-12 h-12 text-slate-605 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">No active orders</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Book ticket purchases or rent booths on the Catalog page to populate simulated transaction history.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("catalog")}
                    className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    View Catalog <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div 
                      key={order.id} 
                      className={`glass rounded-2xl border p-5 relative overflow-hidden ${
                        order.status === "PAID" 
                          ? "border-emerald-500/20 bg-emerald-950/5" 
                          : "border-rose-500/20 bg-rose-950/5"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs text-sky-400 bg-[var(--glass-bg)] border border-[var(--glass-border)] px-2 py-0.5 rounded font-bold">
                              {order.id}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                              order.type === "BOOTH" 
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                                : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            }`}>
                              {order.type === "BOOTH" ? "Booth Slot" : "Attendee Ticket"}
                            </span>
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                              order.status === "PAID" 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}>
                              {order.status}
                            </span>
                            <span className="text-xs text-slate-500">{order.timestamp}</span>
                          </div>
                          
                          <h3 className="text-lg font-bold text-[var(--text-primary)] mt-2 leading-tight">
                            {order.type === "BOOTH" ? order.boothName : order.eventTitle}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-[var(--text-secondary)]">
                            {order.type === "TICKET" ? (
                              <span>Quantity: <strong>{order.quantity} Ticket(s)</strong></span>
                            ) : (
                              <>
                                <span>Vendor: <strong>{order.vendorBusinessName}</strong></span>
                                <span>•</span>
                                <span>Terms: <strong>{order.paymentTerms === "FULL" ? "100% Paid" : `25% Deposit Paid ($${order.amountPaid})`}</strong></span>
                                {order.remainingBalance && order.remainingBalance > 0 ? (
                                  <>
                                    <span>•</span>
                                    <span className="text-indigo-400 font-semibold">Remaining Invoice: ${order.remainingBalance}</span>
                                  </>
                                ) : null}
                              </>
                            )}
                            <span>•</span>
                            <span>Event: {order.eventTitle}</span>
                            <span>•</span>
                            <span>Payment: <strong>{order.paymentGateway}</strong></span>
                            {order.promoApplied && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400 font-mono">Promo: {order.promoApplied}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Paid Amount</span>
                            <span className="text-xl font-bold font-display text-[var(--text-primary)]">${order.amountPaid ?? order.totalAmount}</span>
                          </div>

                          {order.status === "PAID" ? (
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-md shadow-black/20">
                              {/* Simple Mock QR Code */}
                              <svg className="w-12 h-12 text-slate-950" viewBox="0 0 100 100">
                                <rect width="100" height="100" fill="white"/>
                                <rect x="10" y="10" width="20" height="20" fill="black"/>
                                <rect x="70" y="10" width="20" height="20" fill="black"/>
                                <rect x="10" y="70" width="20" height="20" fill="black"/>
                                <rect x="35" y="35" width="30" height="30" fill="black"/>
                                <rect x="15" y="45" width="10" height="10" fill="black"/>
                                <rect x="75" y="75" width="15" height="15" fill="black"/>
                                <rect x="45" y="75" width="20" height="10" fill="black"/>
                                <rect x="75" y="45" width="10" height="20" fill="black"/>
                              </svg>
                            </div>
                          ) : (
                            <div className="h-14 w-14 rounded-lg border border-rose-500/20 flex items-center justify-center bg-rose-500/5">
                              <X className="w-6 h-6 text-rose-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vendor Profile settings & 2FA */}
            <div className="space-y-6">
              
              {/* Vendor Profile Update Console (if verified vendor) */}
              {activeVendorProfile && (
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">Vendor Business Profile</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Manage your registered details, business category, and contact info.</p>
                    </div>
                  </div>

                  {isEditingVendorProfile ? (
                    <form onSubmit={handleUpdateVendorProfile} className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">Business Name</span>
                        <code className="text-xs font-mono font-bold text-[var(--text-primary)] block py-1.5 px-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg">
                          {activeVendorProfile.businessName}
                        </code>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Owner Name *</label>
                        <input
                          type="text"
                          required
                          value={editOwnerName}
                          onChange={(e) => setEditOwnerName(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Business Category</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                        >
                          <option value="Mexican">Mexican Food</option>
                          <option value="Italian">Italian Food</option>
                          <option value="Desserts">Desserts</option>
                          <option value="Beverages">Beverages</option>
                          <option value="Tech Showcase">Tech Showcase</option>
                          <option value="Crafts">Crafts & Art</option>
                          <option value="Apparel">Apparel</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingVendorProfile(false)}
                          className="w-1/2 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs font-semibold py-2 rounded-xl text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="w-1/2 bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 rounded-xl text-xs transition"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl space-y-2.5 text-xs text-[var(--text-primary)]">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Business Name</span>
                          <p className="font-bold text-sm">{activeVendorProfile.businessName}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Owner / Representative</span>
                          <p>{activeVendorProfile.ownerName}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Contact Info</span>
                          <p>{activeVendorProfile.email} | {activeVendorProfile.phone}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Business Category</span>
                          <p>{activeVendorProfile.category}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingVendorProfile(true);
                          setEditOwnerName(activeVendorProfile.ownerName);
                          setEditEmail(activeVendorProfile.email);
                          setEditPhone(activeVendorProfile.phone);
                          setEditCategory(activeVendorProfile.category);
                        }}
                        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] hover:border-slate-500/50 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Business Profile
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 2FA Setup */}
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Two-Factor Auth (2FA)</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Enforce OTP requirement when purchasing event tickets or booking booths. Protect against brute force.</p>
                  </div>
                </div>

                <div className="bg-[var(--glass-bg)] rounded-xl p-4 border border-[var(--glass-border)] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block">Status: {is2FaEnabled ? "ENABLED" : "DISABLED"}</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">TOTP (Google Authenticator)</span>
                  </div>
                  <button
                    onClick={handleToggle2Fa}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all-custom ${
                      is2FaEnabled 
                        ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                    }`}
                  >
                    {is2FaEnabled ? "Disable" : "Enable"}
                  </button>
                </div>

                {is2FaEnabled && (
                  <div className="space-y-4 p-4 bg-[var(--input-bg)] rounded-xl border border-[var(--input-border)]">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Security credentials active: RSA-256 JWT Signed Session.</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>OTP code verification active on checkout.</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--glass-border)] space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Developer Instructions</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    This implementation models standard Spring Security filter authorization checks. If enabled, checkout intercepts and opens the OTP prompt. Type <strong>123456</strong> to verify checkout tokens.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ADMIN PANEL (CRUD & METRICS) */}
        {activeTab === "admin" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Create Event & Allocate Booths Form */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Event Creator Form */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] flex items-center gap-2 font-outfit">
                  <Calendar className="w-6 h-6 text-sky-400" />
                  Add Event Creator
                </h2>
                <form onSubmit={handleCreateEvent} className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Event Title *</label>
                      <input
                        type="text"
                        required
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="e.g. Docker & K8s Bootcamp"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-sky-500 w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Category</label>
                      <select
                        value={newEventCategory}
                        onChange={(e) => setNewEventCategory(e.target.value)}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full"
                      >
                        <option value="Technology">Technology</option>
                        <option value="Music">Music</option>
                        <option value="Food & Drink">Food & Drink</option>
                        <option value="Sports">Sports</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--text-secondary)] font-bold">Description</label>
                    <textarea
                      rows={2}
                      value={newEventDesc}
                      onChange={(e) => setNewEventDesc(e.target.value)}
                      placeholder="Provide detailed description of domain agenda and ticketing policies."
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-sky-500 w-full resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Location *</label>
                      <input
                        type="text"
                        required
                        value={newEventLoc}
                        onChange={(e) => setNewEventLoc(e.target.value)}
                        placeholder="e.g. Seattle, WA"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-sky-500 w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Date *</label>
                      <input
                        type="text"
                        required
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        placeholder="e.g. Sept 15, 2026"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-sky-500 w-full"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Ticket Price ($) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={newEventPrice}
                        onChange={(e) => setNewEventPrice(e.target.value)}
                        placeholder="e.g. 99"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/55 focus:outline-none focus:border-sky-500 w-full font-mono"
                      />
                    </div>
                  </div>

                  {/* Collapsible Advanced Geolocation Data for Event */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowEventGeoOverrides(!showEventGeoOverrides)}
                      className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 focus:outline-none"
                    >
                      {showEventGeoOverrides ? "▼ Hide" : "▶ Show"} Advanced Geolocation & Address Details (Auto-Parsed)
                    </button>

                    {showEventGeoOverrides && (
                      <div className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl space-y-3">
                        <p className="text-[10px] text-[var(--text-secondary)] italic">
                          Values automatically parsed from location text or selected venue. Modify manually for precision.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-[var(--text-secondary)] font-bold">City</label>
                            <input
                              type="text"
                              value={newEventCity}
                              onChange={(e) => setNewEventCity(e.target.value)}
                              placeholder="e.g. San Francisco"
                              className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-[var(--text-secondary)] font-bold">State</label>
                            <select
                              value={newEventState}
                              onChange={(e) => setNewEventState(e.target.value)}
                              className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-sans"
                            >
                              {US_STATES.map((st) => (
                                <option key={st.code} value={st.code} className="bg-[var(--node-bg)] text-[var(--text-primary)]">
                                  {st.code ? `${st.code} - ${st.name}` : st.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-[var(--text-secondary)] font-bold">Zipcode</label>
                            <input
                              type="text"
                              value={newEventZipcode}
                              onChange={(e) => setNewEventZipcode(e.target.value)}
                              placeholder="e.g. 94103"
                              maxLength={5}
                              className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-[var(--text-secondary)] font-bold">Latitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={newEventLat}
                              onChange={(e) => setNewEventLat(e.target.value)}
                              placeholder="e.g. 37.7749"
                              className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-mono"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-[var(--text-secondary)] font-bold">Longitude</label>
                            <input
                              type="number"
                              step="0.000001"
                              value={newEventLng}
                              onChange={(e) => setNewEventLng(e.target.value)}
                              placeholder="e.g. -122.4194"
                              className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Select Available Venue</label>
                      <select
                        value={adminSelectedVenueId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminSelectedVenueId(val);
                          if (val !== "none") {
                            const vn = venues.find(v => v.id === val);
                            if (vn) {
                              setNewEventLoc(`${vn.name}, ${vn.location}`);
                            }
                          }
                        }}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full"
                      >
                        <option value="none">None (Use Manual Location)</option>
                        {venues.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name} (Max Cap: {v.capacity} pax, Parking: {v.parkingSpots} spots)
                          </option>
                        ))}
                      </select>
                    </div>

                    {adminSelectedVenueId !== "none" && (() => {
                      const vn = venues.find(v => v.id === adminSelectedVenueId);
                      if (!vn) return null;
                      
                      const inventory = parseInt(newEventInventory) || 0;
                      const capMatches = vn.capacity >= inventory;
                      
                      const normalizeDate = (d: string) => {
                        try {
                          const parsed = new Date(d);
                          if (!isNaN(parsed.getTime())) {
                            const y = parsed.getFullYear();
                            const m = String(parsed.getMonth() + 1).padStart(2, "0");
                            const day = String(parsed.getDate()).padStart(2, "0");
                            return `${y}-${m}-${day}`;
                          }
                        } catch (err) {}
                        return d.trim().toLowerCase();
                      };
                      const normalizedEventDate = normalizeDate(newEventDate);
                      const isAvailableOnDate = vn.availableDates.some(availDate => normalizeDate(availDate) === normalizedEventDate);
                      const isAlreadyBooked = venueBookings.some(b => b.venueId === vn.id && normalizeDate(b.date) === normalizedEventDate && b.status === "CONFIRMED");

                      return (
                        <div className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-3 text-[11px] space-y-1.5 flex flex-col justify-center">
                          <span className="font-bold text-[var(--text-primary)]">Venue Allocation Checks:</span>
                          <div className="flex items-center gap-1">
                            <span className={capMatches ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                              {capMatches ? "✓ Capacity matches" : "⚠ Inventory exceeds capacity"}
                            </span>
                            <span className="text-[var(--text-secondary)]">({vn.capacity} pax limit vs {inventory || 0} tickets)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={isAvailableOnDate && !isAlreadyBooked ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                              {isAlreadyBooked ? "✗ Already booked" : isAvailableOnDate ? "✓ Available on date" : "✗ Not available on date"}
                            </span>
                            <span className="text-[var(--text-secondary)]">({newEventDate || "No date set"})</span>
                          </div>
                          <div className="flex flex-wrap gap-1 text-[9px] text-[var(--text-secondary)] mt-1">
                            <span>Services: {vn.services.join(", ") || "None"}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Sponsorship Packages Section */}
                  <div className="glass rounded-xl p-4 border border-[var(--glass-border)] space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Event Sponsor Packages</h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">Configure sponsorship tiers with specific pricing and benefits to invite brand sponsorships.</p>
                    </div>

                    {/* Package Add Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--text-secondary)] block uppercase">Tier/Package Name</label>
                        <input
                          type="text"
                          value={newPackageName}
                          onChange={(e) => setNewPackageName(e.target.value)}
                          placeholder="e.g. Platinum Tier"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--text-secondary)] block uppercase">Price ($)</label>
                        <input
                          type="number"
                          value={newPackagePrice}
                          onChange={(e) => setNewPackagePrice(e.target.value)}
                          placeholder="e.g. 5000"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-3">
                        <label className="text-[9px] font-bold text-[var(--text-secondary)] block uppercase">Benefits (comma-separated list)</label>
                        <input
                          type="text"
                          value={newPackageBenefits}
                          onChange={(e) => setNewPackageBenefits(e.target.value)}
                          placeholder="e.g. Logo on website, 5 VIP Passes, Logo on Stage Banner"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="md:col-span-3 flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddSponsorPackage}
                          className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-1.5 px-4 rounded-lg text-[10px] transition font-outfit"
                        >
                          + Add Tier Package
                        </button>
                      </div>
                    </div>

                    {/* Current Packages List */}
                    <div className="space-y-2">
                      {orgEventSponsorPackages.length === 0 ? (
                        <p className="text-[10px] text-[var(--text-secondary)] italic text-center py-2">No sponsorship tiers configured yet. Add at least one above to display sponsorship opportunities.</p>
                      ) : (
                        orgEventSponsorPackages.map(pkg => (
                          <div key={pkg.id} className="flex justify-between items-center bg-[var(--input-bg)] p-2 rounded-lg border border-[var(--input-border)] text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[var(--text-primary)]">{pkg.name}</span>
                                <span className="text-sky-400 font-mono font-bold">${pkg.price}</span>
                              </div>
                              <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">Benefits: {pkg.benefits.join(", ")}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleRemoveSponsorPackage(pkg.id, e)}
                              className="text-rose-400 hover:text-rose-300 text-[10px] py-1 px-2 hover:bg-rose-500/10 rounded-lg transition"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Ticket Inventory Stock *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newEventInventory}
                        onChange={(e) => setNewEventInventory(e.target.value)}
                        placeholder="e.g. 250"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/55 focus:outline-none focus:border-sky-500 w-full font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-2 pb-3">
                      <input
                        type="checkbox"
                        id="newEventIsSponsored"
                        checked={newEventIsSponsored}
                        onChange={(e) => setNewEventIsSponsored(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-[var(--input-border)] bg-[var(--input-bg)] text-amber-500 focus:ring-amber-500 focus:ring-opacity-25 accent-amber-500 cursor-pointer"
                      />
                      <label htmlFor="newEventIsSponsored" className="text-xs text-[var(--text-primary)] font-bold cursor-pointer select-none flex items-center gap-1 hover:text-amber-400 transition-colors">
                        ★ Sponsored Event
                      </label>
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 rounded-xl transition shadow shadow-sky-955 flex items-center justify-center gap-2 text-sm font-outfit"
                      >
                        <Plus className="w-4 h-4" />
                        Create Event
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Event Management CRUD List (Delete features) */}
              <div className="space-y-4 pt-4 border-t border-[var(--glass-border)]">
                <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] flex items-center gap-2 font-outfit">
                  <Layers className="w-6 h-6 text-sky-400" />
                  Manage Existing Events (CRUD)
                </h2>
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-4 space-y-2 max-h-56 overflow-y-auto">
                  {events.map(ev => {
                    const availableStock = ev.ticketInventory - ev.ticketsSold;
                    return (
                      <div key={ev.id} className="p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-[var(--text-primary)] text-sm">{ev.title}</p>
                          <div className="text-[10px] text-[var(--text-secondary)] mt-1 flex gap-3">
                            <span>Date: {ev.date}</span>
                            <span>•</span>
                            <span>Price: ${ev.price}</span>
                            <span>•</span>
                            <span>Tickets Available: {availableStock} / {ev.ticketInventory}</span>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Booth Allocation Form */}
              <div className="space-y-4 pt-4 border-t border-[var(--glass-border)]">
                <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] flex items-center gap-2 font-outfit">
                  <Store className="w-6 h-6 text-sky-400" />
                  Add Booth & Catering service slots
                </h2>
                <form onSubmit={handleCreateBooth} className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold font-mono">Assign to Event *</label>
                      <select
                        value={adminBoothEventId}
                        onChange={(e) => setAdminBoothEventId(e.target.value)}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full"
                      >
                        {events.map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Slot Name/Number *</label>
                      <input
                        type="text"
                        required
                        value={adminBoothName}
                        onChange={(e) => setAdminBoothName(e.target.value)}
                        placeholder="e.g. Catering Spot #FT5, Booth #303"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-sky-500 w-full"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Slot Type</label>
                      <select
                        value={adminBoothType}
                        onChange={(e) => {
                          const type = e.target.value as "STANDARD" | "FOOD_TRUCK";
                          setAdminBoothType(type);
                          if (type === "FOOD_TRUCK") {
                            setAdminBoothCategory("Mexican");
                          } else {
                            setAdminBoothCategory("Tech Showcase");
                          }
                        }}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full"
                      >
                        <option value="STANDARD">Standard Booth</option>
                        <option value="FOOD_TRUCK">Food Truck Spot</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Catering Category / Category</label>
                      {adminBoothType === "FOOD_TRUCK" ? (
                        <select
                          value={adminBoothCategory}
                          onChange={(e) => setAdminBoothCategory(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full"
                        >
                          <option value="Mexican">Mexican</option>
                          <option value="Italian">Italian</option>
                          <option value="Asian">Asian</option>
                          <option value="Desserts">Desserts</option>
                          <option value="Beverages">Beverages</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={adminBoothCategory}
                          onChange={(e) => setAdminBoothCategory(e.target.value)}
                          placeholder="e.g. Crafts, Tech, Apparel"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-sky-500 w-full"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Rental Price ($) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={adminBoothPrice}
                        onChange={(e) => setAdminBoothPrice(e.target.value)}
                        placeholder="e.g. 500"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/55 focus:outline-none focus:border-sky-500 w-full font-mono"
                      />
                    </div>

                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition shadow shadow-sky-955 flex items-center gap-2 text-sm font-outfit"
                    >
                      <Plus className="w-4 h-4" />
                      Allocate Slot
                    </button>
                  </div>
                  
                </form>
              </div>

              {/* Vendor Profiles Directory */}
              <div className="space-y-4 pt-4 border-t border-[var(--glass-border)]">
                <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] flex items-center gap-2 font-outfit">
                  <UserCheck className="w-6 h-6 text-sky-400" />
                  Registered Vendor Profiles
                </h2>
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 overflow-hidden">
                  <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
                    {vendorProfiles.map(profile => (
                      <div key={profile.id} className="flex justify-between items-center border-b border-white/5 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--text-primary)] text-sm">{profile.businessName}</span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                              {profile.status}
                            </span>
                            {(() => {
                              const rating = getAverageRating("VENDOR", profile.id);
                              const count = getReviewCount("VENDOR", profile.id);
                              return rating > 0 ? (
                                <div className="flex items-center gap-1 ml-2">
                                  {renderStars(rating)}
                                  <span className="text-[10px] text-[var(--text-secondary)]">({count})</span>
                                </div>
                              ) : (
                                <span className="text-[9px] text-[var(--text-secondary)]/70 italic ml-2">No reviews</span>
                              );
                            })()}
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)] mt-1 flex gap-3">
                            <span>Owner: {profile.ownerName}</span>
                            <span>•</span>
                            <span>Phone: {profile.phone}</span>
                            <span>•</span>
                            <span>Category: {profile.category}</span>
                          </div>
                        </div>
                        <span className="text-[var(--text-secondary)] font-mono text-[10px]">{profile.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews & Ratings Moderator Dashboard */}
              <div className="space-y-4 pt-4 border-t border-[var(--glass-border)]">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] flex items-center gap-2 font-outfit">
                    <Shield className="w-6 h-6 text-sky-400" />
                    Reviews & Ratings Moderator
                  </h2>
                  <button
                    type="button"
                    onClick={runAbusiveScanChecker}
                    className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 font-bold py-1.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition font-outfit"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Scan Abusive Reviews
                  </button>
                </div>

                <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-4">
                  {/* Filters Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Entity Type</label>
                      <select
                        value={adminReviewTypeFilter}
                        onChange={(e) => setAdminReviewTypeFilter(e.target.value)}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      >
                        <option value="ALL">All Entities</option>
                        <option value="EVENT">Events</option>
                        <option value="VENUE">Venues</option>
                        <option value="VENDOR">Vendors</option>
                        <option value="SITE">Site Experience</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Status</label>
                      <select
                        value={adminReviewStatusFilter}
                        onChange={(e) => setAdminReviewStatusFilter(e.target.value)}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="APPROVED">Approved</option>
                        <option value="FLAGGED_ABUSIVE">Flagged Abusive</option>
                        <option value="HIDDEN">Hidden</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Rating</label>
                      <select
                        value={adminReviewRatingFilter}
                        onChange={(e) => setAdminReviewRatingFilter(e.target.value)}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      >
                        <option value="ALL">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Search</label>
                      <input
                        type="text"
                        value={adminReviewSearch}
                        onChange={(e) => setAdminReviewSearch(e.target.value)}
                        placeholder="Search author/comment..."
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Reviews Table/List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {(() => {
                      const filtered = reviews.filter(r => {
                        const matchType = adminReviewTypeFilter === "ALL" || r.targetType === adminReviewTypeFilter;
                        const matchStatus = adminReviewStatusFilter === "ALL" || r.status === adminReviewStatusFilter;
                        const matchRating = adminReviewRatingFilter === "ALL" || r.rating.toString() === adminReviewRatingFilter;
                        const query = adminReviewSearch.trim().toLowerCase();
                        const matchQuery = !query || 
                          r.authorName.toLowerCase().includes(query) || 
                          r.targetName.toLowerCase().includes(query) ||
                          r.comment.toLowerCase().includes(query);
                        return matchType && matchStatus && matchRating && matchQuery;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center text-xs text-[var(--text-secondary)] py-12 border border-dashed border-[var(--glass-border)] rounded-xl bg-[var(--glass-bg)]">
                            No reviews match the active filters.
                          </div>
                        );
                      }

                      return filtered.map(r => (
                        <div key={r.id} className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)] space-y-3 text-xs">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[var(--text-primary)] text-sm">{r.authorName}</span>
                                <span className="text-[9px] text-slate-400 font-mono uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                                  {r.authorRole}
                                </span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                                  r.status === "APPROVED" 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" 
                                    : r.status === "FLAGGED_ABUSIVE" 
                                      ? "bg-rose-500/10 text-rose-400 border-rose-500/25" 
                                      : "bg-slate-500/10 text-slate-400 border-slate-500/25"
                                }`}>
                                  {r.status}
                                </span>
                              </div>
                              <div className="text-[10px] text-[var(--text-secondary)] mt-1 flex flex-wrap gap-2 items-center">
                                <span className="font-bold text-sky-400">{r.targetType}: {r.targetName}</span>
                                <span>•</span>
                                <span>{r.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {renderStars(r.rating)}
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--glass-border)]">
                            {r.status === "FLAGGED_ABUSIVE" ? (
                              <div className="space-y-1">
                                <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1">
                                  <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                                  [FLAGGED ABUSIVE - Comment Content Hidden in Catalog]
                                </p>
                                <p className="text-[var(--text-secondary)] italic select-all opacity-60 font-mono line-through">{r.comment}</p>
                              </div>
                            ) : (
                              <p className="text-[var(--text-secondary)] italic leading-relaxed">{r.comment}</p>
                            )}
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            {r.status !== "APPROVED" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReviews(prev => prev.map(item => item.id === r.id ? { ...item, status: "APPROVED" as const } : item));
                                  addSagaLog("Moderator-Service", `Review by ${r.authorName} approved by admin.`, "success");
                                }}
                                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] py-1 px-3 rounded-lg font-semibold transition"
                              >
                                Approve
                              </button>
                            )}
                            {r.status !== "FLAGGED_ABUSIVE" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReviews(prev => prev.map(item => item.id === r.id ? { ...item, status: "FLAGGED_ABUSIVE" as const } : item));
                                  addSagaLog("Moderator-Service", `Review by ${r.authorName} flagged as abusive by admin.`, "error");
                                }}
                                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] py-1 px-3 rounded-lg font-semibold transition"
                              >
                                Flag Abusive
                              </button>
                            )}
                            {r.status !== "HIDDEN" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReviews(prev => prev.map(item => item.id === r.id ? { ...item, status: "HIDDEN" as const } : item));
                                  addSagaLog("Moderator-Service", `Review by ${r.authorName} hidden by admin.`, "info");
                                }}
                                className="bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 text-slate-400 text-[10px] py-1 px-3 rounded-lg font-semibold transition"
                              >
                                Hide
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setReviews(prev => prev.filter(item => item.id !== r.id));
                                addSagaLog("Moderator-Service", `Review by ${r.authorName} deleted permanently.`, "info");
                              }}
                              className="bg-transparent hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 text-[10px] py-1 px-2 rounded-lg transition"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* ===== SPONSORSHIP INTEREST DASHBOARD ===== */}
              <div className="space-y-4 pt-4 border-t border-[var(--glass-border)]">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] flex items-center gap-2 font-outfit">
                    <Award className="w-6 h-6 text-amber-400" />
                    Sponsorship Interest Console
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                      {sponsorInterests.length} Total Applications
                    </span>
                    {sponsorInterests.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Clear all sponsorship interest records?")) {
                            setSponsorInterests([]);
                            addSagaLog("Admin-Service", "All sponsorship interest records cleared by admin.", "info");
                          }
                        }}
                        className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-bold py-1.5 px-3 rounded-xl text-[10px] flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-5">
                  {sponsorInterests.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Award className="w-10 h-10 text-amber-400/30 mx-auto" />
                      <p className="text-[var(--text-secondary)] text-sm font-medium">No sponsorship interest submitted yet.</p>
                      <p className="text-[10px] text-[var(--text-secondary)]/60">Sponsors can apply from the Event Catalog sidebar.</p>
                    </div>
                  ) : (() => {
                    // Group by event
                    const grouped: Record<string, SponsorInterest[]> = {};
                    sponsorInterests.forEach(si => {
                      if (!grouped[si.eventId]) grouped[si.eventId] = [];
                      grouped[si.eventId].push(si);
                    });
                    return (
                      <div className="space-y-6">
                        {Object.entries(grouped).map(([evId, interests]) => {
                          const evTitle = interests[0].eventTitle;
                          return (
                            <div key={evId} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[240px]">{evTitle}</span>
                                  <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold">
                                    {interests.length} {interests.length === 1 ? "applicant" : "applicants"}
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono text-[var(--text-secondary)]">{evId}</span>
                              </div>
                              <div className="rounded-xl overflow-hidden border border-[var(--glass-border)]">
                                <table className="w-full text-[10px]">
                                  <thead>
                                    <tr className="bg-[var(--glass-bg)] border-b border-[var(--glass-border)]">
                                      <th className="text-left px-3 py-2 text-[var(--text-secondary)] font-bold uppercase tracking-wider">Company</th>
                                      <th className="text-left px-3 py-2 text-[var(--text-secondary)] font-bold uppercase tracking-wider">Contact</th>
                                      <th className="text-left px-3 py-2 text-[var(--text-secondary)] font-bold uppercase tracking-wider">Package</th>
                                      <th className="text-left px-3 py-2 text-[var(--text-secondary)] font-bold uppercase tracking-wider">Email</th>
                                      <th className="text-left px-3 py-2 text-[var(--text-secondary)] font-bold uppercase tracking-wider">Phone</th>
                                      <th className="text-left px-3 py-2 text-[var(--text-secondary)] font-bold uppercase tracking-wider">Status</th>
                                      <th className="px-3 py-2"></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {interests.map(si => (
                                      <tr key={si.id} className="border-b border-[var(--glass-border)] last:border-0 hover:bg-white/2 transition">
                                        <td className="px-3 py-2.5 font-bold text-[var(--text-primary)]">{si.companyName}</td>
                                        <td className="px-3 py-2.5 text-[var(--text-secondary)]">{si.contactName}</td>
                                        <td className="px-3 py-2.5">
                                          <span className="text-amber-400 font-bold font-mono">{si.packageName}</span>
                                          <span className="text-[var(--text-secondary)] ml-1">(${si.packagePrice})</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-sky-400">{si.email}</td>
                                        <td className="px-3 py-2.5 text-[var(--text-secondary)]">{si.phone}</td>
                                        <td className="px-3 py-2.5">
                                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold font-mono px-1.5 py-0.5 rounded uppercase text-[9px]">
                                            Verified
                                          </span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                          <button
                                            type="button"
                                            title="Remove record"
                                            onClick={() => {
                                              setSponsorInterests(prev => prev.filter(x => x.id !== si.id));
                                              addSagaLog("Admin-Service", `Sponsorship interest from ${si.companyName} removed by admin.`, "info");
                                            }}
                                            className="text-slate-500 hover:text-rose-400 transition"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
              {/* ===== END SPONSORSHIP INTEREST DASHBOARD ===== */}

            </div>

            {/* Metrics Sidebar */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-display text-[var(--text-primary)] font-outfit">System Metrics</h2>
              
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-6">
                
                {/* Total Stats */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest font-mono">Revenue breakdown</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--glass-bg)] p-4 rounded-xl border border-[var(--glass-border)]">
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider block">Ticket Revenue</span>
                      <span className="text-xl font-bold text-sky-400 font-mono mt-1 block">
                        ${orders.filter(o => o.status === "PAID" && o.type === "TICKET").reduce((acc, curr) => acc + curr.totalAmount, 0)}
                      </span>
                    </div>
                    <div className="bg-[var(--glass-bg)] p-4 rounded-xl border border-[var(--glass-border)]">
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider block">Booth Revenue</span>
                      <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">
                        ${orders.filter(o => o.status === "PAID" && o.type === "BOOTH").reduce((acc, curr) => acc + (curr.amountPaid ?? curr.totalAmount), 0)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-[var(--glass-bg)] p-4 rounded-xl border border-[var(--glass-border)] flex justify-between items-center">
                    <span className="text-xs text-[var(--text-secondary)] font-bold">Total Gross Volume</span>
                    <span className="text-2xl font-bold text-emerald-400 font-mono">
                      ${orders.filter(o => o.status === "PAID").reduce((acc, curr) => acc + (acc = (curr.amountPaid ?? curr.totalAmount)), 0)}
                    </span>
                  </div>
                </div>

                {/* SAGA Failures rate */}
                <div className="bg-[var(--glass-bg)] p-4 rounded-xl border border-[var(--glass-border)] space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-mono">
                    <span>Saga Compensation Rate</span>
                    <span className="font-bold text-rose-400">
                      {orders.length > 0 
                        ? `${Math.round((orders.filter(o => o.status === "FAILED").length / orders.length) * 100)}%` 
                        : "0%"}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--glass-border)] h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500" 
                      style={{ 
                        width: orders.length > 0 
                          ? `${(orders.filter(o => o.status === "FAILED").length / orders.length) * 100}%` 
                          : "0%" 
                      }}
                    />
                  </div>
                </div>

                {/* Booth occupancy levels */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest font-mono">Event Booth Allocations</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {booths.filter(b => b.eventId === selectedEvent?.id).map(booth => (
                      <div key={booth.id} className="flex items-center justify-between border-b border-[var(--glass-border)] pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${booth.status === "SOLD" ? "bg-rose-500" : booth.status === "RESERVED" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                          <span className="text-[var(--text-primary)] font-medium">{booth.name}</span>
                        </div>
                        <span className="text-[var(--text-secondary)] font-mono font-bold">
                          {booth.status === "SOLD" ? "Occupied" : booth.status === "RESERVED" ? "Reserved" : "Available"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Codes Inventory */}
                <div className="space-y-3 pt-2 border-t border-[var(--glass-border)]">
                  <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest font-mono">Promo Code Analytics</h4>
                  <div className="space-y-2">
                    {promoCodes.map(promo => (
                      <div key={promo.code} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                        <div>
                          <span className="font-mono text-[var(--text-primary)] font-bold">{promo.code}</span>
                          <span className="text-[10px] text-slate-400 ml-2">({promo.description})</span>
                        </div>
                        <span className="text-[var(--text-secondary)] font-mono">{promo.usageCount} / {promo.usageLimit} used</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SAGA & KAFKA EVENT VISUALIZER */}
        {activeTab === "saga" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold font-display text-[var(--text-primary)] font-outfit">SAGA Kafka Orchestrator</h2>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                  Real-time transaction trace simulation: <strong>{sagaType === "TICKET" ? "Attendee Ticket checkout" : sagaType === "BOOTH" ? "Vendor Booth lease" : "Venue-Event Alignment"} SAGA</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSagaLogs([]);
                  setSagaState("idle");
                }}
                className="bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] rounded-xl flex items-center gap-1.5 transition-colors self-start md:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear Logs
              </button>
            </div>

            {/* Visualizer Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              
              {/* Event Driven flow simulation */}
              <div className="lg:col-span-2 glass rounded-2xl border border-[var(--glass-border)] p-6 flex flex-col justify-between min-h-[480px] relative overflow-hidden">
                
                {/* Visual flowchart */}
                <div className="space-y-8 my-auto relative z-10">
                  <div className="flex justify-between items-center gap-4 relative">
                    
                    {/* Background Connection Line */}
                    <div className="absolute top-[20px] left-[5%] right-[5%] h-1 bg-[var(--node-border)] -z-10 rounded"></div>
                    <div 
                      className={`absolute top-[20px] left-[5%] h-1 transition-all duration-700 -z-10 rounded ${
                        sagaState === "rollback-started" || sagaState === "rollback-complete" 
                          ? "bg-rose-500" 
                          : sagaState === "completed" 
                            ? "bg-emerald-500" 
                            : "bg-sky-500"
                      }`}
                      style={{ 
                        width: sagaState === "idle" ? "0%" 
                             : sagaState === "order-created" ? "20%" 
                             : sagaState === "tickets-reserved" ? "45%" 
                             : sagaState === "promo-applied" ? "70%" 
                             : sagaState === "payment-initiated" ? "90%" 
                             : "100%" 
                      }}
                    ></div>

                    {/* Step 1 Node */}
                    <div className="flex flex-col items-center gap-2 w-1/5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all-custom ${
                        sagaState === "idle" 
                          ? "border-[var(--node-border)] bg-[var(--node-bg)] text-[var(--text-secondary)]" 
                          : sagaState === "order-created" 
                            ? "border-sky-500 bg-sky-955 text-sky-400 shadow-md shadow-sky-900/30 scale-110" 
                            : sagaState === "rollback-started" || sagaState === "rollback-complete"
                              ? "border-rose-500 bg-rose-950/20 text-rose-400"
                              : "border-emerald-500 bg-emerald-950/20 text-emerald-400"
                      }`}>
                        {sagaState === "idle" ? "1" : (sagaState === "order-created" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />)}
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] text-center font-mono">Order-Service</span>
                    </div>

                    {/* Step 2 Node */}
                    <div className="flex flex-col items-center gap-2 w-1/5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all-custom ${
                        sagaState === "idle" || sagaState === "order-created" 
                          ? "border-[var(--node-border)] bg-[var(--node-bg)] text-[var(--text-secondary)]" 
                          : sagaState === "tickets-reserved" 
                            ? "border-sky-500 bg-sky-955 text-sky-400 shadow-md shadow-sky-900/30 scale-110" 
                            : sagaState === "rollback-started" || sagaState === "rollback-complete"
                              ? "border-rose-500 bg-rose-950/20 text-rose-400"
                              : "border-emerald-500 bg-emerald-950/20 text-emerald-400"
                      }`}>
                        {sagaState === "idle" || sagaState === "order-created" ? "2" : (sagaState === "tickets-reserved" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />)}
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] text-center font-mono">
                        {sagaType === "TICKET" ? "Ticket-Service" : sagaType === "BOOTH" ? "Booth-Service" : "Venue-Service"}
                      </span>
                    </div>

                    {/* Step 3 Node */}
                    <div className="flex flex-col items-center gap-2 w-1/5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all-custom ${
                        sagaState === "idle" || sagaState === "order-created" || sagaState === "tickets-reserved"
                          ? "border-[var(--node-border)] bg-[var(--node-bg)] text-[var(--text-secondary)]" 
                          : sagaState === "promo-applied" 
                            ? "border-sky-500 bg-sky-955 text-sky-400 shadow-md shadow-sky-905 scale-110" 
                            : sagaState === "rollback-started" || sagaState === "rollback-complete"
                              ? "border-rose-500 bg-rose-950/20 text-rose-400 animate-pulse"
                              : "border-emerald-500 bg-emerald-950/20 text-emerald-400"
                      }`}>
                        {sagaState === "idle" || sagaState === "order-created" || sagaState === "tickets-reserved" ? "3" : (sagaState === "promo-applied" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />)}
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] text-center font-mono">
                        {sagaType === "VENUE" ? "Contract-Service" : "Promo-Service"}
                      </span>
                    </div>

                    {/* Step 4 Node */}
                    <div className="flex flex-col items-center gap-2 w-1/5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all-custom ${
                        sagaState === "idle" || sagaState === "order-created" || sagaState === "tickets-reserved" || sagaState === "promo-applied"
                          ? "border-[var(--node-border)] bg-[var(--node-bg)] text-[var(--text-secondary)]" 
                          : sagaState === "payment-initiated" 
                            ? "border-sky-500 bg-sky-955 text-sky-400 shadow-md shadow-sky-905 scale-110" 
                            : sagaState === "rollback-started" || sagaState === "rollback-complete"
                              ? "border-rose-500 bg-rose-950/20 text-rose-400 font-bold"
                              : "border-emerald-500 bg-emerald-950/20 text-emerald-400"
                      }`}>
                        {sagaState === "idle" || sagaState === "order-created" || sagaState === "tickets-reserved" || sagaState === "promo-applied" ? "4" : (sagaState === "payment-initiated" ? <RefreshCw className="w-4 h-4 animate-spin" /> : (sagaState === "rollback-started" || sagaState === "rollback-complete" ? "X" : <Check className="w-4 h-4" />))}
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] text-center font-mono">
                        {sagaType === "VENUE" ? "Billing-Service" : "Payment-API"}
                      </span>
                    </div>

                    {/* Step 5 Node */}
                    <div className="flex flex-col items-center gap-2 w-1/5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all-custom ${
                        sagaState === "completed" 
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                          : sagaState === "rollback-complete" 
                            ? "border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                            : "border-[var(--node-border)] bg-[var(--node-bg)] text-[var(--text-secondary)]"
                      }`}>
                        {sagaState === "completed" ? <Check className="w-4 h-4" /> : (sagaState === "rollback-complete" ? <X className="w-4 h-4" /> : "5")}
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] text-center font-mono">
                        {sagaType === "VENUE" ? "Event-Service" : "Notify-Service"}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Architecture explanations */}
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-5 mt-6 space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-outfit">
                    <Info className="w-4 h-4 text-sky-400" />
                    How SAGA event-driven choreography works:
                  </h4>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed list-disc pl-4">
                    <li>Each microservice acts independently, triggered by Kafka domain events.</li>
                    <li>
                      {sagaType === "TICKET" 
                        ? "Row locking (SELECT FOR UPDATE) isolates ticket inventory updates before initiating payment processing."
                        : sagaType === "BOOTH"
                          ? "Before acquiring slot locks, Order-Service conducts an event-driven validation of the Vendor Profile state."
                          : "Venue reservation allocates dates and validates venue capacity matching the expected audience level."}
                    </li>
                    <li>If a failure happens downstream (e.g. Stripe card decline), the orchestrator triggers <strong>compensating transactions</strong> to release the reserved slot.</li>
                  </ul>
                </div>

              </div>

              {/* Console Logs Terminal */}
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 flex flex-col justify-between h-[480px]">
                <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-3 mb-3">
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Broker Feed
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">Kafka 2.13</span>
                </div>

                {/* Log Output */}
                <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[11px] pr-2">
                  {sagaLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-600 text-center px-4">
                      <span>No active transactions. Complete checkout or booth bookings to listen to event brokers.</span>
                    </div>
                  ) : (
                    sagaLogs.map((log, i) => (
                      <div key={i} className="leading-relaxed border-l-2 border-white/5 pl-2">
                        <span className="text-slate-600">[{log.time}]</span>{" "}
                        <span className="text-sky-400 font-bold">{log.service}:</span>{" "}
                        <span className={
                          log.type === "success" ? "text-emerald-400" 
                          : log.type === "error" ? "text-rose-400 font-semibold" 
                          : log.type === "event" ? "text-indigo-400 italic" 
                          : "text-[var(--text-primary)]"
                        }>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--glass-border)] flex items-center justify-between text-[10px] text-slate-500">
                  <span>Topic subscriptions: 5 active</span>
                  <span>SSL encrypted</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: EVENT ORGANIZERS MANAGEMENT */}
        {activeTab === "organizer" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Event Onboarding or Event Creator / Editor Form */}
            <div className="lg:col-span-2 space-y-6">
              {!activeOrganizerProfile ? (
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/25">
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[var(--text-primary)]">Event Organizer Verification</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Register and verify your organization credentials via OTP to manage and publish your events.</p>
                    </div>
                  </div>

                  {organizerRegStep === "form" ? (
                    <form onSubmit={handleRegisterOrganizerProfile} className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Organization Name *</label>
                        <input
                          type="text"
                          required
                          value={regOrgName}
                          onChange={(e) => setRegOrgName(e.target.value)}
                          placeholder="e.g. Acme Tech Events LLC"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Contact Person *</label>
                          <input
                            type="text"
                            required
                            value={regOrgContactName}
                            onChange={(e) => setRegOrgContactName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            value={regOrgPhone}
                            onChange={(e) => setRegOrgPhone(e.target.value)}
                            placeholder="e.g. +1 555-0199"
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={regOrgEmail}
                          onChange={(e) => setRegOrgEmail(e.target.value)}
                          placeholder="organizer@acme.com"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 rounded-xl text-xs transition"
                      >
                        Register Organizer
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOrganizerOtp} className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-[var(--text-secondary)] font-semibold">Enter SMS Verification OTP</label>
                          <span className="text-[10px] text-slate-500">Test OTP: <strong>123456</strong></span>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={organizerOtpInput}
                          onChange={(e) => setOrganizerOtpInput(e.target.value)}
                          placeholder="e.g. 123456"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-center text-sm tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full font-mono font-bold"
                        />
                        {organizerOtpError && (
                          <p className="text-rose-400 text-xs font-semibold text-center mt-1">{organizerOtpError}</p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setOrganizerRegStep("form");
                            setPendingOrganizerProfile(null);
                          }}
                          className="w-1/2 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs font-semibold py-2 rounded-xl text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="w-1/2 bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 rounded-xl text-xs transition shadow shadow-sky-955"
                        >
                          Verify & Access
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* Event Creator / Editor Form */
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] flex items-center gap-2 font-outfit">
                    <Plus className="w-6 h-6 text-sky-400" />
                    {orgEditingEventId ? "Update Event Details" : "Organize New Event"}
                  </h2>
                  <form onSubmit={handleOrganizerSaveEvent} className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-[var(--text-secondary)] font-bold">Event Title *</label>
                        <input
                          type="text"
                          required
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                          placeholder="e.g. Blockchain & Web3 Hackathon"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-sky-500 w-full"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-[var(--text-secondary)] font-bold">Category</label>
                        <select
                          value={newEventCategory}
                          onChange={(e) => setNewEventCategory(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full"
                        >
                          <option value="Technology">Technology</option>
                          <option value="Music">Music</option>
                          <option value="Food & Drink">Food & Drink</option>
                          <option value="Sports">Sports</option>
                          <option value="Gaming">Gaming</option>
                          <option value="Art & Design">Art & Design</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Description</label>
                      <textarea
                        rows={2}
                        value={newEventDesc}
                        onChange={(e) => setNewEventDesc(e.target.value)}
                        placeholder="Provide detailed description of domain agenda and ticketing policies."
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-sky-500 w-full resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-[var(--text-secondary)] font-bold">Event Date *</label>
                        <input
                          type="date"
                          required
                          value={newEventDate}
                          onChange={(e) => setNewEventDate(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-[var(--text-secondary)] font-bold">Ticket Price ($) *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={newEventPrice}
                          onChange={(e) => setNewEventPrice(e.target.value)}
                          placeholder="e.g. 49"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-[var(--text-secondary)] font-bold">Ticket Inventory *</label>
                        <input
                          type="number"
                          required
                          min={10}
                          value={newEventInventory}
                          onChange={(e) => setNewEventInventory(e.target.value)}
                          placeholder="e.g. 500"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-[var(--text-secondary)] font-bold block">Allocate Venue Property</label>
                        <select
                          value={adminSelectedVenueId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminSelectedVenueId(val);
                            if (val !== "none") {
                              const vn = venues.find(v => v.id === val);
                              if (vn) {
                                setNewEventLoc(`${vn.name}, ${vn.location}`);
                              }
                            }
                          }}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full"
                        >
                          <option value="none">None (Use Manual Location)</option>
                          {venues.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.name} (Max Cap: {v.capacity} pax)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-[var(--text-secondary)] font-bold">Address/Location *</label>
                        <input
                          type="text"
                          required
                          value={newEventLoc}
                          onChange={(e) => setNewEventLoc(e.target.value)}
                          placeholder="Enter event venue address..."
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full"
                        />
                      </div>
                    </div>

                    {/* Geocoding parameters auto-fill */}
                    <div className="p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl space-y-2 text-xs">
                      <span className="text-[10px] text-sky-400 font-bold block font-mono">Geographical details (Auto-filled on address change)</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">City</label>
                          <input
                            type="text"
                            value={newEventCity}
                            onChange={(e) => setNewEventCity(e.target.value)}
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2.5 text-[10px] text-[var(--text-primary)] w-full focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">State</label>
                          <input
                            type="text"
                            value={newEventState}
                            onChange={(e) => setNewEventState(e.target.value)}
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2.5 text-[10px] text-[var(--text-primary)] w-full focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Zipcode</label>
                          <input
                            type="text"
                            value={newEventZipcode}
                            onChange={(e) => setNewEventZipcode(e.target.value)}
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2.5 text-[10px] text-[var(--text-primary)] w-full focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Vendor Selection Grid */}
                    <div className="space-y-2.5 pt-2 border-t border-[var(--glass-border)]">
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">Select Vendors for Event</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {newEventDate 
                            ? `Showing vendor availability for event date: ${newEventDate}`
                            : "Select an event date above to evaluate vendor availability."}
                        </span>
                      </div>

                      <div className="glass rounded-xl border border-[var(--glass-border)] overflow-hidden">
                        <div className="max-h-52 overflow-y-auto space-y-1.5 p-3 text-xs">
                          {vendorProfiles.length === 0 ? (
                            <p className="text-[11px] text-[var(--text-secondary)] italic text-center py-4">No registered vendors in catalog.</p>
                          ) : (
                            vendorProfiles.map(vendor => {
                              const dateMatches = newEventDate && vendor.availableDates?.includes(newEventDate);
                              
                              const isBooked = booths.some(b => 
                                b.vendorBusinessName === vendor.businessName && 
                                b.status === "SOLD" && 
                                events.find(ev => ev.id === b.eventId)?.date === newEventDate &&
                                b.eventId !== orgEditingEventId
                              );

                              const isAvailable = dateMatches && !isBooked;
                              const isChecked = orgSelectedVendorIds.includes(vendor.id);

                              return (
                                <div 
                                  key={vendor.id} 
                                  className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                                    isAvailable 
                                      ? "border-[var(--glass-border)] bg-[var(--input-bg)] text-[var(--text-primary)]" 
                                      : "border-slate-800 bg-slate-900/10 text-slate-500 opacity-60"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      disabled={!isAvailable}
                                      checked={isChecked}
                                      onChange={() => {
                                        if (isChecked) {
                                          setOrgSelectedVendorIds(prev => prev.filter(id => id !== vendor.id));
                                        } else {
                                          setOrgSelectedVendorIds(prev => [...prev, vendor.id]);
                                        }
                                      }}
                                      className="rounded border-slate-700 bg-transparent text-sky-500 focus:ring-0 focus:ring-offset-0 disabled:opacity-30 cursor-pointer"
                                    />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold">{vendor.businessName}</span>
                                        <span className="text-[9px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded font-bold">
                                          {vendor.category}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] mt-0.5">
                                        <span>Rating:</span>
                                        {renderStars(getAverageRating("VENDOR", vendor.id))}
                                        <span>•</span>
                                        <span className="font-bold text-sky-400">${vendor.pricing}/event</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    {isAvailable ? (
                                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                                        Available
                                      </span>
                                    ) : (
                                      <span className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                                        {isBooked ? "Booked" : "Unavailable"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sponsored Badge */}
                    <div className="bg-[var(--glass-bg)] rounded-xl p-3.5 border border-[var(--glass-border)] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">Feature as Sponsored Event?</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">Sponsored events display with gold border highlight and badge.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewEventIsSponsored(!newEventIsSponsored)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          newEventIsSponsored ? "bg-amber-500" : "bg-sky-500"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            newEventIsSponsored ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Sponsorship Packages Section */}
                    <div className="glass rounded-xl p-4 border border-[var(--glass-border)] space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Event Sponsor Packages</h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">Configure sponsorship tiers with specific pricing and benefits to invite brand sponsorships.</p>
                      </div>

                      {/* Package Add Form */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-[var(--text-secondary)] block uppercase">Tier/Package Name</label>
                          <input
                            type="text"
                            value={newPackageName}
                            onChange={(e) => setNewPackageName(e.target.value)}
                            placeholder="e.g. Platinum Tier"
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-[var(--text-secondary)] block uppercase">Price ($)</label>
                          <input
                            type="number"
                            value={newPackagePrice}
                            onChange={(e) => setNewPackagePrice(e.target.value)}
                            placeholder="e.g. 5000"
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-3">
                          <label className="text-[9px] font-bold text-[var(--text-secondary)] block uppercase">Benefits (comma-separated list)</label>
                          <input
                            type="text"
                            value={newPackageBenefits}
                            onChange={(e) => setNewPackageBenefits(e.target.value)}
                            placeholder="e.g. Logo on website, 5 VIP Passes, Logo on Stage Banner"
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                          <button
                            type="button"
                            onClick={handleAddSponsorPackage}
                            className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-1.5 px-4 rounded-lg text-[10px] transition font-outfit"
                          >
                            + Add Tier Package
                          </button>
                        </div>
                      </div>

                      {/* Current Packages List */}
                      <div className="space-y-2">
                        {orgEventSponsorPackages.length === 0 ? (
                          <p className="text-[10px] text-[var(--text-secondary)] italic text-center py-2">No sponsorship tiers configured yet. Add at least one above to display sponsorship opportunities.</p>
                        ) : (
                          orgEventSponsorPackages.map(pkg => (
                            <div key={pkg.id} className="flex justify-between items-center bg-[var(--input-bg)] p-2 rounded-lg border border-[var(--input-border)] text-xs">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[var(--text-primary)]">{pkg.name}</span>
                                  <span className="text-sky-400 font-mono font-bold">${pkg.price}</span>
                                </div>
                                <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">Benefits: {pkg.benefits.join(", ")}</p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleRemoveSponsorPackage(pkg.id, e)}
                                className="text-rose-400 hover:text-rose-300 text-[10px] py-1 px-2 hover:bg-rose-500/10 rounded-lg transition"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>


                    <div className="flex gap-3 pt-2">
                      {orgEditingEventId && (
                        <button
                          type="button"
                          onClick={() => {
                            setOrgEditingEventId(null);
                            setNewEventTitle("");
                            setNewEventDesc("");
                            setNewEventLoc("");
                            setNewEventDate("");
                            setNewEventPrice("");
                            setNewEventInventory("");
                            setAdminSelectedVenueId("none");
                            setNewEventCity("");
                            setNewEventState("");
                            setNewEventZipcode("");
                            setNewEventLat("");
                            setNewEventLng("");
                            setNewEventIsSponsored(false);
                            setOrgSelectedVendorIds([]);
                          }}
                          className="w-1/3 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs font-semibold py-3 rounded-xl transition text-[var(--text-primary)] font-outfit"
                        >
                          Cancel Edit
                        </button>
                      )}
                      <button
                        type="submit"
                        className={`bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center gap-2 text-xs font-outfit ${
                          orgEditingEventId ? "w-2/3" : "w-full"
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        {orgEditingEventId ? "Update Event Details" : "Publish Event Catalog Listing"}
                      </button>
                    </div>

                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Organizer Session Badge & Organized Events Directory */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-display text-[var(--text-primary)] font-outfit">Organizer Console</h2>
              
              {activeOrganizerProfile ? (
                <div className="space-y-6">
                  {/* Active Profile Info */}
                  <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">Active Organization</span>
                        <h4 className="text-base font-bold text-[var(--text-primary)] mt-0.5">{activeOrganizerProfile.organizationName}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveOrganizerProfile(null);
                          setOrgEditingEventId(null);
                        }}
                        className="text-[var(--text-secondary)] hover:text-rose-400 text-xs font-semibold"
                      >
                        Disconnect
                      </button>
                    </div>

                    <div className="p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl space-y-2 text-xs text-[var(--text-primary)] relative z-10 font-sans">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Representative:</span>
                        <span className="font-semibold">{activeOrganizerProfile.contactName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Email:</span>
                        <span className="font-semibold">{activeOrganizerProfile.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Phone:</span>
                        <span className="font-semibold">{activeOrganizerProfile.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Status:</span>
                        <span className="text-emerald-400 font-bold uppercase">{activeOrganizerProfile.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* My Organized Events Directory */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase text-[var(--text-secondary)] font-mono tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-sky-400" />
                      My Listings ({events.filter(e => e.organizerId === activeOrganizerProfile.id).length})
                    </h3>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {events.filter(e => e.organizerId === activeOrganizerProfile.id).length === 0 ? (
                        <div className="text-center text-xs text-[var(--text-secondary)] py-12 border border-dashed border-[var(--glass-border)] rounded-2xl bg-[var(--glass-bg)]">
                          No organized events listed yet. Use the form on the left to publish your first event.
                        </div>
                      ) : (
                        events.filter(e => e.organizerId === activeOrganizerProfile.id).map(ev => {
                          const eventBooths = booths.filter(b => b.eventId === ev.id);
                          return (
                            <div key={ev.id} className="glass rounded-xl border border-[var(--glass-border)] p-4 space-y-3 relative overflow-hidden">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="font-bold text-sm text-[var(--text-primary)]">{ev.title}</h5>
                                    {ev.isSponsored && (
                                      <span className="text-amber-400 text-xs" title="Sponsored Event">★</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-[var(--text-secondary)] font-mono mt-1 flex gap-2.5">
                                    <span>Date: {ev.date}</span>
                                    <span>•</span>
                                    <span>Venue: {ev.venueId ? venues.find(v => v.id === ev.venueId)?.name : "Manual"}</span>
                                  </div>
                                </div>
                                <span className="font-mono text-xs font-bold text-sky-400">${ev.price}</span>
                              </div>

                              <div className="flex justify-between items-center text-[10px] bg-[var(--input-bg)] p-2 rounded-lg border border-[var(--input-border)]">
                                <span className="text-[var(--text-secondary)]">Tickets Sold: <strong>{ev.ticketsSold} / {ev.ticketInventory}</strong></span>
                                <span className="text-[var(--text-secondary)]">Vendor Booths: <strong>{eventBooths.length} allocated</strong></span>
                              </div>

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOrgEditingEventId(ev.id);
                                    setNewEventTitle(ev.title);
                                    setNewEventDesc(ev.description || "");
                                    setNewEventLoc(ev.location);
                                    setNewEventDate(ev.date);
                                    setNewEventPrice(ev.price.toString());
                                    setNewEventInventory(ev.ticketInventory.toString());
                                    setAdminSelectedVenueId(ev.venueId || "none");
                                    setNewEventCity(ev.city || "");
                                    setNewEventState(ev.state || "");
                                    setNewEventZipcode(ev.zipcode || "");
                                    setNewEventLat(ev.latitude ? ev.latitude.toString() : "");
                                    setNewEventLng(ev.longitude ? ev.longitude.toString() : "");
                                    setNewEventIsSponsored(!!ev.isSponsored);
                                    setOrgEventSponsorPackages(ev.sponsorPackages || []);
                                    
                                    const linkedVendors = eventBooths
                                      .map(b => vendorProfiles.find(v => v.businessName === b.vendorBusinessName)?.id)
                                      .filter((id): id is string => !!id);
                                    setOrgSelectedVendorIds(linkedVendors);
                                  }}
                                  className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 text-[10px] py-1 px-3 rounded-lg font-semibold transition"
                                >
                                  Edit details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] py-1 px-2 rounded-lg transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-12 text-center text-[var(--text-secondary)]">
                  <p>Please register and verify an Event Organizer account on the left to load console metrics.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: VENUE PROVIDERS MANAGEMENT */}
        {activeTab === "venues" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Vendor Session Badge & Venue Creator Form */}
            <div className="lg:col-span-1 space-y-6">
              {!activeVenueProvider ? (
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/25">
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[var(--text-primary)]">Venue Provider Verification</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Register and verify your company details via SMS OTP to manage your venue listings.</p>
                    </div>
                  </div>

                  {vpRegStep === "form" ? (
                    <form onSubmit={handleRegisterVenueProvider} className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Company / Venue Provider Name *</label>
                        <input
                          type="text"
                          required
                          value={vpRegCompanyName}
                          onChange={(e) => setVpRegCompanyName(e.target.value)}
                          placeholder="e.g. Apex Venues Ltd."
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Contact Name *</label>
                        <input
                          type="text"
                          required
                          value={vpRegContactName}
                          onChange={(e) => setVpRegContactName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={vpRegEmail}
                            onChange={(e) => setVpRegEmail(e.target.value)}
                            placeholder="venues@apex.com"
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            value={vpRegPhone}
                            onChange={(e) => setVpRegPhone(e.target.value)}
                            placeholder="+1 555-0155"
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 mt-2"
                      >
                        <Smartphone className="w-4 h-4" />
                        Send Verification OTP
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyVenueProviderOtp} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                          <label className="font-semibold">Verification Code</label>
                          <span>Verification code: <strong>555888</strong></span>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={vpOtpInput}
                          onChange={(e) => setVpOtpInput(e.target.value)}
                          placeholder="e.g. 555888"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3 text-center text-lg tracking-widest text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 font-mono font-bold w-full focus:outline-none focus:border-indigo-500"
                        />
                        {vpOtpError && (
                          <p className="text-rose-400 text-xs text-center font-medium mt-1 flex items-center justify-center gap-1">
                            <X className="w-3.5 h-3.5" /> {vpOtpError}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => setVpRegStep("form")}
                          className="w-1/2 bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-xs py-2 rounded-xl text-[var(--text-secondary)]"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="w-1/2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2 rounded-xl text-xs transition"
                        >
                          Verify OTP
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Verified Session Badge */}
                  <div className="glass rounded-xl border border-indigo-500/25 bg-indigo-950/5 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{activeVenueProvider.companyName}</h4>
                        <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono font-bold">Verified Provider</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveVenueProvider(null)}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs"
                    >
                      Disconnect
                    </button>
                  </div>

                  {/* List Venue Form Card */}
                  <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                    <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-outfit">
                      <Plus className="w-4 h-4 text-indigo-400" />
                      List New Venue
                    </h3>
                    
                    <form onSubmit={handleCreateVenue} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Venue Name *</label>
                        <input
                          type="text"
                          required
                          value={newVenueName}
                          onChange={(e) => setNewVenueName(e.target.value)}
                          placeholder="e.g. Pacific Center Pavilion"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Description</label>
                        <textarea
                          rows={2}
                          value={newVenueDesc}
                          onChange={(e) => setNewVenueDesc(e.target.value)}
                          placeholder="Provide summary of amenities and spaces..."
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Address/Location *</label>
                        <input
                          type="text"
                          required
                          value={newVenueLoc}
                          onChange={(e) => setNewVenueLoc(e.target.value)}
                          placeholder="e.g. 101 Market St, SF, CA"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      {/* Collapsible Advanced Geolocation Data for Venue */}
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setShowVenueGeoOverrides(!showVenueGeoOverrides)}
                          className="text-[10px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 focus:outline-none"
                        >
                          {showVenueGeoOverrides ? "▼ Hide" : "▶ Show"} Advanced Geolocation & Address Details (Auto-Parsed)
                        </button>

                        {showVenueGeoOverrides && (
                          <div className="p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[8px] font-bold text-[var(--text-secondary)] uppercase">City</label>
                                <input
                                  type="text"
                                  value={newVenueCity}
                                  onChange={(e) => setNewVenueCity(e.target.value)}
                                  placeholder="City"
                                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-[10px] text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-[var(--text-secondary)] uppercase">State</label>
                                <select
                                  value={newVenueState}
                                  onChange={(e) => setNewVenueState(e.target.value)}
                                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-[10px] text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-sans"
                                >
                                  {US_STATES.map((st) => (
                                    <option key={st.code} value={st.code} className="bg-[var(--node-bg)] text-[var(--text-primary)]">
                                      {st.code ? `${st.code} - ${st.name}` : st.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-[var(--text-secondary)] uppercase">Zipcode</label>
                                <input
                                  type="text"
                                  value={newVenueZipcode}
                                  onChange={(e) => setNewVenueZipcode(e.target.value)}
                                  placeholder="Zipcode"
                                  maxLength={5}
                                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-[10px] text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] font-bold text-[var(--text-secondary)] uppercase">Latitude</label>
                                <input
                                  type="number"
                                  step="0.000001"
                                  value={newVenueLat}
                                  onChange={(e) => setNewVenueLat(e.target.value)}
                                  placeholder="Latitude"
                                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-[10px] text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-[var(--text-secondary)] uppercase">Longitude</label>
                                <input
                                  type="number"
                                  step="0.000001"
                                  value={newVenueLng}
                                  onChange={(e) => setNewVenueLng(e.target.value)}
                                  placeholder="Longitude"
                                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-[10px] text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Capacity *</label>
                          <input
                            type="number"
                            required
                            min={10}
                            value={newVenueCapacity}
                            onChange={(e) => setNewVenueCapacity(e.target.value)}
                            placeholder="Capacity"
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Parking Spots *</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={newVenueParking}
                            onChange={(e) => setNewVenueParking(e.target.value)}
                            placeholder="Parking Spots"
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Services Checkboxes */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Services & Amenities</span>
                        <div className="grid grid-cols-2 gap-1.5 text-xs p-2.5 bg-[var(--input-bg)] rounded-lg border border-[var(--input-border)] font-sans">
                          {["Catering", "AV Setup", "Staging", "Valet Parking", "Security"].map(srv => {
                            const isChecked = newVenueServices.includes(srv);
                            return (
                              <label key={srv} className="flex items-center gap-1.5 cursor-pointer text-[var(--text-primary)] font-medium">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setNewVenueServices(prev => prev.filter(s => s !== srv));
                                    } else {
                                      setNewVenueServices(prev => [...prev, srv]);
                                    }
                                  }}
                                  className="rounded border-slate-700 bg-transparent text-indigo-500 focus:ring-0 focus:ring-offset-0"
                                />
                                {srv}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Available Dates Multi-select Checkboxes */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Date Availability *</span>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] p-2.5 bg-[var(--input-bg)] rounded-lg border border-[var(--input-border)] max-h-24 overflow-y-auto font-sans">
                          {["2026-06-25", "2026-06-26", "2026-07-12", "2026-07-13", "2026-08-05", "2026-08-06", "2026-09-15", "2026-10-10", "2026-10-20"].map(dt => {
                            const isChecked = newVenueDates.includes(dt);
                            return (
                              <label key={dt} className="flex items-center gap-1.5 cursor-pointer text-[var(--text-primary)] font-medium">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setNewVenueDates(prev => prev.filter(d => d !== dt));
                                    } else {
                                      setNewVenueDates(prev => [...prev, dt]);
                                    }
                                  }}
                                  className="rounded border-slate-700 bg-transparent text-indigo-500 focus:ring-0 focus:ring-offset-0"
                                />
                                {dt}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 rounded-xl text-xs transition"
                      >
                        List Venue Property
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Right Columns: My Venues List & Booking Calendar */}
            <div className="lg:col-span-2 space-y-6">
              {activeVenueProvider ? (
                <div className="space-y-6">
                  {/* Tab Selector */}
                  <div className="flex gap-4 border-b border-[var(--glass-border)] pb-2">
                    <h3 className="text-xl font-bold font-display text-[var(--text-primary)] font-outfit">Provider Console</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* Venues Owned */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase text-[var(--text-secondary)] font-mono tracking-wider flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-indigo-400" />
                        My Properties ({venues.filter(v => v.providerId === activeVenueProvider.id).length})
                      </h4>

                      <div className="space-y-3">
                        {venues.filter(v => v.providerId === activeVenueProvider.id).length === 0 ? (
                          <div className="text-center text-xs text-[var(--text-secondary)] py-12 border border-dashed border-[var(--glass-border)] rounded-2xl bg-[var(--glass-bg)]">
                            No listed venue properties found. List a property in the form to get bookings.
                          </div>
                        ) : (
                          venues.filter(v => v.providerId === activeVenueProvider.id).map(vn => (
                            <div key={vn.id} className="glass rounded-xl border border-[var(--glass-border)] overflow-hidden">
                              <div className="relative h-24 bg-[var(--input-bg)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={vn.imageUrl} alt={vn.name} className="w-full h-full object-cover opacity-75" />
                                <span className="absolute bottom-2 right-2 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                                  CAP: {vn.capacity} pax
                                </span>
                              </div>
                              <div className="p-3 space-y-1.5 text-xs">
                                <h5 className="font-bold text-sm text-[var(--text-primary)]">{vn.name}</h5>
                                <div className="flex items-center my-0.5">
                                  {(() => {
                                    const rating = getAverageRating("VENUE", vn.id);
                                    const count = getReviewCount("VENUE", vn.id);
                                    return rating > 0 ? (
                                      <div className="flex items-center gap-1">
                                        {renderStars(rating)}
                                        <span className="text-[10px] text-[var(--text-secondary)]">({count})</span>
                                      </div>
                                    ) : (
                                      <span className="text-[9px] text-[var(--text-secondary)]/75 italic">No reviews yet</span>
                                    );
                                  })()}
                                </div>
                                <p className="text-[var(--text-secondary)] text-[11px] line-clamp-2">{vn.description}</p>
                                <p className="text-[var(--text-secondary)] text-[10px] italic flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-indigo-400" /> {vn.location}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {vn.services.map(s => (
                                    <span key={s} className="bg-[var(--glass-border)] text-[var(--text-primary)] text-[9px] px-1.5 py-0.5 rounded font-semibold">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                                <div className="pt-2 border-t border-[var(--glass-border)]">
                                  <span className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block">Available Dates:</span>
                                  <p className="font-mono text-[9px] text-indigo-400 font-semibold">{vn.availableDates.join(", ")}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Booking Calendar View */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase text-[var(--text-secondary)] font-mono tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        Availability Calendar
                      </h4>

                      {/* Interactive Calendar grid */}
                      <div className="glass rounded-2xl border border-[var(--glass-border)] p-4 space-y-4">
                        
                        {/* Calendar Month Header */}
                        <div className="flex justify-between items-center text-sm font-bold text-[var(--text-primary)]">
                          <button 
                            type="button"
                            onClick={() => setCurrentCalMonth(prev => prev === 5 ? 7 : prev - 1)}
                            className="p-1 hover:bg-[var(--glass-border)] rounded transition-colors text-xs"
                          >
                            &larr;
                          </button>
                          <span>{currentCalMonth === 5 ? "June 2026" : currentCalMonth === 6 ? "July 2026" : "August 2026"}</span>
                          <button 
                            type="button"
                            onClick={() => setCurrentCalMonth(prev => prev === 7 ? 5 : prev + 1)}
                            className="p-1 hover:bg-[var(--glass-border)] rounded transition-colors text-xs"
                          >
                            &rarr;
                          </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                          {/* Weekdays */}
                          {["M", "T", "W", "T", "F", "S", "S"].map(w => (
                            <span key={w} className="font-bold text-[var(--text-secondary)] py-1 font-mono">{w}</span>
                          ))}

                          {/* Empty spaces at start offset */}
                          {Array.from({ length: currentCalMonth === 5 ? 0 : currentCalMonth === 6 ? 2 : 5 }).map((_, i) => (
                            <span key={`empty-${i}`} className="py-2 opacity-0">.</span>
                          ))}

                          {/* Calendar Days */}
                          {Array.from({ length: currentCalMonth === 5 ? 30 : currentCalMonth === 6 ? 31 : 31 }).map((_, i) => {
                            const day = i + 1;
                            const monthStr = String(currentCalMonth + 1).padStart(2, "0");
                            const dayStr = String(day).padStart(2, "0");
                            const dateYmd = `2026-${monthStr}-${dayStr}`;

                            const providerVenues = venues.filter(v => v.providerId === activeVenueProvider.id);
                            const dayBooking = venueBookings.find(b => 
                              b.date === dateYmd && 
                              b.status === "CONFIRMED" && 
                              providerVenues.some(v => v.id === b.venueId)
                            );

                            const isSelected = selectedCalendarDay === dateYmd;

                            return (
                              <button
                                key={`day-${day}`}
                                type="button"
                                onClick={() => setSelectedCalendarDay(dateYmd)}
                                className={`py-2 rounded-lg font-mono font-bold flex flex-col items-center justify-center relative transition-colors ${
                                  dayBooking
                                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/35 hover:bg-indigo-500/20"
                                    : "hover:bg-[var(--glass-border)] text-[var(--text-primary)]"
                                } ${isSelected ? "ring-2 ring-indigo-500 scale-105" : ""}`}
                              >
                                <span>{day}</span>
                                {dayBooking && (
                                  <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Calendar Details Panel */}
                        <div className="pt-3 border-t border-[var(--glass-border)] text-xs font-sans">
                          {selectedCalendarDay ? (() => {
                            const providerVenues = venues.filter(v => v.providerId === activeVenueProvider.id);
                            const activeBooking = venueBookings.find(b => 
                              b.date === selectedCalendarDay && 
                              b.status === "CONFIRMED" && 
                              providerVenues.some(v => v.id === b.venueId)
                            );

                            if (activeBooking) {
                              const vnDetails = venues.find(v => v.id === activeBooking.venueId);
                              return (
                                <div className="space-y-2 bg-[var(--input-bg)] p-3 rounded-xl border border-[var(--glass-border)]">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-[var(--text-primary)] text-sm">{activeBooking.eventTitle}</span>
                                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono uppercase text-[9px] font-bold">
                                      {activeBooking.status}
                                    </span>
                                  </div>
                                  <p className="text-[var(--text-secondary)] text-[11px]">
                                    Venue Allocated: <strong>{vnDetails?.name}</strong>
                                  </p>
                                  <p className="text-[var(--text-secondary)] text-[10px]">
                                    Lease Date: <strong className="font-mono text-indigo-400">{selectedCalendarDay}</strong>
                                  </p>
                                </div>
                              );
                            } else {
                              return (
                                <p className="text-[var(--text-secondary)] text-[11px] italic text-center py-2">
                                  No event bookings scheduled for date {selectedCalendarDay}.
                                </p>
                              );
                            }
                          })() : (
                            <p className="text-[var(--text-secondary)] text-[11px] italic text-center py-2">
                              Select a date in the calendar to view bookings.
                            </p>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-12 text-center text-[var(--text-secondary)] space-y-3">
                  <p>Please register and verify a Venue Provider account using the form on the left to load the booking calendar.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: SAGA & KAFKA EVENT VISUALIZER */}

      </main>

      {/* MFA OTP Verification Overlay Dialog (Checkout flow integration) */}
      {checkoutStep === "mfa" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="glass rounded-2xl border border-[var(--glass-border)] max-w-sm w-full p-6 space-y-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl"></div>

            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">2FA Verification</h3>
              <p className="text-xs text-[var(--text-secondary)]">Two-Factor Authentication is enabled. Please enter the OTP code to approve this purchase.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-[var(--text-secondary)] font-medium">Verification Code</label>
                  <span className="text-[10px] text-slate-500">Demo Code: <strong>123456</strong></span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-center text-lg tracking-widest text-[var(--text-primary)] placeholder-slate-655 focus:outline-none focus:border-sky-500 w-full font-mono font-bold"
                />
                {otpError && (
                  <p className="text-rose-400 text-xs font-medium mt-1 text-center flex items-center justify-center gap-1">
                    <X className="w-3.5 h-3.5" /> {otpError}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutStep("form");
                    setIsCheckingOut(false);
                    setOtpCode("");
                    setOtpError(null);
                  }}
                  className="w-1/2 bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-xs font-semibold py-2.5 rounded-xl transition text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={verifyCheckoutMfa}
                  className="w-1/2 bg-sky-500 hover:bg-sky-400 text-xs font-bold py-2.5 rounded-xl transition shadow shadow-sky-955 text-white"
                >
                  Approve Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA SETUP MODAL DIALOG */}
      {show2FaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="glass rounded-2xl border border-[var(--glass-border)] max-w-md w-full p-6 space-y-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl"></div>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Setup Authenticator</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Configure your authentication app for secure transaction checks.</p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShow2FaModal(false);
                  setOtpCode("");
                  setOtpError(null);
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]">
              {/* Fake QR code */}
              <div className="bg-white p-2.5 rounded-xl shrink-0">
                <svg className="w-24 h-24 text-slate-950" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="white"/>
                  <rect x="5" y="5" width="20" height="20" fill="black"/>
                  <rect x="75" y="5" width="20" height="20" fill="black"/>
                  <rect x="5" y="75" width="20" height="20" fill="black"/>
                  <rect x="30" y="30" width="40" height="40" fill="black"/>
                  <rect x="15" y="45" width="10" height="10" fill="black"/>
                  <rect x="75" y="75" width="20" height="20" fill="black"/>
                  <rect x="45" y="75" width="20" height="10" fill="black"/>
                  <rect x="75" y="45" width="10" height="20" fill="black"/>
                </svg>
              </div>

              <div className="space-y-2 text-xs text-[var(--text-secondary)] text-center md:text-left">
                <p><strong>Step 1:</strong> Scan the QR code or enter this text key into Google Authenticator / Authy app:</p>
                <code className="bg-[var(--input-bg)] px-2.5 py-1.5 rounded font-mono text-[11px] text-sky-400 block font-bold text-center border border-[var(--glass-border)] select-all">
                  {temp2FaSecret}
                </code>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-[var(--text-secondary)] font-semibold">Step 2: Enter Verification Code</label>
                  <span className="text-[10px] text-slate-500">Test OTP: <strong>123456</strong></span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-center text-sm tracking-widest text-[var(--text-primary)] placeholder-slate-655 focus:outline-none focus:border-sky-500 w-full font-mono font-bold"
                />
                {otpError && (
                  <p className="text-rose-400 text-xs text-center font-medium mt-1 text-center flex items-center justify-center gap-1">
                    <X className="w-3.5 h-3.5" /> {otpError}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full bg-sky-500 hover:bg-sky-400 text-xs font-bold py-3 rounded-xl transition shadow shadow-sky-955 text-white"
              >
                Verify & Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPONSOR INTEREST MODAL DIALOG */}
      {showSponsorModal && sponsorSelectedEvent && sponsorSelectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="glass rounded-2xl border border-[var(--glass-border)] max-w-md w-full p-6 space-y-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl"></div>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-outfit">Sponsorship Application</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Apply for <strong className="text-amber-400">{sponsorSelectedPackage.name}</strong> (${sponsorSelectedPackage.price}) for <strong className="text-sky-400">{sponsorSelectedEvent.title}</strong>
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowSponsorModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sponsorStep === "form" ? (
              <form onSubmit={handleSponsorSubmitInterest} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={sponsorCompanyName}
                    onChange={(e) => setSponsorCompanyName(e.target.value)}
                    placeholder="e.g. Acme Tech Corp"
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={sponsorContactName}
                    onChange={(e) => setSponsorContactName(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={sponsorEmail}
                      onChange={(e) => setSponsorEmail(e.target.value)}
                      placeholder="e.g. sponsor@acme.com"
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={sponsorPhone}
                      onChange={(e) => setSponsorPhone(e.target.value)}
                      placeholder="e.g. +1 555-9080"
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-3 rounded-xl transition shadow text-xs font-outfit"
                >
                  Apply & Verify Contact
                </button>
              </form>
            ) : sponsorStep === "otp" ? (
              <form onSubmit={handleVerifySponsorOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-[var(--text-secondary)] font-semibold">Enter OTP Verification Code</label>
                    <span className="text-[10px] text-slate-500">Test OTP: <strong>123456</strong></span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={sponsorOtpInput}
                    onChange={(e) => setSponsorOtpInput(e.target.value)}
                    placeholder="e.g. 123456"
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-center text-sm tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full font-mono font-bold"
                  />
                  {sponsorOtpError && (
                    <p className="text-rose-400 text-xs text-center font-medium mt-1">{sponsorOtpError}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSponsorStep("form")}
                    className="w-1/2 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs font-semibold py-2.5 rounded-xl transition text-[var(--text-secondary)]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-amber-500 hover:bg-amber-400 text-white font-bold py-2.5 rounded-xl transition text-xs shadow shadow-amber-955"
                  >
                    Verify & Submit
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">Application Received!</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    Thank you! Your verified sponsorship interest has been submitted. The organizer and admin will review details for <strong className="text-indigo-400">{sponsorCompanyName}</strong> and contact you at <strong className="text-sky-400">{sponsorEmail}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSponsorModal(false)}
                  className="w-full bg-[var(--input-bg)] hover:bg-[var(--glass-border)] border border-[var(--glass-border)] text-xs py-2 rounded-xl transition font-semibold"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== EVENT DETAIL PAGE OVERLAY ===================== */}
      {showEventDetailPage && detailPageEvent && (
        <div className="event-detail-backdrop fixed inset-0 z-40 bg-[var(--bg-primary)] overflow-y-auto">
          <div className="event-detail-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

            {/* ── STICKY TOP BAR ── */}
            <div className="sticky top-0 z-10 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--glass-border)] py-3 flex items-center justify-between gap-4 mb-6">
              <button
                type="button"
                onClick={() => setShowEventDetailPage(false)}
                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium text-sm group"
              >
                <span className="p-1.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg group-hover:border-sky-500/40 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </span>
                Back to Catalog
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] px-3 py-1.5 rounded-lg font-mono">
                  {detailPageEvent.category}
                </span>
                {detailPageEvent.isSponsored && (
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                    ★ Sponsored Event
                  </span>
                )}
              </div>
            </div>

            {/* ── HERO BANNER ── */}
            <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detailPageEvent.imageUrl}
                alt={detailPageEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-black/40 to-transparent" />
              {detailPageEvent.isSponsored && (
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
              )}
              <div className="absolute bottom-0 left-0 p-6 sm:p-8 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {detailPageEvent.isSponsored && (
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                      ★ Sponsored
                    </span>
                  )}
                  <span className="text-xs bg-white/10 backdrop-blur-sm border border-white/20 text-sky-300 px-2.5 py-1 rounded-full font-semibold">
                    {detailPageEvent.category}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white font-outfit leading-tight drop-shadow-lg">
                  {detailPageEvent.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sky-300" />
                    {detailPageEvent.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-300" />
                    {detailPageEvent.location}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono font-bold text-emerald-300">
                    ${detailPageEvent.price}
                    <span className="text-white/50 font-normal font-sans text-xs">/ ticket</span>
                  </span>
                  {(() => {
                    const available = detailPageEvent.ticketInventory - detailPageEvent.ticketsSold;
                    if (available <= 0) return <span className="bg-rose-500/80 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">SOLD OUT</span>;
                    if (available <= 15) return <span className="bg-rose-500/80 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">Only {available} left!</span>;
                    return null;
                  })()}
                </div>
              </div>
            </div>

            {/* ── TWO-COLUMN BODY ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              {/* LEFT COLUMN: Main Content */}
              <div className="lg:col-span-2 space-y-6">

                {/* Star Ratings */}
                {(() => {
                  const rating = getAverageRating("EVENT", detailPageEvent.id);
                  const count = getReviewCount("EVENT", detailPageEvent.id);
                  return (
                    <div className="flex items-center gap-3">
                      {rating > 0 ? (
                        <>
                          <div className="flex items-center gap-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] px-3 py-2 rounded-xl">
                            {renderStars(rating)}
                            <span className="text-sm font-bold text-[var(--text-primary)] ml-1">{rating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-[var(--text-secondary)]">{count} {count === 1 ? "review" : "reviews"}</span>
                        </>
                      ) : (
                        <span className="text-sm text-[var(--text-secondary)] italic">No reviews yet — be the first!</span>
                      )}
                    </div>
                  );
                })()}

                {/* About This Event */}
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-3 relative overflow-hidden">
                  <div className="absolute -top-12 -left-12 w-40 h-40 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
                  <h2 className="text-lg font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                    <Info className="w-5 h-5 text-sky-400" />
                    About This Event
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {detailPageEvent.description || `Join us for ${detailPageEvent.title} — an exceptional gathering in the ${detailPageEvent.category} space. This event brings together enthusiasts, professionals, and newcomers for a day of learning, networking, and inspiration.`}
                  </p>
                  <div className="pt-3 border-t border-[var(--glass-border)] space-y-1.5">
                    <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                      <span>Ticket Availability</span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        {Math.max(0, detailPageEvent.ticketInventory - detailPageEvent.ticketsSold)} / {detailPageEvent.ticketInventory} remaining
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--glass-border)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (detailPageEvent.ticketsSold / detailPageEvent.ticketInventory) > 0.8 ? "bg-rose-500"
                            : (detailPageEvent.ticketsSold / detailPageEvent.ticketInventory) > 0.5 ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, (detailPageEvent.ticketsSold / detailPageEvent.ticketInventory) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Venue Details */}
                {(() => {
                  const vn = venues.find(v => v.id === detailPageEvent.venueId);
                  if (!vn) return null;
                  const vnRating = getAverageRating("VENUE", vn.id);
                  return (
                    <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 relative overflow-hidden">
                      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-indigo-400" />
                          Venue
                        </h2>
                        {vnRating > 0 && (
                          <div className="flex items-center gap-1.5 bg-[var(--glass-bg)] px-2.5 py-1 rounded-lg border border-[var(--glass-border)]">
                            {renderStars(vnRating)}
                          </div>
                        )}
                      </div>
                      <div className="bg-[var(--input-bg)] rounded-xl border border-[var(--glass-border)] p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-[var(--text-primary)]">{vn.name}</h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{vn.location}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-3 text-center">
                            <Users className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                            <span className="font-mono font-bold text-[var(--text-primary)] text-base block">{vn.capacity.toLocaleString()}</span>
                            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Max Capacity</span>
                          </div>
                          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-3 text-center">
                            <ArrowRight className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                            <span className="font-mono font-bold text-[var(--text-primary)] text-base block">{vn.parkingSpots}</span>
                            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Parking Spots</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {vn.services.map(s => (
                            <span key={s} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded font-semibold">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Sponsorship Opportunities */}
                {detailPageEvent.sponsorPackages && detailPageEvent.sponsorPackages.length > 0 && (
                  <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                    <h2 className="text-lg font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      Sponsorship Opportunities
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">Showcase your brand at this event. Select a tier and apply below.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {detailPageEvent.sponsorPackages.map(pkg => (
                        <div key={pkg.id} className="bg-[var(--input-bg)] border border-amber-500/20 rounded-xl p-4 space-y-3 hover:border-amber-400/40 transition-colors">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-[var(--text-primary)]">{pkg.name}</h3>
                            <span className="font-mono font-bold text-amber-400 text-lg">${pkg.price.toLocaleString()}</span>
                          </div>
                          <ul className="space-y-1.5">
                            {pkg.benefits.map((b, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                                {b}
                              </li>
                            ))}
                          </ul>
                          <button
                            type="button"
                            onClick={() => {
                              setSponsorSelectedEvent(detailPageEvent);
                              setSponsorSelectedPackage(pkg);
                              setSponsorCompanyName("");
                              setSponsorContactName("");
                              setSponsorEmail("");
                              setSponsorPhone("");
                              setSponsorOtpInput("");
                              setSponsorOtpError(null);
                              setSponsorStep("form");
                              setShowSponsorModal(true);
                            }}
                            className="w-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <Award className="w-3.5 h-3.5" /> Show Interest
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Community Reviews */}
                {(() => {
                  const evtReviews = reviews.filter(r => r.targetType === "EVENT" && r.targetId === detailPageEvent.id && r.status !== "HIDDEN" && r.status !== "FLAGGED_ABUSIVE");
                  return (
                    <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-400" />
                          Community Reviews
                        </h2>
                        <span className="text-xs text-[var(--text-secondary)] font-mono">{evtReviews.length} review{evtReviews.length !== 1 ? "s" : ""}</span>
                      </div>
                      {evtReviews.length === 0 ? (
                        <div className="text-center py-8 space-y-2">
                          <Star className="w-10 h-10 text-amber-400/20 mx-auto" />
                          <p className="text-sm text-[var(--text-secondary)]">No reviews yet — be the first to share your experience!</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                          {evtReviews.slice(0, 10).map(r => (
                            <div key={r.id} className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-4 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-sm text-[var(--text-primary)]">{r.authorName}</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">{renderStars(r.rating)}</div>
                                </div>
                                <span className="text-[10px] text-[var(--text-secondary)] font-mono">{r.date}</span>
                              </div>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{r.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* RIGHT COLUMN: Sticky Purchase Panel */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 space-y-4">

                  {/* Mode toggle */}
                  <div className="glass rounded-2xl border border-[var(--glass-border)] p-1 grid grid-cols-2 gap-1">
                    <button type="button"
                      onClick={() => { setBookingMode("TICKET"); setSelectedBooth(null); setAppliedPromo(""); setPromoSuccess(null); setPromoError(null); }}
                      className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${bookingMode === "TICKET" ? "bg-sky-500 text-white shadow" : "text-[var(--text-secondary)] hover:text-white"}`}>
                      <Ticket className="w-3.5 h-3.5" /> Tickets
                    </button>
                    <button type="button"
                      onClick={() => { setBookingMode("BOOTH"); setTicketQuantity(1); setAppliedPromo(""); setPromoSuccess(null); setPromoError(null); }}
                      className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${bookingMode === "BOOTH" ? "bg-sky-500 text-white shadow" : "text-[var(--text-secondary)] hover:text-white"}`}>
                      <Store className="w-3.5 h-3.5" /> Booths
                    </button>
                  </div>

                  {bookingMode === "TICKET" && (
                    <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-5 relative overflow-hidden">
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                      {/* Price */}
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-3xl font-bold font-mono text-[var(--text-primary)]">${detailPageEvent.price}</span>
                          <span className="text-sm text-[var(--text-secondary)] ml-1">/ ticket</span>
                        </div>
                        {(() => {
                          const avail = detailPageEvent.ticketInventory - detailPageEvent.ticketsSold;
                          return (
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg border font-mono ${avail <= 0 ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : avail <= 15 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
                              {avail <= 0 ? "SOLD OUT" : `${avail} left`}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <label className="text-xs text-[var(--text-secondary)] font-medium block">Number of Tickets</label>
                        <div className="flex items-center gap-3">
                          <button type="button" disabled={ticketQuantity <= 1} onClick={() => setTicketQuantity(prev => Math.max(1, prev - 1))}
                            className="w-10 h-10 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] hover:border-slate-600 disabled:opacity-40 font-bold flex items-center justify-center text-xl transition text-[var(--text-primary)]">−</button>
                          <span className="flex-1 text-center text-2xl font-bold font-mono text-[var(--text-primary)]">{ticketQuantity}</span>
                          <button type="button" disabled={ticketQuantity >= (detailPageEvent.ticketInventory - detailPageEvent.ticketsSold)} onClick={() => setTicketQuantity(prev => prev + 1)}
                            className="w-10 h-10 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] hover:border-slate-600 disabled:opacity-40 font-bold flex items-center justify-center text-xl transition text-[var(--text-primary)]">+</button>
                        </div>
                      </div>

                      {/* Promo */}
                      <div className="space-y-2 pt-2 border-t border-[var(--glass-border)]">
                        <label className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-indigo-400" /> Promo Code
                        </label>
                        <div className="flex gap-2">
                          <input type="text" value={appliedPromo}
                            onChange={e => { setAppliedPromo(e.target.value.toUpperCase()); setPromoSuccess(null); setPromoError(null); }}
                            placeholder="e.g. WELCOME10"
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/55 focus:outline-none focus:border-sky-500 w-full font-mono uppercase" />
                          <button type="button" onClick={verifyPromo}
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] hover:border-sky-500 text-xs px-3.5 rounded-xl transition text-[var(--text-primary)] font-medium">Apply</button>
                        </div>
                        {promoError && <p className="text-rose-400 text-xs font-medium flex items-center gap-1"><X className="w-3 h-3" />{promoError}</p>}
                        {promoSuccess && <p className="text-emerald-400 text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" />{promoSuccess}</p>}
                      </div>

                      {/* Payment gateway */}
                      <div className="space-y-2 pt-2 border-t border-[var(--glass-border)]">
                        <label className="text-xs text-[var(--text-secondary)] font-medium block">Payment Gateway</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => setPaymentGateway("Stripe")}
                            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition ${paymentGateway === "Stripe" ? "border-sky-500 bg-sky-500/10 text-sky-400" : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:border-sky-500/40"}`}>
                            <CreditCard className="w-3.5 h-3.5" /> Stripe
                          </button>
                          <button type="button" onClick={() => setPaymentGateway("PayPal")}
                            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition ${paymentGateway === "PayPal" ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:border-indigo-500/40"}`}>
                            <Zap className="w-3.5 h-3.5" /> PayPal
                          </button>
                        </div>
                      </div>

                      {/* Simulation toggle */}
                      <div className="bg-[var(--glass-bg)] rounded-xl p-3 border border-[var(--glass-border)] flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[var(--text-primary)] block">Simulate Payment Success?</span>
                          <span className="text-[10px] text-[var(--text-secondary)]">Toggle to trigger SAGA rollback.</span>
                        </div>
                        <button type="button" onClick={() => setSimulatePaymentFailure(!simulatePaymentFailure)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${simulatePaymentFailure ? "bg-rose-500" : "bg-sky-500"}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${simulatePaymentFailure ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>

                      {/* Cost summary */}
                      <div className="bg-[var(--input-bg)] rounded-xl p-4 border border-[var(--glass-border)] space-y-2">
                        <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                          <span>Subtotal ({ticketQuantity} ticket{ticketQuantity > 1 ? "s" : ""})</span>
                          <span className="font-mono text-[var(--text-primary)]">${pricingDetails.subtotal}</span>
                        </div>
                        {pricingDetails.discount > 0 && (
                          <div className="flex justify-between text-sm text-emerald-400">
                            <span>Promo Discount</span>
                            <span className="font-mono">−${pricingDetails.discount}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--glass-border)] text-xl">
                          <span>Total</span>
                          <span className="font-mono text-sky-400">${pricingDetails.total}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        type="button"
                        onClick={() => { setShowEventDetailPage(false); startCheckout(); }}
                        disabled={detailPageEvent.ticketInventory - detailPageEvent.ticketsSold <= 0}
                        className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 font-outfit"
                      >
                        <Ticket className="w-5 h-5" />
                        Book {ticketQuantity} Ticket{ticketQuantity > 1 ? "s" : ""} · ${pricingDetails.total}
                      </button>
                      <p className="text-[10px] text-center text-[var(--text-secondary)]">
                        Powered by {paymentGateway} · SAGA distributed checkout
                      </p>
                    </div>
                  )}

                  {bookingMode === "BOOTH" && (
                    <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 text-center">
                      <Store className="w-10 h-10 text-sky-400/40 mx-auto" />
                      <p className="text-sm text-[var(--text-secondary)]">To lease a vendor booth, return to the catalog and use the Booth booking panel.</p>
                      <button type="button" onClick={() => { setShowEventDetailPage(false); setBookingMode("BOOTH"); }}
                        className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-sky-500/40 text-xs py-2.5 rounded-xl font-semibold transition text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        Go to Booth Booking
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* =============================================================== */}

    </div>
  );
}

