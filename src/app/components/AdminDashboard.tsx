import React, { useState, useEffect } from "react";
import { Settings, Plus, Calendar, Store, Trash2, Shield, ShieldAlert, Award, Search } from "lucide-react";
import { UserProfile, Event, VendorProfile, Booth, Venue, VenueBooking, Order, Review, SponsorInterest } from "../types";
import { renderStars, parseLocationDetails } from "../utils";

interface AdminDashboardProps {
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setSelectedEvent: React.Dispatch<React.SetStateAction<Event | null>>;
  vendorProfiles: VendorProfile[];
  setVendorProfiles: React.Dispatch<React.SetStateAction<VendorProfile[]>>;
  booths: Booth[];
  setBooths: React.Dispatch<React.SetStateAction<Booth[]>>;
  venues: Venue[];
  venueBookings: VenueBooking[];
  setVenueBookings: React.Dispatch<React.SetStateAction<VenueBooking[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  sponsorInterests: SponsorInterest[];
  setSponsorInterests: React.Dispatch<React.SetStateAction<SponsorInterest[]>>;
  otpVerificationEnabled: boolean;
  setOtpVerificationEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  platformFeePercentage: number;
  setPlatformFeePercentage: React.Dispatch<React.SetStateAction<number>>;
  addSagaLog: (service: string, message: string, type: "info" | "success" | "error" | "event") => void;
  addNotification: (title: string, message: string, roleTarget?: string) => void;
  runSagaVenueAllocation: (bookingId: string, venue: Venue, eventTitle: string, eventDate: string) => void;
  setActiveTab: (tab: any) => void;
  handleDeleteEvent: (eventId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  setUsers,
  events,
  setEvents,
  setSelectedEvent,
  vendorProfiles,
  setVendorProfiles,
  booths,
  setBooths,
  venues,
  venueBookings,
  setVenueBookings,
  orders,
  setOrders,
  reviews,
  setReviews,
  sponsorInterests,
  setSponsorInterests,
  otpVerificationEnabled,
  setOtpVerificationEnabled,
  platformFeePercentage,
  setPlatformFeePercentage,
  addSagaLog,
  addNotification,
  runSagaVenueAllocation,
  setActiveTab,
  handleDeleteEvent
}) => {
  // Sub-tab Navigation state
  const [adminSubTab, setAdminSubTab] = useState<"directory" | "events" | "financials" | "reports" | "reviews">("directory");

  // Local state for released payouts
  const [releasedPayouts, setReleasedPayouts] = useState<string[]>([]);

  // Local Form states for creating event (in admin context)
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState("Technology");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventLoc, setNewEventLoc] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventPrice, setNewEventPrice] = useState("");
  const [newEventInventory, setNewEventInventory] = useState("");
  const [newEventCity, setNewEventCity] = useState("");
  const [newEventState, setNewEventState] = useState("");
  const [newEventZipcode, setNewEventZipcode] = useState("");
  const [newEventLat, setNewEventLat] = useState("");
  const [newEventLng, setNewEventLng] = useState("");
  const [newEventIsSponsored, setNewEventIsSponsored] = useState(false);
  const [showEventGeoOverrides, setShowEventGeoOverrides] = useState(false);
  const [adminSelectedVenueId, setAdminSelectedVenueId] = useState<string>("none");

  // Local Form states for creating booth slot
  const [adminBoothEventId, setAdminBoothEventId] = useState(events[0]?.id || "");
  const [adminBoothName, setAdminBoothName] = useState("");
  const [adminBoothType, setAdminBoothType] = useState<"STANDARD" | "FOOD_TRUCK">("STANDARD");
  const [adminBoothCategory, setAdminBoothCategory] = useState("Tech Showcase");
  const [adminBoothPrice, setAdminBoothPrice] = useState("");

  // Review moderator filters local state
  const [adminReviewTypeFilter, setAdminReviewTypeFilter] = useState<string>("ALL");
  const [adminReviewStatusFilter, setAdminReviewStatusFilter] = useState<string>("ALL");
  const [adminReviewRatingFilter, setAdminReviewRatingFilter] = useState<string>("ALL");
  const [adminReviewSearch, setAdminReviewSearch] = useState<string>("");

  // Auto-fill parsed details for Event Location
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

  // Moderation functions
  const approveEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, moderationStatus: "APPROVED" as const } : e));
    const ev = events.find(e => e.id === eventId);
    if (ev) {
      addSagaLog("Admin-Service", `Approved event: ${ev.title}`, "success");
      addNotification("Event Approved", `Your event "${ev.title}" has been approved and is now live in the catalog.`, "ORGANIZER");
    }
  };

  const rejectEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, moderationStatus: "REJECTED" as const } : e));
    const ev = events.find(e => e.id === eventId);
    if (ev) {
      addSagaLog("Admin-Service", `Rejected event: ${ev.title}`, "error");
      addNotification("Event Rejected", `Your event "${ev.title}" has been rejected.`, "ORGANIZER");
    }
  };

  const approveVendor = (vendorId: string) => {
    setVendorProfiles(prev => prev.map(v => v.id === vendorId ? { ...v, status: "VERIFIED" as const } : v));
    const vp = vendorProfiles.find(v => v.id === vendorId);
    if (vp) {
      addSagaLog("Admin-Service", `Approved vendor: ${vp.businessName}`, "success");
      addNotification("Vendor Approved", `Your vendor profile "${vp.businessName}" has been approved.`, "VENDOR");
    }
  };

  const rejectVendor = (vendorId: string) => {
    setVendorProfiles(prev => prev.filter(v => v.id !== vendorId));
    addSagaLog("Admin-Service", `Rejected and removed vendor registration.`, "error");
  };

  // User suspension toggler
  const toggleUserSuspension = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        addSagaLog("Admin-Service", `User [${u.name}] status changed to [${newStatus}].`, "info");
        addNotification(
          newStatus === "SUSPENDED" ? "Account Suspended" : "Account Activated",
          `Your account has been ${newStatus.toLowerCase()} by the system administrator.`,
          u.role
        );
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  // Create Event Action (Admin Context)
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
        } catch (err) { }
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
      sponsorPackages: []
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
        } catch (err) { }
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
  };

  // Create Booth/Catering Slot (Admin Context)
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

    // Reset Form
    setAdminBoothName("");
    setAdminBoothPrice("");
  };

  // Refund transaction with SAGA rollback
  const handleRefundTransaction = (order: Order) => {
    if (order.status !== "PAID") return;
    if (!confirm(`Are you sure you want to refund order "${order.id}" for $${order.totalAmount}? This will trigger a full compensating SAGA rollback.`)) return;

    // 1. Mark order as CANCELLED
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "CANCELLED" as const } : o));

    // 2. Compensate states
    if (order.type === "TICKET") {
      setEvents(prev => prev.map(e => {
        if (e.id === order.eventId) {
          let updatedClasses = e.ticketClasses;
          if (e.ticketClasses && order.ticketClass) {
            updatedClasses = e.ticketClasses.map(tc =>
              tc.name === order.ticketClass
                ? { ...tc, sold: Math.max(0, tc.sold - order.quantity) }
                : tc
            );
          }
          return {
            ...e,
            ticketsSold: Math.max(0, e.ticketsSold - order.quantity),
            ticketClasses: updatedClasses
          };
        }
        return e;
      }));
    } else if (order.type === "BOOTH" && order.boothId) {
      setBooths(prev => prev.map(b => b.id === order.boothId ? {
        ...b,
        status: "AVAILABLE",
        vendorBusinessName: undefined,
        paymentTerms: undefined,
        amountPaid: undefined
      } : b));
    }

    // 4. Log compensating transactions in SAGA console
    addSagaLog("Order-Service", `Refund requested for Order: ${order.id}. Commencing SAGA Compensating rollback...`, "info");
    addSagaLog("Payment-Service", `Refunding charge $${order.totalAmount} to customer. Reference ref_stripe_${Math.floor(Math.random() * 1000000)}`, "success");
    addSagaLog("Kafka-Broker", "Event [payment.refunded] published to 'payment-events' topic.", "event");
    if (order.type === "TICKET") {
      addSagaLog("Ticket-Service", `Restored ${order.quantity} ticket inventory for event: ${order.eventTitle}`, "success");
    } else if (order.type === "BOOTH") {
      addSagaLog("Booth-Service", `Restored booth slot ${order.boothName} to [AVAILABLE]`, "success");
    }
    addSagaLog("Notification-Service", `Refund notification email dispatched to customer.`, "success");
    addSagaLog("Order-Service", `Compensating transactions completed. Order status updated to CANCELLED.`, "success");

    alert(`Order ${order.id} refunded successfully! SAGA Rollback logged.`);
  };

  // Run scanner check for abusive review comments
  const runAbusiveScanChecker = () => {
    let flaggedCount = 0;
    const updatedReviews = reviews.map(r => {
      const isAbusive = ["scam", "spam", "abuse", "fake"].some(word => r.comment.toLowerCase().includes(word));
      if (isAbusive && r.status !== "FLAGGED_ABUSIVE") {
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

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--glass-border)] pb-4">
        <button
          type="button"
          onClick={() => setAdminSubTab("directory")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-outfit transition ${adminSubTab === "directory"
            ? "bg-sky-500 text-white shadow-md shadow-sky-500/10"
            : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
            }`}
        >
          👤 User Directory &amp; Moderation
        </button>
        <button
          type="button"
          onClick={() => setAdminSubTab("events")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-outfit transition ${adminSubTab === "events"
            ? "bg-sky-500 text-white shadow-md shadow-sky-500/10"
            : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
            }`}
        >
          🎪 Events &amp; Slots Config
        </button>
        <button
          type="button"
          onClick={() => setAdminSubTab("financials")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-outfit transition ${adminSubTab === "financials"
            ? "bg-sky-500 text-white shadow-md shadow-sky-500/10"
            : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
            }`}
        >
          💵 Financials Console
        </button>
        <button
          type="button"
          onClick={() => setAdminSubTab("reports")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-outfit transition ${adminSubTab === "reports"
            ? "bg-sky-500 text-white shadow-md shadow-sky-500/10"
            : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
            }`}
        >
          📊 SVG Reports
        </button>
        <button
          type="button"
          onClick={() => setAdminSubTab("reviews")}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-outfit transition ${adminSubTab === "reviews"
            ? "bg-sky-500 text-white shadow-md shadow-sky-500/10"
            : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
            }`}
        >
          🛡️ Moderator Console
        </button>
      </div>

      {/* Sub-tab 1: Directory & Moderation */}
      {adminSubTab === "directory" && (
        <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
          {/* Global Settings Configuration Card */}
          <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-outfit">Global Security Settings</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Configure security rules and authentication requirements for EventSnap.</p>
              </div>
            </div>

            <div className="p-4 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-[var(--text-primary)] block">System-Wide OTP Verification</span>
                <span className="text-xs text-[var(--text-secondary)]">When disabled, OTP checks during registration and review submission are skipped.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newVal = !otpVerificationEnabled;
                  setOtpVerificationEnabled(newVal);
                  localStorage.setItem("otpVerificationEnabled", String(newVal));
                  addSagaLog("System-Config", `OTP Verification is now ${newVal ? "ENABLED" : "DISABLED"} globally.`, newVal ? "success" : "info");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all-custom border cursor-pointer ${otpVerificationEnabled
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                  }`}
              >
                {otpVerificationEnabled ? "OTP Required" : "OTP Bypassed"}
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-outfit">Registered User Profiles</h3>
            <p className="text-xs text-[var(--text-secondary)]">Manage registered platform credentials and suspend/activate accounts.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
              {users.map(u => (
                <div key={u.id} className="p-3.5 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[var(--text-primary)] text-sm">{u.name}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{u.email} • Role: <strong className="text-sky-400 font-mono">{u.role}</strong></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${u.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                      {u.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleUserSuspension(u.id)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${u.status === "ACTIVE"
                        ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        }`}
                    >
                      {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Events Moderation Queue */}
            <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
              <h4 className="text-sm font-bold uppercase text-[var(--text-secondary)] font-mono tracking-wider">Pending Event Approval Queue</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {events.filter(e => e.moderationStatus === "PENDING").length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)] italic text-center py-8">No pending event catalog listings.</p>
                ) : (
                  events.filter(e => e.moderationStatus === "PENDING").map(ev => (
                    <div key={ev.id} className="p-3.5 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h5 className="font-bold text-sm text-[var(--text-primary)]">{ev.title}</h5>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5">Date: {ev.date} | Ticket Price: ${ev.price}</p>
                        </div>
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/25 uppercase font-mono">Pending</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{ev.description}</p>
                      <div className="flex justify-end gap-2 text-[10px] pt-1">
                        <button
                          type="button"
                          onClick={() => rejectEvent(ev.id)}
                          className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg font-bold transition"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => approveEvent(ev.id)}
                          className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold transition"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Vendor Registrations Queue */}
            <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
              <h4 className="text-sm font-bold uppercase text-[var(--text-secondary)] font-mono tracking-wider">Pending Vendor Approval Queue</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {vendorProfiles.filter(v => v.status === "PENDING").length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)] italic text-center py-8">No pending vendor lease verifications.</p>
                ) : (
                  vendorProfiles.filter(v => v.status === "PENDING").map(vp => (
                    <div key={vp.id} className="p-3.5 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h5 className="font-bold text-sm text-[var(--text-primary)]">{vp.businessName}</h5>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5">Owner: {vp.ownerName} | Cat: {vp.category}</p>
                        </div>
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/25 uppercase font-mono">Pending</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">Email: {vp.email} | Phone: {vp.phone}</p>
                      <div className="flex justify-end gap-2 text-[10px] pt-1">
                        <button
                          type="button"
                          onClick={() => rejectVendor(vp.id)}
                          className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg font-bold transition"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => approveVendor(vp.id)}
                          className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold transition"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Events & Slots Config */}
      {adminSubTab === "events" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-[fadeIn_0.25s_ease-out]">
          {/* Forms Section */}
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
                      placeholder="e.g. Docker &amp; K8s Bootcamp"
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
                      <option value="Conference">Conference</option>
                      <option value="Trade Show">Trade Show</option>
                      <option value="Festival">Festival</option>
                      <option value="Community Event">Community Event</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Expo">Expo</option>
                      <option value="Farmers Market">Farmers Market</option>
                      <option value="Sports Event">Sports Event</option>
                      <option value="Technology">Technology</option>
                      <option value="Music">Music</option>
                      <option value="Food &amp; Drink">Food &amp; Drink</option>
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

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowEventGeoOverrides(!showEventGeoOverrides)}
                    className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 focus:outline-none"
                  >
                    {showEventGeoOverrides ? "▼ Hide" : "▶ Show"} Advanced Geolocation &amp; Address Details (Auto-Parsed)
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
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-[var(--text-secondary)] font-bold">State</label>
                          <input
                            type="text"
                            value={newEventState}
                            onChange={(e) => setNewEventState(e.target.value)}
                            placeholder="e.g. CA"
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-[var(--text-secondary)] font-bold">Zipcode</label>
                          <input
                            type="text"
                            value={newEventZipcode}
                            onChange={(e) => setNewEventZipcode(e.target.value)}
                            placeholder="e.g. 94103"
                            maxLength={5}
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none font-mono"
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
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none font-mono"
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
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full focus:outline-none font-mono"
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
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none w-full"
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
                    <label className="text-xs text-[var(--text-secondary)] font-bold">Ticket Inventory Stock *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newEventInventory}
                      onChange={(e) => setNewEventInventory(e.target.value)}
                      placeholder="e.g. 250"
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] w-full font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pb-1">
                  <input
                    type="checkbox"
                    id="newEventIsSponsored"
                    checked={newEventIsSponsored}
                    onChange={(e) => setNewEventIsSponsored(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--input-border)] bg-[var(--input-bg)] text-amber-500 accent-amber-500 cursor-pointer"
                  />
                  <label htmlFor="newEventIsSponsored" className="text-xs text-[var(--text-primary)] font-bold cursor-pointer select-none">
                    ★ Highlight as Sponsored Event
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition shadow shadow-sky-955 flex items-center gap-2 text-sm font-outfit"
                  >
                    <Plus className="w-4 h-4" />
                    Create Approved Event
                  </button>
                </div>
              </form>
            </div>

            {/* Booth Allocation Form */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] flex items-center gap-2 font-outfit">
                <Store className="w-6 h-6 text-sky-400" />
                Add Booth &amp; Catering service slots
              </h2>
              <form onSubmit={handleCreateBooth} className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--text-secondary)] font-bold font-mono">Assign to Event *</label>
                    <select
                      value={adminBoothEventId}
                      onChange={(e) => setAdminBoothEventId(e.target.value)}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] w-full"
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
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none w-full"
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
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] w-full"
                    >
                      <option value="STANDARD">Standard Booth</option>
                      <option value="FOOD_TRUCK">Food Truck Spot</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--text-secondary)] font-bold">Category</label>
                    {adminBoothType === "FOOD_TRUCK" ? (
                      <select
                        value={adminBoothCategory}
                        onChange={(e) => setAdminBoothCategory(e.target.value)}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] w-full"
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
                        placeholder="e.g. Crafts, Tech Showcase"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] w-full"
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
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] w-full font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition shadow flex items-center gap-2 text-sm font-outfit"
                  >
                    <Plus className="w-4 h-4" />
                    Allocate Slot
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Lists Column */}
          <div className="space-y-6">
            {/* Event CRUD List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-[var(--text-secondary)] font-mono tracking-wider">Catalog Listings CRUD</h3>
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {events.map(ev => (
                  <div key={ev.id} className="p-3 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{ev.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">Date: {ev.date} | Available: {ev.ticketInventory - ev.ticketsSold}/{ev.ticketInventory}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Registered Vendors Directory */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-[var(--text-secondary)] font-mono tracking-wider">Registered Vendors</h3>
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {vendorProfiles.map(vp => (
                  <div key={vp.id} className="p-3 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-[var(--text-primary)] text-sm block">{vp.businessName}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Owner: {vp.ownerName} | Status: <strong className="text-sky-400">{vp.status}</strong></span>
                    </div>
                    <span className="text-[9px] text-[var(--text-secondary)] font-mono">{vp.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Financials Console */}
      {adminSubTab === "financials" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-[fadeIn_0.25s_ease-out]">
          {/* Platform Fee Control and Calculations */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-5">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Platform Fee Control</h4>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">Adjust platform service cut commission rate below.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--text-secondary)]">Fee Percentage cut</span>
                  <span className="text-sky-400 font-bold font-mono text-sm">{platformFeePercentage}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={platformFeePercentage}
                  onChange={(e) => setPlatformFeePercentage(parseInt(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
                />
                <p className="text-[9px] text-slate-500">Service fee cut calculations apply immediately to all gross ticket orders.</p>
              </div>

              {(() => {
                const grossTicketSales = orders.filter(o => o.status === "PAID" && o.type === "TICKET").reduce((sum, o) => sum + o.totalAmount, 0);
                const grossBoothSales = orders.filter(o => o.status === "PAID" && o.type === "BOOTH").reduce((sum, o) => sum + (o.amountPaid ?? o.totalAmount), 0);
                const grossSponsorSales = orders.filter(o => o.status === "PAID" && o.type === "SPONSOR").reduce((sum, o) => sum + o.totalAmount, 0);
                const platformFeeRevenue = grossTicketSales * platformFeePercentage / 100;
                const grossTotal = grossTicketSales + grossBoothSales + grossSponsorSales;

                return (
                  <div className="space-y-3.5 pt-4 border-t border-[var(--glass-border)] text-xs text-[var(--text-primary)] font-sans">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Ticket Volume (Gross):</span>
                      <span className="font-bold font-mono">${grossTicketSales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Booth Volume (Gross):</span>
                      <span className="font-bold font-mono">${grossBoothSales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Sponsor Volume (Gross):</span>
                      <span className="font-bold font-mono">${grossSponsorSales}</span>
                    </div>
                    <div className="flex justify-between border-t border-[var(--glass-border)] pt-2 font-bold text-sky-400">
                      <span>Platform Revenue cut:</span>
                      <span className="font-mono">${Math.round(platformFeeRevenue)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-400">
                      <span>Gross Platform Volume:</span>
                      <span className="font-mono">${Math.round(grossTotal)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Organizer Payouts and Payout Releases */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payouts release console */}
            <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-4 text-xs font-sans">
              <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Release Organizer Payouts</h4>
              <p className="text-[10px] text-[var(--text-secondary)]">Disburse organizer funds from ticket sales (net platform cut fee) and rental/sponsor space lease bookings.</p>

              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {events.map(ev => {
                  const org = users.find(u => u.id === ev.organizerId) || { name: "Organizer", email: "" };

                  const eventTicketsGross = orders
                    .filter(o => o.eventId === ev.id && o.type === "TICKET" && o.status === "PAID")
                    .reduce((sum, o) => sum + o.totalAmount, 0);

                  const eventBoothGross = orders
                    .filter(o => o.eventId === ev.id && o.type === "BOOTH" && o.status === "PAID")
                    .reduce((sum, o) => sum + (o.amountPaid ?? o.totalAmount), 0);

                  const eventSponsorGross = orders
                    .filter(o => o.eventId === ev.id && o.type === "SPONSOR" && o.status === "PAID")
                    .reduce((sum, o) => sum + o.totalAmount, 0);

                  const eventTicketsNet = eventTicketsGross * (1 - platformFeePercentage / 100);
                  const totalPayout = eventTicketsNet + eventBoothGross + eventSponsorGross;

                  const isReleased = releasedPayouts.includes(ev.id);

                  return (
                    <div key={ev.id} className="p-3 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-[var(--text-primary)] text-sm block">{ev.title}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Org: {org.name} | Net Ticket: ${Math.round(eventTicketsNet)} | Booths: ${eventBoothGross} | Sponsor: ${eventSponsorGross}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${isReleased ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                          {isReleased ? "Released" : "Pending"}
                        </span>
                        {!isReleased && (
                          <button
                            type="button"
                            onClick={() => {
                              setReleasedPayouts(prev => [...prev, ev.id]);
                              addSagaLog("Admin-Service", `Released payout of $${Math.round(totalPayout)} to organizer for event: ${ev.title}`, "success");
                              addNotification("Payout Released", `A payout of $${Math.round(totalPayout)} has been dispatched for "${ev.title}".`, "ORGANIZER");
                              alert("Payout released successfully!");
                            }}
                            className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded text-[10px] transition"
                          >
                            Release Payout
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Master Transactions log */}
            <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-4 text-xs font-sans">
              <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Master Transactions log</h4>
              <p className="text-[10px] text-[var(--text-secondary)]">Master transaction database logs. Refund actions trigger compensating rollback saga transaction commands.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)] text-[var(--text-secondary)] font-bold font-mono">
                      <th className="py-2">Order ID</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Details</th>
                      <th className="py-2">Gross</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-500 italic">No payments processed in sandbox.</td>
                      </tr>
                    ) : (
                      orders.map(o => (
                        <tr key={o.id} className="border-b border-[var(--glass-border)] last:border-0 hover:bg-white/2 transition">
                          <td className="py-2.5 font-mono font-bold text-[var(--text-primary)]">{o.id}</td>
                          <td className="py-2.5">
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${o.type === "TICKET"
                              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              : o.type === "BOOTH"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                              }`}>
                              {o.type}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <p className="font-bold text-[var(--text-primary)]">{o.eventTitle}</p>
                            <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">{o.ticketClass || o.boothName || "Sponsorship Package"}</p>
                          </td>
                          <td className="py-2.5 font-mono font-bold text-[var(--text-primary)]">${o.totalAmount}</td>
                          <td className="py-2.5">
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${o.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : o.status === "CANCELLED" || o.status === "FAILED"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            {o.status === "PAID" && (
                              <button
                                type="button"
                                onClick={() => handleRefundTransaction(o)}
                                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded font-semibold text-[9px] transition"
                              >
                                Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Reports & Charts */}
      {adminSubTab === "reports" && (
        <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
          {(() => {
            const getCategorySales = (cat: string) => orders
              .filter(o => o.status === "PAID" && events.find(e => e.id === o.eventId)?.category === cat)
              .reduce((sum, o) => sum + o.totalAmount, 0);

            const techSales = getCategorySales("Technology");
            const musicSales = getCategorySales("Music");
            const foodSales = getCategorySales("Food & Drink");
            const sportsSales = getCategorySales("Sports");
            const gamingSales = getCategorySales("Gaming");

            const maxVal = Math.max(techSales, musicSales, foodSales, sportsSales, gamingSales, 100);

            const attendeeCount = users.filter(u => u.role === "ATTENDEE").length;
            const organizerCount = users.filter(u => u.role === "ORGANIZER").length;
            const vendorCount = users.filter(u => u.role === "VENDOR").length;
            const sponsorCount = users.filter(u => u.role === "SPONSOR").length;
            const adminCount = users.filter(u => u.role === "ADMIN").length;
            const totalUsers = users.length || 1;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Category Revenue SVG Bar Chart */}
                <div className="lg:col-span-2 glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Revenue By Category Dashboard</h4>
                  <div className="w-full flex justify-center py-4 bg-slate-900/20 rounded-xl border border-[var(--glass-border)]">
                    <svg width="480" height="240" viewBox="0 0 480 240" className="w-full max-w-[480px] font-sans">
                      <line x1="50" y1="30" x2="450" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4" />
                      <line x1="50" y1="80" x2="450" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4" />
                      <line x1="50" y1="130" x2="450" y2="130" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4" />
                      <line x1="50" y1="180" x2="450" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4" />

                      <rect x="70" y={180 - (techSales / maxVal) * 140} width="40" height={(techSales / maxVal) * 140} rx="4" fill="url(#blue-grad)" />
                      <text x="90" y="200" fill="var(--text-secondary)" fontSize="9" textAnchor="middle" fontWeight="bold">Tech</text>
                      <text x="90" y={170 - (techSales / maxVal) * 140} fill="var(--text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">${techSales}</text>

                      <rect x="150" y={180 - (musicSales / maxVal) * 140} width="40" height={(musicSales / maxVal) * 140} rx="4" fill="url(#pink-grad)" />
                      <text x="170" y="200" fill="var(--text-secondary)" fontSize="9" textAnchor="middle" fontWeight="bold">Music</text>
                      <text x="170" y={170 - (musicSales / maxVal) * 140} fill="var(--text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">${musicSales}</text>

                      <rect x="230" y={180 - (foodSales / maxVal) * 140} width="40" height={(foodSales / maxVal) * 140} rx="4" fill="url(#green-grad)" />
                      <text x="250" y="200" fill="var(--text-secondary)" fontSize="9" textAnchor="middle" fontWeight="bold">Food/Wine</text>
                      <text x="250" y={170 - (foodSales / maxVal) * 140} fill="var(--text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">${foodSales}</text>

                      <rect x="310" y={180 - (sportsSales / maxVal) * 140} width="40" height={(sportsSales / maxVal) * 140} rx="4" fill="url(#purple-grad)" />
                      <text x="330" y="200" fill="var(--text-secondary)" fontSize="9" textAnchor="middle" fontWeight="bold">Sports</text>
                      <text x="330" y={170 - (sportsSales / maxVal) * 140} fill="var(--text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">${sportsSales}</text>

                      <rect x="390" y={180 - (gamingSales / maxVal) * 140} width="40" height={(gamingSales / maxVal) * 140} rx="4" fill="url(#orange-grad)" />
                      <text x="410" y="200" fill="var(--text-secondary)" fontSize="9" textAnchor="middle" fontWeight="bold">Gaming</text>
                      <text x="410" y={170 - (gamingSales / maxVal) * 140} fill="var(--text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">${gamingSales}</text>

                      <line x1="50" y1="180" x2="450" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

                      <defs>
                        <linearGradient id="blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0369a1" />
                        </linearGradient>
                        <linearGradient id="pink-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#be185d" />
                        </linearGradient>
                        <linearGradient id="green-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                        <linearGradient id="purple-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6d28d9" />
                        </linearGradient>
                        <linearGradient id="orange-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#c2410c" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* SVG Role breakdown Donut chart */}
                <div className="lg:col-span-1 glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Role Breakdown Donut</h4>
                  <div className="flex justify-center py-4 relative items-center">
                    <svg width="180" height="180" viewBox="0 0 180 180" className="w-[180px] h-[180px]">
                      {(() => {
                        const aPct = attendeeCount / totalUsers;
                        const oPct = organizerCount / totalUsers;
                        const vPct = vendorCount / totalUsers;
                        const sPct = sponsorCount / totalUsers;
                        const adPct = adminCount / totalUsers;

                        const circ = 377;
                        const aLen = circ * aPct;
                        const oLen = circ * oPct;
                        const vLen = circ * vPct;
                        const sLen = circ * sPct;
                        const adLen = circ * adPct;

                        return (
                          <>
                            <circle cx="90" cy="90" r="60" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="20" />

                            <circle cx="90" cy="90" r="60" fill="transparent" stroke="#38bdf8" strokeWidth="20"
                              strokeDasharray={`${aLen} ${circ - aLen}`}
                              strokeDashoffset="0"
                              transform="rotate(-90 90 90)"
                            />
                            <circle cx="90" cy="90" r="60" fill="transparent" stroke="#8b5cf6" strokeWidth="20"
                              strokeDasharray={`${oLen} ${circ - oLen}`}
                              strokeDashoffset={-aLen}
                              transform="rotate(-90 90 90)"
                            />
                            <circle cx="90" cy="90" r="60" fill="transparent" stroke="#fbbf24" strokeWidth="20"
                              strokeDasharray={`${vLen} ${circ - vLen}`}
                              strokeDashoffset={-(aLen + oLen)}
                              transform="rotate(-90 90 90)"
                            />
                            <circle cx="90" cy="90" r="60" fill="transparent" stroke="#ec4899" strokeWidth="20"
                              strokeDasharray={`${sLen} ${circ - sLen}`}
                              strokeDashoffset={-(aLen + oLen + vLen)}
                              transform="rotate(-90 90 90)"
                            />
                            <circle cx="90" cy="90" r="60" fill="transparent" stroke="#64748b" strokeWidth="20"
                              strokeDasharray={`${adLen} ${circ - adLen}`}
                              strokeDashoffset={-(aLen + oLen + vLen + sLen)}
                              transform="rotate(-90 90 90)"
                            />
                          </>
                        );
                      })()}
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-sans">Total Users</span>
                      <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{users.length}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-[var(--glass-border)]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                      <span className="text-[var(--text-secondary)] font-sans">Attendee ({attendeeCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                      <span className="text-[var(--text-secondary)] font-sans">Organizer ({organizerCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                      <span className="text-[var(--text-secondary)] font-sans">Vendor ({vendorCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                      <span className="text-[var(--text-secondary)] font-sans">Sponsor ({sponsorCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                      <span className="text-[var(--text-secondary)] font-sans">Admin ({adminCount})</span>
                    </div>
                  </div>
                </div>

                {/* Ticket sales progress list */}
                <div className="lg:col-span-3 glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 text-xs font-sans">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Event Attendance &amp; Occupancy Levels</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map(ev => {
                      const pct = ev.ticketInventory > 0 ? (ev.ticketsSold / ev.ticketInventory) * 100 : 0;
                      return (
                        <div key={ev.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-[var(--text-primary)] truncate max-w-[200px]">{ev.title}</span>
                            <span className="text-sky-400 font-mono">{ev.ticketsSold}/{ev.ticketInventory} sold ({Math.round(pct)}%)</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-white/5">
                            <div className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      )}

      {/* Sub-tab 5: Reviews & Ratings moderator */}
      {adminSubTab === "reviews" && (
        <div className="space-y-8 animate-[fadeIn_0.25s_ease-out]">
          {/* Reviews & Ratings Moderator Dashboard */}
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-2xl font-bold font-display text-[var(--text-primary)] flex items-center gap-2 font-outfit">
                <Shield className="w-6 h-6 text-sky-400" />
                Reviews &amp; Ratings Moderator
              </h2>
              <button
                type="button"
                onClick={runAbusiveScanChecker}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 font-bold py-1.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition font-outfit animate-pulse"
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
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase font-sans">Search</label>
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
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${r.status === "APPROVED"
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
                        <div className="flex items-center font-sans">
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
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] py-1 px-3 rounded-lg font-semibold transition font-sans"
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
                            className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] py-1 px-3 rounded-lg font-semibold transition font-sans"
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
                            className="bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 text-slate-400 text-[10px] py-1 px-3 rounded-lg font-semibold transition font-sans"
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

          {/* Sponsorship Interest Console */}
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
                              <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[240px] font-outfit">{evTitle}</span>
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
                                    <td className="px-3 py-2.5 text-right">
                                      <button
                                        type="button"
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
        </div>
      )}
    </div>
  );
};
