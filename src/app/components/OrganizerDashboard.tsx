import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Ticket,
  Check,
  X,
  Shield,
  RefreshCw,
  Layers,
  Trash2,
  Edit2,
  Search,
  Star,
  ShieldAlert,
  FileText,
  Activity,
  DollarSign,
  Mic,
  TrendingUp,
  BarChart2,
  Settings,
  Mail,
  QrCode,
  ClipboardList,
  Award,
  Truck,
  Store,
  Briefcase,
  AlertCircle,
  Download,
  Upload,
  UserCheck,
  Smartphone
} from "lucide-react";
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
  // Navigation Tabs
  const [activeSubTab, setActiveSubTab] = useState<"listings" | "globalReports" | "approvals">("listings");

  // Filter Toolbar (Listings)
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

  // Command Center Modal Overlay State
  const [commandCenterEventId, setCommandCenterEventId] = useState<string | null>(null);
  const [commandActiveTab, setCommandActiveTab] = useState<
    "overview" | "schedule" | "venue" | "attendees" | "exhibitors" | "booths" | "vendors" | "foodTrucks" | "sponsors" | "communications" | "documents" | "payments" | "analytics" | "settings"
  >("overview");

  // Modal Child Forms Local States
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionStart, setNewSessionStart] = useState("10:00 AM");
  const [newSessionEnd, setNewSessionEnd] = useState("11:30 AM");
  const [newSessionRoom, setNewSessionRoom] = useState("Room A");
  const [newSessionCap, setNewSessionCap] = useState("50");
  const [newSessionSpeakerId, setNewSessionSpeakerId] = useState("");

  const [newSpeakerName, setNewSpeakerName] = useState("");
  const [newSpeakerEmail, setNewSpeakerEmail] = useState("");
  const [newSpeakerBio, setNewSpeakerBio] = useState("");

  const [newAttendeeName, setNewAttendeeName] = useState("");
  const [newAttendeeEmail, setNewAttendeeEmail] = useState("");
  const [attendeeImportText, setAttendeeImportText] = useState("");

  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("Contract");

  // Exhibitor and Food Truck Registration Form Simulation
  const [exhibitorCompanyName, setExhibitorCompanyName] = useState("");
  const [exhibitorContactName, setExhibitorContactName] = useState("");
  const [exhibitorEmail, setExhibitorEmail] = useState("");
  const [exhibitorPhone, setExhibitorPhone] = useState("");
  const [exhibitorWeb, setExhibitorWeb] = useState("");
  const [exhibitorInd, setExhibitorInd] = useState("Technology");
  
  const [truckBusinessName, setTruckBusinessName] = useState("");
  const [truckName, setTruckName] = useState("");
  const [truckCuisine, setTruckCuisine] = useState("");
  const [truckPermit, setTruckPermit] = useState("");
  const [truckPower, setTruckPower] = useState("50 Amp");
  const [truckWater, setTruckWater] = useState(false);
  const [truckSpot, setTruckSpot] = useState("Spot A");

  const [vendorNameSim, setVendorNameSim] = useState("");
  const [vendorCatSim, setVendorCatSim] = useState("Promotional");
  const [vendorTaxId, setVendorTaxId] = useState("");
  const [vendorSpace, setVendorSpace] = useState("Space 10");

  const [sponsorNameSim, setSponsorNameSim] = useState("");
  const [sponsorLevelSim, setSponsorLevelSim] = useState("Gold");

  // Venue Integration Conflict Flags
  const [venueConflictAlert, setVenueConflictAlert] = useState<string | null>(null);

  // Active CommandCenter Event instance lookup
  const activeEvent = useMemo(() => {
    return events.find(e => e.id === commandCenterEventId) || null;
  }, [events, commandCenterEventId]);

  // Handler: Register Profile
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

  // Helper to commit changes to activeEvent in global events list
  const updateActiveEvent = (updated: Partial<Event>) => {
    if (!commandCenterEventId) return;
    setEvents(prev => prev.map(e => e.id === commandCenterEventId ? { ...e, ...updated } : e));
  };

  // Handle Event Creation template (Quick setup)
  const handleCreateNewEvent = () => {
    if (!activeOrganizerProfile) return;
    const newId = `evt-${Date.now()}`;
    const newEventObj: Event = {
      id: newId,
      title: "New Scheduled Expo / Conference",
      description: "Enter full description here.",
      location: "San Francisco Center",
      date: "2026-07-20",
      price: 150,
      ticketInventory: 300,
      ticketsSold: 0,
      status: "UPCOMING",
      category: "Technology",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
      organizerId: activeOrganizerProfile.id,
      moderationStatus: "PENDING",
      code: `EXPO-${Math.floor(1000 + Math.random() * 9000)}`,
      eventStatus: "Draft",
      endDate: "2026-07-21",
      timezone: "PST",
      registrationOpenDate: "2026-06-15",
      registrationCloseDate: "2026-07-15",
      maxCapacity: 300,
      waitlistEnabled: true,
      waitlistCapacity: 50,
      registrationRequired: true,
      eventType: "In-Person",
      currency: "USD",
      budget: 5000,
      actualCost: 1200,
      sponsorshipTarget: 10000,
      sessions: [],
      speakers: [],
      registrations: [],
      foodTrucks: [],
      vendors: [],
      exhibitors: [],
      documents: []
    };

    setEvents(prev => [newEventObj, ...prev]);
    setCommandCenterEventId(newId);
    setCommandActiveTab("overview");
    addSagaLog("Organizer-Service", `Drafted new event code: ${newEventObj.code}`, "info");
    alert("New draft event template created! Command Center is open.");
  };

  // CRUD Lifecycle actions inside Command Center
  const handlePublishToggle = () => {
    if (!activeEvent) return;
    const current = activeEvent.eventStatus || "Draft";
    const next = current === "Published" ? "Draft" : "Published";
    updateActiveEvent({ eventStatus: next });
    addSagaLog("Organizer-Service", `Toggled status of ${activeEvent.title} to: ${next}`, "info");
  };

  const handleCancelEvent = () => {
    if (!activeEvent) return;
    if (confirm("Are you sure you want to cancel this event and notify all attendees?")) {
      updateActiveEvent({ eventStatus: "Cancelled", status: "CANCELLED" });
      addSagaLog("Organizer-Service", `Cancelled event: ${activeEvent.title}. Attendance alerts dispatched.`, "error");
      addNotification("Event Cancelled", `The event "${activeEvent.title}" has been cancelled. Refunds are processing.`, "ATTENDEE");
      alert("Event has been cancelled. Notification notifications pushed.");
    }
  };

  // Speaker Actions
  const handleAddSpeaker = () => {
    if (!activeEvent || !newSpeakerName.trim()) return;
    const newSpeaker = {
      id: `spk-${Date.now()}`,
      name: newSpeakerName,
      email: newSpeakerEmail,
      phone: "555-0100",
      bio: newSpeakerBio || "Guest speaker.",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80"
    };
    const current = activeEvent.speakers || [];
    updateActiveEvent({ speakers: [...current, newSpeaker] });
    setNewSpeakerName("");
    setNewSpeakerEmail("");
    setNewSpeakerBio("");
    alert("Speaker added successfully.");
  };

  const handleRemoveSpeaker = (id: string) => {
    if (!activeEvent) return;
    const current = activeEvent.speakers || [];
    updateActiveEvent({ speakers: current.filter(s => s.id !== id) });
  };

  // Session Actions
  const handleAddSession = () => {
    if (!activeEvent || !newSessionName.trim()) return;
    const newSession = {
      id: `ses-${Date.now()}`,
      name: newSessionName,
      startTime: newSessionStart,
      endTime: newSessionEnd,
      speakerId: newSessionSpeakerId,
      room: newSessionRoom,
      capacity: parseInt(newSessionCap) || 50
    };
    const current = activeEvent.sessions || [];
    updateActiveEvent({ sessions: [...current, newSession] });
    setNewSessionName("");
    alert("Session created and added to schedule.");
  };

  const handleRemoveSession = (id: string) => {
    if (!activeEvent) return;
    const current = activeEvent.sessions || [];
    updateActiveEvent({ sessions: current.filter(s => s.id !== id) });
  };

  // Attendee registration Actions
  const handleAddAttendee = () => {
    if (!activeEvent || !newAttendeeName.trim() || !newAttendeeEmail.trim()) return;
    
    // Capacity check
    const currentRegs = activeEvent.registrations || [];
    const limit = activeEvent.maxCapacity || 500;
    let status: "Approved" | "Waitlisted" = "Approved";

    if (currentRegs.filter(r => r.status === "Approved").length >= limit) {
      if (activeEvent.waitlistEnabled) {
        status = "Waitlisted";
      } else {
        alert("Event capacity reached and waitlisting is disabled.");
        return;
      }
    }

    const newReg = {
      id: `reg-${Date.now()}`,
      name: newAttendeeName,
      email: newAttendeeEmail,
      status: status,
      date: new Date().toLocaleDateString(),
      checkedIn: false
    };

    updateActiveEvent({ 
      registrations: [...currentRegs, newReg],
      ticketsSold: status === "Approved" ? activeEvent.ticketsSold + 1 : activeEvent.ticketsSold
    });
    setNewAttendeeName("");
    setNewAttendeeEmail("");
    alert(`Attendee successfully added as: ${status}!`);
  };

  const handleRemoveAttendee = (id: string) => {
    if (!activeEvent) return;
    const currentRegs = activeEvent.registrations || [];
    const target = currentRegs.find(r => r.id === id);
    const sub = target?.status === "Approved" ? 1 : 0;
    
    updateActiveEvent({
      registrations: currentRegs.filter(r => r.id !== id),
      ticketsSold: Math.max(0, activeEvent.ticketsSold - sub)
    });
  };

  const handleCheckInAttendee = (id: string) => {
    if (!activeEvent) return;
    const currentRegs = activeEvent.registrations || [];
    updateActiveEvent({
      registrations: currentRegs.map(r => r.id === id ? { ...r, checkedIn: !r.checkedIn } : r)
    });
  };

  const handleImportAttendees = () => {
    if (!activeEvent || !attendeeImportText.trim()) return;
    const lines = attendeeImportText.split("\n").map(l => l.trim()).filter(Boolean);
    const parsedRegs = lines.map((line, idx) => {
      const [name, email] = line.split(",").map(item => item.trim().replace(/^["']|["']$/g, ''));
      return {
        id: `reg-import-${Date.now()}-${idx}`,
        name: name || "Imported Attendee",
        email: email || "imported@user.com",
        status: "Approved" as const,
        date: new Date().toLocaleDateString(),
        checkedIn: false
      };
    });

    const currentRegs = activeEvent.registrations || [];
    updateActiveEvent({
      registrations: [...currentRegs, ...parsedRegs],
      ticketsSold: activeEvent.ticketsSold + parsedRegs.length
    });
    setAttendeeImportText("");
    alert(`Imported ${parsedRegs.length} attendees successfully!`);
  };

  const handleExportAttendees = () => {
    if (!activeEvent) return;
    const list = activeEvent.registrations || [];
    const headers = ["id", "name", "email", "status", "registrationDate", "checkedIn"];
    const csvContent = [headers.join(",")];
    list.forEach(r => {
      csvContent.push([r.id, `"${r.name}"`, r.email, r.status, r.date, r.checkedIn].join(","));
    });

    const blob = new Blob([csvContent.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event_${activeEvent.id}_attendees.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Venue assigning conflict checks
  const handleAssignVenueId = (venueId: string) => {
    if (!activeEvent) return;
    if (venueId === "none") {
      updateActiveEvent({ venueId: undefined });
      setVenueConflictAlert(null);
      return;
    }

    const vn = venues.find(v => v.id === venueId);
    if (vn) {
      // 1. Availability check
      const normalizedEventDate = activeEvent.date;
      const isAvailable = vn.availableDates.some(availDate => availDate === normalizedEventDate);
      
      // 2. Double booking check
      const doubleBooked = venueBookings.some(b => 
        b.venueId === vn.id && 
        b.date === normalizedEventDate && 
        b.status === "CONFIRMED" && 
        b.eventId !== activeEvent.id
      );

      // 3. Capacity match check
      const capMismatch = activeEvent.ticketInventory > vn.capacity;

      let alertMsg = null;
      if (!isAvailable) {
        alertMsg = `⚠️ Conflict: "${vn.name}" does not list availability for event date ${activeEvent.date}.`;
      } else if (doubleBooked) {
        alertMsg = `⚠️ Double Booking: "${vn.name}" is already booked on ${activeEvent.date} by another event.`;
      } else if (capMismatch) {
        alertMsg = `⚠️ Capacity Conflict: Event expected inventory (${activeEvent.ticketInventory}) exceeds venue capacity (${vn.capacity}).`;
      }

      setVenueConflictAlert(alertMsg);
      updateActiveEvent({ venueId: vn.id, location: `${vn.name}, ${vn.location}` });
      
      // log to bookings
      setVenueBookings(prev => {
        const filtered = prev.filter(b => b.eventId !== activeEvent.id);
        return [...filtered, {
          id: `vb-cc-${Date.now()}`,
          venueId: vn.id,
          eventId: activeEvent.id,
          eventTitle: activeEvent.title,
          date: activeEvent.date,
          status: "CONFIRMED"
        }];
      });
    }
  };

  // Exhibitor Actions
  const handleAddExhibitorSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !exhibitorCompanyName.trim()) return;
    const newEx = {
      id: `exh-${Date.now()}`,
      companyName: exhibitorCompanyName,
      contactName: exhibitorContactName || "Exhibitor contact",
      email: exhibitorEmail || "exh@company.com",
      phone: exhibitorPhone || "555-0100",
      website: exhibitorWeb || "www.company.com",
      industry: exhibitorInd,
      status: "Pending" as const,
      boothRequested: "Standard #1"
    };

    const current = activeEvent.exhibitors || [];
    updateActiveEvent({ exhibitors: [...current, newEx] });
    setExhibitorCompanyName("");
    setExhibitorContactName("");
    setExhibitorEmail("");
    setExhibitorPhone("");
    setExhibitorWeb("");
    alert("Exhibitor application submitted for review.");
  };

  const handleApproveExhibitor = (id: string, boothToAssign?: string) => {
    if (!activeEvent) return;
    const current = activeEvent.exhibitors || [];
    updateActiveEvent({
      exhibitors: current.map(e => e.id === id ? { ...e, status: "Approved", boothAssigned: boothToAssign || "Booth #10" } : e)
    });
  };

  // Food Truck simulation Actions
  const handleAddFoodTruckSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !truckBusinessName.trim()) return;
    const newFT = {
      id: `ft-${Date.now()}`,
      name: truckBusinessName,
      cuisine: truckCuisine || "Diverse Cuisine",
      permitNumber: truckPermit || "FPM-9080",
      powerRequired: truckPower,
      waterRequired: truckWater,
      spot: truckSpot,
      status: "Pending" as const
    };

    const current = activeEvent.foodTrucks || [];
    updateActiveEvent({ foodTrucks: [...current, newFT] });
    setTruckBusinessName("");
    setTruckName("");
    setTruckCuisine("");
    setTruckPermit("");
    alert("Food Truck application added and pending approval.");
  };

  const handleApproveFoodTruck = (id: string) => {
    if (!activeEvent) return;
    const current = activeEvent.foodTrucks || [];
    updateActiveEvent({
      foodTrucks: current.map(ft => ft.id === id ? { ...ft, status: "Approved" } : ft)
    });
  };

  // Vendor marketplace actions
  const handleAddVendorSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !vendorNameSim.trim()) return;
    const newVnd = {
      id: `vnd-sim-${Date.now()}`,
      name: vendorNameSim,
      category: vendorCatSim,
      taxId: vendorTaxId || "TAX-1234",
      license: "BUS-LIC-9090",
      space: vendorSpace,
      status: "Pending" as const
    };
    const current = activeEvent.vendors || [];
    updateActiveEvent({ vendors: [...current, newVnd] });
    setVendorNameSim("");
    setVendorTaxId("");
    alert("Vendor registered.");
  };

  // Document actions
  const handleAddDocSim = () => {
    if (!activeEvent || !newDocName.trim()) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: newDocName,
      type: newDocType,
      fileUrl: `/docs/simulated_${newDocName.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      expiryDate: "2027-12-31"
    };
    const current = activeEvent.documents || [];
    updateActiveEvent({ documents: [...current, newDoc] });
    setNewDocName("");
    alert("Document uploaded.");
  };

  // Global consolidated reports calculation
  const totalReportsMetrics = useMemo(() => {
    const orgEvents = events.filter(e => e.organizerId === activeOrganizerProfile?.id);
    let totalTicketsSold = 0;
    let totalTicketRevenue = 0;
    let totalSponsorRevenue = 0;
    let totalBoothRevenue = 0;
    let registrantsCount = 0;
    let checkedInAttendees = 0;

    orgEvents.forEach(e => {
      // Tickets
      totalTicketsSold += e.ticketsSold;
      totalTicketRevenue += e.ticketsSold * e.price;
      
      // Sponsors
      const evSponsors = sponsorApplications.filter(a => a.eventId === e.id && a.status === "APPROVED");
      evSponsors.forEach(s => {
        totalSponsorRevenue += s.packagePrice;
      });

      // Booths
      const evBooths = boothApplications.filter(a => a.eventId === e.id && a.status === "APPROVED");
      evBooths.forEach(b => {
        totalBoothRevenue += b.price;
      });

      // Attendee Registrants
      const list = e.registrations || [];
      registrantsCount += list.length;
      checkedInAttendees += list.filter(r => r.checkedIn).length;
    });

    const totalGMV = totalTicketRevenue + totalSponsorRevenue + totalBoothRevenue;

    return {
      totalTicketsSold,
      totalTicketRevenue,
      totalSponsorRevenue,
      totalBoothRevenue,
      totalGMV,
      registrantsCount,
      checkedInAttendees
    };
  }, [events, activeOrganizerProfile, sponsorApplications, boothApplications]);

  const handleApproveBoothApplication = (app: BoothApplication) => {
    // 1. Map status to APPROVED
    setBoothApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "APPROVED" as const } : a));

    // 2. Assign booth slot: update the booth's status to SOLD and vendorBusinessName
    setBooths(prev => prev.map(b => {
      if (b.id === app.boothId) {
        return {
          ...b,
          status: "SOLD" as const,
          vendorBusinessName: app.vendorName,
          paymentTerms: app.paymentTerms,
          amountPaid: app.amountPaid
        };
      }
      return b;
    }));

    // 3. Update the event's vendors array
    setEvents(prevEvents => prevEvents.map(ev => {
      if (ev.id === app.eventId) {
        const currentVendors = ev.vendors || [];
        if (!currentVendors.some(v => v.name === app.vendorName)) {
          const newVendor = {
            id: `vnd-${Date.now()}`,
            name: app.vendorName,
            category: app.category,
            taxId: "TAX-SIM",
            license: "LIC-SIM",
            space: app.boothName,
            status: "Approved" as const
          };
          return {
            ...ev,
            vendors: [...currentVendors, newVendor]
          };
        }
      }
      return ev;
    }));

    // 4. Log order record
    const newOrder: Order = {
      id: `ord-booth-${Date.now()}`,
      eventId: app.eventId,
      eventTitle: app.eventTitle,
      quantity: 1,
      totalAmount: app.price,
      promoApplied: null,
      status: "PAID" as const,
      timestamp: new Date().toISOString().split("T")[0],
      paymentGateway: "Stripe",
      idempotencyKey: `idem-booth-${app.id}`,
      type: "BOOTH" as const,
      boothId: app.boothId,
      boothName: app.boothName,
      vendorBusinessName: app.vendorName,
      paymentTerms: app.paymentTerms,
      amountPaid: app.amountPaid,
      remainingBalance: app.price - app.amountPaid
    };
    setOrders(prev => [...prev, newOrder]);

    // 5. Trigger notification
    addNotification(
      "Booth Application Approved",
      `Your lease for ${app.boothName} at ${app.eventTitle} has been approved.`,
      "VENDOR"
    );

    // 6. Log saga event
    addSagaLog(
      "Booth-Leasing-Service",
      `Transaction committed: booth lease approved for vendor ${app.vendorName}. Order ID: ${newOrder.id}`,
      "success"
    );

    alert(`Booth ${app.boothName} approved for ${app.vendorName}`);
  };

  const handleApproveSponsorApplication = (app: SponsorApplication) => {
    // 1. Map status to APPROVED
    setSponsorApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "APPROVED" as const } : a));

    // 2. Log order record
    const newOrder: Order = {
      id: `ord-sponsor-${Date.now()}`,
      eventId: app.eventId,
      eventTitle: app.eventTitle,
      quantity: 1,
      totalAmount: app.packagePrice,
      promoApplied: null,
      status: "PAID" as const,
      timestamp: new Date().toISOString().split("T")[0],
      paymentGateway: "Stripe",
      idempotencyKey: `idem-sponsor-${app.id}`,
      type: "SPONSOR" as const,
      vendorBusinessName: app.companyName
    };
    setOrders(prev => [...prev, newOrder]);

    // 3. Trigger notification
    addNotification(
      "Sponsorship Approved",
      `Your sponsor application for ${app.packageName} at ${app.eventTitle} has been approved.`,
      "SPONSOR"
    );

    // 4. Log saga event
    addSagaLog(
      "Sponsor-Service",
      `Transaction committed: sponsorship approved for ${app.companyName}. Order ID: ${newOrder.id}`,
      "success"
    );

    alert(`Sponsorship for ${app.companyName} approved successfully.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Session Header / Verified Badge */}
      {!activeOrganizerProfile ? (
        <div className="max-w-md mx-auto glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/25">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">Organizer Verification Portal</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Verify organization details to list, duplicate, edit, and publish events.</p>
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
                  placeholder="Acme Trade Shows LLC"
                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Contact Manager *</label>
                <input
                  type="text"
                  required
                  value={regOrgContactName}
                  onChange={(e) => setRegOrgContactName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regOrgEmail}
                    onChange={(e) => setRegOrgEmail(e.target.value)}
                    placeholder="organizer@acme.com"
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={regOrgPhone}
                    onChange={(e) => setRegOrgPhone(e.target.value)}
                    placeholder="+1 555-0988"
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3.5 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-[2] bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-sky-500/20"
                >
                  <Smartphone className="w-4 h-4" />
                  Request OTP Verification
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveOrganizerProfile({
                      id: "org-sarah",
                      organizationName: "Sarah Connor Events LLC",
                      contactName: "Sarah Connor",
                      email: "sarah@sfvenues.com",
                      phone: "+1 555-9011",
                      status: "VERIFIED"
                    });
                    addSagaLog("Auth-Service", `Quick login: Sarah Connor Organizer Profile loaded successfully.`, "info");
                  }}
                  className="flex-[1] bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-[10px] px-2 rounded-xl text-[var(--text-secondary)] font-semibold transition cursor-pointer"
                >
                  Quick Bypass
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOrganizerOtp} className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                  <label className="font-semibold">SMS Code</label>
                  <span>Verification code: <strong>123456</strong></span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={organizerOtpInput}
                  onChange={(e) => setOrganizerOtpInput(e.target.value)}
                  placeholder="e.g. 123456"
                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2.5 px-3 text-center text-lg tracking-widest text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 font-mono font-bold w-full focus:outline-none focus:border-sky-500"
                />
                {organizerOtpError && (
                  <p className="text-rose-400 text-xs text-center font-medium mt-1 flex items-center justify-center gap-1">
                    <X className="w-3.5 h-3.5" /> {organizerOtpError}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrganizerRegStep("form")}
                  className="w-1/2 bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-xs py-2.5 rounded-xl text-[var(--text-secondary)] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Verify Credentials
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-6 font-sans">
          
          {/* Active Session Overview & Sub-Tabs */}
          <div className="glass rounded-2xl border border-[var(--glass-border)] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] font-outfit">{activeOrganizerProfile.organizationName}</h2>
                <span className="text-[9px] text-sky-400 font-mono tracking-widest uppercase font-bold">Authorized Event Organizer</span>
              </div>
            </div>

            {/* Dashboard Sub-Tabs */}
            <div className="flex bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--glass-border)] text-xs">
              <button
                onClick={() => setActiveSubTab("listings")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${activeSubTab === "listings" ? "bg-sky-500 text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              >
                Event Listings
              </button>
              <button
                onClick={() => setActiveSubTab("globalReports")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${activeSubTab === "globalReports" ? "bg-sky-500 text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              >
                Operational Analytics
              </button>
              <button
                onClick={() => setActiveSubTab("approvals")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${activeSubTab === "approvals" ? "bg-sky-500 text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              >
                Global Approvals Queue
              </button>
            </div>

            <button
              onClick={() => setActiveOrganizerProfile(null)}
              className="text-xs text-[var(--text-secondary)] hover:text-rose-400 font-medium transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          {/* ===================== SUB TAB 1: EVENT LISTINGS ===================== */}
          {activeSubTab === "listings" && (
            <div className="space-y-4">
              
              {/* Toolbar Controls */}
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-secondary)]/50" />
                    <input
                      type="text"
                      placeholder="Filter event listings by title, code, venue name..."
                      value={orgListingsSearch}
                      onChange={(e) => setOrgListingsSearch(e.target.value)}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 pl-9 pr-4 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 placeholder-[var(--text-secondary)]/50 font-sans"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCreateNewEvent}
                      className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Create Event
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Category</label>
                    <select
                      value={orgListingsCategory}
                      onChange={(e) => setOrgListingsCategory(e.target.value)}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] rounded-lg py-1.5 px-2.5 w-full focus:outline-none focus:border-sky-500 cursor-pointer font-sans"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Technology">Technology</option>
                      <option value="Music">Music</option>
                      <option value="Food & Drink">Food & Drink</option>
                      <option value="Business">Business</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Moderation Status</label>
                    <select
                      value={orgListingsStatus}
                      onChange={(e) => setOrgListingsStatus(e.target.value)}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] rounded-lg py-1.5 px-2.5 w-full focus:outline-none focus:border-sky-500 cursor-pointer font-sans"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* listings Table */}
              <div className="overflow-x-auto rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] overflow-y-auto">
                {(() => {
                  const orgEvents = events.filter(e => e.organizerId === activeOrganizerProfile.id);
                  if (orgEvents.length === 0) {
                    return (
                      <div className="text-center py-16 text-xs text-[var(--text-secondary)] space-y-2">
                        <Calendar className="w-10 h-10 mx-auto text-[var(--text-secondary)]/35" />
                        <p className="font-bold">No listed properties or active events found.</p>
                      </div>
                    );
                  }

                  const filtered = orgEvents.filter(ev => {
                    if (orgListingsSearch) {
                      const q = orgListingsSearch.toLowerCase();
                      const matchTitle = ev.title.toLowerCase().includes(q);
                      const matchLoc = ev.location.toLowerCase().includes(q);
                      const matchCode = (ev.code || "").toLowerCase().includes(q);
                      if (!matchTitle && !matchLoc && !matchCode) return false;
                    }
                    if (orgListingsCategory !== "ALL" && ev.category !== orgListingsCategory) return false;
                    if (orgListingsStatus !== "ALL" && (ev.moderationStatus || "APPROVED") !== orgListingsStatus) return false;
                    return true;
                  });

                  return (
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="border-b border-[var(--glass-border)] bg-slate-900/40 text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                          <th className="py-3 px-4 font-bold">Event Details</th>
                          <th className="py-3 px-4 font-bold">Category</th>
                          <th className="py-3 px-4 font-bold">Date & Venue</th>
                          <th className="py-3 px-4 font-bold text-right">Standard Fee</th>
                          <th className="py-3 px-4 font-bold">Metrics Summary</th>
                          <th className="py-3 px-4 font-bold">Approval</th>
                          <th className="py-3 px-4 font-bold text-right">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--glass-border)] text-xs">
                        {filtered.map(ev => {
                          const boothsCount = booths.filter(b => b.eventId === ev.id).length;
                          const regCount = (ev.registrations || []).length;
                          
                          return (
                            <tr key={ev.id} className="hover:bg-slate-800/10 transition-colors">
                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-[var(--text-primary)] text-sm">{ev.title}</span>
                                  <div className="flex gap-2">
                                    <span className="font-mono text-[9px] text-sky-400 font-bold uppercase">{ev.code || "EVT-MOCK"}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">({ev.eventStatus || "Published"})</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 align-middle">
                                <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-[var(--glass-border)] text-[var(--text-secondary)] text-[10px] font-bold font-sans">
                                  {ev.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 align-middle">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-[var(--text-primary)]">{ev.date}</span>
                                  <p className="text-[10px] text-[var(--text-secondary)] italic flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                    {ev.location}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4 align-middle text-right font-mono font-bold text-sky-400">
                                ${ev.price}
                              </td>
                              <td className="py-3 px-4 align-middle">
                                <div className="space-y-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
                                  <div>Regs: <strong className="text-[var(--text-primary)]">{regCount}</strong> / {ev.maxCapacity || ev.ticketInventory}</div>
                                  <div>Booths: <strong className="text-[var(--text-primary)]">{boothsCount}</strong> slots</div>
                                </div>
                              </td>
                              <td className="py-3 px-4 align-middle">
                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                                  (ev.moderationStatus || "APPROVED") === "APPROVED"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                }`}>
                                  {ev.moderationStatus || "APPROVED"}
                                </span>
                              </td>
                              <td className="py-3 px-4 align-middle text-right">
                                <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => {
                                      setCommandCenterEventId(ev.id);
                                      setCommandActiveTab("overview");
                                    }}
                                    className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-1 px-3 rounded-lg text-[10px] transition cursor-pointer"
                                  >
                                    Command Center
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateEvent(ev.id)}
                                    className="bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] text-[10px] py-1 px-2.5 rounded-lg transition font-semibold cursor-pointer"
                                  >
                                    Clone
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(ev.id)}
                                    className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 p-1 rounded-lg transition cursor-pointer"
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

          {/* ===================== SUB TAB 2: OPERATIONAL ANALYTICS ===================== */}
          {activeSubTab === "globalReports" && (
            <div className="space-y-6 font-sans">
              
              {/* Financial & Registrations Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass rounded-xl border border-[var(--glass-border)] p-4 space-y-1 relative overflow-hidden">
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-sky-500/10">
                    <Users className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">Total Event Registrants</span>
                  <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                    {totalReportsMetrics.registrantsCount}
                  </span>
                </div>

                <div className="glass rounded-xl border border-[var(--glass-border)] p-4 space-y-1 relative overflow-hidden">
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-emerald-500/10">
                    <QrCode className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">Checked In Attendance Rate</span>
                  <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                    {totalReportsMetrics.registrantsCount > 0 
                      ? `${((totalReportsMetrics.checkedInAttendees / totalReportsMetrics.registrantsCount) * 100).toFixed(1)}%`
                      : "0.0%"}
                  </span>
                  <span className="text-[9px] text-[var(--text-secondary)] block font-mono">({totalReportsMetrics.checkedInAttendees} of {totalReportsMetrics.registrantsCount} checked-in)</span>
                </div>

                <div className="glass rounded-xl border border-[var(--glass-border)] p-4 space-y-1 relative overflow-hidden">
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-amber-500/10">
                    <DollarSign className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">Gross Event GMV</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    ${totalReportsMetrics.totalGMV.toLocaleString()}
                  </span>
                </div>

                <div className="glass rounded-xl border border-[var(--glass-border)] p-4 space-y-1 relative overflow-hidden">
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-indigo-500/10">
                    <Ticket className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">Tickets Sold</span>
                  <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                    {totalReportsMetrics.totalTicketsSold}
                  </span>
                </div>
              </div>

              {/* Revenue breakdown by source */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue Streams Chart */}
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 lg:col-span-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-sky-400" />
                    Revenue Channels Breakdown
                  </h3>
                  
                  <div className="space-y-4 pt-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono font-bold">
                        <span>Ticket Sales</span>
                        <span className="text-sky-400">${totalReportsMetrics.totalTicketRevenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2.5 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${totalReportsMetrics.totalGMV > 0 ? (totalReportsMetrics.totalTicketRevenue / totalReportsMetrics.totalGMV) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-mono font-bold">
                        <span>Booth Leases</span>
                        <span className="text-indigo-400">${totalReportsMetrics.totalBoothRevenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2.5 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${totalReportsMetrics.totalGMV > 0 ? (totalReportsMetrics.totalBoothRevenue / totalReportsMetrics.totalGMV) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-mono font-bold">
                        <span>Brand Sponsorships</span>
                        <span className="text-amber-400">${totalReportsMetrics.totalSponsorRevenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2.5 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalReportsMetrics.totalGMV > 0 ? (totalReportsMetrics.totalSponsorRevenue / totalReportsMetrics.totalGMV) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Events Performance Directory */}
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 lg:col-span-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono">
                    Per-Event Registration & Capacity Utilization
                  </h3>
                  
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {events.filter(e => e.organizerId === activeOrganizerProfile.id).map(ev => {
                      const totalRegs = (ev.registrations || []).length;
                      const cap = ev.maxCapacity || ev.ticketInventory || 100;
                      const pct = Math.min(100, (totalRegs / cap) * 100);
                      
                      return (
                        <div key={ev.id} className="space-y-1 text-xs">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-[var(--text-primary)]">{ev.title}</span>
                            <span className="font-mono text-[var(--text-secondary)]">({totalRegs} / {cap} Pax · {pct.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full h-2 bg-[var(--input-bg)] rounded-full overflow-hidden border border-[var(--glass-border)]">
                            <div className={`h-full rounded-full transition-all ${pct > 90 ? "bg-rose-500" : pct > 50 ? "bg-sky-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ===================== SUB TAB 3: GLOBAL APPROVALS QUEUE ===================== */}
          {activeSubTab === "approvals" && (
            <div className="space-y-6 font-sans">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Booth applications */}
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-4">
                  <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Store className="w-4.5 h-4.5 text-indigo-400" />
                    Exhibitor Booth Applications ({boothApplications.filter(a => a.status === "PENDING").length})
                  </h3>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {boothApplications.filter(a => a.status === "PENDING").length === 0 ? (
                      <p className="text-xs text-[var(--text-secondary)] italic text-center py-8">No pending exhibitor booth requests.</p>
                    ) : (
                      boothApplications.filter(a => a.status === "PENDING").map(app => (
                        <div key={app.id} className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-3.5 space-y-2 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-[var(--text-primary)] block">{app.vendorName}</span>
                              <span className="text-[10px] text-[var(--text-secondary)]">{app.eventTitle} · {app.boothName}</span>
                            </div>
                            <span className="font-mono font-bold text-indigo-400">${app.price}</span>
                          </div>

                          <div className="flex justify-end gap-2 pt-1.5 border-t border-[var(--glass-border)]">
                            <button
                              onClick={() => {
                                setBoothApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "REJECTED" } : a));
                                addNotification("Booth Leasing Rejected", `Your lease application for ${app.eventTitle} was rejected.`, "VENDOR");
                              }}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] py-1 px-2.5 rounded font-bold transition cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveBoothApplication(app)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] py-1 px-2.5 rounded font-bold transition cursor-pointer"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sponsorship applications */}
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-4">
                  <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Award className="w-4.5 h-4.5 text-amber-400" />
                    Sponsor Package Requests ({sponsorApplications.filter(a => a.status === "PENDING").length})
                  </h3>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {sponsorApplications.filter(a => a.status === "PENDING").length === 0 ? (
                      <p className="text-xs text-[var(--text-secondary)] italic text-center py-8">No pending sponsor applications.</p>
                    ) : (
                      sponsorApplications.filter(a => a.status === "PENDING").map(app => (
                        <div key={app.id} className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-3.5 space-y-2 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-[var(--text-primary)] block">{app.companyName}</span>
                              <span className="text-[10px] text-[var(--text-secondary)]">{app.eventTitle} · {app.packageName}</span>
                            </div>
                            <span className="font-mono font-bold text-amber-400">${app.packagePrice}</span>
                          </div>

                          <div className="flex justify-end gap-2 pt-1.5 border-t border-[var(--glass-border)]">
                            <button
                              onClick={() => {
                                setSponsorApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "REJECTED" } : a));
                                addNotification("Sponsorship Rejected", `Your request for ${app.eventTitle} was rejected.`, "SPONSOR");
                              }}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] py-1 px-2.5 rounded font-bold transition cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveSponsorApplication(app)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] py-1 px-2.5 rounded font-bold transition cursor-pointer"
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

        </div>
      )}

      {/* ================================================================================= */}
      {/* ======================= EVENT COMMAND CENTER OVERLAY MODAL ======================= */}
      {/* ================================================================================= */}
      {commandCenterEventId !== null && activeEvent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
          <div className="glass rounded-2xl border border-[var(--glass-border)] max-w-5xl w-full p-6 space-y-6 relative overflow-y-auto max-h-[90vh]">
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-[var(--glass-border)] pb-3">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-outfit">{activeEvent.title}</h3>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>CODE: <strong className="text-sky-400 font-bold">{activeEvent.code || "N/A"}</strong></span>
                  <span>STATUS: <strong className="text-amber-400 font-bold">{activeEvent.eventStatus || "Planning"}</strong></span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setCommandCenterEventId(null);
                  setVenueConflictAlert(null);
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub navigation 14 tabs */}
            <div className="flex flex-wrap gap-1 border-b border-[var(--glass-border)] pb-1.5 text-[10px] font-mono tracking-wider font-bold">
              {[
                "overview", "schedule", "venue", "attendees", "exhibitors", "booths", "vendors", 
                "foodTrucks", "sponsors", "communications", "documents", "payments", "analytics", "settings"
              ].map(tab => (
                <button
                  key={tab}
                  onClick={() => setCommandActiveTab(tab as any)}
                  className={`px-2.5 py-1.5 rounded-lg transition uppercase ${
                    commandActiveTab === tab 
                      ? "bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold" 
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tabs content block */}
            <div className="space-y-4 pt-1 font-sans text-xs">
              
              {/* TAB 1: OVERVIEW */}
              {commandActiveTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Event Title *</label>
                      <input
                        type="text"
                        value={activeEvent.title}
                        onChange={(e) => updateActiveEvent({ title: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Event Category *</label>
                      <select
                        value={activeEvent.category}
                        onChange={(e) => updateActiveEvent({ category: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full"
                      >
                        <option value="Conference">Conference</option>
                        <option value="Trade Show">Trade Show</option>
                        <option value="Webinar">Webinar</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Meetup">Meetup</option>
                        <option value="Corporate Event">Corporate Event</option>
                        <option value="Fundraiser">Fundraiser</option>
                        <option value="Technology">Technology</option>
                        <option value="Music">Music</option>
                        <option value="Food & Drink">Food & Drink</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Event Status Workflow</label>
                      <select
                        value={activeEvent.eventStatus || "Draft"}
                        onChange={(e) => updateActiveEvent({ eventStatus: e.target.value as any })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Planning">Planning</option>
                        <option value="Published">Published</option>
                        <option value="Registration Open">Registration Open</option>
                        <option value="Registration Closed">Registration Closed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Event Description</label>
                    <textarea
                      rows={3}
                      value={activeEvent.description}
                      onChange={(e) => updateActiveEvent({ description: e.target.value })}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full resize-none"
                    />
                  </div>

                  {/* Dates, times, location info */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Start Date *</label>
                      <input
                        type="text"
                        value={activeEvent.date}
                        onChange={(e) => updateActiveEvent({ date: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">End Date</label>
                      <input
                        type="text"
                        value={activeEvent.endDate || ""}
                        onChange={(e) => updateActiveEvent({ endDate: e.target.value })}
                        placeholder="e.g. 2026-07-21"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Time Zone</label>
                      <input
                        type="text"
                        value={activeEvent.timezone || "PST"}
                        onChange={(e) => updateActiveEvent({ timezone: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Event Type</label>
                      <select
                        value={activeEvent.eventType || "In-Person"}
                        onChange={(e) => updateActiveEvent({ eventType: e.target.value as any })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full"
                      >
                        <option value="In-Person">In-Person</option>
                        <option value="Virtual">Virtual</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[var(--glass-border)]">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Branding Banner URL</label>
                      <input
                        type="text"
                        value={activeEvent.imageUrl}
                        onChange={(e) => updateActiveEvent({ imageUrl: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Website URL</label>
                      <input
                        type="text"
                        value={activeEvent.websiteUrl || ""}
                        onChange={(e) => updateActiveEvent({ websiteUrl: e.target.value })}
                        placeholder="https://acmeexpo.com"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handlePublishToggle}
                      className={`py-2 px-4 rounded-xl font-bold transition cursor-pointer ${
                        (activeEvent.eventStatus || "Draft") === "Published" 
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          : "bg-sky-500 hover:bg-sky-400 text-white shadow shadow-sky-500/15"
                      }`}
                    >
                      {(activeEvent.eventStatus || "Draft") === "Published" ? "Draft / Unpublish" : "Publish Event"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCancelEvent}
                      className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 py-2 px-4 rounded-xl font-bold transition cursor-pointer"
                    >
                      Cancel Event
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SCHEDULE & SESSIONS */}
              {commandActiveTab === "schedule" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* Sessions List */}
                    <div className="space-y-3">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Scheduled Sessions ({activeEvent.sessions?.length || 0})</span>
                      
                      {(!activeEvent.sessions || activeEvent.sessions.length === 0) ? (
                        <p className="text-xs text-[var(--text-secondary)] italic">No sessions scheduled yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                          {activeEvent.sessions.map(s => {
                            const speaker = activeEvent.speakers?.find(sp => sp.id === s.speakerId);
                            return (
                              <div key={s.id} className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-3 flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-bold text-[var(--text-primary)] block text-sm">{s.name}</span>
                                  <span className="text-[10px] text-sky-400 font-mono font-bold block">{s.startTime} — {s.endTime} · {s.room}</span>
                                  {speaker && <span className="text-[10px] text-[var(--text-secondary)] block">Speaker: {speaker.name}</span>}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSession(s.id)}
                                  className="text-rose-400 hover:text-rose-300 font-bold"
                                >
                                  Delete
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Add Session Form */}
                    <div className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl p-4 space-y-3">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Create Session slot</span>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] text-[var(--text-secondary)]">Session Name</label>
                        <input
                          type="text"
                          value={newSessionName}
                          onChange={(e) => setNewSessionName(e.target.value)}
                          placeholder="Opening Keynote / Tech Talk"
                          className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-1 px-2 text-xs text-[var(--text-primary)] w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500">Start Time</label>
                          <input type="text" value={newSessionStart} onChange={(e) => setNewSessionStart(e.target.value)} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-0.5 px-2 w-full text-center" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500">End Time</label>
                          <input type="text" value={newSessionEnd} onChange={(e) => setNewSessionEnd(e.target.value)} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-0.5 px-2 w-full text-center" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500">Room</label>
                          <input type="text" value={newSessionRoom} onChange={(e) => setNewSessionRoom(e.target.value)} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-0.5 px-2 w-full text-center" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500">Capacity</label>
                          <input type="number" value={newSessionCap} onChange={(e) => setNewSessionCap(e.target.value)} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-0.5 px-2 w-full text-center font-mono" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-[var(--text-secondary)]">Assign Speaker</label>
                        <select
                          value={newSessionSpeakerId}
                          onChange={(e) => setNewSessionSpeakerId(e.target.value)}
                          className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-1 px-2 text-xs text-[var(--text-primary)] w-full"
                        >
                          <option value="">No Speaker Assigned</option>
                          {activeEvent.speakers?.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddSession}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-1.5 rounded text-[11px] cursor-pointer"
                      >
                        Create Session
                      </button>
                    </div>

                  </div>

                  {/* Speaker Manager */}
                  <div className="border-t border-[var(--glass-border)] pt-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono">Speakers Panel</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Speaker list */}
                      <div className="md:col-span-2 space-y-2">
                        {(!activeEvent.speakers || activeEvent.speakers.length === 0) ? (
                          <p className="text-xs text-[var(--text-secondary)] italic">No guest speakers listed yet.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeEvent.speakers.map(s => (
                              <div key={s.id} className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-3 flex justify-between items-start text-xs">
                                <div>
                                  <span className="font-bold text-[var(--text-primary)] block text-sm">{s.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono block">{s.email}</span>
                                  <p className="text-[10px] text-[var(--text-secondary)] mt-1 line-clamp-2">{s.bio}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSpeaker(s.id)}
                                  className="text-rose-400 hover:text-rose-300 font-bold"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add Speaker Form */}
                      <div className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-3 space-y-2">
                        <span className="font-bold text-[9px] uppercase text-[var(--text-secondary)]">Register New Speaker</span>
                        <input
                          type="text"
                          value={newSpeakerName}
                          onChange={(e) => setNewSpeakerName(e.target.value)}
                          placeholder="Speaker Full Name"
                          className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-1 px-2 text-[11px] text-[var(--text-primary)] w-full"
                        />
                        <input
                          type="email"
                          value={newSpeakerEmail}
                          onChange={(e) => setNewSpeakerEmail(e.target.value)}
                          placeholder="speaker@email.com"
                          className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-1 px-2 text-[11px] text-[var(--text-primary)] w-full font-sans"
                        />
                        <textarea
                          rows={2}
                          value={newSpeakerBio}
                          onChange={(e) => setNewSpeakerBio(e.target.value)}
                          placeholder="Brief biography..."
                          className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-1 px-2 text-[11px] text-[var(--text-primary)] w-full resize-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddSpeaker}
                          className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-1 rounded text-[10px]"
                        >
                          Add Speaker
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: VENUE INTEGRATION */}
              {commandActiveTab === "venue" && (
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl space-y-3">
                    <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5 font-outfit">
                      <MapPin className="w-4.5 h-4.5 text-indigo-400" />
                      Allocate Venue Slot
                    </span>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Select Venue</label>
                      <select
                        value={activeEvent.venueId || "none"}
                        onChange={(e) => handleAssignVenueId(e.target.value)}
                        className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg py-2 px-3 text-xs text-[var(--text-primary)] w-full cursor-pointer"
                      >
                        <option value="none">No Venue Assigned (Manual Location)</option>
                        {venues.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.city}, {v.state})</option>
                        ))}
                      </select>
                    </div>

                    {venueConflictAlert && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-start gap-2 text-[11px] leading-relaxed">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{venueConflictAlert}</span>
                      </div>
                    )}

                    {activeEvent.venueId && (() => {
                      const vn = venues.find(v => v.id === activeEvent.venueId);
                      if (!vn) return null;
                      return (
                        <div className="pt-2 text-xs text-[var(--text-secondary)] grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] uppercase block text-[var(--text-secondary)]">Max Venue Capacity</span>
                            <strong className="text-[var(--text-primary)] font-mono">{vn.capacity} pax</strong>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase block text-[var(--text-secondary)]">Daily Rental Cost</span>
                            <strong className="text-emerald-400 font-mono">${vn.rentalCost || 1200}</strong>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* TAB 4: ATTENDEE REGISTRATION */}
              {commandActiveTab === "attendees" && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Add Attendee */}
                    <div className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-4 space-y-3 lg:col-span-1">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Manual Registrant Entry</span>
                      
                      <input
                        type="text"
                        value={newAttendeeName}
                        onChange={(e) => setNewAttendeeName(e.target.value)}
                        placeholder="Name"
                        className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full"
                      />
                      <input
                        type="email"
                        value={newAttendeeEmail}
                        onChange={(e) => setNewAttendeeEmail(e.target.value)}
                        placeholder="email@user.com"
                        className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-1.5 px-2.5 text-xs text-[var(--text-primary)] w-full font-sans"
                      />
                      <button
                        type="button"
                        onClick={handleAddAttendee}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-1.5 rounded text-[11px]"
                      >
                        Add Attendee
                      </button>

                      {/* CSV import text area */}
                      <div className="border-t border-[var(--glass-border)] pt-3 space-y-2">
                        <span className="font-bold text-[9px] uppercase text-[var(--text-secondary)] block">Bulk Paste (CSV)</span>
                        <textarea
                          rows={3}
                          value={attendeeImportText}
                          onChange={(e) => setAttendeeImportText(e.target.value)}
                          placeholder="John Doe, john@doe.com&#10;Sarah Connor, sarah@fight.com"
                          className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded p-2 text-[10px] text-[var(--text-primary)] w-full font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleImportAttendees}
                          className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] py-1.5 rounded text-[10px] font-bold"
                        >
                          Import List
                        </button>
                      </div>
                    </div>

                    {/* Registrants Table directory */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Registrants List ({(activeEvent.registrations || []).length})</span>
                        <button
                          onClick={handleExportAttendees}
                          className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 text-[10px]"
                        >
                          <Download className="w-3.5 h-3.5" /> Export List
                        </button>
                      </div>

                      {(!activeEvent.registrations || activeEvent.registrations.length === 0) ? (
                        <p className="text-xs text-[var(--text-secondary)] italic">No registrants found.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)] bg-[var(--input-bg)] max-h-80 overflow-y-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-[var(--glass-border)] bg-slate-900/50 font-mono text-[9px] uppercase tracking-wider text-[var(--text-secondary)]">
                                <th className="p-2">Name</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Status</th>
                                <th className="p-2 text-center">Checked-In</th>
                                <th className="p-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--glass-border)]">
                              {activeEvent.registrations.map(r => (
                                <tr key={r.id} className="hover:bg-slate-800/10">
                                  <td className="p-2 font-bold">{r.name}</td>
                                  <td className="p-2 font-mono text-[11px]">{r.email}</td>
                                  <td className="p-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold font-mono border ${
                                      r.status === "Approved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    }`}>
                                      {r.status}
                                    </span>
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      onClick={() => handleCheckInAttendee(r.id)}
                                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                        r.checkedIn ? "bg-emerald-500 text-white" : "bg-slate-800 border border-[var(--glass-border)] text-slate-400"
                                      }`}
                                    >
                                      {r.checkedIn ? "YES" : "NO"}
                                    </button>
                                  </td>
                                  <td className="p-2 text-right">
                                    <button onClick={() => handleRemoveAttendee(r.id)} className="text-rose-400 hover:text-rose-300 font-bold">Delete</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 5: EXHIBITORS */}
              {commandActiveTab === "exhibitors" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    
                    {/* Add Exhibitor Application Simulation */}
                    <div className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl p-4 space-y-3 md:col-span-1">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Submit Exhibitor Application</span>
                      <form onSubmit={handleAddExhibitorSim} className="space-y-2">
                        <input type="text" required value={exhibitorCompanyName} onChange={(e) => setExhibitorCompanyName(e.target.value)} placeholder="Company Name" className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded p-1.5 text-xs text-[var(--text-primary)] w-full" />
                        <input type="text" value={exhibitorContactName} onChange={(e) => setExhibitorContactName(e.target.value)} placeholder="Contact Name" className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded p-1.5 text-xs text-[var(--text-primary)] w-full" />
                        <input type="email" value={exhibitorEmail} onChange={(e) => setExhibitorEmail(e.target.value)} placeholder="email@company.com" className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded p-1.5 text-xs text-[var(--text-primary)] w-full font-sans" />
                        <input type="text" value={exhibitorWeb} onChange={(e) => setExhibitorWeb(e.target.value)} placeholder="Website URL" className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded p-1.5 text-xs text-[var(--text-primary)] w-full font-sans" />
                        
                        <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-1.5 rounded text-xs cursor-pointer">
                          Add Application
                        </button>
                      </form>
                    </div>

                    {/* Exhibitors Application list */}
                    <div className="md:col-span-2 space-y-3">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Registered Exhibitors ({(activeEvent.exhibitors || []).length})</span>
                      
                      {(!activeEvent.exhibitors || activeEvent.exhibitors.length === 0) ? (
                        <p className="text-xs text-[var(--text-secondary)] italic">No exhibitors registered yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {activeEvent.exhibitors.map(ex => (
                            <div key={ex.id} className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-3.5 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-[var(--text-primary)] block text-sm">{ex.companyName}</span>
                                <span className="text-[10px] text-[var(--text-secondary)] block">Contact: {ex.contactName} · {ex.email}</span>
                                {ex.boothAssigned && <span className="text-[10px] text-indigo-400 font-mono font-bold block">Assigned: {ex.boothAssigned}</span>}
                              </div>
                              
                              <div className="flex gap-2">
                                {ex.status === "Pending" ? (
                                  <>
                                    <button onClick={() => {
                                      const current = activeEvent.exhibitors || [];
                                      updateActiveEvent({ exhibitors: current.map(e => e.id === ex.id ? { ...e, status: "Rejected" } : e) });
                                    }} className="text-rose-400 hover:text-rose-300 font-semibold text-[10px]">Reject</button>
                                    <button onClick={() => handleApproveExhibitor(ex.id)} className="bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400 py-1 px-2.5 rounded font-bold transition">Approve</button>
                                  </>
                                ) : (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ex.status === "Approved" ? "text-emerald-400" : "text-rose-400"}`}>{ex.status}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 6: BOOTHS MANAGEMENT */}
              {commandActiveTab === "booths" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    
                    {/* Booth specs layout list */}
                    <div className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-4 space-y-3 md:col-span-1">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Exhibitor Booths Config</span>
                      
                      <div className="p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span>Premium Occupancy Rate</span>
                          <span className="font-mono text-indigo-400 font-bold">
                            {(() => {
                              const evBooths = booths.filter(b => b.eventId === activeEvent.id);
                              const total = evBooths.length;
                              const occupied = evBooths.filter(b => b.status === "SOLD").length;
                              return total > 0 ? `${((occupied / total) * 100).toFixed(1)}%` : "0.0%";
                            })()}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-[var(--text-secondary)] space-y-1 font-mono">
                        <div>Exhibition Strategy: <strong>Organizer Assigned</strong></div>
                        <div>Standard Slot Price: <strong>$500</strong></div>
                        <div>Premium Slot Price: <strong>$800</strong></div>
                      </div>
                    </div>

                    {/* Booth map grid simulation */}
                    <div className="md:col-span-2 space-y-3 font-sans">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Interactive Exhibition Floor Map</span>
                      
                      <div className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-4 flex flex-col items-center justify-center">
                        <div className="grid grid-cols-5 gap-3">
                          {Array.from({ length: 15 }).map((_, idx) => {
                            const bthNumber = 101 + idx;
                            const isSold = idx % 3 === 0;
                            const isPremium = idx < 5;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  alert(`Booth #${bthNumber} (${isPremium ? "Premium" : "Standard"}) status: ${isSold ? "SOLD" : "AVAILABLE"}`);
                                }}
                                className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center text-[10px] font-bold transition ${
                                  isSold 
                                    ? "bg-rose-500/10 border-rose-500/35 text-rose-400" 
                                    : "bg-emerald-500/10 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/20"
                                }`}
                              >
                                <span>#{bthNumber}</span>
                                <span className="text-[8px] font-mono opacity-75">{isPremium ? "PREM" : "STD"}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-4 mt-4 text-[10px] text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/25 border border-emerald-500/40"></span> Available</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500/25 border border-rose-500/40"></span> Leased / Occupied</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 7: VENDORS */}
              {commandActiveTab === "vendors" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    
                    {/* Add simulated vendor */}
                    <div className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl p-4 space-y-3 md:col-span-1">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Add Marketplace Vendor</span>
                      <form onSubmit={handleAddVendorSim} className="space-y-2">
                        <input type="text" required value={vendorNameSim} onChange={(e) => setVendorNameSim(e.target.value)} placeholder="Vendor Business Name" className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded p-1.5 text-xs text-[var(--text-primary)] w-full font-sans" />
                        <input type="text" value={vendorTaxId} onChange={(e) => setVendorTaxId(e.target.value)} placeholder="Sales Tax ID" className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded p-1.5 text-xs text-[var(--text-primary)] w-full font-mono" />
                        <input type="text" value={vendorSpace} onChange={(e) => setVendorSpace(e.target.value)} placeholder="Assigned Space (e.g. Space A)" className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded p-1.5 text-xs text-[var(--text-primary)] w-full" />
                        
                        <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-1.5 rounded text-xs cursor-pointer">
                          Add Vendor
                        </button>
                      </form>
                    </div>

                    {/* Vendors list */}
                    <div className="md:col-span-2 space-y-3">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Marketplace Vendors ({(activeEvent.vendors || []).length})</span>
                      
                      {(!activeEvent.vendors || activeEvent.vendors.length === 0) ? (
                        <p className="text-xs text-[var(--text-secondary)] italic">No vendors registered yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {activeEvent.vendors.map(v => (
                            <div key={v.id} className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-3 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-[var(--text-primary)] block text-sm">{v.name}</span>
                                <span className="text-[10px] text-[var(--text-secondary)] block">Tax ID: {v.taxId} · Assigned: {v.space}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = activeEvent.vendors || [];
                                  updateActiveEvent({ vendors: current.filter(item => item.id !== v.id) });
                                }}
                                className="text-rose-400 hover:text-rose-300 font-bold"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 8: FOOD TRUCKS */}
              {commandActiveTab === "foodTrucks" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    
                    {/* Add Food Truck Application */}
                    <div className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl p-4 space-y-3 md:col-span-1">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Simulate Food Truck application</span>
                      <form onSubmit={handleAddFoodTruckSim} className="space-y-2">
                        <input type="text" required value={truckBusinessName} onChange={(e) => setTruckBusinessName(e.target.value)} placeholder="Food Truck / Business Name" className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded p-1.5 text-xs text-[var(--text-primary)] w-full" />
                        <input type="text" value={truckCuisine} onChange={(e) => setTruckCuisine(e.target.value)} placeholder="Cuisine Category (e.g. Mexican)" className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded p-1.5 text-xs text-[var(--text-primary)] w-full" />
                        <input type="text" value={truckPermit} onChange={(e) => setTruckPermit(e.target.value)} placeholder="Food Safety Permit ID" className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded p-1.5 text-xs text-[var(--text-primary)] w-full font-mono" />
                        
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[var(--text-primary)] pt-1">
                          <input type="checkbox" checked={truckWater} onChange={() => setTruckWater(!truckWater)} className="rounded border-slate-700 bg-transparent text-indigo-500" />
                          Water Hookup Required?
                        </label>
                        
                        <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-1.5 rounded text-xs cursor-pointer">
                          Add Food Truck
                        </button>
                      </form>
                    </div>

                    {/* Food Trucks List */}
                    <div className="md:col-span-2 space-y-3">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Registered Food Trucks ({(activeEvent.foodTrucks || []).length})</span>
                      
                      {(!activeEvent.foodTrucks || activeEvent.foodTrucks.length === 0) ? (
                        <p className="text-xs text-[var(--text-secondary)] italic">No food trucks registered yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {activeEvent.foodTrucks.map(ft => (
                            <div key={ft.id} className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-3.5 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-[var(--text-primary)] block text-sm">{ft.name}</span>
                                <span className="text-[10px] text-[var(--text-secondary)] block">Cuisine: {ft.cuisine} · Parking: {ft.spot} · Utility: {ft.powerRequired}</span>
                                {ft.waterRequired && <span className="text-[9px] text-sky-400 block font-bold font-mono">WATER CONNECTED</span>}
                              </div>
                              
                              <div className="flex gap-2.5">
                                {ft.status === "Pending" ? (
                                  <button onClick={() => handleApproveFoodTruck(ft.id)} className="bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400 py-1 px-2.5 rounded font-bold transition">Approve</button>
                                ) : (
                                  <span className="text-emerald-400 font-bold uppercase text-[10px]">Active Spot</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = activeEvent.foodTrucks || [];
                                    updateActiveEvent({ foodTrucks: current.filter(item => item.id !== ft.id) });
                                  }}
                                  className="text-rose-400 hover:text-rose-300 font-bold"
                                >
                                  &times;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 9: SPONSORS */}
              {commandActiveTab === "sponsors" && (
                <div className="space-y-4">
                  
                  {/* Add Brand Sponsor Sim */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-4 space-y-3 md:col-span-1">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Register Brand Sponsor</span>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] text-[var(--text-secondary)]">Sponsor Company Name</label>
                        <input
                          type="text"
                          value={sponsorNameSim}
                          onChange={(e) => setSponsorNameSim(e.target.value)}
                          placeholder="e.g. Google Cloud"
                          className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-1.5 px-2 text-xs text-[var(--text-primary)] w-full"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-[var(--text-secondary)]">Sponsorship Tier</label>
                        <select
                          value={sponsorLevelSim}
                          onChange={(e) => setSponsorLevelSim(e.target.value)}
                          className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-1 px-2 text-xs text-[var(--text-primary)] w-full"
                        >
                          <option value="Gold">Gold Corporate</option>
                          <option value="Silver">Silver Corporate</option>
                          <option value="Bronze">Bronze Associate</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!sponsorNameSim.trim()) return;
                          const newApp = {
                            id: `sp-sim-${Date.now()}`,
                            eventId: activeEvent.id,
                            eventTitle: activeEvent.title,
                            packageId: `pkg-${Date.now()}`,
                            packageName: `${sponsorLevelSim} Package`,
                            packagePrice: sponsorLevelSim === "Gold" ? 5000 : sponsorLevelSim === "Silver" ? 2500 : 1000,
                            sponsorId: `sp-${Date.now()}`,
                            companyName: sponsorNameSim,
                            logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80",
                            status: "APPROVED" as const,
                            timestamp: new Date().toLocaleString(),
                            deliverables: [{ name: "Stage Banner", completed: true }, { name: "VIP Passes", completed: false }]
                          };
                          setSponsorApplications(prev => [newApp, ...prev]);
                          setSponsorNameSim("");
                          alert("Brand sponsorship package confirmed successfully!");
                        }}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-1.5 rounded text-[11px]"
                      >
                        Add Sponsorship
                      </button>
                    </div>

                    {/* Sponsor packages active list */}
                    <div className="md:col-span-2 space-y-3">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Confirmed Event Sponsors</span>
                      {sponsorApplications.filter(a => a.eventId === activeEvent.id && a.status === "APPROVED").length === 0 ? (
                        <p className="text-xs text-[var(--text-secondary)] italic">No approved sponsors listed for this event.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {sponsorApplications.filter(a => a.eventId === activeEvent.id && a.status === "APPROVED").map(app => (
                            <div key={app.id} className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-3 space-y-2 text-xs">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-[var(--text-primary)] block text-sm">{app.companyName}</span>
                                  <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">{app.packageName}</span>
                                </div>
                                <span className="font-mono text-emerald-400 font-bold">${app.packagePrice}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 10: COMMUNICATIONS & EMAILS */}
              {commandActiveTab === "communications" && (
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-2xl space-y-3">
                    <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5 font-outfit">
                      <Mail className="w-4.5 h-4.5 text-indigo-400" />
                      Dispatch Broadcast Communications
                    </span>
                    
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      Select communication email template to send bulk invitations, reminders, or schedule change updates to all registered attendees.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <button
                        onClick={() => {
                          addSagaLog("Notification-Service", `Bulk Invitations dispatched to registrants of: ${activeEvent.title}`, "info");
                          alert("✉️ Bulk Event invitations sent out to lists successfully!");
                        }}
                        className="bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 text-indigo-400 py-3 rounded-xl font-bold transition text-[10px] font-mono uppercase cursor-pointer"
                      >
                        Send Invitations
                      </button>
                      <button
                        onClick={() => {
                          addSagaLog("Notification-Service", `Reminders dispatched to check-in queues of: ${activeEvent.title}`, "info");
                          alert("✉️ Attendance reminders dispatched!");
                        }}
                        className="bg-sky-500/10 border border-sky-500/25 hover:bg-sky-500/20 text-sky-400 py-3 rounded-xl font-bold transition text-[10px] font-mono uppercase cursor-pointer"
                      >
                        Send Reminders
                      </button>
                      <button
                        onClick={() => {
                          addSagaLog("Notification-Service", `Confirmations dispatched to list of: ${activeEvent.title}`, "info");
                          alert("✉️ Order confirmations sent.");
                        }}
                        className="bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400 py-3 rounded-xl font-bold transition text-[10px] font-mono uppercase cursor-pointer"
                      >
                        Send Confirmations
                      </button>
                      <button
                        onClick={() => {
                          addSagaLog("Notification-Service", `Follow-up survey questionnaires sent for: ${activeEvent.title}`, "info");
                          alert("✉️ Follow-up feedback links sent.");
                        }}
                        className="bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] py-3 rounded-xl font-bold transition text-[10px] font-mono uppercase cursor-pointer"
                      >
                        Send Follow-Ups
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 11: DOCUMENTS */}
              {commandActiveTab === "documents" && (
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl space-y-4">
                    <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                      <FileText className="w-4.5 h-4.5 text-indigo-400" />
                      Event Files & Compliance Agreements
                    </span>

                    {(!activeEvent.documents || activeEvent.documents.length === 0) ? (
                      <p className="text-xs text-[var(--text-secondary)] italic">No contracts or plans uploaded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeEvent.documents.map(d => (
                          <div key={d.id} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-2.5 flex justify-between items-center text-xs">
                            <div>
                              <strong className="text-[var(--text-primary)] block">{d.name}</strong>
                              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{d.type}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const current = activeEvent.documents || [];
                                updateActiveEvent({ documents: current.filter(doc => doc.id !== d.id) });
                              }}
                              className="text-rose-400 hover:text-rose-300 font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-3 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)] flex flex-wrap gap-2 items-center text-xs">
                      <input
                        type="text"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        placeholder="File Name (e.g. Exhibitor layout blueprint)"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded py-1 px-2 text-[11px] text-[var(--text-primary)] flex-1 focus:outline-none"
                      />
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value)}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded py-1 px-2 text-[11px] text-[var(--text-primary)]"
                      >
                        <option value="Contract">Contract</option>
                        <option value="Floor Plan">Floor Plan Map</option>
                        <option value="Safety Waiver">Safety Waiver</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddDocSim}
                        className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-1 px-3 rounded text-[10px] cursor-pointer"
                      >
                        Upload Doc
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 12: PAYMENTS & FINANCIALS */}
              {commandActiveTab === "payments" && (
                <div className="space-y-4">
                  
                  {/* Budget versus Actual tracking */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="bg-[var(--input-bg)] p-4 border border-[var(--glass-border)] rounded-xl space-y-1">
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase block font-sans">Projected Event Budget</span>
                      <div className="flex items-center gap-1.5">
                        <span>$</span>
                        <input
                          type="number"
                          value={activeEvent.budget || 0}
                          onChange={(e) => updateActiveEvent({ budget: parseFloat(e.target.value) || 0 })}
                          className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded px-2 py-0.5 text-sm text-[var(--text-primary)] w-24 font-mono"
                        />
                      </div>
                    </div>

                    <div className="bg-[var(--input-bg)] p-4 border border-[var(--glass-border)] rounded-xl space-y-1">
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase block font-sans">Actual Expenses Cost</span>
                      <div className="flex items-center gap-1.5">
                        <span>$</span>
                        <input
                          type="number"
                          value={activeEvent.actualCost || 0}
                          onChange={(e) => updateActiveEvent({ actualCost: parseFloat(e.target.value) || 0 })}
                          className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded px-2 py-0.5 text-sm text-[var(--text-primary)] w-24 font-mono"
                        />
                      </div>
                    </div>

                    <div className="bg-[var(--input-bg)] p-4 border border-[var(--glass-border)] rounded-xl space-y-1">
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase block font-sans">Tracked Financial Net Profit</span>
                      {(() => {
                        const ticketRev = activeEvent.ticketsSold * activeEvent.price;
                        const boothsRev = boothApplications.filter(a => a.eventId === activeEvent.id && a.status === "APPROVED").reduce((acc, curr) => acc + curr.price, 0);
                        const sponsorsRev = sponsorApplications.filter(a => a.eventId === activeEvent.id && a.status === "APPROVED").reduce((acc, curr) => acc + curr.packagePrice, 0);
                        const grossRev = ticketRev + boothsRev + sponsorsRev;
                        const profit = grossRev - (activeEvent.actualCost || 0);

                        return (
                          <div className={`text-base font-bold font-mono ${profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            ${profit.toLocaleString()}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 13: ANALYTICS */}
              {commandActiveTab === "analytics" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Performance metrics lists */}
                    <div className="glass rounded-xl border border-[var(--glass-border)] p-4 space-y-3">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Operations Scores</span>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Event Net Promoter Score (NPS)</span>
                          <span className="font-mono font-bold text-sky-400">74 (Excellent)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Community Feedback Rating</span>
                          <span className="font-mono font-bold text-amber-400">4.8 / 5.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance checkin rate */}
                    <div className="glass rounded-xl border border-[var(--glass-border)] p-4 space-y-3">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Session popularities</span>
                      
                      {(!activeEvent.sessions || activeEvent.sessions.length === 0) ? (
                        <p className="text-xs text-[var(--text-secondary)] italic">No sessions listed for tracking.</p>
                      ) : (
                        <div className="space-y-2 text-xs font-mono text-[var(--text-secondary)]">
                          {activeEvent.sessions.map((s, idx) => (
                            <div key={s.id} className="flex justify-between border-b border-[var(--glass-border)] pb-1 last:border-0">
                              <span className="text-[var(--text-primary)] font-bold">{s.name}</span>
                              <span className="text-indigo-400">{(80 - idx * 12) % 100}% occupancy</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 14: SETTINGS */}
              {commandActiveTab === "settings" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase font-sans">Max capacity limit</label>
                      <input
                        type="number"
                        value={activeEvent.maxCapacity || 500}
                        onChange={(e) => updateActiveEvent({ maxCapacity: parseInt(e.target.value) || 0 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 w-full text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase font-sans">Waitlist Capacity</label>
                      <input
                        type="number"
                        value={activeEvent.waitlistCapacity || 50}
                        onChange={(e) => updateActiveEvent({ waitlistCapacity: parseInt(e.target.value) || 0 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 w-full text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase font-sans">Registration opens</label>
                      <input
                        type="text"
                        value={activeEvent.registrationOpenDate || ""}
                        onChange={(e) => updateActiveEvent({ registrationOpenDate: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 w-full text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase font-sans">Registration Closes</label>
                      <input
                        type="text"
                        value={activeEvent.registrationCloseDate || ""}
                        onChange={(e) => updateActiveEvent({ registrationCloseDate: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 w-full text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal actions footer */}
            <div className="flex justify-end pt-4 border-t border-[var(--glass-border)]">
              <button
                type="button"
                onClick={() => {
                  setCommandCenterEventId(null);
                  setVenueConflictAlert(null);
                }}
                className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-sky-500/15"
              >
                Close Command Center
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
