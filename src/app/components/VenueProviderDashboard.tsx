import React, { useState, useEffect } from "react";
import { ShieldAlert, UserCheck, Plus, Edit2, Store, Calendar, MapPin, X, Smartphone } from "lucide-react";
import { VenueProviderProfile, Venue, VenueBooking, Review, UserProfile } from "../types";
import { parseLocationDetails, US_STATES } from "../utils";

interface VenueProviderDashboardProps {
  activeVenueProvider: VenueProviderProfile | null;
  setActiveVenueProvider: (p: VenueProviderProfile | null) => void;
  venueProviders: VenueProviderProfile[];
  setVenueProviders: React.Dispatch<React.SetStateAction<VenueProviderProfile[]>>;
  venues: Venue[];
  setVenues: React.Dispatch<React.SetStateAction<Venue[]>>;
  venueBookings: VenueBooking[];
  setVenueBookings: React.Dispatch<React.SetStateAction<VenueBooking[]>>;
  otpVerificationEnabled: boolean;
  addSagaLog: (service: string, message: string, type: "info" | "success" | "error" | "event") => void;
  getAverageRating: (targetType: "EVENT" | "VENUE" | "VENDOR" | "SITE", targetId: string) => number;
  getReviewCount: (targetType: "EVENT" | "VENUE" | "VENDOR" | "SITE", targetId: string) => number;
  renderStars: (rating: number) => React.ReactNode;
}

export const VenueProviderDashboard: React.FC<VenueProviderDashboardProps> = ({
  activeVenueProvider,
  setActiveVenueProvider,
  venueProviders,
  setVenueProviders,
  venues,
  setVenues,
  venueBookings,
  setVenueBookings,
  otpVerificationEnabled,
  addSagaLog,
  getAverageRating,
  getReviewCount,
  renderStars
}) => {
  // Venue Provider Registration State
  const [vpRegStep, setVpRegStep] = useState<"form" | "otp">("form");
  const [vpRegCompanyName, setVpRegCompanyName] = useState("");
  const [vpRegContactName, setVpRegContactName] = useState("");
  const [vpRegEmail, setVpRegEmail] = useState("");
  const [vpRegPhone, setVpRegPhone] = useState("");
  const [vpOtpInput, setVpOtpInput] = useState("");
  const [vpOtpError, setVpOtpError] = useState<string | null>(null);
  const [pendingVenueProvider, setPendingVenueProvider] = useState<VenueProviderProfile | null>(null);

  // Venue Provider: Editing & Calendar Filter states
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [selectedCalVenueId, setSelectedCalVenueId] = useState<string>("ALL");
  const [showVenueGeoOverrides, setShowVenueGeoOverrides] = useState(false);

  // New Venue Creation Form State
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueType, setNewVenueType] = useState<"Convention Center" | "Hotel" | "Banquet Hall" | "Stadium" | "Conference Room" | "Outdoor Venue">("Convention Center");
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
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  // Auto-fill parsed details for Venue Location
  useEffect(() => {
    const parsed = parseLocationDetails(newVenueLoc);
    setNewVenueCity(parsed.city);
    setNewVenueState(parsed.state);
    setNewVenueZipcode(parsed.zipcode);
    setNewVenueLat(parsed.latitude.toString());
    setNewVenueLng(parsed.longitude.toString());
  }, [newVenueLoc]);

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
      status: otpVerificationEnabled ? "PENDING" : "VERIFIED"
    };

    if (otpVerificationEnabled) {
      setPendingVenueProvider(newProvider);
      setVpRegStep("otp");
      setVpOtpInput("");
      setVpOtpError(null);
    } else {
      setVenueProviders(prev => [...prev, newProvider]);
      setActiveVenueProvider(newProvider);
      setPendingVenueProvider(null);
      setVpRegStep("form");
      alert("Venue Provider profile registered successfully!");
    }
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

  // Venue Provider: List New Venue / Update Venue Action
  const handleCreateVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVenueProvider) return;
    if (!newVenueName || !newVenueLoc || !newVenueCapacity || !newVenueParking) {
      alert("Please fill in all required venue fields.");
      return;
    }

    if (editingVenueId) {
      // Conflict detection: verify if any dates being removed are currently booked
      const originalVenue = venues.find(v => v.id === editingVenueId);
      if (originalVenue) {
        const removedDates = originalVenue.availableDates.filter(d => !newVenueDates.includes(d));
        const conflictingBookings = venueBookings.filter(b =>
          b.venueId === editingVenueId &&
          b.status === "CONFIRMED" &&
          removedDates.includes(b.date)
        );

        if (conflictingBookings.length > 0) {
          const conflictList = conflictingBookings.map(b => `"${b.eventTitle}" on ${b.date}`).join(", ");
          alert(`Conflict Detected: You cannot remove availability for dates that have confirmed bookings. Active bookings: ${conflictList}`);
          return;
        }
      }

      const updatedVenues = venues.map(vn => {
        if (vn.id === editingVenueId) {
          return {
            ...vn,
            name: newVenueName,
            type: newVenueType,
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
        }
        return vn;
      });
      setVenues(updatedVenues);
      alert(`Venue "${newVenueName}" successfully updated!`);
      setEditingVenueId(null);
    } else {
      const newVn: Venue = {
        id: `vn-${venues.length + 1}`,
        providerId: activeVenueProvider.id,
        name: newVenueName,
        type: newVenueType,
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
    }

    // Reset Form
    setNewVenueName("");
    setNewVenueType("Convention Center");
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-[fadeIn_0.3s_ease-out]">

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

                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="flex-[2] bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-4 h-4" />
                    Send Verification OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVenueProvider({
                        id: "vp-1",
                        companyName: "SF Bay Area Venues",
                        contactName: "Sarah Connor",
                        email: "sarah@sfvenues.com",
                        phone: "+1 555-9011",
                        status: "VERIFIED"
                      });
                      addSagaLog("Auth-Service", `Mock login: Switched role to [ORGANIZER] and loaded Venue Provider via Quick Mock Login.`, "info");
                    }}
                    className="flex-[1] bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-[10px] px-2 rounded-xl text-[var(--text-secondary)] font-semibold transition"
                    title="Quickly bypass verification using mock credentials"
                  >
                    Quick Bypass
                  </button>
                </div>
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
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-outfit">
                  {editingVenueId ? <Edit2 className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4 text-indigo-400" />}
                  {editingVenueId ? "Edit Venue" : "List New Venue"}
                </h3>
                {editingVenueId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVenueId(null);
                      setNewVenueName("");
                      setNewVenueType("Convention Center");
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
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleCreateVenue} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
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
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Venue Type *</label>
                    <select
                      value={newVenueType}
                      onChange={(e) => setNewVenueType(e.target.value as any)}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-sans cursor-pointer"
                    >
                      <option value="Convention Center" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Convention Center</option>
                      <option value="Hotel" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Hotel</option>
                      <option value="Banquet Hall" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Banquet Hall</option>
                      <option value="Stadium" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Stadium</option>
                      <option value="Conference Room" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Conference Room</option>
                      <option value="Outdoor Venue" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Outdoor Venue</option>
                    </select>
                  </div>
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
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 rounded-xl text-xs transition animate-pulse-hover"
                >
                  {editingVenueId ? "Save Venue Changes" : "List Venue Property"}
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
                    venues.filter(v => v.providerId === activeVenueProvider.id).map(vn => {
                      const isSelected = selectedCalVenueId === vn.id;
                      return (
                        <div
                          key={vn.id}
                          onClick={() => setSelectedCalVenueId(isSelected ? "ALL" : vn.id)}
                          className={`glass rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] ${isSelected
                            ? "border-indigo-500 ring-2 ring-indigo-500/35 bg-indigo-950/5"
                            : "border-[var(--glass-border)] hover:border-indigo-500/30"
                            }`}
                        >
                          <div className="relative h-24 bg-[var(--input-bg)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={vn.imageUrl} alt={vn.name} className="w-full h-full object-cover opacity-75" />
                            <span className="absolute bottom-2 right-2 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                              CAP: {vn.capacity} pax
                            </span>
                          </div>
                          <div className="p-3 space-y-1.5 text-xs">
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="font-bold text-sm text-[var(--text-primary)]">{vn.name}</h5>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation(); // prevent calendar toggle click
                                  setEditingVenueId(vn.id);
                                  setNewVenueName(vn.name);
                                  setNewVenueType(vn.type);
                                  setNewVenueDesc(vn.description || "");
                                  setNewVenueLoc(vn.location);
                                  setNewVenueCapacity(vn.capacity.toString());
                                  setNewVenueParking(vn.parkingSpots.toString());
                                  setNewVenueServices(vn.services);
                                  setNewVenueDates(vn.availableDates);
                                  setNewVenueImageUrl(vn.imageUrl || "");
                                  setNewVenueCity(vn.city || "");
                                  setNewVenueState(vn.state || "");
                                  setNewVenueZipcode(vn.zipcode || "");
                                  setNewVenueLat(vn.latitude ? vn.latitude.toString() : "");
                                  setNewVenueLng(vn.longitude ? vn.longitude.toString() : "");

                                  // Scroll form into view
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-[10px] py-0.5 px-2 rounded font-semibold transition"
                              >
                                Edit
                              </button>
                            </div>
                            <div className="flex items-center gap-2 my-0.5">
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase tracking-wider font-mono">
                                {vn.type}
                              </span>
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
                      );
                    })
                  )}
                </div>
              </div>

              {/* Booking Calendar View */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-sm font-bold uppercase text-[var(--text-secondary)] font-mono tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    Availability Calendar
                  </h4>

                  {/* Venue Select Filter */}
                  <select
                    value={selectedCalVenueId}
                    onChange={(e) => setSelectedCalVenueId(e.target.value)}
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] text-[10px] font-bold rounded-lg py-1 px-2 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 cursor-pointer font-sans"
                  >
                    <option value="ALL">All Properties</option>
                    {venues.filter(v => v.providerId === activeVenueProvider.id).map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

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
                        (selectedCalVenueId === "ALL"
                          ? providerVenues.some(v => v.id === b.venueId)
                          : b.venueId === selectedCalVenueId)
                      );

                      const isSelected = selectedCalendarDay === dateYmd;

                      return (
                        <button
                          key={`day-${day}`}
                          type="button"
                          onClick={() => setSelectedCalendarDay(dateYmd)}
                          className={`py-2 rounded-lg font-mono font-bold flex flex-col items-center justify-center relative transition-colors ${dayBooking
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
                        (selectedCalVenueId === "ALL"
                          ? providerVenues.some(v => v.id === b.venueId)
                          : b.venueId === selectedCalVenueId)
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
  );
};
