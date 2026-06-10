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
  Star,
  Settings,
  Search
} from "lucide-react";

import {
  UserProfile,
  Notification,
  BoothApplication,
  SponsorApplication,
  VendorLead,
  VendorSale,
  SponsorPackage,
  SponsorInterest,
  Event,
  Review,
  OrganizerProfile,
  VenueProviderProfile,
  Venue,
  VenueBooking,
  PromoCode,
  Order,
  Booth,
  VendorProfile,
  LogMessage
} from "./types";

import {
  US_STATES,
  ZIP_LOOKUP,
  containsAbusiveContent,
  renderStars,
  normalizeDateToYmd,
  parseLocationDetails,
  getDistanceInMiles
} from "./utils";

import {
  initialEvents,
  initialPromoCodes,
  initialBooths,
  initialVendorProfiles,
  initialVenueProviders,
  initialVenues,
  initialVenueBookings,
  initialReviews
} from "./mockData";

import { AdminDashboard } from "./components/AdminDashboard";
import { SagaConsole } from "./components/SagaConsole";
import { OrganizerDashboard } from "./components/OrganizerDashboard";
import { VendorDashboard } from "./components/VendorDashboard";
import { SponsorDashboard } from "./components/SponsorDashboard";
import { VenueProviderDashboard } from "./components/VenueProviderDashboard";
export default function Home() {
  // Theme State
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Global custom alert modal state
  const [customAlert, setCustomAlert] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const nativeAlert = window.alert;
      window.alert = (message: string) => {
        setCustomAlert(message);
      };

      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        alert("🔒 Context menu and right-click actions are disabled to protect application content.");
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        const isCtrlOrMeta = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;

        // F12
        if (e.key === "F12" || e.keyCode === 123) {
          e.preventDefault();
          alert("🔒 Developer Tools access is restricted.");
          return;
        }

        // Ctrl + Shift + I/J/C (Inspect / Console / Element)
        if (isCtrlOrMeta && isShift && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c" || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
          e.preventDefault();
          alert("🔒 Developer Tools access is restricted.");
          return;
        }

        // Ctrl + U (View Source)
        if (isCtrlOrMeta && (e.key === "U" || e.key === "u" || e.keyCode === 85)) {
          e.preventDefault();
          alert("🔒 Viewing page source is disabled.");
          return;
        }

        // Ctrl + S (Save Page)
        if (isCtrlOrMeta && (e.key === "S" || e.key === "s" || e.keyCode === 83)) {
          e.preventDefault();
          alert("🔒 Saving page content is disabled.");
          return;
        }

        // Ctrl + C (Copy)
        if (isCtrlOrMeta && (e.key === "C" || e.key === "c" || e.keyCode === 67)) {
          const target = e.target as HTMLElement;
          if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
            return;
          }
          e.preventDefault();
          alert("🔒 Copying content from this application is disabled.");
          return;
        }
      };

      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        window.alert = nativeAlert;
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

  const getAlertStyle = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes("success") || lower.includes("verified") || lower.includes("successful") || lower.includes("✅") || lower.includes("🎉") || lower.includes("💰")) {
      return {
        icon: <Check className="w-5 h-5 text-emerald-400" />,
        colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
        title: "Success"
      };
    }
    if (lower.includes("error") || lower.includes("denied") || lower.includes("failed") || lower.includes("invalid") || lower.includes("🔒") || lower.includes("warning")) {
      return {
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/25",
        title: "Warning / Error"
      };
    }
    return {
      icon: <Info className="w-5 h-5 text-sky-400" />,
      colorClass: "text-sky-400 bg-sky-500/10 border-sky-500/25",
      title: "Notification"
    };
  };

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

  // OTP Verification Requirement (configurable, off by default)
  const [otpVerificationEnabled, setOtpVerificationEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("otpVerificationEnabled");
      return stored === "true";
    }
    return false;
  });

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
      if (otpVerificationEnabled && reviewVerificationStep === "form") {
        setReviewVerificationStep("otp");
        return;
      }
    }

    if (otpVerificationEnabled && !isVendor && !isVenueProvider && reviewVerificationStep === "otp") {
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
  const [activeTab, setActiveTab] = useState<"catalog" | "my-tickets" | "admin" | "saga" | "venues" | "organizer" | "vendor" | "sponsor">("catalog");
  const [adminSubTab, setAdminSubTab] = useState<"directory" | "events" | "financials" | "reports" | "reviews">("directory");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(initialEvents[0]);
  const [bookingMode, setBookingMode] = useState<"TICKET" | "BOOTH">("BOOTH");

  // User role state
  const [currentUserRole, setCurrentUserRole] = useState<"ATTENDEE" | "ORGANIZER" | "VENDOR" | "SPONSOR" | "ADMIN" | "VENUE_PROVIDER">("ATTENDEE");

  // Platform Users Directory
  const [users, setUsers] = useState<UserProfile[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("users_list");
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: "usr-1", name: "Jane Doe (Attendee)", email: "jane@doe.com", role: "ATTENDEE", status: "ACTIVE" },
      { id: "usr-2", name: "Sarah Connor (Organizer)", email: "sarah@sfvenues.com", role: "ORGANIZER", status: "ACTIVE" },
      { id: "usr-3", name: "Luigi Rossini (Vendor)", email: "luigi@woodfiredpizza.it", role: "VENDOR", status: "ACTIVE" },
      { id: "usr-4", name: "Apex Sponsors (Sponsor)", email: "sponsor@apex.com", role: "SPONSOR", status: "ACTIVE" },
      { id: "usr-5", name: "System Admin (Admin)", email: "admin@auratickets.com", role: "ADMIN", status: "ACTIVE" },
      { id: "usr-6", name: "Sarah Connor (Venue Provider)", email: "sarah@sfvenues.com", role: "VENUE_PROVIDER", status: "ACTIVE" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("users_list", JSON.stringify(users));
  }, [users]);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notifications");
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: "notif-1", userId: "all", title: "Welcome to AuraTickets!", message: "Enjoy secure, real-time ticket bookings and instant vendor leasing.", timestamp: "2026-06-08 09:00", read: false },
      { id: "notif-2", userId: "all", title: "Global Tech Summit 2026", message: "Booth reservations are now open for verified technology vendors.", timestamp: "2026-06-08 10:15", read: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title: string, message: string, roleTarget: string = "all") => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: roleTarget,
      title,
      message,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Suspension check helper
  const checkSuspended = () => {
    const userRecord = users.find(u => u.role === currentUserRole);
    if (userRecord && userRecord.status === "SUSPENDED") {
      alert("🔒 Access Denied: Your account has been suspended by the platform administrator.");
      return true;
    }
    return false;
  };

  // Platform fee percentage state
  const [platformFeePercentage, setPlatformFeePercentage] = useState<number>(10);

  // Vendor & Sponsor Application States
  const [boothApplications, setBoothApplications] = useState<BoothApplication[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("boothApplications");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("boothApplications", JSON.stringify(boothApplications));
  }, [boothApplications]);

  const [sponsorApplications, setSponsorApplications] = useState<SponsorApplication[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sponsorApplications");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("sponsorApplications", JSON.stringify(sponsorApplications));
  }, [sponsorApplications]);

  // Vendor Lead & Sale States
  const [vendorLeads, setVendorLeads] = useState<VendorLead[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vendorLeads");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("vendorLeads", JSON.stringify(vendorLeads));
  }, [vendorLeads]);

  const [vendorSales, setVendorSales] = useState<VendorSale[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vendorSales");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("vendorSales", JSON.stringify(vendorSales));
  }, [vendorSales]);

  // Social friend invite state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteEventId, setInviteEventId] = useState("");

  // Payout states
  const [releasedPayouts, setReleasedPayouts] = useState<string[]>([]);
  // Ticket tier states
  const [selectedTicketClass, setSelectedTicketClass] = useState<string>("General Admission");
  const [enableTiers, setEnableTiers] = useState(false);
  const [ebPrice, setEbPrice] = useState("");
  const [ebInv, setEbInv] = useState("");
  const [gaPriceForm, setGaPriceForm] = useState("");
  const [gaInvForm, setGaInvForm] = useState("");
  const [vipPriceForm, setVipPriceForm] = useState("");
  const [vipInvForm, setVipInvForm] = useState("");
  // Event Detail Page
  const [showEventDetailPage, setShowEventDetailPage] = useState(false);
  const [detailPageEvent, setDetailPageEvent] = useState<Event | null>(null);
  // Marketing video: { [eventId]: objectURL }
  const [eventVideos, setEventVideos] = useState<Record<string, string>>({});
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);
  const [videoUploadName, setVideoUploadName] = useState<string>("");
  const [videoUploadSize, setVideoUploadSize] = useState<string>("");
  const [videoUploadError, setVideoUploadError] = useState<string>("");

  const handleVideoUpload = (file: File) => {
    const maxMb = 200;
    if (!file.type.startsWith("video/")) {
      setVideoUploadError("Please upload a valid video file (MP4, MOV, WebM…)");
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      setVideoUploadError(`File too large. Max ${maxMb} MB allowed.`);
      return;
    }
    setVideoUploadError("");
    setVideoUploadName(file.name);
    setVideoUploadSize((file.size / (1024 * 1024)).toFixed(1) + " MB");
    // Simulate upload progress
    setVideoUploadProgress(0);
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 18 + 6;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        const url = URL.createObjectURL(file);
        setEventVideos(prev => ({ ...prev, [detailPageEvent!.id]: url }));
        setVideoUploadProgress(null);
      } else {
        setVideoUploadProgress(Math.round(pct));
      }
    }, 120);
  };

  const handleRemoveVideo = (eventId: string) => {
    setEventVideos(prev => {
      const copy = { ...prev };
      if (copy[eventId]) URL.revokeObjectURL(copy[eventId]);
      delete copy[eventId];
      return copy;
    });
    setVideoUploadName("");
    setVideoUploadSize("");
  };

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

  // Organizer listings search & filters state
  const [orgListingsSearch, setOrgListingsSearch] = useState("");
  const [orgListingsCategory, setOrgListingsCategory] = useState("ALL");
  const [orgListingsStatus, setOrgListingsStatus] = useState("ALL");

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

  // Venue Provider: Editing & Calendar Filter states
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [selectedCalVenueId, setSelectedCalVenueId] = useState<string>("ALL");

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

      // 7. Event Moderation Status check (only APPROVED events show in catalog)
      const isApproved = ev.moderationStatus === undefined || ev.moderationStatus === "APPROVED";
      if (!isApproved) return false;

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
    const activeEvent = detailPageEvent || selectedEvent;
    if (!activeEvent) return { subtotal: 0, discount: 0, total: 0, depositAmount: 0, remainingBalance: 0 };

    let subtotal = 0;
    if (bookingMode === "TICKET") {
      let ticketPrice = activeEvent.price;
      if (activeEvent.ticketClasses) {
        const tc = activeEvent.ticketClasses.find(c => c.name === selectedTicketClass);
        if (tc) ticketPrice = tc.price;
      }
      subtotal = ticketPrice * ticketQuantity;
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
  }, [selectedEvent, detailPageEvent, selectedTicketClass, ticketQuantity, bookingMode, selectedBooth, appliedPromo, promoSuccess, promoCodes]);

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
      status: otpVerificationEnabled ? "PENDING" : "VERIFIED",
      availableDates: ["2026-06-25", "2026-07-12", "2026-08-05", "2026-09-20", "2026-10-10", "2026-10-20"],
      pricing: 250
    };

    if (otpVerificationEnabled) {
      setPendingVendorProfile(newProfile);
      setVendorRegStep("otp");
      setVendorOtpInput("");
      setVendorOtpError(null);
    } else {
      setVendorProfiles(prev => [...prev, newProfile]);
      setActiveVendorProfile(newProfile);
      setPendingVendorProfile(null);
      setVendorRegStep("form");
      setEditOwnerName(newProfile.ownerName);
      setEditEmail(newProfile.email);
      setEditPhone(newProfile.phone);
      setEditCategory(newProfile.category);
      alert("Business Profile registered successfully!");
    }
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
    addSagaLog("Billing-Service", `Pre-authorizing venue lease fee. Transaction cleared. Reference vn_txn_${Math.floor(Math.random() * 1000000)}`, "success");
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

  // Organizer: Duplicate Event
  const handleDuplicateEvent = (eventId: string) => {
    const originalEvent = events.find(e => e.id === eventId);
    if (!originalEvent) return;

    const newDate = prompt(`Enter a date for the duplicated event (Original: ${originalEvent.date}):`, originalEvent.date);
    if (!newDate) return;

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

    const normalizedNewDate = normalizeDate(newDate);

    // Conflict Check for Duplicate
    if (originalEvent.venueId) {
      const vn = venues.find(v => v.id === originalEvent.venueId);
      if (vn) {
        const isAvailable = vn.availableDates.some(availDate => normalizeDate(availDate) === normalizedNewDate);
        const isAlreadyBooked = venueBookings.some(b =>
          b.venueId === vn.id &&
          normalizeDate(b.date) === normalizedNewDate &&
          b.status === "CONFIRMED"
        );

        if (!isAvailable) {
          alert(`Warning: The venue "${vn.name}" does not list availability for date "${newDate}". Available dates: ${vn.availableDates.join(", ")}`);
          return;
        }

        if (isAlreadyBooked) {
          alert(`Error: The venue "${vn.name}" is already booked on "${newDate}". Cannot duplicate event to this date.`);
          return;
        }
      }
    }

    const tempEventId = `evt-${Date.now()}`;

    if (originalEvent.venueId) {
      // Create booking record for duplicated event
      const bookingId = `vb-${venueBookings.length + 1}`;
      const newBooking: VenueBooking = {
        id: bookingId,
        venueId: originalEvent.venueId,
        eventId: tempEventId,
        eventTitle: `Copy of ${originalEvent.title}`,
        date: normalizedNewDate,
        status: "CONFIRMED"
      };
      setVenueBookings(prev => [...prev, newBooking]);
    }

    const duplicated: Event = {
      ...originalEvent,
      id: tempEventId,
      title: `Copy of ${originalEvent.title}`,
      date: newDate,
      ticketsSold: 0,
      status: "UPCOMING",
      moderationStatus: "PENDING",
      ticketClasses: originalEvent.ticketClasses?.map(tc => ({
        ...tc,
        sold: 0
      }))
    };

    setEvents(prev => [duplicated, ...prev]);
    addSagaLog("Organizer-Service", `Duplicated event "${originalEvent.title}" to "${duplicated.title}" (Date: ${newDate}). Moderation status set to [PENDING].`, "success");
    addNotification("Event Duplicated", `"${originalEvent.title}" has been duplicated. Awaiting Admin moderation.`, "ORGANIZER");
    alert(`Event duplicated! Awaiting Admin approval.`);
  };

  // Admin User suspension toggler
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

  // Admin approve/reject events
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

  // Admin approve/reject vendor profiles
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

  // Admin transaction refund trigger SAGA compensation
  const handleRefundTransaction = (order: Order) => {
    if (order.status !== "PAID") return;
    if (!confirm(`Are you sure you want to refund order "${order.id}" for $${order.totalAmount}? This will trigger a full compensating SAGA rollback.`)) return;

    // 1. Mark order as CANCELLED
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "CANCELLED" as const } : o));

    // 2. Compensate states
    if (order.type === "TICKET") {
      // Release tickets
      setEvents(prev => prev.map(e => {
        if (e.id === order.eventId) {
          // Adjust class sold
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
      // Release booth
      setBooths(prev => prev.map(b => b.id === order.boothId ? {
        ...b,
        status: "AVAILABLE",
        vendorBusinessName: undefined,
        paymentTerms: undefined,
        amountPaid: undefined
      } : b));
    }

    // 3. Adjust promo usage
    if (order.promoApplied) {
      setPromoCodes(prev => prev.map(p =>
        p.code.toUpperCase() === order.promoApplied!.toUpperCase()
          ? { ...p, usageCount: Math.max(0, p.usageCount - 1) }
          : p
      ));
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

  // Applications approval handlers
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

  const handleRejectBoothApplication = (app: BoothApplication) => {
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
  };

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

  const handleRejectSponsorApplication = (app: SponsorApplication) => {
    setSponsorApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "REJECTED" as const } : a));
    addSagaLog("Order-Service", `Organizer rejected sponsor application for package: ${app.packageName}`, "info");
    addNotification("Sponsorship Rejected", `Your sponsorship application for "${app.eventTitle}" was rejected by the organizer.`, "SPONSOR");
    alert("Sponsorship application rejected.");
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
    if (otpVerificationEnabled) {
      setSponsorStep("otp");
      setSponsorOtpInput("");
      setSponsorOtpError(null);
    } else {
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
    }
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

      let hasInventory = true;
      let availStockText = "";
      if (eventObj.ticketClasses) {
        const tClass = eventObj.ticketClasses.find(tc => tc.name === selectedTicketClass);
        if (!tClass || tClass.inventory - tClass.sold < itemQuantity) {
          hasInventory = false;
          availStockText = tClass ? `${tClass.inventory - tClass.sold}` : "0";
        }
      } else {
        if (eventObj.ticketInventory - eventObj.ticketsSold < itemQuantity) {
          hasInventory = false;
          availStockText = `${eventObj.ticketInventory - eventObj.ticketsSold}`;
        }
      }

      if (!hasInventory) {
        addSagaLog("Ticket-Service", `Inventory check failed! Required: ${itemQuantity}, Available: ${availStockText}`, "error");
        addSagaLog("Kafka-Broker", "Event [tickets.reservation.failed] published to 'ticket-events' topic.", "event");
        await delay(1000);
        rollbackSaga("inventory-failure", orderId, itemQuantity, eventObj, appliedCode);
        return;
      }

      setEvents(prev => prev.map(e => {
        if (e.id === eventObj.id) {
          if (e.ticketClasses) {
            const updatedClasses = e.ticketClasses.map(tc => tc.name === selectedTicketClass ? { ...tc, sold: tc.sold + itemQuantity } : tc);
            return { ...e, ticketsSold: e.ticketsSold + itemQuantity, ticketClasses: updatedClasses };
          }
          return { ...e, ticketsSold: e.ticketsSold + itemQuantity };
        }
        return e;
      }));

      addSagaLog("Ticket-Service", `Acquired MySQL row lock (FOR UPDATE) on tickets table.`, "info");
      addSagaLog("Ticket-Service", `Optimistic version check verified. Reserved ${itemQuantity} ticket(s) of tier [${eventObj.ticketClasses ? selectedTicketClass : "General Admission"}].`, "success");
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
        addSagaLog("Payment-Service", `Payment transaction cleared. Reference ch_stripe_${Math.floor(Math.random() * 1000000)}`, "success");
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
          type: "TICKET",
          ticketClass: eventObj.ticketClasses ? selectedTicketClass : "General Admission"
        };
        setOrders(prev => [finalOrder, ...prev]);

        addSagaLog("Notification-Service", `Sending email and SMS booking tokens...`, "info");
        addSagaLog("Notification-Service", `[EMAIL SENT] Sent HTML ticket attachment.`, "success");
        addSagaLog("Notification-Service", `[SMS SENT] Twilio booking token dispatched: TKT-${Math.floor(Math.random() * 1000000)}`, "success");

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
        addSagaLog("Payment-Service", `Vendor payment cleared. Reference ch_stripe_vendor_${Math.floor(Math.random() * 1000000)}`, "success");
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
      setEvents(prev => prev.map(e => {
        if (e.id === eventObj.id) {
          if (e.ticketClasses) {
            const updatedClasses = e.ticketClasses.map(tc => tc.name === selectedTicketClass ? { ...tc, sold: Math.max(0, tc.sold - itemQuantity) } : tc);
            return { ...e, ticketsSold: Math.max(0, e.ticketsSold - itemQuantity), ticketClasses: updatedClasses };
          }
          return { ...e, ticketsSold: Math.max(0, e.ticketsSold - itemQuantity) };
        }
        return e;
      }));
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
      remainingBalance: 0,
      ticketClass: bookingMode === "TICKET" && eventObj.ticketClasses ? selectedTicketClass : undefined
    };
    setOrders(prev => [failedOrder, ...prev]);

    setSagaState("rollback-complete");
    setCheckoutStep("failed");
    setIsCheckingOut(false);
  };

  // Launch Checkout Dialog / 2FA check
  const startCheckout = () => {
    if (checkSuspended()) return;
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

        {/* Desktop Navigation Tabs - dynamically filtered by role */}
        <nav className="flex items-center gap-1.5 bg-[var(--glass-bg)] p-1.5 rounded-xl border border-[var(--glass-border)]">
          {currentUserRole === "ATTENDEE" && (
            <>
              <button
                onClick={() => setActiveTab("catalog")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom ${activeTab === "catalog" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
                  }`}
              >
                Catalog
              </button>
              <button
                onClick={() => setActiveTab("my-tickets")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom flex items-center gap-1.5 ${activeTab === "my-tickets" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
                  }`}
              >
                My Orders & Profile
                {orders.length > 0 && (
                  <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {orders.length}
                  </span>
                )}
              </button>
            </>
          )}

          {currentUserRole === "ORGANIZER" && (
            <>
              <button
                onClick={() => setActiveTab("organizer")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom ${activeTab === "organizer" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
                  }`}
              >
                Organizer Console
              </button>
              <button
                onClick={() => setActiveTab("venues")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom ${activeTab === "venues" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
                  }`}
              >
                Venue Management
              </button>
            </>
          )}

          {currentUserRole === "VENUE_PROVIDER" && (
            <button
              onClick={() => setActiveTab("venues")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom ${activeTab === "venues" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
                }`}
            >
              Venue Owner Console
            </button>
          )}

          {currentUserRole === "VENDOR" && (
            <button
              onClick={() => setActiveTab("vendor")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom ${activeTab === "vendor" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
                }`}
            >
              Vendor Dashboard
            </button>
          )}

          {currentUserRole === "SPONSOR" && (
            <button
              onClick={() => setActiveTab("sponsor")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom ${activeTab === "sponsor" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
                }`}
            >
              Sponsor Dashboard
            </button>
          )}

          {currentUserRole === "ADMIN" && (
            <>
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom ${activeTab === "admin" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
                  }`}
              >
                Admin Control
              </button>
              <button
                onClick={() => setActiveTab("saga")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all-custom flex items-center gap-1.5 ${activeTab === "saga" ? "bg-sky-500 text-white shadow-md shadow-sky-500/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-border)]"
                  }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sagaState !== "idle" && sagaState !== "completed" && sagaState !== "rollback-complete" ? "animate-spin text-sky-400" : ""}`} />
                Saga Console
              </button>
            </>
          )}
        </nav>

        {/* Right side: Login role selector, Notifications, Theme toggle */}
        <div className="flex items-center gap-3 relative">

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--glass-border)] transition-colors shadow-sm relative"
              aria-label="Notifications"
            >
              <span className="text-xs">🔔</span>
              {notifications.filter(n => (n.userId === "all" || n.userId === currentUserRole) && !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {notifications.filter(n => (n.userId === "all" || n.userId === currentUserRole) && !n.read).length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 glass rounded-2xl border border-[var(--glass-border)] p-4 shadow-xl z-50 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-border)]">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Notifications</h4>
                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(n => n.userId === "all" || n.userId === currentUserRole ? { ...n, read: true } : n));
                    }}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 text-[11px]">
                  {notifications.filter(n => n.userId === "all" || n.userId === currentUserRole).length === 0 ? (
                    <p className="text-[10px] text-[var(--text-secondary)] italic text-center py-4">No notifications yet.</p>
                  ) : (
                    notifications
                      .filter(n => n.userId === "all" || n.userId === currentUserRole)
                      .map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                          }}
                          className={`p-2.5 rounded-lg border transition cursor-pointer ${n.read
                            ? "bg-transparent border-[var(--glass-border)] text-[var(--text-secondary)]"
                            : "bg-sky-500/10 border-sky-500/20 text-[var(--text-primary)] font-semibold"
                            }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-xs">{n.title}</span>
                            <span className="text-[8px] text-slate-500 font-mono">{n.timestamp}</span>
                          </div>
                          <p className="text-[10px] mt-1 text-[var(--text-secondary)] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Unified Login Role Picker */}
          <div className="flex items-center gap-1.5">
            <select
              value={currentUserRole}
              onChange={(e) => {
                const selected = e.target.value as "ATTENDEE" | "ORGANIZER" | "VENDOR" | "SPONSOR" | "ADMIN" | "VENUE_PROVIDER";
                setCurrentUserRole(selected);
                if (selected === "ATTENDEE") {
                  setActiveTab("catalog");
                } else if (selected === "ORGANIZER") {
                  setActiveTab("organizer");
                  if (!activeOrganizerProfile || activeOrganizerProfile.id !== "org-sarah") {
                    setActiveOrganizerProfile({
                      id: "org-sarah",
                      organizationName: "Sarah Connor Events",
                      contactName: "Sarah Connor",
                      email: "sarah@sfvenues.com",
                      phone: "+1 555-9011",
                      status: "VERIFIED"
                    });
                  }
                } else if (selected === "VENUE_PROVIDER") {
                  setActiveTab("venues");
                  if (!activeVenueProvider || activeVenueProvider.id !== "vp-1") {
                    setActiveVenueProvider({
                      id: "vp-1",
                      companyName: "SF Bay Area Venues",
                      contactName: "Sarah Connor",
                      email: "sarah@sfvenues.com",
                      phone: "+1 555-9011",
                      status: "VERIFIED"
                    });
                  }
                } else if (selected === "VENDOR") {
                  setActiveTab("vendor");
                  if (!activeVendorProfile || activeVendorProfile.id !== "vnd-luigi") {
                    setActiveVendorProfile({
                      id: "vnd-luigi",
                      businessName: "Luigi's Woodfired Pizza",
                      ownerName: "Luigi Rossini",
                      email: "luigi@woodfiredpizza.it",
                      phone: "+1 555-8833",
                      category: "Italian",
                      status: "VERIFIED"
                    });
                  }
                } else if (selected === "SPONSOR") {
                  setActiveTab("sponsor");
                } else if (selected === "ADMIN") {
                  setActiveTab("admin");
                }
                addSagaLog("Auth-Service", `User switched role to [${selected}] (Mock Login).`, "info");
              }}
              className="bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs font-bold font-outfit py-1.5 px-3 rounded-xl text-[var(--text-primary)] focus:outline-none cursor-pointer hover:bg-[var(--glass-border)] transition-colors shadow-sm"
            >
              <option value="ATTENDEE" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>👤 Login: Attendee (Jane)</option>
              <option value="ORGANIZER" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>🏢 Login: Event Organizer (Sarah)</option>
              <option value="VENUE_PROVIDER" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>🏰 Login: Venue Owner (Sarah)</option>
              <option value="VENDOR" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>🎪 Login: Food/Tech Vendor (Luigi)</option>
              <option value="SPONSOR" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>🎗️ Login: Brand Sponsor (Apex)</option>
              <option value="ADMIN" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>🛡️ Login: Platform Admin</option>
            </select>
          </div>

          {/* OTP Verification Toggle Button */}
          <button
            onClick={() => {
              const newVal = !otpVerificationEnabled;
              setOtpVerificationEnabled(newVal);
              localStorage.setItem("otpVerificationEnabled", String(newVal));
              addSagaLog("System-Config", `OTP Verification is now ${newVal ? "ENABLED" : "DISABLED"} globally.`, newVal ? "success" : "info");
            }}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold font-outfit transition-colors shadow-sm cursor-pointer ${otpVerificationEnabled
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
              }`}
            title="Toggle system-wide OTP verification requirement"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>OTP: {otpVerificationEnabled ? "ON" : "OFF"}</span>
          </button>

          {/* Light/Dark Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--glass-border)] transition-colors shadow-sm"
            aria-label="Toggle Dark/Light Mode"
          >
            {theme === "light" ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
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
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${available <= 0 ? "bg-rose-500 text-white" :
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
                        className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs transition-all flex items-center gap-1 ${catalogView === "grid"
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
                        className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs transition-all flex items-center gap-1 ${catalogView === "calendar"
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
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all-custom ${searchUseGeo
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
                            className={`group rounded-2xl overflow-hidden glass-card cursor-pointer border transition-all-custom duration-300 hover:scale-[1.02] hover:shadow-2xl ${isSelected
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
                                    className={`h-full rounded-full transition-all duration-500 ${percentSold > 85 ? "bg-rose-500" : percentSold > 60 ? "bg-amber-500" : "bg-sky-500"
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
                            className={`aspect-square p-1 rounded-xl border flex flex-col justify-between transition-all duration-200 cursor-pointer ${dayEvents.length > 0
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
                                    className={`text-[8px] px-1 py-0.5 rounded font-sans truncate font-medium text-left border ${selectedEvent?.id === evt.id
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
                                    className={`h-1.5 w-1.5 rounded-full ${selectedEvent?.id === evt.id
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
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isSelected
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
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${selectedEvent.ticketInventory - selectedEvent.ticketsSold <= 0
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

                    {/* Business Portal Actions Card */}
                    <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 relative overflow-hidden">
                      <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl"></div>

                      <div className="flex items-center gap-2 relative z-10 font-sans">
                        <Settings className="w-5 h-5 text-sky-400" />
                        <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">Business Portals &amp; Bookings</h4>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">Access professional operations, lease booths, book venues, or apply for brand sponsorship packages.</p>

                      <div className="space-y-3 relative z-10 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentUserRole("ORGANIZER");
                            setActiveTab("organizer");
                            addSagaLog("Auth-Service", `Redirected to Organizer Console via Create Event.`, "info");
                          }}
                          className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold py-2.5 rounded-xl shadow shadow-sky-500/10 transition-all flex items-center justify-center gap-2 text-xs font-outfit cursor-pointer animate-pulse-hover"
                        >
                          <Plus className="w-4 h-4" />
                          Create Event
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentUserRole("SPONSOR");
                            setActiveTab("sponsor");
                            addSagaLog("Auth-Service", `Mock login: Switched role to [SPONSOR] via Sponsor Event action.`, "info");
                          }}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-2.5 rounded-xl shadow shadow-purple-500/10 transition-all flex items-center justify-center gap-2 text-xs font-outfit cursor-pointer animate-pulse-hover"
                        >
                          <Award className="w-4 h-4" />
                          Sponsor Event
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentUserRole("VENDOR");
                            setActiveTab("vendor");
                            if (!activeVendorProfile || activeVendorProfile.id !== "vnd-luigi") {
                              setActiveVendorProfile({
                                id: "vnd-luigi",
                                businessName: "Luigi's Woodfired Pizza",
                                ownerName: "Luigi Rossini",
                                email: "luigi@woodfiredpizza.it",
                                phone: "+1 555-8833",
                                category: "Italian",
                                status: "VERIFIED"
                              });
                            }
                            addSagaLog("Auth-Service", `Mock login: Switched role to [VENDOR] via Book Booth action.`, "info");
                          }}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold py-2.5 rounded-xl shadow shadow-amber-500/10 transition-all flex items-center justify-center gap-2 text-xs font-outfit cursor-pointer animate-pulse-hover"
                        >
                          <Store className="w-4 h-4" />
                          Book Booth
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentUserRole("ORGANIZER");
                            setActiveTab("venues");
                            if (!activeOrganizerProfile || activeOrganizerProfile.id !== "org-sarah") {
                              setActiveOrganizerProfile({
                                id: "org-sarah",
                                organizationName: "Sarah Connor Events",
                                contactName: "Sarah Connor",
                                email: "sarah@sfvenues.com",
                                phone: "+1 555-9011",
                                status: "VERIFIED"
                              });
                            }
                            addSagaLog("Auth-Service", `Mock login: Switched role to [ORGANIZER] via Book Venue action.`, "info");
                          }}
                          className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold py-2.5 rounded-xl shadow shadow-sky-500/10 transition-all flex items-center justify-center gap-2 text-xs font-outfit cursor-pointer animate-pulse-hover"
                        >
                          <Calendar className="w-4 h-4" />
                          Book Venue
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentUserRole("ORGANIZER");
                            setActiveTab("venues");
                            setActiveVenueProvider(null);
                            setVpRegStep("form");
                            addSagaLog("Auth-Service", `Switched role to [ORGANIZER] and opened Venue Registration page.`, "info");
                          }}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-2.5 rounded-xl shadow shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 text-xs font-outfit cursor-pointer animate-pulse-hover"
                        >
                          <MapPin className="w-4 h-4" />
                          List Your Venu
                        </button>
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
                      className={`glass rounded-2xl border p-5 relative overflow-hidden ${order.status === "PAID"
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
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${order.type === "BOOTH"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                              }`}>
                              {order.type === "BOOTH" ? "Booth Slot" : "Attendee Ticket"}
                            </span>
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${order.status === "PAID"
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
                                <rect width="100" height="100" fill="white" />
                                <rect x="10" y="10" width="20" height="20" fill="black" />
                                <rect x="70" y="10" width="20" height="20" fill="black" />
                                <rect x="10" y="70" width="20" height="20" fill="black" />
                                <rect x="35" y="35" width="30" height="30" fill="black" />
                                <rect x="15" y="45" width="10" height="10" fill="black" />
                                <rect x="75" y="75" width="15" height="15" fill="black" />
                                <rect x="45" y="75" width="20" height="10" fill="black" />
                                <rect x="75" y="45" width="10" height="20" fill="black" />
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

            {/* Attendee Security Settings & 2FA */}
            <div className="space-y-6">

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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all-custom ${is2FaEnabled
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

        {activeTab === "admin" && (
          <AdminDashboard
            users={users}
            setUsers={setUsers}
            events={events}
            setEvents={setEvents}
            setSelectedEvent={setSelectedEvent}
            vendorProfiles={vendorProfiles}
            setVendorProfiles={setVendorProfiles}
            booths={booths}
            setBooths={setBooths}
            venues={venues}
            venueBookings={venueBookings}
            setVenueBookings={setVenueBookings}
            orders={orders}
            setOrders={setOrders}
            reviews={reviews}
            setReviews={setReviews}
            sponsorInterests={sponsorInterests}
            setSponsorInterests={setSponsorInterests}
            otpVerificationEnabled={otpVerificationEnabled}
            setOtpVerificationEnabled={setOtpVerificationEnabled}
            platformFeePercentage={platformFeePercentage}
            setPlatformFeePercentage={setPlatformFeePercentage}
            addSagaLog={addSagaLog}
            addNotification={addNotification}
            runSagaVenueAllocation={runSagaVenueAllocation}
            setActiveTab={setActiveTab}
            handleDeleteEvent={handleDeleteEvent}
          />
        )}
        {activeTab === "saga" && (
          <SagaConsole
            sagaLogs={sagaLogs}
            sagaState={sagaState}
            sagaType={sagaType}
            setSagaLogs={setSagaLogs}
            setSagaState={setSagaState}
          />
        )}
        {activeTab === "organizer" && (
          <OrganizerDashboard
            activeOrganizerProfile={activeOrganizerProfile}
            setActiveOrganizerProfile={setActiveOrganizerProfile}
            organizerProfiles={organizerProfiles}
            setOrganizerProfiles={setOrganizerProfiles}
            events={events}
            setEvents={setEvents}
            booths={booths}
            setBooths={setBooths}
            venues={venues}
            venueBookings={venueBookings}
            setVenueBookings={setVenueBookings}
            vendorProfiles={vendorProfiles}
            boothApplications={boothApplications}
            setBoothApplications={setBoothApplications}
            sponsorApplications={sponsorApplications}
            setSponsorApplications={setSponsorApplications}
            orders={orders}
            setOrders={setOrders}
            otpVerificationEnabled={otpVerificationEnabled}
            platformFeePercentage={platformFeePercentage}
            addSagaLog={addSagaLog}
            addNotification={addNotification}
            checkSuspended={checkSuspended}
            getAverageRating={getAverageRating}
            runSagaVenueAllocation={runSagaVenueAllocation}
            handleDeleteEvent={handleDeleteEvent}
            handleDuplicateEvent={handleDuplicateEvent}
          />
        )}
        {activeTab === "vendor" && (
          <VendorDashboard
            activeVendorProfile={activeVendorProfile}
            setActiveVendorProfile={setActiveVendorProfile}
            vendorProfiles={vendorProfiles}
            setVendorProfiles={setVendorProfiles}
            boothApplications={boothApplications}
            setBoothApplications={setBoothApplications}
            booths={booths}
            setBooths={setBooths}
            events={events}
            selectedEvent={selectedEvent}
            vendorLeads={vendorLeads}
            setVendorLeads={setVendorLeads}
            vendorSales={vendorSales}
            setVendorSales={setVendorSales}
            otpVerificationEnabled={otpVerificationEnabled}
            addSagaLog={addSagaLog}
            addNotification={addNotification}
            checkSuspended={checkSuspended}
          />
        )}
        {activeTab === "sponsor" && (
          <SponsorDashboard
            users={users}
            events={events}
            sponsorApplications={sponsorApplications}
            setSponsorApplications={setSponsorApplications}
            checkSuspended={checkSuspended}
            addSagaLog={addSagaLog}
            addNotification={addNotification}
          />
        )}
        {activeTab === "venues" && (
          <VenueProviderDashboard
            activeVenueProvider={activeVenueProvider}
            setActiveVenueProvider={setActiveVenueProvider}
            venueProviders={venueProviders}
            setVenueProviders={setVenueProviders}
            venues={venues}
            setVenues={setVenues}
            venueBookings={venueBookings}
            setVenueBookings={setVenueBookings}
            otpVerificationEnabled={otpVerificationEnabled}
            addSagaLog={addSagaLog}
            getAverageRating={getAverageRating}
            getReviewCount={getReviewCount}
            renderStars={renderStars}
            events={events}
          />
        )}

        {/* TAB 4: SAGA & KAFKA EVENT VISUALIZER */}

      </main>

      {/* MFA OTP Verification Overlay Dialog (Checkout flow integration) */}
      {checkoutStep === "mfa" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="glass rounded-2xl border border-[var(--glass-border)] max-w-sm w-full p-6 space-y-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

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
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

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
                  <rect width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="20" height="20" fill="black" />
                  <rect x="75" y="5" width="20" height="20" fill="black" />
                  <rect x="5" y="75" width="20" height="20" fill="black" />
                  <rect x="30" y="30" width="40" height="40" fill="black" />
                  <rect x="15" y="45" width="10" height="10" fill="black" />
                  <rect x="75" y="75" width="20" height="20" fill="black" />
                  <rect x="45" y="75" width="20" height="10" fill="black" />
                  <rect x="75" y="45" width="10" height="20" fill="black" />
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
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

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

      {/* CUSTOM GLASSMORPHIC ALERT MODAL */}
      {customAlert !== null && (() => {
        const style = getAlertStyle(customAlert);
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md px-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="glass rounded-2xl border border-[var(--glass-border)] max-w-sm w-full p-6 space-y-4 relative overflow-hidden shadow-2xl">
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl"></div>

              <div className="flex items-start gap-3.5 relative z-10 font-sans">
                <div className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${style.colorClass}`}>
                  {style.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono uppercase tracking-wider">{style.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans mt-0.5">{customAlert}</p>
                </div>
              </div>

              <div className="flex justify-end relative z-10 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomAlert(null)}
                  className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-5 rounded-xl text-xs transition font-outfit shadow-sm shadow-sky-955 cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* COMMUNITY REVIEW SUBMISSION MODAL DIALOG */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="glass rounded-2xl border border-[var(--glass-border)] max-w-md w-full p-6 space-y-5 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-outfit">Write a Review</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Share your experience with the community.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewVerificationStep === "form" ? (
              <form onSubmit={handleVerifyAndSubmitReview} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Author Name *</label>
                    <input
                      type="text"
                      required
                      value={reviewAuthorName}
                      onChange={(e) => setReviewAuthorName(e.target.value)}
                      placeholder="Jane Doe"
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={reviewAuthorEmail}
                      onChange={(e) => setReviewAuthorEmail(e.target.value)}
                      placeholder="jane@doe.com"
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Rating (1-5 Stars)</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(parseInt(e.target.value))}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                      <option value={2}>⭐⭐ (2 Stars)</option>
                      <option value={1}>⭐ (1 Star)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Target</label>
                    <span className="block text-xs font-bold text-sky-400 py-1.5 uppercase font-mono">{reviewTargetType}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Review Comment *</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your constructive feedback..."
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>

                {reviewOtpError && <p className="text-rose-400 text-xs font-semibold text-center">{reviewOtpError}</p>}

                <button
                  type="submit"
                  className="w-full bg-sky-500 hover:bg-sky-400 text-xs font-bold py-2.5 rounded-xl transition shadow text-white"
                >
                  Verify via SMS OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndSubmitReview} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-[var(--text-secondary)] font-semibold">Enter SMS Verification OTP</label>
                    <span className="text-[10px] text-slate-500">Test OTP: <strong>123456</strong></span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={reviewOtpInput}
                    onChange={(e) => setReviewOtpInput(e.target.value)}
                    placeholder="e.g. 123456"
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-center text-sm tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full font-mono font-bold"
                  />
                  {reviewOtpError && (
                    <p className="text-rose-400 text-xs font-semibold text-center mt-1">{reviewOtpError}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReviewVerificationStep("form");
                    }}
                    className="w-1/2 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs font-semibold py-2 rounded-xl text-[var(--text-secondary)] hover:border-slate-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    Verify & Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SOCIAL INVITE FRIENDS MODAL DIALOG */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="glass rounded-2xl border border-[var(--glass-border)] max-w-md w-full p-6 space-y-5 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-outfit">Invite Friends</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Share this event experience with your network.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inviteEmails.trim()) {
                  alert("Please enter at least one email address.");
                  return;
                }
                const emailList = inviteEmails.split(",").map(em => em.trim()).filter(Boolean);
                alert(`📧 Inviting ${emailList.length} friend(s) to the event: ` + emailList.join(", "));
                addSagaLog("Notification-Service", `[EMAIL SENT] Mock invitations dispatched to: ${emailList.join(", ")}`, "success");
                addNotification("Invitations Dispatched", `Sent ${emailList.length} friend invitations for event listing successfully.`, "ATTENDEE");
                setInviteModalOpen(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Friend Email Addresses *</label>
                <textarea
                  rows={3}
                  required
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder="e.g. friend1@email.com, friend2@email.com"
                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500 resize-none font-sans"
                />
                <span className="text-[9px] text-[var(--text-secondary)] block">Enter comma-separated emails. We will notify them instantly.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs font-semibold py-2 px-4 rounded-xl text-[var(--text-secondary)] hover:border-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-5 rounded-xl text-xs transition shadow"
                >
                  Send Invitations
                </button>
              </div>
            </form>
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

            {/* ── MARKETING VIDEO SECTION ── */}
            {(() => {
              const videoUrl = eventVideos[detailPageEvent.id];
              const isAuthorized = currentUserRole === "ADMIN" || currentUserRole === "ORGANIZER";

              if (!videoUrl && !isAuthorized) return null;

              return (
                <div className="mb-8 glass rounded-3xl border border-violet-500/20 overflow-hidden relative shadow-xl shadow-violet-500/5">
                  {/* Glow */}
                  <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-12 -left-12 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-2xl" />

                  {/* Header */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-violet-500/15">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                        <Layers className="w-4 h-4 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">Marketing Video</h3>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          {isAuthorized ? "Upload a promotional video for this event" : "Promotional event highlight video"}
                        </p>
                      </div>
                    </div>
                    {videoUrl && isAuthorized && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(detailPageEvent.id)}
                        className="flex items-center gap-1.5 text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3 h-3" /> Remove Video
                      </button>
                    )}
                  </div>

                  {videoUrl ? (
                    /* ── VIDEO PLAYER ── */
                    <div className="relative bg-black">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full max-h-[480px] object-contain"
                        style={{ background: "#000" }}
                      />
                      <div className="px-5 py-3 flex items-center gap-3 bg-[var(--glass-bg)]">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] text-[var(--text-secondary)] font-mono truncate">{videoUploadName}</span>
                        <span className="ml-auto text-[10px] text-[var(--text-secondary)] font-mono shrink-0">{videoUploadSize}</span>
                      </div>
                    </div>
                  ) : videoUploadProgress !== null ? (
                    /* ── UPLOAD PROGRESS ── */
                    <div className="px-6 py-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                          <RefreshCw className="w-4 h-4 text-violet-400 animate-spin" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate">{videoUploadName}</p>
                          <p className="text-[10px] text-[var(--text-secondary)]">{videoUploadSize} · Uploading…</p>
                        </div>
                        <span className="text-sm font-bold font-mono text-violet-400 shrink-0">{videoUploadProgress}%</span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-2 bg-[var(--glass-border)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-150"
                          style={{ width: `${videoUploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-center text-[var(--text-secondary)] font-mono">Processing video · please wait…</p>
                    </div>
                  ) : (
                    /* ── DROP ZONE ── */
                    <label
                      htmlFor={`video-upload-${detailPageEvent.id}`}
                      className="group flex flex-col items-center justify-center gap-4 px-6 py-10 cursor-pointer relative hover:bg-violet-500/5 transition-all"
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) handleVideoUpload(file);
                      }}
                    >
                      <input
                        id={`video-upload-${detailPageEvent.id}`}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoUpload(file);
                          e.target.value = "";
                        }}
                      />
                      {/* Animated icon */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-violet-500/10">
                          <Zap className="w-8 h-8 text-violet-400 group-hover:text-violet-300 transition-colors" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[var(--bg-primary)] flex items-center justify-center">
                          <Plus className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-violet-300 transition-colors">
                          Drop your marketing video here
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          or <span className="text-violet-400 underline underline-offset-2">click to browse</span> — MP4, MOV, WebM · Max 200 MB
                        </p>
                      </div>
                      {videoUploadError && (
                        <p className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                          <X className="w-3.5 h-3.5 shrink-0" /> {videoUploadError}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)] font-mono mt-1">
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-sky-400" /> Secure upload</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Instant preview</span>
                        <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> MP4 / MOV / WebM</span>
                      </div>
                    </label>
                  )}
                </div>
              );
            })()}

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
                        className={`h-full rounded-full transition-all ${(detailPageEvent.ticketsSold / detailPageEvent.ticketInventory) > 0.8 ? "bg-rose-500"
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
                        <div className="space-y-1">
                          <h2 className="text-lg font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-400" />
                            Venue
                          </h2>
                          {vnRating > 0 && (
                            <div className="flex items-center gap-1">
                              {renderStars(vnRating)}
                              <span className="text-[10px] text-[var(--text-secondary)] font-mono font-bold">({getReviewCount("VENUE", vn.id)})</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReviewTargetType("VENUE");
                            setReviewTargetId(vn.id);
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
                        <div className="space-y-1">
                          <h2 className="text-lg font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-400" />
                            Community Reviews
                          </h2>
                          <p className="text-[10px] text-[var(--text-secondary)] font-mono font-bold">{evtReviews.length} review{evtReviews.length !== 1 ? "s" : ""}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReviewTargetType("EVENT");
                            setReviewTargetId(detailPageEvent.id);
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

                {/* Event Schedule Timeline */}
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 relative overflow-hidden">
                  <div className="absolute -top-16 -left-16 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
                  <h2 className="text-lg font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-400" />
                    Event Schedule & Timeline
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">Plan your day with the official event itinerary below.</p>

                  <div className="relative border-l border-slate-700 ml-3 pl-6 space-y-6 text-xs pt-2">
                    <div className="relative">
                      <div className="absolute -left-[30px] top-0.5 bg-sky-500 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)]"></div>
                      <span className="font-mono text-sky-400 font-bold block">09:00 AM — 10:00 AM</span>
                      <h4 className="font-bold text-[var(--text-primary)] text-sm mt-0.5 font-outfit">Doors Open & Registration</h4>
                      <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">Pick up your entry badge and welcome kits at the reception desks.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[30px] top-0.5 bg-sky-500 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)]"></div>
                      <span className="font-mono text-sky-400 font-bold block">10:00 AM — 11:30 AM</span>
                      <h4 className="font-bold text-[var(--text-primary)] text-sm mt-0.5 font-outfit font-bold text-sky-400">Opening Keynotes & Panel</h4>
                      <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">Industry leaders discuss emerging trends, monolithic architectures, and DDD patterns.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[30px] top-0.5 bg-sky-500 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)]"></div>
                      <span className="font-mono text-sky-400 font-bold block">11:30 AM — 01:00 PM</span>
                      <h4 className="font-bold text-[var(--text-primary)] text-sm mt-0.5 font-outfit">Vendor Showcase & Lunch Break</h4>
                      <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">Explore vendor booths, grab lunch at the local food truck spots, and network.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[30px] top-0.5 bg-sky-500 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)]"></div>
                      <span className="font-mono text-sky-400 font-bold block">01:00 PM — 03:00 PM</span>
                      <h4 className="font-bold text-[var(--text-primary)] text-sm mt-0.5 font-outfit">Interactive Workshops</h4>
                      <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">Deep-dive technical tracks and hands-on developer training labs.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[30px] top-0.5 bg-sky-500 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)]"></div>
                      <span className="font-mono text-sky-400 font-bold block">03:00 PM — 05:00 PM</span>
                      <h4 className="font-bold text-[var(--text-primary)] text-sm mt-0.5 font-outfit">Sponsor Presentations & Close</h4>
                      <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">Special deliverables awards, raffle drawings, and closing remarks.</p>
                    </div>
                  </div>
                </div>

                {/* Social Sharing & Invites */}
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 relative overflow-hidden">
                  <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <h2 className="text-lg font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Social Sharing & Invites
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">Invite colleagues and share this event on your networks.</p>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={() => {
                        const mockUrl = `https://auratickets.com/events/${detailPageEvent.id}`;
                        navigator.clipboard.writeText(mockUrl);
                        alert("📋 Event link copied to clipboard! " + mockUrl);
                        addSagaLog("Social-Service", `Generated event sharing link for: ${detailPageEvent.title}`, "info");
                      }}
                      className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs py-2.5 px-4 rounded-xl font-bold transition flex items-center gap-1.5"
                    >
                      <span>🔗 Copy Event Link</span>
                    </button>

                    <button
                      onClick={() => {
                        setInviteEventId(detailPageEvent.id);
                        setInviteEmails("");
                        setInviteModalOpen(true);
                      }}
                      className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs py-2.5 px-4 rounded-xl font-bold transition flex items-center gap-1.5"
                    >
                      <span>✉️ Invite Friends via Email</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Sticky Purchase Panel */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 space-y-4">

                  {/* Tickets Booking Panel */}
                  <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-5 relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                    {/* Price & Class Selector */}
                    <div className="space-y-4">
                      {detailPageEvent.ticketClasses && detailPageEvent.ticketClasses.length > 0 ? (
                        <div className="space-y-2.5">
                          <label className="text-xs text-[var(--text-secondary)] font-medium block">Select Ticket Tier</label>
                          <div className="space-y-2">
                            {detailPageEvent.ticketClasses.map((tc) => {
                              const classAvail = tc.inventory - tc.sold;
                              const isSelected = selectedTicketClass === tc.name;
                              return (
                                <div
                                  key={tc.name}
                                  onClick={() => {
                                    if (classAvail > 0) {
                                      setSelectedTicketClass(tc.name);
                                      setTicketQuantity(1);
                                    }
                                  }}
                                  className={`p-3 rounded-xl border text-left transition-all flex justify-between items-center ${classAvail <= 0
                                    ? "border-[var(--glass-border)] bg-[var(--glass-bg)] opacity-50 cursor-not-allowed text-[var(--text-secondary)]"
                                    : isSelected
                                      ? "border-sky-500 bg-sky-500/10 text-[var(--text-primary)] ring-1 ring-sky-500/20 cursor-pointer"
                                      : "border-[var(--glass-border)] hover:border-[var(--text-secondary)]/30 bg-[var(--input-bg)] cursor-pointer text-[var(--text-primary)]"
                                    }`}
                                >
                                  <div>
                                    <span className="text-xs font-bold block">{tc.name}</span>
                                    <span className="text-[10px] text-[var(--text-secondary)] font-mono">{classAvail <= 0 ? "SOLD OUT" : `${classAvail} left`}</span>
                                  </div>
                                  <span className="text-sm font-mono font-bold text-sky-400">${tc.price}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
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
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <label className="text-xs text-[var(--text-secondary)] font-medium block">Number of Tickets</label>
                      <div className="flex items-center gap-3">
                        <button type="button" disabled={ticketQuantity <= 1} onClick={() => setTicketQuantity(prev => Math.max(1, prev - 1))}
                          className="w-10 h-10 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] hover:border-slate-605 disabled:opacity-40 font-bold flex items-center justify-center text-xl transition text-[var(--text-primary)]">−</button>
                        <span className="flex-1 text-center text-2xl font-bold font-mono text-[var(--text-primary)]">{ticketQuantity}</span>
                        <button type="button"
                          disabled={(() => {
                            if (detailPageEvent.ticketClasses) {
                              const tc = detailPageEvent.ticketClasses.find(c => c.name === selectedTicketClass);
                              return tc ? ticketQuantity >= (tc.inventory - tc.sold) : true;
                            }
                            return ticketQuantity >= (detailPageEvent.ticketInventory - detailPageEvent.ticketsSold);
                          })()}
                          onClick={() => setTicketQuantity(prev => prev + 1)}
                          className="w-10 h-10 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] hover:border-slate-605 disabled:opacity-40 font-bold flex items-center justify-center text-xl transition text-[var(--text-primary)]">+</button>
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
                      disabled={(() => {
                        if (detailPageEvent.ticketClasses) {
                          const tc = detailPageEvent.ticketClasses.find(c => c.name === selectedTicketClass);
                          return tc ? (tc.inventory - tc.sold <= 0) : true;
                        }
                        return detailPageEvent.ticketInventory - detailPageEvent.ticketsSold <= 0;
                      })()}
                      className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 font-outfit"
                    >
                      <Ticket className="w-5 h-5" />
                      Book {ticketQuantity} Ticket{ticketQuantity > 1 ? "s" : ""} · ${pricingDetails.total}
                    </button>
                    <p className="text-[10px] text-center text-[var(--text-secondary)]">
                      Powered by {paymentGateway} · SAGA distributed checkout
                    </p>
                  </div>
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

