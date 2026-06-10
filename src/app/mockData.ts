import {
  Event,
  PromoCode,
  Booth,
  VendorProfile,
  VenueProviderProfile,
  Venue,
  VenueBooking,
  Review
} from "./types";
import { ZIP_LOOKUP } from "./utils";

export const initialEvents: Event[] = [
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
    organizerId: "org-sarah",
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
    longitude: -105.1911,
    organizerId: "org-sarah"
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
    isSponsored: true,
    organizerId: "org-sarah"
  }
];

export const initialPromoCodes: PromoCode[] = [
  { code: "WELCOME10", discountType: "PERCENTAGE", value: 10, description: "10% off for new users", usageLimit: 500, usageCount: 242 },
  { code: "AURA50", discountType: "PERCENTAGE", value: 50, description: "Special 50% discount on tech events", usageLimit: 50, usageCount: 15 },
  { code: "EARLYBIRD", discountType: "FIXED", value: 30, description: "$30 off early bookings", usageLimit: 100, usageCount: 98 }
];

export const initialBooths: Booth[] = [
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

export const initialVendorProfiles: VendorProfile[] = [
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

export const initialVenueProviders: VenueProviderProfile[] = [
  { id: "vp-1", companyName: "SF Bay Area Venues", contactName: "Sarah Connor", email: "sarah@sfvenues.com", phone: "+1 555-9011", status: "VERIFIED" },
  { id: "vp-2", companyName: "Colorado Parks & Arenas", contactName: "David Miller", email: "david@coparks.org", phone: "+1 555-3022", status: "VERIFIED" },
  { id: "vp-3", companyName: "Napa Luxury Vineyards", contactName: "Elena Rostova", email: "elena@napavineyards.com", phone: "+1 555-7033", status: "VERIFIED" }
];

export const initialVenues: Venue[] = [
  {
    id: "vn-1",
    providerId: "vp-1",
    name: "San Francisco Center",
    type: "Convention Center",
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
    type: "Outdoor Venue",
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
    type: "Outdoor Venue",
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

export const initialVenueBookings: VenueBooking[] = [
  { id: "vb-1", venueId: "vn-1", eventId: "evt-1", eventTitle: "Global Tech Summit 2026", date: "2026-06-25", status: "CONFIRMED" },
  { id: "vb-2", venueId: "vn-2", eventId: "evt-2", eventTitle: "Symphony Under the Stars", date: "2026-07-12", status: "CONFIRMED" },
  { id: "vb-3", venueId: "vn-3", eventId: "evt-3", eventTitle: "International Food & Wine Festival", date: "2026-08-05", status: "CONFIRMED" }
];

export const initialReviews: Review[] = [
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
        type: "Convention Center",
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
