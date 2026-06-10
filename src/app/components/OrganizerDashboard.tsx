import React, { useState, useEffect } from "react";
import { Plus, Calendar, MapPin, Users, Ticket, Check, X, Shield, RefreshCw, Layers, Trash2, Edit2, Search, Star, ShieldAlert } from "lucide-react";
import { OrganizerProfile, Event, Booth, Venue, VenueBooking, VendorProfile, BoothApplication, SponsorApplication, Order, SponsorPackage } from "../types";
import { renderStars, parseLocationDetails } from "../utils";

interface OrganizerDashboardProps {
  activeOrganizerProfile: OrganizerProfile | null;
  setActiveOrganizerProfile: React.Dispatch<React.SetStateAction<OrganizerProfile | null>>;
  organizerProfiles: OrganizerProfile[];
  setOrganizerProfiles: React.Dispatch<React.SetStateAction<OrganizerProfile[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  booths: Booth[];
  setBooths: React.Dispatch<React.SetStateAction<Booth[]>>;
  venues: Venue[];
  venueBookings: VenueBooking[];
  setVenueBookings: React.Dispatch<React.SetStateAction<VenueBooking[]>>;
  vendorProfiles: VendorProfile[];
  boothApplications: BoothApplication[];
  setBoothApplications: React.Dispatch<React.SetStateAction<BoothApplication[]>>;
  sponsorApplications: SponsorApplication[];
  setSponsorApplications: React.Dispatch<React.SetStateAction<SponsorApplication[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  otpVerificationEnabled: boolean;
  platformFeePercentage: number;
  addSagaLog: (service: string, message: string, type: "info" | "success" | "error" | "event") => void;
  addNotification: (title: string, message: string, roleTarget?: string) => void;
  checkSuspended: () => boolean;
  getAverageRating: (type: "EVENT" | "VENUE" | "VENDOR" | "SITE", id: string) => number;
  runSagaVenueAllocation: (bookingId: string, venue: Venue, eventTitle: string, eventDate: string) => void;
  handleDeleteEvent: (eventId: string) => void;
  handleDuplicateEvent: (eventId: string) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  activeOrganizerProfile,
  setActiveOrganizerProfile,
  organizerProfiles,
  setOrganizerProfiles,
  events,
  setEvents,
  booths,
  setBooths,
  venues,
  venueBookings,
  setVenueBookings,
  vendorProfiles,
  boothApplications,
  setBoothApplications,
  sponsorApplications,
  setSponsorApplications,
  orders,
  setOrders,
  otpVerificationEnabled,
  platformFeePercentage,
  addSagaLog,
  addNotification,
  checkSuspended,
  getAverageRating,
  runSagaVenueAllocation,
  handleDeleteEvent,
  handleDuplicateEvent
}) => {
  // Local Toolbar Filters
  const [orgListingsSearch, setOrgListingsSearch] = useState("");
  const [orgListingsCategory, setOrgListingsCategory] = useState("ALL");
  const [orgListingsStatus, setOrgListingsStatus] = useState("ALL");

  // Registration wizard states
  const [organizerRegStep, setOrganizerRegStep] = useState<"form" | "otp">("form");
  const [regOrgName, setRegOrgName] = useState("");
  const [regOrgContactName, setRegOrgContactName] = useState("");
  const [regOrgEmail, setRegOrgEmail] = useState("");
  const [regOrgPhone, setRegOrgPhone] = useState("");
  const [organizerOtpInput, setOrganizerOtpInput] = useState("");
  const [organizerOtpError, setOrganizerOtpError] = useState<string | null>(null);
  const [pendingOrganizerProfile, setPendingOrganizerProfile] = useState<OrganizerProfile | null>(null);

  // Form states for creating/editing events
  const [orgEditingEventId, setOrgEditingEventId] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState("Technology");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventPrice, setNewEventPrice] = useState("");
  const [newEventInventory, setNewEventInventory] = useState("");
  const [newEventLoc, setNewEventLoc] = useState("");
  const [newEventCity, setNewEventCity] = useState("");
  const [newEventState, setNewEventState] = useState("");
  const [newEventZipcode, setNewEventZipcode] = useState("");
  const [newEventLat, setNewEventLat] = useState("");
  const [newEventLng, setNewEventLng] = useState("");
  const [newEventIsSponsored, setNewEventIsSponsored] = useState(false);
  const [orgSelectedVendorIds, setOrgSelectedVendorIds] = useState<string[]>([]);
  const [orgEventSponsorPackages, setOrgEventSponsorPackages] = useState<SponsorPackage[]>([]);
  const [adminSelectedVenueId, setAdminSelectedVenueId] = useState<string>("none");

  // Ticket Tiers config
  const [enableTiers, setEnableTiers] = useState(false);
  const [ebPrice, setEbPrice] = useState("");
  const [ebInv, setEbInv] = useState("");
  const [gaPriceForm, setGaPriceForm] = useState("");
  const [gaInvForm, setGaInvForm] = useState("");
  const [vipPriceForm, setVipPriceForm] = useState("");
  const [vipInvForm, setVipInvForm] = useState("");

  // Sponsorship package additions form states
  const [newPackageName, setNewPackageName] = useState("");
  const [newPackagePrice, setNewPackagePrice] = useState("");
  const [newPackageBenefits, setNewPackageBenefits] = useState("");

  // Location Auto-fill Parsed details
  useEffect(() => {
    if (adminSelectedVenueId === "none" && newEventLoc) {
      const parsed = parseLocationDetails(newEventLoc);
      setNewEventCity(parsed.city);
      setNewEventState(parsed.state);
      setNewEventZipcode(parsed.zipcode);
      setNewEventLat(parsed.latitude.toString());
      setNewEventLng(parsed.longitude.toString());
    }
  }, [newEventLoc, adminSelectedVenueId]);

  // Venue selection Auto-fill
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

  // Handler: Register profile
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
      status: otpVerificationEnabled ? "PENDING" : "VERIFIED"
    };

    if (otpVerificationEnabled) {
      setPendingOrganizerProfile(newProfile);
      setOrganizerRegStep("otp");
      setOrganizerOtpInput("");
      setOrganizerOtpError(null);
    } else {
      setOrganizerProfiles(prev => [...prev, newProfile]);
      setActiveOrganizerProfile(newProfile);
      setPendingOrganizerProfile(null);
      setOrganizerRegStep("form");
      alert("Organizer Profile registered successfully!");
    }
  };

  // Handler: Verify OTP
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

  // Handler: Add Sponsor Package
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

  // Handler: Remove Sponsor Package
  const handleRemoveSponsorPackage = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOrgEventSponsorPackages(prev => prev.filter(p => p.id !== id));
  };

  // Handler: Save/Update Event
  const handleOrganizerSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkSuspended()) return;

    if (!activeOrganizerProfile) {
      alert("Please sign in as an organizer first.");
      return;
    }

    if (enableTiers) {
      if (!newEventTitle || !newEventDate || !gaPriceForm || !gaInvForm) {
        alert("Please fill in all required fields (GA Price & Inventory are required when tiers are enabled).");
        return;
      }
    } else {
      if (!newEventTitle || !newEventDate || !newEventPrice || !newEventInventory) {
        alert("Please fill in all required fields.");
        return;
      }
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
        } catch (err) { }
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
    const calculatedPrice = enableTiers ? (parseFloat(gaPriceForm) || 0) : parseFloat(newEventPrice);
    const calculatedInventory = enableTiers
      ? ((parseInt(ebInv) || 0) + (parseInt(gaInvForm) || 0) + (parseInt(vipInvForm) || 0))
      : parseInt(newEventInventory);

    const targetEvent: Event = {
      id: targetEventId,
      title: newEventTitle,
      description: newEventDesc || "No description provided.",
      location: finalLocation,
      date: newEventDate,
      price: calculatedPrice,
      ticketInventory: calculatedInventory,
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
      sponsorPackages: orgEventSponsorPackages,
      moderationStatus: orgEditingEventId ? (events.find(ev => ev.id === orgEditingEventId)?.moderationStatus || "PENDING") : "PENDING",
      ticketClasses: enableTiers ? [
        { name: "Early Bird", price: parseFloat(ebPrice) || 0, inventory: parseInt(ebInv) || 0, sold: orgEditingEventId ? (events.find(ev => ev.id === orgEditingEventId)?.ticketClasses?.find(tc => tc.name === "Early Bird")?.sold || 0) : 0 },
        { name: "General Admission", price: parseFloat(gaPriceForm) || 0, inventory: parseInt(gaInvForm) || 0, sold: orgEditingEventId ? (events.find(ev => ev.id === orgEditingEventId)?.ticketClasses?.find(tc => tc.name === "General Admission")?.sold || 0) : 0 },
        { name: "VIP", price: parseFloat(vipPriceForm) || 0, inventory: parseInt(vipInvForm) || 0, sold: orgEditingEventId ? (events.find(ev => ev.id === orgEditingEventId)?.ticketClasses?.find(tc => tc.name === "VIP")?.sold || 0) : 0 }
      ] : undefined
    };

    if (orgEditingEventId) {
      setEvents(prev => prev.map(ev => ev.id === orgEditingEventId ? targetEvent : ev));
      addSagaLog("Organizer-Service", `Updated event "${newEventTitle}" successfully.`, "success");
    } else {
      setEvents(prev => [targetEvent, ...prev]);
      addSagaLog("Organizer-Service", `Created new event "${newEventTitle}" successfully. Moderation status set to [PENDING].`, "success");
      addNotification("New Event Submitted", `Your event "${newEventTitle}" has been submitted for moderation.`, "ORGANIZER");
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
        } catch (err) { }
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
    setEnableTiers(false);
    setEbPrice("");
    setEbInv("");
    setGaPriceForm("");
    setGaInvForm("");
    setVipPriceForm("");
    setVipInvForm("");
  };

  // Handler: Approve Booth Application
  const handleApproveBoothApplication = (app: BoothApplication) => {
    setBoothApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "APPROVED" as const } : a));
    setBooths(prev => prev.map(b => b.id === app.boothId ? {
      ...b,
      status: "SOLD",
      vendorBusinessName: app.vendorName,
      paymentTerms: app.paymentTerms,
      amountPaid: app.amountPaid
    } : b));

    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      eventId: app.eventId,
      eventTitle: app.eventTitle,
      quantity: 1,
      totalAmount: app.price,
      promoApplied: null,
      status: "PAID",
      timestamp: new Date().toLocaleString(),
      paymentGateway: "Stripe",
      idempotencyKey: `IDEM-BOOTH-APP-${app.id}`,
      type: "BOOTH",
      boothId: app.boothId,
      boothName: app.boothName,
      vendorBusinessName: app.vendorName,
      paymentTerms: app.paymentTerms,
      amountPaid: app.amountPaid,
      remainingBalance: app.paymentTerms === "FULL" ? 0 : app.price - app.amountPaid
    };
    setOrders(prev => [newOrder, ...prev]);

    addSagaLog("Order-Service", `Organizer approved vendor booth application for slot: ${app.boothName}. Order ${newOrder.id} logged.`, "success");
    addNotification("Booth Lease Approved", `Your booth leasing application for "${app.eventTitle}" was approved by the organizer.`, "VENDOR");
    alert("Vendor booth application approved! Booth status updated to SOLD and order logged.");
  };

  // Handler: Approve Sponsor Application
  const handleApproveSponsorApplication = (app: SponsorApplication) => {
    setSponsorApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "APPROVED" as const } : a));

    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      eventId: app.eventId,
      eventTitle: app.eventTitle,
      quantity: 1,
      totalAmount: app.packagePrice,
      promoApplied: null,
      status: "PAID",
      timestamp: new Date().toLocaleString(),
      paymentGateway: "Stripe",
      idempotencyKey: `IDEM-SPONSOR-APP-${app.id}`,
      type: "SPONSOR",
      amountPaid: app.packagePrice
    };
    setOrders(prev => [newOrder, ...prev]);

    addSagaLog("Order-Service", `Organizer approved sponsor application for package: ${app.packageName}. Order ${newOrder.id} logged.`, "success");
    addNotification("Sponsorship Approved", `Your sponsorship application for "${app.eventTitle}" was approved by the organizer.`, "SPONSOR");
    alert("Sponsorship application approved! Order logged.");
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {activeOrganizerProfile && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold uppercase text-[var(--text-secondary)] font-mono tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" />
              My Listings ({events.filter(e => e.organizerId === activeOrganizerProfile.id).length})
            </h3>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap gap-2.5 items-center font-sans">
              {/* Search Field */}
              <div className="relative w-full sm:w-60">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                  <Search className="w-3.5 h-3.5 text-sky-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search title or location..."
                  value={orgListingsSearch}
                  onChange={(e) => setOrgListingsSearch(e.target.value)}
                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 pl-9 pr-7 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 font-sans"
                />
                {orgListingsSearch && (
                  <button
                    type="button"
                    onClick={() => setOrgListingsSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <select
                value={orgListingsCategory}
                onChange={(e) => setOrgListingsCategory(e.target.value)}
                className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500 cursor-pointer font-sans"
              >
                <option value="ALL" className="bg-[var(--node-bg)] text-[var(--text-primary)]">All Categories</option>
                <option value="Technology" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Technology</option>
                <option value="Music" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Music</option>
                <option value="Food & Drink" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Food & Drink</option>
                <option value="Arts & Crafts" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Arts & Crafts</option>
                <option value="Health & Wellness" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Health & Wellness</option>
              </select>

              {/* Status Filter */}
              <select
                value={orgListingsStatus}
                onChange={(e) => setOrgListingsStatus(e.target.value)}
                className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-sky-500 cursor-pointer font-sans"
              >
                <option value="ALL" className="bg-[var(--node-bg)] text-[var(--text-primary)]">All Statuses</option>
                <option value="APPROVED" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Approved</option>
                <option value="PENDING" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Pending</option>
                <option value="REJECTED" className="bg-[var(--node-bg)] text-[var(--text-primary)]">Rejected</option>
              </select>

              {(orgListingsSearch || orgListingsCategory !== "ALL" || orgListingsStatus !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setOrgListingsSearch("");
                    setOrgListingsCategory("ALL");
                    setOrgListingsStatus("ALL");
                  }}
                  className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition font-mono uppercase"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] max-h-[480px] overflow-y-auto">
            {(() => {
              const rawOrgEvents = events.filter(e => e.organizerId === activeOrganizerProfile.id);
              if (rawOrgEvents.length === 0) {
                return (
                  <div className="text-center text-xs text-[var(--text-secondary)] py-12">
                    No organized events listed yet. Use the form on the left to publish your first event.
                  </div>
                );
              }

              const filteredOrgEvents = rawOrgEvents.filter(ev => {
                if (orgListingsSearch) {
                  const q = orgListingsSearch.toLowerCase();
                  const matchTitle = ev.title.toLowerCase().includes(q);
                  const matchLoc = ev.location.toLowerCase().includes(q);
                  const venueName = ev.venueId ? (venues.find(v => v.id === ev.venueId)?.name || "") : "";
                  const matchVenue = venueName.toLowerCase().includes(q);
                  if (!matchTitle && !matchLoc && !matchVenue) return false;
                }
                if (orgListingsCategory !== "ALL" && ev.category !== orgListingsCategory) {
                  return false;
                }
                if (orgListingsStatus !== "ALL") {
                  const status = ev.moderationStatus || "APPROVED";
                  if (status !== orgListingsStatus) return false;
                }
                return true;
              });

              if (filteredOrgEvents.length === 0) {
                return (
                  <div className="text-center text-xs text-[var(--text-secondary)] py-12 space-y-2">
                    <p>No listings match the current search or filters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setOrgListingsSearch("");
                        setOrgListingsCategory("ALL");
                        setOrgListingsStatus("ALL");
                      }}
                      className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-lg text-[10px] font-bold transition"
                    >
                      Reset Search & Filters
                    </button>
                  </div>
                );
              }

              return (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)] bg-slate-900/40 text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                      <th className="py-3 px-4 font-bold">Event Details</th>
                      <th className="py-3 px-4 font-bold">Category</th>
                      <th className="py-3 px-4 font-bold">Date & Venue</th>
                      <th className="py-3 px-4 font-bold text-right">Price</th>
                      <th className="py-3 px-4 font-bold">Tickets & Booths</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--glass-border)] text-xs">
                    {filteredOrgEvents.map(ev => {
                      const eventBooths = booths.filter(b => b.eventId === ev.id);
                      return (
                        <tr key={ev.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-3 px-4 align-middle">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-[var(--text-primary)] text-sm">{ev.title}</span>
                              {ev.isSponsored && (
                                <div className="flex">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold rounded">
                                    <Star className="w-2.5 h-2.5 fill-current" /> SPONSORED
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 align-middle">
                            <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-[var(--glass-border)] text-[var(--text-secondary)] text-[10px]">
                              {ev.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 align-middle">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-[var(--text-primary)]">{ev.date}</div>
                              <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                <span className="truncate max-w-[200px]" title={ev.venueId ? venues.find(v => v.id === ev.venueId)?.name : ev.location}>
                                  {ev.venueId ? venues.find(v => v.id === ev.venueId)?.name : "Manual"} ({ev.location})
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 align-middle text-right font-mono font-bold text-sky-400">
                            ${ev.price}
                          </td>
                          <td className="py-3 px-4 align-middle">
                            <div className="space-y-1 text-[11px]">
                              <div>
                                Tickets: <span className="font-mono font-bold text-[var(--text-primary)]">{ev.ticketsSold}</span>
                                <span className="text-[var(--text-secondary)]"> / {ev.ticketInventory}</span>
                              </div>
                              <div>
                                Booths: <span className="font-mono font-bold text-[var(--text-primary)]">{eventBooths.length}</span>
                                <span className="text-[var(--text-secondary)]"> allocated</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 align-middle">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${ev.moderationStatus === "APPROVED" || ev.moderationStatus === undefined
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              : ev.moderationStatus === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                              }`}>
                              {ev.moderationStatus || "APPROVED"}
                            </span>
                          </td>
                          <td className="py-3 px-4 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDuplicateEvent(ev.id)}
                                className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-[10px] py-1 px-2.5 rounded-lg font-semibold transition"
                              >
                                Duplicate
                              </button>
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

                                  if (ev.ticketClasses && ev.ticketClasses.length > 0) {
                                    setEnableTiers(true);
                                    const eb = ev.ticketClasses.find(tc => tc.name === "Early Bird");
                                    const ga = ev.ticketClasses.find(tc => tc.name === "General Admission");
                                    const vip = ev.ticketClasses.find(tc => tc.name === "VIP");
                                    setEbPrice(eb ? eb.price.toString() : "");
                                    setEbInv(eb ? eb.inventory.toString() : "");
                                    setGaPriceForm(ga ? ga.price.toString() : "");
                                    setGaInvForm(ga ? ga.inventory.toString() : "");
                                    setVipPriceForm(vip ? vip.price.toString() : "");
                                    setVipInvForm(vip ? vip.inventory.toString() : "");
                                  } else {
                                    setEnableTiers(false);
                                    setEbPrice("");
                                    setEbInv("");
                                    setGaPriceForm("");
                                    setGaInvForm("");
                                    setVipPriceForm("");
                                    setVipInvForm("");
                                  }

                                  const linkedVendors = eventBooths
                                    .map(b => vendorProfiles.find(v => v.businessName === b.vendorBusinessName)?.id)
                                    .filter((id): id is string => !!id);
                                  setOrgSelectedVendorIds(linkedVendors);
                                }}
                                className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 text-[10px] py-1 px-2.5 rounded-lg font-semibold transition"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEvent(ev.id)}
                                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 p-1.5 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      )}

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="bg-[var(--glass-bg)] rounded-xl p-3 border border-[var(--glass-border)] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)] block">Enable Multiple Ticket Tiers?</span>
                      <span className="text-[9px] text-[var(--text-secondary)]">Configure Early Bird, GA, and VIP.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnableTiers(!enableTiers)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${enableTiers ? "bg-sky-500" : "bg-slate-700"}`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${enableTiers ? "translate-x-5" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                </div>

                {!enableTiers ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-secondary)] font-bold">Ticket Price ($) *</label>
                      <input
                        type="number"
                        required={!enableTiers}
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
                        required={!enableTiers}
                        min={10}
                        value={newEventInventory}
                        onChange={(e) => setNewEventInventory(e.target.value)}
                        placeholder="e.g. 500"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl space-y-3 text-xs">
                    <span className="text-[10px] text-sky-400 font-bold block font-mono">Ticket Tiers Configuration</span>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Early Bird ($)</label>
                        <input
                          type="number"
                          required={enableTiers}
                          value={ebPrice}
                          onChange={(e) => setEbPrice(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">GA ($)</label>
                        <input
                          type="number"
                          required={enableTiers}
                          value={gaPriceForm}
                          onChange={(e) => setGaPriceForm(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">VIP ($)</label>
                        <input
                          type="number"
                          required={enableTiers}
                          value={vipPriceForm}
                          onChange={(e) => setVipPriceForm(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Early Bird Inv</label>
                        <input
                          type="number"
                          required={enableTiers}
                          value={ebInv}
                          onChange={(e) => setEbInv(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">GA Inv</label>
                        <input
                          type="number"
                          required={enableTiers}
                          value={gaInvForm}
                          onChange={(e) => setGaInvForm(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">VIP Inv</label>
                        <input
                          type="number"
                          required={enableTiers}
                          value={vipInvForm}
                          onChange={(e) => setVipInvForm(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1 px-2 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

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
                              className={`flex items-center justify-between p-2.5 rounded-lg border transition ${isAvailable
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${newEventIsSponsored ? "bg-amber-500" : "bg-sky-500"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newEventIsSponsored ? "translate-x-6" : "translate-x-1"}`}
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
                    className={`bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center gap-2 text-xs font-outfit ${orgEditingEventId ? "w-2/3" : "w-full"}`}
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

              {/* Metrics Grid */}
              {(() => {
                const orgEvents = events.filter(e => e.organizerId === activeOrganizerProfile.id);
                const orgEventIds = new Set(orgEvents.map(e => e.id));
                const totalListings = orgEvents.length;

                const ticketSales = orders
                  .filter(o => o.type === "TICKET" && o.status === "PAID" && orgEventIds.has(o.eventId))
                  .reduce((sum, o) => sum + o.totalAmount, 0);

                const totalTicketsSold = orgEvents.reduce((sum, e) => sum + e.ticketsSold, 0);

                const boothSales = orders
                  .filter(o => o.type === "BOOTH" && o.status === "PAID" && orgEventIds.has(o.eventId))
                  .reduce((sum, o) => sum + (o.amountPaid || 0), 0);

                const sponsorSales = orders
                  .filter(o => o.type === "SPONSOR" && o.status === "PAID" && orgEventIds.has(o.eventId))
                  .reduce((sum, o) => sum + o.totalAmount, 0);

                const netRevenue = (1 - platformFeePercentage / 100) * ticketSales + boothSales + sponsorSales;

                const pendingBoothAppsCount = boothApplications.filter(app => app.status === "PENDING" && orgEventIds.has(app.eventId)).length;
                const pendingSponsorAppsCount = sponsorApplications.filter(app => app.status === "PENDING" && orgEventIds.has(app.eventId)).length;
                const pendingAppsCount = pendingBoothAppsCount + pendingSponsorAppsCount;

                return (
                  <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                    <div className="glass p-3 rounded-xl border border-[var(--glass-border)]">
                      <span className="text-[9px] text-[var(--text-secondary)] font-mono uppercase tracking-wider block">Listings</span>
                      <span className="text-base font-bold text-sky-400 font-mono mt-0.5 block">{totalListings} events</span>
                    </div>
                    <div className="glass p-3 rounded-xl border border-[var(--glass-border)]">
                      <span className="text-[9px] text-[var(--text-secondary)] font-mono uppercase tracking-wider block">Tickets Sold</span>
                      <span className="text-base font-bold text-indigo-400 font-mono mt-0.5 block">{totalTicketsSold} sold</span>
                    </div>
                    <div className="glass p-3 rounded-xl border border-[var(--glass-border)]">
                      <span className="text-[9px] text-[var(--text-secondary)] font-mono uppercase tracking-wider block">Net Revenue</span>
                      <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">${Math.round(netRevenue)}</span>
                    </div>
                    <div className="glass p-3 rounded-xl border border-[var(--glass-border)]">
                      <span className="text-[9px] text-[var(--text-secondary)] font-mono uppercase tracking-wider block">Pending Apps</span>
                      <span className="text-base font-bold text-amber-400 font-mono mt-0.5 block">{pendingAppsCount} active</span>
                    </div>
                  </div>
                );
              })()}

              {/* Applications Manager */}
              {(() => {
                const orgEvents = events.filter(e => e.organizerId === activeOrganizerProfile.id);
                const orgEventIds = new Set(orgEvents.map(e => e.id));
                const pendingBoothApps = boothApplications.filter(app => app.status === "PENDING" && orgEventIds.has(app.eventId));
                const pendingSponsorApps = sponsorApplications.filter(app => app.status === "PENDING" && orgEventIds.has(app.eventId));

                if (pendingBoothApps.length === 0 && pendingSponsorApps.length === 0) return null;

                return (
                  <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-4 font-sans text-xs">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                      📥 Applications Manager
                    </h4>

                    {/* Pending Booths */}
                    {pendingBoothApps.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] text-[var(--text-secondary)] uppercase font-mono font-bold block border-b border-[var(--glass-border)] pb-1">Vendor Booth Requests</span>
                        {pendingBoothApps.map(app => (
                          <div key={app.id} className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)] space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-[var(--text-primary)]">{app.vendorName}</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Event: {app.eventTitle} | Slot: {app.boothName}</span>
                              </div>
                              <span className="font-mono text-amber-400 font-bold">${app.price}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-[var(--text-secondary)]">{app.paymentTerms} payment (Paid: ${app.amountPaid})</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setBoothApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "REJECTED" as const } : a));
                                    setBooths(prev => prev.map(b => b.id === app.boothId ? {
                                      ...b,
                                      status: "AVAILABLE",
                                      vendorBusinessName: undefined,
                                      paymentTerms: undefined,
                                      amountPaid: undefined
                                    } : b));
                                    addSagaLog("Order-Service", `Organizer rejected vendor booth application for slot: ${app.boothName}`, "info");
                                    addNotification("Booth Lease Rejected", `Your booth leasing application for "${app.eventTitle}" was rejected by the organizer.`, "VENDOR");
                                    alert("Vendor booth application rejected.");
                                  }}
                                  className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded font-semibold text-[9px]"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleApproveBoothApplication(app)}
                                  className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded font-semibold text-[9px]"
                                >
                                  Approve
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pending Sponsorships */}
                    {pendingSponsorApps.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[var(--glass-border)]">
                        <span className="text-[9px] text-[var(--text-secondary)] uppercase font-mono font-bold block border-b border-[var(--glass-border)] pb-1">Brand Sponsor Requests</span>
                        {pendingSponsorApps.map(app => (
                          <div key={app.id} className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)] space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-[var(--text-primary)]">{app.companyName}</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Event: {app.eventTitle} | Package: {app.packageName}</span>
                              </div>
                              <span className="font-mono text-amber-400 font-bold">${app.packagePrice}</span>
                            </div>
                            <div className="flex justify-end gap-2 text-[10px]">
                              <button
                                onClick={() => {
                                  setSponsorApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "REJECTED" as const } : a));
                                  addSagaLog("Order-Service", `Organizer rejected sponsor application for package: ${app.packageName}`, "info");
                                  addNotification("Sponsorship Rejected", `Your sponsorship application for "${app.eventTitle}" was rejected by the organizer.`, "SPONSOR");
                                  alert("Sponsorship application rejected.");
                                }}
                                className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded font-semibold text-[9px]"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleApproveSponsorApplication(app)}
                                className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded font-semibold text-[9px]"
                              >
                                Approve
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Sponsor Deliverables tracker */}
              {(() => {
                const orgEvents = events.filter(e => e.organizerId === activeOrganizerProfile.id);
                const orgEventIds = new Set(orgEvents.map(e => e.id));
                const activeSponsorApps = sponsorApplications.filter(app => app.status === "APPROVED" && orgEventIds.has(app.eventId));

                if (activeSponsorApps.length === 0) return null;

                return (
                  <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-3 font-sans text-xs">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                      Compliance Deliverables Checklist
                    </h4>
                    <div className="space-y-3">
                      {activeSponsorApps.map(app => (
                        <div key={app.id} className="p-3 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl space-y-2">
                          <div>
                            <span className="font-bold text-[var(--text-primary)] block">{app.companyName}</span>
                            <span className="text-[9px] text-sky-400 block font-mono mt-0.5">Event: {app.eventTitle} | {app.packageName}</span>
                          </div>
                          <div className="space-y-1.5 pl-1.5">
                            {app.deliverables.map((del, dIdx) => (
                              <label key={dIdx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={del.completed}
                                  onChange={() => {
                                    setSponsorApplications(prev => prev.map(a => {
                                      if (a.id === app.id) {
                                        const updatedDel = a.deliverables.map((d, idx) => idx === dIdx ? { ...d, completed: !d.completed } : d);
                                        return { ...a, deliverables: updatedDel };
                                      }
                                      return a;
                                    }));
                                    addSagaLog("Organizer-Service", `Organizer toggled deliverable: ${del.name} for sponsor: ${app.companyName}`, "info");
                                  }}
                                  className="rounded border-slate-700 bg-transparent text-emerald-500 focus:ring-0 cursor-pointer"
                                />
                                <span className={del.completed ? "line-through text-slate-500" : ""}>{del.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="glass rounded-2xl border border-[var(--glass-border)] p-12 text-center text-[var(--text-secondary)]">
              <p>Please register and verify an Event Organizer account on the left to load console metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
