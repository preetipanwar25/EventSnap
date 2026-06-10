import React from "react";

// US States Dropdown constant
export const US_STATES = [
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
export const ZIP_LOOKUP: Record<string, { city: string; state: string; lat: number; lng: number }> = {
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

// Helper to check for abusive keywords
export const containsAbusiveContent = (text: string) => {
  const lowercase = text.toLowerCase();
  return ["scam", "spam", "abuse", "fake"].some(word => lowercase.includes(word));
};

// Helper to render star ratings out of 5
export const renderStars = (rating: number) => {
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
export const normalizeDateToYmd = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (e) { }
  return "";
};

// Helper functions for location parsing and geocoding
export const parseLocationDetails = (locStr: string) => {
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

export const getDistanceInMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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
