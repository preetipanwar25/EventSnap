import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  UserCheck,
  Plus,
  Edit2,
  Store,
  Calendar,
  MapPin,
  X,
  Smartphone,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Upload,
  Download,
  FileText,
  CheckCircle,
  Wifi,
  Tv,
  Mic,
  Shield,
  Wind,
  Utensils,
  BarChart2,
  DollarSign,
  Map as MapIcon,
  Navigation,
  Plane,
  Building,
  Check,
  Clock,
  Star,
  Layers,
  Activity,
  AlertCircle
} from "lucide-react";
import { VenueProviderProfile, Venue, VenueBooking, Review, Event } from "../types";
import { parseLocationDetails, US_STATES, getDistanceInMiles } from "../utils";

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
  events?: Event[];
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
  renderStars,
  events = []
}) => {
  // Navigation & Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<"directory" | "calendar" | "reports" | "bulk">("directory");

  // Venue Provider Registration State
  const [vpRegStep, setVpRegStep] = useState<"form" | "otp">("form");
  const [vpRegCompanyName, setVpRegCompanyName] = useState("");
  const [vpRegContactName, setVpRegContactName] = useState("");
  const [vpRegEmail, setVpRegEmail] = useState("");
  const [vpRegPhone, setVpRegPhone] = useState("");
  const [vpOtpInput, setVpOtpInput] = useState("");
  const [vpOtpError, setVpOtpError] = useState<string | null>(null);
  const [pendingVenueProvider, setPendingVenueProvider] = useState<VenueProviderProfile | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterMinCapacity, setFilterMinCapacity] = useState<number>(0);
  const [filterMaxCost, setFilterMaxCost] = useState<number>(10000);
  const [filterCity, setFilterCity] = useState("ALL");
  const [filterWifi, setFilterWifi] = useState(false);
  const [filterParking, setFilterParking] = useState(false);
  const [filterCatering, setFilterCatering] = useState(false);
  const [filterWheelchair, setFilterWheelchair] = useState(false);

  // Sorting State
  const [sortKey, setSortKey] = useState<"name" | "capacity" | "cost" | "rating" | "distance">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // User Coordinates for Distance calculations (default: San Francisco)
  const [userLat, setUserLat] = useState<number>(37.7749);
  const [userLng, setUserLng] = useState<number>(-122.4194);

  // Bulk Operations State
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<"Active" | "Inactive" | "Under Renovation">("Active");
  const [importCsvText, setImportCsvText] = useState("");

  // Availability / Calendar Management State
  const [selectedCalVenueId, setSelectedCalVenueId] = useState<string>("ALL");
  const [currentCalMonth, setCurrentCalMonth] = useState(5); // June 2026 (index 5)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [newBlockedReason, setNewBlockedReason] = useState("");
  
  // Recurring Blocks state
  const [recurringDayOfWeek, setRecurringDayOfWeek] = useState<string>("Monday");
  const [recurringMonth, setRecurringMonth] = useState<number>(5); // June
  
  // Detail CRUD Modal State
  const [showDetailedModalVenueId, setShowDetailedModalVenueId] = useState<string | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<"general" | "space" | "pricing" | "amenities" | "compliance" | "events">("general");
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [showVenueGeoOverrides, setShowVenueGeoOverrides] = useState(false);

  // Document Upload Sim State (inside modal)
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("Contract");
  const [docExpiry, setDocExpiry] = useState("");

  // Map Plot Boundaries
  const mapMinLat = 24;
  const mapMaxLat = 50;
  const mapMinLng = -125;
  const mapMaxLng = -66;

  const getMapCoords = (lat: number, lng: number) => {
    const x = ((lng - mapMinLng) / (mapMaxLng - mapMinLng)) * 100;
    const y = (1 - (lat - mapMinLat) / (mapMaxLat - mapMinLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  // List of unique cities from current venues
  const uniqueCities = useMemo(() => {
    const cities = venues.map(v => v.city).filter(Boolean) as string[];
    return Array.from(new Set(cities));
  }, [venues]);

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

  // Calculate coordinates when edit location changes
  useEffect(() => {
    if (editingVenue && editingVenue.location) {
      const parsed = parseLocationDetails(editingVenue.location);
      setEditingVenue(prev => {
        if (!prev) return null;
        return {
          ...prev,
          city: parsed.city || prev.city,
          state: parsed.state || prev.state,
          zipcode: parsed.zipcode || prev.zipcode,
          latitude: parsed.latitude || prev.latitude,
          longitude: parsed.longitude || prev.longitude
        };
      });
    }
  }, [editingVenue?.location]);

  // Open Modal to View or Edit Venue
  const handleOpenDetailedModal = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    if (venue) {
      setEditingVenue({
        ...venue,
        status: venue.status || "Active",
        country: venue.country || "USA",
        timezone: venue.timezone || "PST",
        minCapacity: venue.minCapacity || 10,
        seatingCapacity: venue.seatingCapacity || venue.capacity,
        standingCapacity: venue.standingCapacity || venue.capacity,
        roomsCount: venue.roomsCount || 1,
        floorArea: venue.floorArea || 2500,
        layoutTypes: venue.layoutTypes || ["Theater", "Classroom", "U-Shape", "Banquet"],
        managerName: venue.managerName || activeVenueProvider?.contactName || "John Manager",
        managerEmail: venue.managerEmail || activeVenueProvider?.email || "manager@venue.com",
        managerPhone: venue.managerPhone || activeVenueProvider?.phone || "555-0100",
        rentalCost: venue.rentalCost || 1500,
        currency: venue.currency || "USD",
        costPerHour: venue.costPerHour || 150,
        costPerDay: venue.costPerDay || 1200,
        securityDeposit: venue.securityDeposit || 500,
        cancellationPolicy: venue.cancellationPolicy || "Free cancellation up to 14 days prior to event.",
        parkingAvailable: venue.parkingAvailable !== undefined ? venue.parkingAvailable : (venue.parkingSpots > 0),
        wifiAvailable: venue.wifiAvailable !== undefined ? venue.wifiAvailable : true,
        wifiSpeed: venue.wifiSpeed || 100,
        avEquipment: venue.avEquipment !== undefined ? venue.avEquipment : true,
        projectors: venue.projectors !== undefined ? venue.projectors : true,
        soundSystem: venue.soundSystem !== undefined ? venue.soundSystem : true,
        stage: venue.stage !== undefined ? venue.stage : true,
        airConditioning: venue.airConditioning !== undefined ? venue.airConditioning : true,
        cateringAvailable: venue.cateringAvailable !== undefined ? venue.cateringAvailable : true,
        kitchenAccess: venue.kitchenAccess !== undefined ? venue.kitchenAccess : false,
        greenRooms: venue.greenRooms !== undefined ? venue.greenRooms : false,
        wheelchairAccessible: venue.wheelchairAccessible !== undefined ? venue.wheelchairAccessible : true,
        restroomsCount: venue.restroomsCount || 4,
        powerBackup: venue.powerBackup !== undefined ? venue.powerBackup : true,
        setupTime: venue.setupTime || 2,
        cleanupTime: venue.cleanupTime || 2,
        loadingDock: venue.loadingDock !== undefined ? venue.loadingDock : false,
        freightElevator: venue.freightElevator !== undefined ? venue.freightElevator : false,
        fireSafetyCertified: venue.fireSafetyCertified !== undefined ? venue.fireSafetyCertified : true,
        emergencyExitsCount: venue.emergencyExitsCount || 4,
        securityAvailable: venue.securityAvailable !== undefined ? venue.securityAvailable : true,
        accessibilityCompliance: venue.accessibilityCompliance !== undefined ? venue.accessibilityCompliance : true,
        blockedDates: venue.blockedDates || [],
        maintenanceSchedule: venue.maintenanceSchedule || [],
        photos: venue.photos || [venue.imageUrl],
        videos: venue.videos || [],
        floorPlans: venue.floorPlans || [],
        documents: venue.documents || []
      });
      setModalActiveTab("general");
      setShowDetailedModalVenueId(venueId);
    }
  };

  // Open Modal for Create New Venue
  const handleOpenCreateModal = () => {
    if (!activeVenueProvider) return;
    const newId = `vn-${Date.now()}`;
    setEditingVenue({
      id: newId,
      providerId: activeVenueProvider.id,
      name: "",
      type: "Convention Center",
      description: "",
      location: "",
      capacity: 500,
      services: ["AV Setup", "Security"],
      parkingSpots: 50,
      availableDates: ["2026-06-25", "2026-06-26", "2026-07-12"],
      imageUrl: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=800&auto=format&fit=crop&q=80",
      city: "",
      state: "",
      zipcode: "",
      latitude: 37.7749,
      longitude: -122.4194,
      status: "Active",
      country: "USA",
      timezone: "PST",
      minCapacity: 10,
      seatingCapacity: 300,
      standingCapacity: 500,
      roomsCount: 1,
      floorArea: 5000,
      layoutTypes: ["Theater", "Classroom"],
      managerName: activeVenueProvider.contactName,
      managerEmail: activeVenueProvider.email,
      managerPhone: activeVenueProvider.phone,
      rentalCost: 1500,
      currency: "USD",
      costPerHour: 200,
      costPerDay: 1500,
      securityDeposit: 500,
      cancellationPolicy: "Free cancellation 7 days before event.",
      parkingAvailable: true,
      wifiAvailable: true,
      wifiSpeed: 200,
      avEquipment: true,
      projectors: true,
      soundSystem: true,
      stage: true,
      airConditioning: true,
      cateringAvailable: true,
      kitchenAccess: true,
      greenRooms: true,
      wheelchairAccessible: true,
      restroomsCount: 6,
      powerBackup: true,
      setupTime: 3,
      cleanupTime: 2,
      loadingDock: true,
      freightElevator: true,
      fireSafetyCertified: true,
      emergencyExitsCount: 6,
      securityAvailable: true,
      accessibilityCompliance: true,
      blockedDates: [],
      maintenanceSchedule: [],
      photos: [],
      videos: [],
      floorPlans: [],
      documents: []
    });
    setModalActiveTab("general");
    setShowDetailedModalVenueId(newId);
  };

  // Save Modal Form Action
  const handleSaveVenueDetails = () => {
    if (!editingVenue) return;
    if (!editingVenue.name || !editingVenue.location) {
      alert("Please enter a Venue Name and Location Address.");
      return;
    }

    // Double-booking check: If editingVenue availableDates were updated and dates with active bookings are missing
    const original = venues.find(v => v.id === editingVenue.id);
    if (original) {
      const removedDates = original.availableDates.filter(d => !editingVenue.availableDates.includes(d));
      const conflicts = venueBookings.filter(b => 
        b.venueId === editingVenue.id &&
        b.status === "CONFIRMED" &&
        removedDates.includes(b.date)
      );
      if (conflicts.length > 0) {
        const conflictList = conflicts.map(c => `"${c.eventTitle}" on ${c.date}`).join(", ");
        alert(`Cannot save modifications. The following confirmed event bookings would lose venue availability: ${conflictList}`);
        return;
      }
    }

    if (venues.some(v => v.id === editingVenue.id)) {
      // Update
      setVenues(prev => prev.map(v => v.id === editingVenue.id ? editingVenue : v));
      addSagaLog("Venue-Service", `Updated details for Venue: ${editingVenue.name}`, "success");
      alert(`Venue "${editingVenue.name}" successfully updated!`);
    } else {
      // Create
      setVenues(prev => [...prev, editingVenue]);
      addSagaLog("Venue-Service", `Listed new Venue property: ${editingVenue.name}`, "success");
      alert(`Venue "${editingVenue.name}" successfully listed!`);
    }

    setShowDetailedModalVenueId(null);
    setEditingVenue(null);
  };

  // Delete/Archive Venue
  const handleDeleteVenue = (venueId: string) => {
    const activeBookings = venueBookings.filter(b => b.venueId === venueId && b.status === "CONFIRMED");
    if (activeBookings.length > 0) {
      alert(`Cannot delete this venue. It has ${activeBookings.length} confirmed event bookings. Cancel bookings first.`);
      return;
    }

    if (confirm("Are you sure you want to delete/archive this venue property?")) {
      setVenues(prev => prev.filter(v => v.id !== venueId));
      addSagaLog("Venue-Service", `Deleted venue property ID: ${venueId}`, "error");
      alert("Venue successfully deleted.");
      setShowDetailedModalVenueId(null);
    }
  };

  // Filter and Sort Venues
  const filteredVenues = useMemo(() => {
    if (!activeVenueProvider) return [];

    let result = venues.filter(v => v.providerId === activeVenueProvider.id);

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(v => 
        v.name.toLowerCase().includes(term) || 
        (v.city || "").toLowerCase().includes(term) ||
        (v.description || "").toLowerCase().includes(term)
      );
    }

    // Type filter
    if (filterType !== "ALL") {
      result = result.filter(v => v.type === filterType);
    }

    // Capacity filter
    if (filterMinCapacity > 0) {
      result = result.filter(v => v.capacity >= filterMinCapacity);
    }

    // Cost range
    result = result.filter(v => (v.rentalCost || 0) <= filterMaxCost);

    // City
    if (filterCity !== "ALL") {
      result = result.filter(v => v.city === filterCity);
    }

    // Facilities check
    if (filterWifi) {
      result = result.filter(v => v.wifiAvailable !== false);
    }
    if (filterParking) {
      result = result.filter(v => v.parkingSpots > 0 || v.parkingAvailable);
    }
    if (filterCatering) {
      result = result.filter(v => v.cateringAvailable !== false);
    }
    if (filterWheelchair) {
      result = result.filter(v => v.wheelchairAccessible !== false);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortKey === "capacity") {
        comparison = a.capacity - b.capacity;
      } else if (sortKey === "cost") {
        comparison = (a.rentalCost || 0) - (b.rentalCost || 0);
      } else if (sortKey === "rating") {
        comparison = getAverageRating("VENUE", a.id) - getAverageRating("VENUE", b.id);
      } else if (sortKey === "distance") {
        const distA = getDistanceInMiles(userLat, userLng, a.latitude || 0, a.longitude || 0);
        const distB = getDistanceInMiles(userLat, userLng, b.latitude || 0, b.longitude || 0);
        comparison = distA - distB;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [venues, activeVenueProvider, searchTerm, filterType, filterMinCapacity, filterMaxCost, filterCity, filterWifi, filterParking, filterCatering, filterWheelchair, sortKey, sortOrder, userLat, userLng]);

  // Bulk operation handlers
  const handleToggleSelectVenue = (id: string) => {
    setSelectedVenueIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = () => {
    if (selectedVenueIds.length === 0) {
      alert("No venues selected.");
      return;
    }
    setVenues(prev => prev.map(v => 
      selectedVenueIds.includes(v.id) ? { ...v, status: bulkStatus } : v
    ));
    addSagaLog("Venue-Service", `Bulk updated status of ${selectedVenueIds.length} venues to: ${bulkStatus}`, "success");
    alert(`Bulk updated ${selectedVenueIds.length} venues status to ${bulkStatus}!`);
    setSelectedVenueIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedVenueIds.length === 0) {
      alert("No venues selected.");
      return;
    }
    // check bookings for these
    const confirmedCount = venueBookings.filter(b => 
      selectedVenueIds.includes(b.venueId) && b.status === "CONFIRMED"
    ).length;
    if (confirmedCount > 0) {
      alert(`Cannot perform bulk delete. Selected venues have active bookings.`);
      return;
    }
    if (confirm(`Are you sure you want to bulk delete ${selectedVenueIds.length} venues?`)) {
      setVenues(prev => prev.filter(v => !selectedVenueIds.includes(v.id)));
      addSagaLog("Venue-Service", `Bulk deleted ${selectedVenueIds.length} venues`, "error");
      alert(`Deleted ${selectedVenueIds.length} venues.`);
      setSelectedVenueIds([]);
    }
  };

  const handleExportVenues = () => {
    const providerVenues = venues.filter(v => v.providerId === activeVenueProvider?.id);
    const headers = ["id", "name", "type", "description", "location", "capacity", "parkingSpots", "rentalCost", "city", "state", "zipcode", "status", "managerName", "managerEmail"];
    const csvLines = [headers.join(",")];
    
    providerVenues.forEach(v => {
      const line = [
        v.id,
        `"${v.name.replace(/"/g, '""')}"`,
        v.type,
        `"${(v.description || "").replace(/"/g, '""')}"`,
        `"${v.location.replace(/"/g, '""')}"`,
        v.capacity,
        v.parkingSpots,
        v.rentalCost || 0,
        v.city || "",
        v.state || "",
        v.zipcode || "",
        v.status || "Active",
        v.managerName || "",
        v.managerEmail || ""
      ];
      csvLines.push(line.join(","));
    });

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "venues_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addSagaLog("Venue-Service", "Exported venue properties list to CSV.", "info");
  };

  const handleImportCSV = (csvText: string) => {
    const lines = csvText.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      alert("Invalid CSV. Please include a header row and values.");
      return;
    }
    
    const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ''));
    const parsedVenues: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length < headers.length) continue;
      
      const item: any = {};
      headers.forEach((h, index) => {
        item[h] = values[index];
      });
      parsedVenues.push(item);
    }
    
    const newImported = parsedVenues.map((pv, idx) => {
      const servicesVal = pv.services ? String(pv.services).split(";") : ["AV Setup"];
      const datesVal = pv.availableDates ? String(pv.availableDates).split(";") : ["2026-06-25"];
      
      return {
        id: `vn-import-${Date.now()}-${idx}`,
        providerId: activeVenueProvider?.id || "vp-1",
        name: pv.name || pv.venue_name || "Imported Venue",
        type: (pv.type || pv.venue_type || "Convention Center") as any,
        description: pv.description || "Imported description.",
        location: pv.location || pv.address || "Unknown location",
        capacity: parseInt(String(pv.capacity || pv.max_capacity || "100")),
        services: servicesVal,
        parkingSpots: parseInt(String(pv.parkingSpots || "10")),
        availableDates: datesVal,
        imageUrl: pv.imageUrl || pv.file_url || "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=800&auto=format&fit=crop&q=80",
        city: pv.city || "San Francisco",
        state: pv.state || "CA",
        zipcode: pv.zipcode || pv.zip_code || "94103",
        latitude: parseFloat(String(pv.latitude || "37.7726")),
        longitude: parseFloat(String(pv.longitude || "-122.4098")),
        status: (pv.status || "Active") as any,
        rentalCost: parseFloat(String(pv.rentalCost || pv.amount || "1000")),
        currency: pv.currency || "USD",
        managerName: pv.managerName || pv.name || "John Doe",
        managerEmail: pv.managerEmail || pv.email || "manager@venue.com",
        managerPhone: pv.managerPhone || pv.phone || "555-0199"
      };
    });
    
    setVenues(prev => [...prev, ...newImported]);
    addSagaLog("Venue-Service", `Bulk imported ${newImported.length} properties via CSV.`, "success");
    alert(`Successfully imported ${newImported.length} venues!`);
    setImportCsvText("");
  };

  // Block selected calendar day
  const handleBlockSelectedDay = () => {
    if (!selectedCalendarDay || selectedCalVenueId === "ALL") return;
    const booking = venueBookings.find(b => b.venueId === selectedCalVenueId && b.date === selectedCalendarDay && b.status === "CONFIRMED");
    if (booking) {
      alert(`Cannot block this date. It is already booked for event: "${booking.eventTitle}".`);
      return;
    }
    
    setVenues(prev => prev.map(v => {
      if (v.id === selectedCalVenueId) {
        const blocked = v.blockedDates || [];
        if (blocked.includes(selectedCalendarDay)) {
          return { ...v, blockedDates: blocked.filter(d => d !== selectedCalendarDay) };
        } else {
          return {
            ...v,
            blockedDates: [...blocked, selectedCalendarDay],
            maintenanceSchedule: [
              ...(v.maintenanceSchedule || []),
              { date: selectedCalendarDay, reason: newBlockedReason || "Property Blocked / Maintenance" }
            ]
          };
        }
      }
      return v;
    }));
    alert("Date block settings updated successfully.");
    setNewBlockedReason("");
  };

  // Add Recurring Blocks
  const handleAddRecurringBlocks = () => {
    if (selectedCalVenueId === "ALL") {
      alert("Please select a specific property to apply recurring blocks.");
      return;
    }
    
    // Find all days of week in target month
    const daysInMonth = currentCalMonth === 5 ? 30 : currentCalMonth === 6 ? 31 : 31;
    const monthStr = String(currentCalMonth + 1).padStart(2, "0");
    const datesToBlock: string[] = [];

    const weekdayMap: { [key: string]: number } = {
      "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6
    };
    const targetDay = weekdayMap[recurringDayOfWeek];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `2026-${monthStr}-${String(day).padStart(2, "0")}`;
      const dt = new Date(dateStr);
      if (dt.getDay() === targetDay) {
        datesToBlock.push(dateStr);
      }
    }

    // Verify conflicts
    const conflicts = venueBookings.filter(b => 
      b.venueId === selectedCalVenueId && 
      b.status === "CONFIRMED" && 
      datesToBlock.includes(b.date)
    );
    if (conflicts.length > 0) {
      const conflictList = conflicts.map(c => c.date).join(", ");
      alert(`Warning: Confirmed events already booked on some of those dates (${conflictList}). Conflict blocked.`);
      return;
    }

    setVenues(prev => prev.map(v => {
      if (v.id === selectedCalVenueId) {
        const existingBlocked = v.blockedDates || [];
        const newBlocked = Array.from(new Set([...existingBlocked, ...datesToBlock]));
        return {
          ...v,
          blockedDates: newBlocked,
          maintenanceSchedule: [
            ...(v.maintenanceSchedule || []),
            ...datesToBlock.map(d => ({ date: d, reason: `Recurring block (${recurringDayOfWeek}s)` }))
          ]
        };
      }
      return v;
    }));
    alert(`Successfully blocked all ${recurringDayOfWeek}s in current month!`);
  };

  // Report details calculation
  const reportMetrics = useMemo(() => {
    const providerVenues = venues.filter(v => v.providerId === activeVenueProvider?.id);
    
    // Most used venues & Utilization
    const venueUsage = providerVenues.map(vn => {
      const bookingsCount = venueBookings.filter(b => b.venueId === vn.id && b.status === "CONFIRMED").length;
      const blockedCount = (vn.blockedDates || []).length;
      const totalDays = vn.availableDates.length + bookingsCount + blockedCount;
      const utilizationRate = totalDays > 0 ? (bookingsCount / totalDays) * 100 : 0;
      
      // Revenue calculation: Sum order sales of linked events, plus simulated rental base
      const linkedEvts = events.filter(e => e.venueId === vn.id);
      let calculatedRevenue = bookingsCount * (vn.rentalCost || 1500); // base rental fee
      linkedEvts.forEach(ev => {
        calculatedRevenue += ev.ticketsSold * ev.price; // ticket sales revenue integration
      });

      return {
        id: vn.id,
        name: vn.name,
        bookingsCount,
        utilizationRate,
        revenue: calculatedRevenue
      };
    });

    // Sort by usage
    const mostUsed = [...venueUsage].sort((a, b) => b.bookingsCount - a.bookingsCount);

    // Monthly trends (June, July, August)
    const trends = [
      { month: "June", bookings: 0, revenue: 0 },
      { month: "July", bookings: 0, revenue: 0 },
      { month: "August", bookings: 0, revenue: 0 }
    ];

    venueBookings.forEach(b => {
      if (b.status === "CONFIRMED" && providerVenues.some(v => v.id === b.venueId)) {
        const dateMonth = parseInt(b.date.split("-")[1]);
        const vnObj = providerVenues.find(v => v.id === b.venueId);
        const fee = vnObj?.rentalCost || 1500;
        if (dateMonth === 6) { trends[0].bookings++; trends[0].revenue += fee; }
        else if (dateMonth === 7) { trends[1].bookings++; trends[1].revenue += fee; }
        else if (dateMonth === 8) { trends[2].bookings++; trends[2].revenue += fee; }
      }
    });

    return {
      venueUsage,
      mostUsed,
      trends
    };
  }, [venues, venueBookings, activeVenueProvider, events]);

  // Compute active venue double bookings or capacity issues in layout
  const modalLinkedEventsInfo = useMemo(() => {
    if (!editingVenue) return [];
    
    // Find all events linked to this venue
    const linked = events.filter(e => e.venueId === editingVenue.id);
    
    return linked.map(ev => {
      // Find matching booking date
      const booking = venueBookings.find(b => b.venueId === editingVenue.id && b.eventId === ev.id && b.status === "CONFIRMED");
      const eventDateStr = booking ? booking.date : "Date not booked";
      
      // Check capacity conflict (event expected ticket inventory overrides max capacity)
      const capacityConflict = ev.ticketInventory > editingVenue.capacity;
      
      // Check double booking: does any other event share this date at this venue?
      const duplicateBookings = venueBookings.filter(b => 
        b.venueId === editingVenue.id && 
        b.date === eventDateStr && 
        b.status === "CONFIRMED" && 
        b.eventId !== ev.id
      );
      const isDoubleBooked = duplicateBookings.length > 0;
      
      return {
        event: ev,
        date: eventDateStr,
        capacityConflict,
        isDoubleBooked,
        doubleBookedWith: duplicateBookings.map(d => d.eventTitle).join(", ")
      };
    });
  }, [editingVenue, events, venueBookings]);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Session Header / Verified Badge */}
      {!activeVenueProvider ? (
        <div className="max-w-md mx-auto glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/25">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[var(--text-primary)]">Venue Provider Verification</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Register and verify your company details via SMS OTP to manage your venue listings.</p>
            </div>
          </div>

          {vpRegStep === "form" ? (
            <form onSubmit={handleRegisterVenueProvider} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Company / Venue Provider Name *</label>
                <input
                  type="text"
                  required
                  value={vpRegCompanyName}
                  onChange={(e) => setVpRegCompanyName(e.target.value)}
                  placeholder="e.g. Apex Venues Ltd."
                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={vpRegContactName}
                  onChange={(e) => setVpRegContactName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={vpRegEmail}
                    onChange={(e) => setVpRegEmail(e.target.value)}
                    placeholder="venues@apex.com"
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
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
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3.5 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-3">
                <button
                  type="submit"
                  className="flex-[2] bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
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
                    addSagaLog("Auth-Service", `Mock login: Switched role to [VENUE_PROVIDER] and loaded Sarah Connor provider profile via Quick Mock Login.`, "info");
                  }}
                  className="flex-[1] bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-[10px] px-2 rounded-xl text-[var(--text-secondary)] font-semibold transition cursor-pointer"
                  title="Quickly bypass verification using mock credentials"
                >
                  Quick Bypass
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyVenueProviderOtp} className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] font-sans">
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
                  className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2.5 px-3 text-center text-lg tracking-widest text-[var(--text-primary)] placeholder-[var(--text-secondary)]/30 font-mono font-bold w-full focus:outline-none focus:border-indigo-500"
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
                  className="w-1/2 bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-xs py-2.5 rounded-xl text-[var(--text-secondary)] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Verify OTP
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Verified Provider Title & Sub-Tabs Navigation */}
          <div className="glass rounded-2xl border border-[var(--glass-border)] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] font-outfit">{activeVenueProvider.companyName}</h2>
                <p className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase font-bold">Venue Provider Administrator Console</p>
              </div>
            </div>

            {/* Sub-Tabs Selector */}
            <div className="flex bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--glass-border)] text-xs font-sans">
              <button
                onClick={() => setActiveSubTab("directory")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeSubTab === "directory" ? "bg-indigo-500 text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              >
                Properties Directory
              </button>
              <button
                onClick={() => setActiveSubTab("calendar")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeSubTab === "calendar" ? "bg-indigo-500 text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              >
                Availability Calendar
              </button>
              <button
                onClick={() => setActiveSubTab("reports")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeSubTab === "reports" ? "bg-indigo-500 text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              >
                Analytics & Reports
              </button>
              <button
                onClick={() => setActiveSubTab("bulk")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeSubTab === "bulk" ? "bg-indigo-500 text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              >
                Bulk Operations
              </button>
            </div>

            <button
              onClick={() => setActiveVenueProvider(null)}
              className="text-xs text-[var(--text-secondary)] hover:text-rose-400 font-medium transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          {/* ======================= TAB 1: PROPERTIES DIRECTORY ======================= */}
          {activeSubTab === "directory" && (
            <div className="space-y-6">
              
              {/* Directory Filter Panel & Sorting */}
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 font-sans">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-secondary)]/60" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search properties by name, city, description..."
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 pl-9 pr-4 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-indigo-500 placeholder-[var(--text-secondary)]/50"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Add property CTA */}
                    <button
                      onClick={handleOpenCreateModal}
                      className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-500/15"
                    >
                      <Plus className="w-4 h-4" />
                      List Property
                    </button>

                    <button
                      onClick={handleExportVenues}
                      className="bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] font-semibold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Property Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] rounded-lg py-1.5 px-2.5 w-full focus:outline-none focus:border-indigo-500 cursor-pointer font-sans"
                    >
                      <option value="ALL">All Types</option>
                      <option value="Convention Center">Convention Center</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Banquet Hall">Banquet Hall</option>
                      <option value="Stadium">Stadium</option>
                      <option value="Conference Room">Conference Room</option>
                      <option value="Outdoor Venue">Outdoor Venue</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">City</label>
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] rounded-lg py-1.5 px-2.5 w-full focus:outline-none focus:border-indigo-500 cursor-pointer font-sans"
                    >
                      <option value="ALL">All Cities</option>
                      {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Min Capacity</label>
                    <input
                      type="number"
                      value={filterMinCapacity === 0 ? "" : filterMinCapacity}
                      onChange={(e) => setFilterMinCapacity(e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder="e.g. 500"
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] rounded-lg py-1.5 px-2.5 w-full focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Max Daily Cost</label>
                    <input
                      type="number"
                      value={filterMaxCost}
                      onChange={(e) => setFilterMaxCost(parseInt(e.target.value) || 10000)}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] rounded-lg py-1.5 px-2.5 w-full focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Sort By</label>
                    <select
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value as any)}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] rounded-lg py-1.5 px-2.5 w-full focus:outline-none focus:border-indigo-500 cursor-pointer font-sans"
                    >
                      <option value="name">Property Name</option>
                      <option value="capacity">Max Capacity</option>
                      <option value="cost">Rental Cost</option>
                      <option value="rating">Review Rating</option>
                      <option value="distance">User GPS Distance</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Sort Order</label>
                    <button
                      onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] rounded-lg py-1.5 px-3 w-full flex items-center justify-between focus:outline-none hover:border-indigo-500/40"
                    >
                      <span>{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  </div>
                </div>

                {/* Amenities checklist & Distance Sort Coordinates inputs */}
                <div className="flex flex-col lg:flex-row justify-between gap-4 pt-2 border-t border-[var(--glass-border)] text-[11px] text-[var(--text-secondary)]">
                  <div className="flex flex-wrap gap-4 items-center">
                    <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Quick Filters:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-primary)]">
                      <input type="checkbox" checked={filterWifi} onChange={() => setFilterWifi(!filterWifi)} className="rounded border-slate-700 bg-transparent text-indigo-500" />
                      Free Wi-Fi
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-primary)]">
                      <input type="checkbox" checked={filterParking} onChange={() => setFilterParking(!filterParking)} className="rounded border-slate-700 bg-transparent text-indigo-500" />
                      Parking Spots
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-primary)]">
                      <input type="checkbox" checked={filterCatering} onChange={() => setFilterCatering(!filterCatering)} className="rounded border-slate-700 bg-transparent text-indigo-500" />
                      In-house Catering
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-primary)]">
                      <input type="checkbox" checked={filterWheelchair} onChange={() => setFilterWheelchair(!filterWheelchair)} className="rounded border-slate-700 bg-transparent text-indigo-500" />
                      Wheelchair Accessible
                    </label>
                  </div>

                  {sortKey === "distance" && (
                    <div className="flex items-center gap-2 font-mono">
                      <span>Coordinates for Distance:</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={userLat}
                        onChange={(e) => setUserLat(parseFloat(e.target.value) || 0)}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-1.5 py-0.5 w-20 text-[10px] focus:outline-none focus:border-indigo-500 text-center"
                        title="User Latitude"
                      />
                      <span>Lat,</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={userLng}
                        onChange={(e) => setUserLng(parseFloat(e.target.value) || 0)}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-1.5 py-0.5 w-20 text-[10px] focus:outline-none focus:border-indigo-500 text-center"
                        title="User Longitude"
                      />
                      <span>Lng</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Directory Grid & Simulated Interactive Map */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                
                {/* Properties Cards List */}
                <div className="xl:col-span-2 space-y-4">
                  
                  {/* Select operations header */}
                  {filteredVenues.length > 0 && (
                    <div className="flex justify-between items-center p-2.5 bg-[var(--input-bg)] rounded-xl border border-[var(--glass-border)] text-xs text-[var(--text-secondary)]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedVenueIds.length === filteredVenues.length && filteredVenues.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVenueIds(filteredVenues.map(v => v.id));
                            } else {
                              setSelectedVenueIds([]);
                            }
                          }}
                          className="rounded border-slate-700 bg-transparent text-indigo-500"
                        />
                        <span>Select All ({selectedVenueIds.length} chosen)</span>
                      </label>

                      {selectedVenueIds.length > 0 && (
                        <div className="flex items-center gap-3">
                          <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value as any)}
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded text-[10px] py-1 px-1.5 text-[var(--text-primary)]"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Under Renovation">Under Renovation</option>
                          </select>
                          <button
                            onClick={handleBulkStatusUpdate}
                            className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-2 py-1 rounded text-[10px] transition cursor-pointer"
                          >
                            Update Status
                          </button>
                          <button
                            onClick={handleBulkDelete}
                            className="bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 font-bold px-2 py-1 rounded text-[10px] transition cursor-pointer"
                          >
                            Delete Selected
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {filteredVenues.length === 0 ? (
                    <div className="glass rounded-2xl border border-[var(--glass-border)] py-16 text-center text-xs text-[var(--text-secondary)] space-y-2">
                      <Store className="w-10 h-10 mx-auto text-[var(--text-secondary)]/30" />
                      <p className="font-bold">No listed properties matching these filter parameters.</p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilterType("ALL");
                          setFilterMinCapacity(0);
                          setFilterMaxCost(10000);
                          setFilterCity("ALL");
                          setFilterWifi(false);
                          setFilterParking(false);
                          setFilterCatering(false);
                          setFilterWheelchair(false);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline text-[10px] pt-1"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredVenues.map(vn => {
                        const isChecked = selectedVenueIds.includes(vn.id);
                        const distance = getDistanceInMiles(userLat, userLng, vn.latitude || 0, vn.longitude || 0);
                        const avgRating = getAverageRating("VENUE", vn.id);
                        const reviewCount = getReviewCount("VENUE", vn.id);
                        
                        return (
                          <div
                            key={vn.id}
                            onClick={() => handleOpenDetailedModal(vn.id)}
                            className="glass rounded-xl border border-[var(--glass-border)] hover:border-indigo-500/30 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between"
                          >
                            <div>
                              <div className="relative h-32 bg-[var(--input-bg)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={vn.imageUrl} alt={vn.name} className="w-full h-full object-cover opacity-75" />
                                
                                <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleSelectVenue(vn.id)}
                                    className="rounded border-slate-700 bg-black/50 text-indigo-500 w-4 h-4 cursor-pointer"
                                  />
                                </div>

                                <span className={`absolute top-2 right-2 border text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                                  (vn.status || "Active") === "Active" 
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : (vn.status || "Active") === "Under Renovation"
                                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                }`}>
                                  {vn.status || "Active"}
                                </span>

                                <span className="absolute bottom-2 right-2 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                                  CAP: {vn.capacity}
                                </span>
                              </div>

                              <div className="p-4 space-y-2 text-xs">
                                <div>
                                  <h4 className="font-bold text-sm text-[var(--text-primary)] font-outfit line-clamp-1">{vn.name}</h4>
                                  <p className="text-[var(--text-secondary)] text-[10px] mt-0.5 italic flex items-center gap-1 font-sans">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {vn.location}
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase tracking-wider font-mono">
                                    {vn.type}
                                  </span>

                                  {avgRating > 0 ? (
                                    <div className="flex items-center gap-1">
                                      {renderStars(avgRating)}
                                      <span className="text-[9px] text-[var(--text-secondary)] font-mono">({reviewCount})</span>
                                    </div>
                                  ) : (
                                    <span className="text-[9px] text-[var(--text-secondary)]/60 italic">No ratings</span>
                                  )}
                                </div>

                                <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed line-clamp-2">{vn.description || "No description provided."}</p>
                              </div>
                            </div>

                            <div className="p-4 pt-0 space-y-2.5">
                              {/* Facilities tags */}
                              <div className="flex flex-wrap gap-1 border-t border-[var(--glass-border)] pt-2.5">
                                {(vn.services || []).slice(0, 3).map(s => (
                                  <span key={s} className="bg-[var(--glass-border)] text-[var(--text-primary)] text-[9px] px-1.5 py-0.5 rounded font-semibold">
                                    {s}
                                  </span>
                                ))}
                                {(vn.services || []).length > 3 && (
                                  <span className="bg-[var(--glass-border)] text-[var(--text-secondary)] text-[9px] px-1.5 py-0.5 rounded font-semibold">
                                    +{(vn.services || []).length - 3} more
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
                                <div>
                                  Cost: <span className="font-bold text-sky-400 text-xs">${vn.rentalCost || 1200}</span>/day
                                </div>
                                <div className="flex items-center gap-1">
                                  <Navigation className="w-3 h-3 text-indigo-400" />
                                  <span>{distance.toFixed(1)} miles</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Interactive SVG Map Card */}
                <div className="xl:col-span-1 space-y-4">
                  <div className="glass rounded-2xl border border-[var(--glass-border)] p-4 space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5 font-mono">
                        <MapIcon className="w-4 h-4 text-indigo-400" />
                        US Property Plotter Map
                      </h4>
                      <span className="text-[9px] font-mono text-indigo-400">Interactive SVG</span>
                    </div>

                    <div className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl relative overflow-hidden aspect-[4/3] flex items-center justify-center">
                      
                      {/* Grid background mesh */}
                      <div className="absolute inset-0 bg-[radial-gradient(var(--glass-border)_1px,transparent_1px)] [background-size:16px_16px] opacity-45"></div>

                      <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-indigo-500/20 select-none">
                        {/* US Border Outline Simulation */}
                        <path d="M 10,25 Q 25,12 50,15 T 90,20 Q 95,45 88,65 T 75,85 Q 50,90 28,82 T 8,62 Q 5,42 10,25 Z" fill="rgba(99, 102, 241, 0.03)" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="0.8" />
                        <path d="M 5,20 L 95,20 M 5,40 L 95,40 M 5,60 L 95,60 M 5,80 L 95,80 M 20,5 L 20,95 M 40,5 L 40,95 M 60,5 L 60,95 M 80,5 L 80,95" stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" />
                      </svg>

                      {/* Map Pins plotting */}
                      {filteredVenues.map(vn => {
                        const coords = getMapCoords(vn.latitude || 37.77, vn.longitude || -122.41);
                        return (
                          <button
                            key={`pin-${vn.id}`}
                            type="button"
                            onClick={() => handleOpenDetailedModal(vn.id)}
                            className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                            style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                            title={`${vn.name} (${vn.city})`}
                          >
                            <MapPin className="w-5 h-5 text-indigo-400 group-hover:text-sky-400 transition-colors drop-shadow" />
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-5 bg-black/90 border border-slate-700 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 font-mono font-bold">
                              {vn.name} (${vn.rentalCost || 1200})
                            </span>
                          </button>
                        );
                      })}

                      {/* User Current coordinate pin indicator */}
                      {sortKey === "distance" && (
                        <div
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                          style={{ left: `${getMapCoords(userLat, userLng).x}%`, top: `${getMapCoords(userLat, userLng).y}%` }}
                        >
                          <div className="w-4 h-4 bg-sky-500 rounded-full border-2 border-white animate-ping absolute opacity-75"></div>
                          <Navigation className="w-4 h-4 text-sky-400 drop-shadow relative z-20 fill-sky-400" />
                        </div>
                      )}
                    </div>

                    {/* Simulated nearest utilities logic based on GPS */}
                    {filteredVenues.length > 0 && (() => {
                      const activeVenue = filteredVenues[0];
                      const activeLat = activeVenue.latitude || 37.77;
                      const activeLng = activeVenue.longitude || -122.41;

                      // Airport simulation (e.g. SF Intl coords, Denver Co coords, or offset relative)
                      const airportName = activeVenue.city === "San Francisco" ? "San Francisco International (SFO)" : activeVenue.city === "Morrison" ? "Denver International (DEN)" : `${activeVenue.city} Regional Airport`;
                      const airportLat = activeLat + (activeVenue.city === "Morrison" ? 0.35 : 0.15);
                      const airportLng = activeLng - (activeVenue.city === "Morrison" ? 0.42 : 0.08);
                      const airportDist = getDistanceInMiles(activeLat, activeLng, airportLat, airportLng);

                      // Hotel simulation (offset relative to venue coordinate)
                      const hotelName = `Aura Premium Hotel & Suites (${activeVenue.city})`;
                      const hotelLat = activeLat + 0.008;
                      const hotelLng = activeLng - 0.005;
                      const hotelDist = getDistanceInMiles(activeLat, activeLng, hotelLat, hotelLng);

                      return (
                        <div className="space-y-2.5 pt-2 border-t border-[var(--glass-border)] text-xs font-sans">
                          <span className="font-bold text-[10px] text-[var(--text-secondary)] uppercase block">Nearest Utilities ({activeVenue.name}):</span>
                          <div className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-2.5 space-y-2 font-sans text-[11px]">
                            <div className="flex items-center justify-between text-[var(--text-primary)]">
                              <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                                <Plane className="w-3.5 h-3.5 text-sky-400" /> {airportName}
                              </span>
                              <span className="font-mono text-[var(--text-secondary)] font-bold">{airportDist.toFixed(1)} miles</span>
                            </div>
                            <div className="flex items-center justify-between text-[var(--text-primary)]">
                              <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                                <Building className="w-3.5 h-3.5 text-indigo-400" /> {hotelName}
                              </span>
                              <span className="font-mono text-[var(--text-secondary)] font-bold">{hotelDist.toFixed(1)} miles</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================= TAB 2: AVAILABILITY CALENDAR ======================= */}
          {activeSubTab === "calendar" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start font-sans">
              
              {/* Left Column Controls: Blocking, Reserve, Recurring */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-2">
                    <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-outfit">
                      <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                      Calendar Controls
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Selected Property</label>
                      <select
                        value={selectedCalVenueId}
                        onChange={(e) => {
                          setSelectedCalVenueId(e.target.value);
                          setSelectedCalendarDay(null);
                        }}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] rounded-lg py-2 px-3 w-full focus:outline-none focus:border-indigo-500 cursor-pointer font-sans"
                      >
                        <option value="ALL">All Owned Properties</option>
                        {venues.filter(v => v.providerId === activeVenueProvider.id).map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedCalendarDay ? (
                      <div className="p-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl space-y-3 font-sans text-xs">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold uppercase text-[var(--text-secondary)]">Day Operations</span>
                          <span className="font-mono text-indigo-400 font-bold">{selectedCalendarDay}</span>
                        </div>

                        {selectedCalVenueId === "ALL" ? (
                          <p className="text-[var(--text-secondary)] text-[11px] italic">
                            Select a specific property to block or manage date availability records.
                          </p>
                        ) : (() => {
                          const vn = venues.find(v => v.id === selectedCalVenueId);
                          const isBlocked = vn?.blockedDates?.includes(selectedCalendarDay);
                          const isBooked = venueBookings.some(b => b.venueId === selectedCalVenueId && b.date === selectedCalendarDay && b.status === "CONFIRMED");

                          return (
                            <div className="space-y-3 pt-1">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[var(--text-secondary)]">Block/Maintenance Note</label>
                                <input
                                  type="text"
                                  value={newBlockedReason}
                                  onChange={(e) => setNewBlockedReason(e.target.value)}
                                  placeholder="e.g. Annual AC Overhaul"
                                  className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg py-1 px-2.5 text-[11px] text-[var(--text-primary)] w-full focus:outline-none focus:border-indigo-500"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={handleBlockSelectedDay}
                                className={`w-full py-2 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                                  isBlocked 
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/15" 
                                    : "bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/15"
                                }`}
                              >
                                {isBlocked ? "Unblock / Restore Date" : "Block Date / Maintain"}
                              </button>

                              {isBooked && (
                                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 flex items-start gap-1.5 text-[10px] leading-relaxed">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span>This date has a confirmed booking. Blocking requires event organizer negotiation or SAGA refund orchestration.</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="p-4 bg-[var(--input-bg)]/40 border border-dashed border-[var(--glass-border)] rounded-xl text-center text-xs text-[var(--text-secondary)] italic">
                        Select a date in the calendar grid to block dates or check conflicts.
                      </div>
                    )}

                    {/* Recurring Blocks Scheduler */}
                    <div className="p-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl space-y-3 font-sans text-xs">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Simulate Recurring Blocks</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Day Of Week</label>
                          <select
                            value={recurringDayOfWeek}
                            onChange={(e) => setRecurringDayOfWeek(e.target.value)}
                            className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-1 px-1.5 text-[11px] text-[var(--text-primary)] w-full focus:outline-none"
                          >
                            <option value="Monday">Mondays</option>
                            <option value="Tuesday">Tuesdays</option>
                            <option value="Wednesday">Wednesdays</option>
                            <option value="Thursday">Thursdays</option>
                            <option value="Friday">Fridays</option>
                            <option value="Saturday">Saturdays</option>
                            <option value="Sunday">Sundays</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Month</label>
                          <select
                            value={recurringMonth}
                            onChange={(e) => setRecurringMonth(parseInt(e.target.value))}
                            className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded py-1 px-1.5 text-[11px] text-[var(--text-primary)] w-full focus:outline-none"
                          >
                            <option value={5}>June 2026</option>
                            <option value={6}>July 2026</option>
                            <option value={7}>August 2026</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddRecurringBlocks}
                        className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] font-semibold py-2 rounded-xl text-xs transition cursor-pointer"
                      >
                        Apply Month Block
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Calendar Grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold text-[var(--text-primary)] border-b border-[var(--glass-border)] pb-3">
                    <button
                      onClick={() => setCurrentCalMonth(prev => prev === 5 ? 7 : prev - 1)}
                      className="p-1 hover:bg-[var(--glass-border)] rounded text-xs transition-colors"
                    >
                      &larr; Prev Month
                    </button>
                    <span className="font-outfit text-base">{currentCalMonth === 5 ? "June 2026" : currentCalMonth === 6 ? "July 2026" : "August 2026"}</span>
                    <button
                      onClick={() => setCurrentCalMonth(prev => prev === 7 ? 5 : prev + 1)}
                      className="p-1 hover:bg-[var(--glass-border)] rounded text-xs transition-colors"
                    >
                      Next Month &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                    {/* Weekdays */}
                    {["M", "T", "W", "T", "F", "S", "S"].map((w, idx) => (
                      <span key={idx} className="font-bold text-[var(--text-secondary)] py-1 font-mono">{w}</span>
                    ))}

                    {/* Empty spaces offset */}
                    {Array.from({ length: currentCalMonth === 5 ? 0 : currentCalMonth === 6 ? 2 : 5 }).map((_, i) => (
                      <span key={`empty-${i}`} className="py-3 opacity-0">.</span>
                    ))}

                    {/* Month Days */}
                    {Array.from({ length: currentCalMonth === 5 ? 30 : currentCalMonth === 6 ? 31 : 31 }).map((_, i) => {
                      const day = i + 1;
                      const monthStr = String(currentCalMonth + 1).padStart(2, "0");
                      const dayStr = String(day).padStart(2, "0");
                      const dateYmd = `2026-${monthStr}-${dayStr}`;

                      const providerVenues = venues.filter(v => v.providerId === activeVenueProvider.id);
                      
                      // Active bookings
                      const dayBooking = venueBookings.find(b => 
                        b.date === dateYmd &&
                        b.status === "CONFIRMED" &&
                        (selectedCalVenueId === "ALL" 
                          ? providerVenues.some(v => v.id === b.venueId)
                          : b.venueId === selectedCalVenueId)
                      );

                      // Date blocked
                      const dayBlocked = selectedCalVenueId === "ALL"
                        ? providerVenues.every(v => v.blockedDates?.includes(dateYmd))
                        : (venues.find(v => v.id === selectedCalVenueId)?.blockedDates?.includes(dateYmd));

                      const isSelected = selectedCalendarDay === dateYmd;

                      return (
                        <button
                          key={`day-${day}`}
                          type="button"
                          onClick={() => setSelectedCalendarDay(dateYmd)}
                          className={`py-3.5 rounded-xl font-mono font-bold flex flex-col items-center justify-center relative transition-colors cursor-pointer border ${
                            dayBooking 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
                              : dayBlocked
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/25 hover:bg-rose-500/20"
                                : "bg-[var(--glass-bg)] hover:bg-[var(--glass-border)] border-[var(--glass-border)] text-[var(--text-primary)]"
                          } ${isSelected ? "ring-2 ring-indigo-500 border-indigo-500 scale-105" : ""}`}
                        >
                          <span>{day}</span>
                          
                          {/* Indicator dots */}
                          <div className="flex gap-0.5 absolute bottom-1.5 justify-center">
                            {dayBooking && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
                            {dayBlocked && <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Booking details card bottom */}
                  <div className="pt-4 border-t border-[var(--glass-border)] font-sans text-xs">
                    {selectedCalendarDay ? (() => {
                      const providerVenues = venues.filter(v => v.providerId === activeVenueProvider.id);
                      
                      const activeBooking = venueBookings.find(b =>
                        b.date === selectedCalendarDay &&
                        b.status === "CONFIRMED" &&
                        (selectedCalVenueId === "ALL"
                          ? providerVenues.some(v => v.id === b.venueId)
                          : b.venueId === selectedCalVenueId)
                      );

                      const vnDetails = activeBooking ? venues.find(v => v.id === activeBooking.venueId) : null;
                      const activeBlocked = selectedCalVenueId === "ALL" 
                        ? providerVenues.filter(v => v.blockedDates?.includes(selectedCalendarDay))
                        : (venues.find(v => v.id === selectedCalVenueId)?.blockedDates?.includes(selectedCalendarDay) ? [venues.find(v => v.id === selectedCalVenueId)] : []);

                      if (!activeBooking && activeBlocked.length === 0) {
                        return (
                          <div className="text-center py-4 italic text-[var(--text-secondary)] bg-[var(--input-bg)] rounded-xl border border-[var(--glass-border)]">
                            No event bookings or custom maintenance blocks scheduled for {selectedCalendarDay}.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {activeBooking && (
                            <div className="bg-[var(--input-bg)] p-3 rounded-xl border border-[var(--glass-border)] space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-[var(--text-primary)]">🎉 Event Booking: {activeBooking.eventTitle}</span>
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase">
                                  {activeBooking.status}
                                </span>
                              </div>
                              <p className="text-[var(--text-secondary)] text-[11px]">
                                Property Allocated: <strong>{vnDetails?.name}</strong> ({vnDetails?.city}, {vnDetails?.state})
                              </p>
                            </div>
                          )}

                          {activeBlocked.length > 0 && (
                            <div className="bg-[var(--input-bg)] p-3 rounded-xl border border-[var(--glass-border)] space-y-1.5">
                              <span className="font-bold text-[var(--text-primary)] flex items-center gap-1 text-xs">
                                <AlertCircle className="w-4 h-4 text-rose-400" />
                                Blocked Properties for Maintenance:
                              </span>
                              <div className="space-y-1 pt-1 font-mono text-[11px] text-[var(--text-secondary)]">
                                {activeBlocked.map(b => {
                                  const reason = b?.maintenanceSchedule?.find(s => s.date === selectedCalendarDay)?.reason || "Custom Blocked";
                                  return (
                                    <div key={b?.id} className="flex justify-between border-b border-[var(--glass-border)] pb-1 last:border-0 last:pb-0">
                                      <span className="font-bold text-[var(--text-primary)]">{b?.name}</span>
                                      <span>Reason: {reason}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })() : (
                      <div className="text-center py-4 italic text-[var(--text-secondary)]">
                        Click on any date inside the grid to manage booking conflicts or date blocks.
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ======================= TAB 3: ANALYTICS & REPORTS ======================= */}
          {activeSubTab === "reports" && (
            <div className="space-y-6 font-sans">
              
              {/* Top Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass rounded-xl border border-[var(--glass-border)] p-4 space-y-1 relative overflow-hidden">
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-indigo-500/10">
                    <Store className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">Total Listed properties</span>
                  <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                    {venues.filter(v => v.providerId === activeVenueProvider.id).length}
                  </span>
                </div>

                <div className="glass rounded-xl border border-[var(--glass-border)] p-4 space-y-1 relative overflow-hidden">
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-emerald-500/10">
                    <Calendar className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">Leased Bookings Count</span>
                  <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                    {venueBookings.filter(b => b.status === "CONFIRMED" && venues.filter(v => v.providerId === activeVenueProvider.id).some(v => v.id === b.venueId)).length}
                  </span>
                </div>

                <div className="glass rounded-xl border border-[var(--glass-border)] p-4 space-y-1 relative overflow-hidden">
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-sky-500/10">
                    <Activity className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">Average Provider Utilization</span>
                  <span className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                    {(() => {
                      const counts = reportMetrics.venueUsage.map(v => v.utilizationRate);
                      const avg = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
                      return `${avg.toFixed(1)}%`;
                    })()}
                  </span>
                </div>

                <div className="glass rounded-xl border border-[var(--glass-border)] p-4 space-y-1 relative overflow-hidden">
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-amber-500/10">
                    <DollarSign className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">Estimated Total Revenue</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    ${reportMetrics.venueUsage.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* utilization rates & revenue charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Revenue Bar charts by property */}
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                    <DollarSign className="w-4.5 h-4.5 text-indigo-400" />
                    Revenue Breakdown by Property
                  </h3>

                  <div className="space-y-4 pt-2">
                    {reportMetrics.venueUsage.map(v => {
                      const maxRevenue = Math.max(...reportMetrics.venueUsage.map(u => u.revenue), 1);
                      const widthPercent = (v.revenue / maxRevenue) * 100;
                      
                      return (
                        <div key={v.id} className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[var(--text-primary)]">{v.name}</span>
                            <span className="font-mono font-bold text-emerald-400">${v.revenue.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-3 bg-[var(--input-bg)] rounded-full overflow-hidden border border-[var(--glass-border)]">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Utilization rates comparisons */}
                <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                    <BarChart2 className="w-4.5 h-4.5 text-indigo-400" />
                    Utilization & Demand Rates
                  </h3>

                  <div className="space-y-4 pt-2">
                    {reportMetrics.venueUsage.map(v => {
                      return (
                        <div key={v.id} className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[var(--text-primary)]">{v.name}</span>
                            <span className="font-mono font-bold text-indigo-400">{v.utilizationRate.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-3 bg-[var(--input-bg)] rounded-full overflow-hidden border border-[var(--glass-border)]">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-500"
                              style={{ width: `${v.utilizationRate}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Booking Trend line chart and usage tables */}
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[var(--text-secondary)]">
                  Booking Trends (Summer 2026 Season)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-mono">
                  {reportMetrics.trends.map(t => {
                    return (
                      <div key={t.month} className="bg-[var(--input-bg)] p-4 rounded-xl border border-[var(--glass-border)] text-center space-y-1.5">
                        <span className="text-[10px] text-[var(--text-secondary)] uppercase block font-sans">{t.month}</span>
                        <div className="text-lg font-bold text-[var(--text-primary)]">{t.bookings} bookings</div>
                        <div className="text-xs text-emerald-400">${t.revenue.toLocaleString()} base rental</div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ======================= TAB 4: BULK OPERATIONS ======================= */}
          {activeSubTab === "bulk" && (
            <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-6 font-sans max-w-3xl mx-auto">
              <div className="border-b border-[var(--glass-border)] pb-2 flex items-center justify-between">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-outfit">
                  <Layers className="w-4.5 h-4.5 text-indigo-400" />
                  Simulate Bulk Venues CSV Import
                </h3>
                <span className="text-[10px] font-mono text-indigo-400">CSV Template Parser</span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Paste commas-separated CSV values below to list properties in bulk. The header row is required. Copy the template block as a baseline.
                </p>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                    <span>Sample Template (CSV)</span>
                    <button
                      type="button"
                      onClick={() => setImportCsvText("name,type,description,location,capacity,parkingSpots,rentalCost\nGrand Plaza Hall,Banquet Hall,Large luxury hall with stage.,909 Geary Blvd; SF; CA,1200,100,2500\nBoardroom East,Conference Room,Executive meeting space.,101 Market St; SF; CA,50,5,300")}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Autofill Sample CSV
                    </button>
                  </div>
                  <pre className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-3 text-[10px] text-[var(--text-primary)] font-mono overflow-x-auto select-all">
                    {"name,type,description,location,capacity,parkingSpots,rentalCost\nGrand Plaza Hall,Banquet Hall,Large luxury hall with stage.,909 Geary Blvd; SF; CA,1200,100,2500"}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">Paste CSV Data</label>
                  <textarea
                    rows={6}
                    value={importCsvText}
                    onChange={(e) => setImportCsvText(e.target.value)}
                    placeholder="name,type,description,location,capacity,parkingSpots,rentalCost..."
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-3 text-xs text-[var(--text-primary)] font-mono w-full focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleImportCSV(importCsvText)}
                  disabled={!importCsvText.trim()}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                >
                  Parse & Import Properties
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================================================================================== */}
      {/* ===================== DETAILED CRUD EDIT OVERLAY MODAL DIALOG ==================== */}
      {/* ================================================================================== */}
      {showDetailedModalVenueId !== null && editingVenue && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
          <div className="glass rounded-2xl border border-[var(--glass-border)] max-w-4xl w-full p-6 space-y-6 relative overflow-y-auto max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[var(--glass-border)] pb-3">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-outfit">
                  {venues.some(v => v.id === editingVenue.id) ? `Edit: ${editingVenue.name}` : "List New Property"}
                </h3>
                <p className="text-[10px] text-indigo-400 font-mono">VENUE ID: {editingVenue.id}</p>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setShowDetailedModalVenueId(null);
                  setEditingVenue(null);
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Internal Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-[var(--glass-border)] pb-1.5 text-xs font-sans">
              {(["general", "space", "pricing", "amenities", "compliance", "events"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setModalActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    modalActiveTab === tab ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Modal Tab Content */}
            <div className="space-y-4 pt-1 font-sans text-xs">
              
              {/* SUB TAB 1: GENERAL & LOCATION */}
              {modalActiveTab === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Venue Name *</label>
                      <input
                        type="text"
                        required
                        value={editingVenue.name}
                        onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Venue Type *</label>
                      <select
                        value={editingVenue.type}
                        onChange={(e) => setEditingVenue({ ...editingVenue, type: e.target.value as any })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Convention Center">Convention Center</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Banquet Hall">Banquet Hall</option>
                        <option value="Stadium">Stadium</option>
                        <option value="Conference Room">Conference Room</option>
                        <option value="Outdoor Venue">Outdoor Venue</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Status</label>
                      <select
                        value={editingVenue.status || "Active"}
                        onChange={(e) => setEditingVenue({ ...editingVenue, status: e.target.value as any })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Under Renovation">Under Renovation</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Description</label>
                    <textarea
                      rows={2}
                      value={editingVenue.description}
                      onChange={(e) => setEditingVenue({ ...editingVenue, description: e.target.value })}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={editingVenue.location}
                        onChange={(e) => setEditingVenue({ ...editingVenue, location: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">City</label>
                        <input
                          type="text"
                          value={editingVenue.city || ""}
                          onChange={(e) => setEditingVenue({ ...editingVenue, city: e.target.value })}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">State</label>
                        <input
                          type="text"
                          value={editingVenue.state || ""}
                          onChange={(e) => setEditingVenue({ ...editingVenue, state: e.target.value })}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">ZIP</label>
                        <input
                          type="text"
                          value={editingVenue.zipcode || ""}
                          onChange={(e) => setEditingVenue({ ...editingVenue, zipcode: e.target.value })}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-2 text-xs text-[var(--text-primary)] w-full focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lat Lng overrides */}
                  <div className="p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase text-[9px] text-[var(--text-secondary)]">GPS Coordinates & Timezone</span>
                      <button
                        type="button"
                        onClick={() => setShowVenueGeoOverrides(!showVenueGeoOverrides)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        {showVenueGeoOverrides ? "Hide Coordinates" : "Edit Coordinates"}
                      </button>
                    </div>

                    {showVenueGeoOverrides ? (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Latitude</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={editingVenue.latitude || ""}
                            onChange={(e) => setEditingVenue({ ...editingVenue, latitude: parseFloat(e.target.value) || 0 })}
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded py-1 px-1.5 text-[11px] text-[var(--text-primary)] w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Longitude</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={editingVenue.longitude || ""}
                            onChange={(e) => setEditingVenue({ ...editingVenue, longitude: parseFloat(e.target.value) || 0 })}
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded py-1 px-1.5 text-[11px] text-[var(--text-primary)] w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Time Zone</label>
                          <input
                            type="text"
                            value={editingVenue.timezone || "PST"}
                            onChange={(e) => setEditingVenue({ ...editingVenue, timezone: e.target.value })}
                            className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded py-1 px-1.5 text-[11px] text-[var(--text-primary)] w-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[var(--text-secondary)] font-mono flex gap-4">
                        <span>Lat: <strong>{editingVenue.latitude || "Not set"}</strong></span>
                        <span>Lng: <strong>{editingVenue.longitude || "Not set"}</strong></span>
                        <span>Timezone: <strong>{editingVenue.timezone || "PST"}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB TAB 2: SPACE & CAPACITY */}
              {modalActiveTab === "space" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Max Capacity *</label>
                      <input
                        type="number"
                        required
                        value={editingVenue.capacity}
                        onChange={(e) => setEditingVenue({ ...editingVenue, capacity: parseInt(e.target.value) || 0 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Min Capacity</label>
                      <input
                        type="number"
                        value={editingVenue.minCapacity || ""}
                        onChange={(e) => setEditingVenue({ ...editingVenue, minCapacity: parseInt(e.target.value) || 0 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Seating Capacity</label>
                      <input
                        type="number"
                        value={editingVenue.seatingCapacity || ""}
                        onChange={(e) => setEditingVenue({ ...editingVenue, seatingCapacity: parseInt(e.target.value) || 0 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Standing Capacity</label>
                      <input
                        type="number"
                        value={editingVenue.standingCapacity || ""}
                        onChange={(e) => setEditingVenue({ ...editingVenue, standingCapacity: parseInt(e.target.value) || 0 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Number of Rooms/Halls</label>
                      <input
                        type="number"
                        value={editingVenue.roomsCount || 1}
                        onChange={(e) => setEditingVenue({ ...editingVenue, roomsCount: parseInt(e.target.value) || 1 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Floor Area (sq ft)</label>
                      <input
                        type="number"
                        value={editingVenue.floorArea || 2500}
                        onChange={(e) => setEditingVenue({ ...editingVenue, floorArea: parseInt(e.target.value) || 0 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">Supported Layout configurations</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl font-sans text-xs">
                      {["Theater", "Classroom", "U-Shape", "Banquet", "Boardroom"].map(layout => {
                        const checked = (editingVenue.layoutTypes || []).includes(layout as any);
                        return (
                          <label key={layout} className="flex items-center gap-1.5 cursor-pointer text-[var(--text-primary)] font-medium">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const current = editingVenue.layoutTypes || [];
                                const updated = checked 
                                  ? current.filter(l => l !== layout)
                                  : [...current, layout as any];
                                setEditingVenue({ ...editingVenue, layoutTypes: updated });
                              }}
                              className="rounded border-slate-700 bg-transparent text-indigo-500"
                            />
                            {layout}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB 3: COST & PRICING */}
              {modalActiveTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Base Rental Cost ($) *</label>
                      <input
                        type="number"
                        required
                        value={editingVenue.rentalCost || 0}
                        onChange={(e) => setEditingVenue({ ...editingVenue, rentalCost: parseFloat(e.target.value) || 0 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none font-mono"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Hourly Fee ($)</label>
                      <input
                        type="number"
                        value={editingVenue.costPerHour || ""}
                        onChange={(e) => setEditingVenue({ ...editingVenue, costPerHour: parseFloat(e.target.value) || 0 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Security Deposit ($)</label>
                      <input
                        type="number"
                        value={editingVenue.securityDeposit || ""}
                        onChange={(e) => setEditingVenue({ ...editingVenue, securityDeposit: parseFloat(e.target.value) || 0 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Tax Rate Info</label>
                      <input
                        type="text"
                        value={editingVenue.taxInfo || ""}
                        onChange={(e) => setEditingVenue({ ...editingVenue, taxInfo: e.target.value })}
                        placeholder="e.g. 8.5% state tax"
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Cancellation Policy</label>
                    <textarea
                      rows={2}
                      value={editingVenue.cancellationPolicy || ""}
                      onChange={(e) => setEditingVenue({ ...editingVenue, cancellationPolicy: e.target.value })}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-[var(--glass-border)] pt-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Manager Contact Name</label>
                      <input
                        type="text"
                        value={editingVenue.managerName || ""}
                        onChange={(e) => setEditingVenue({ ...editingVenue, managerName: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Email</label>
                      <input
                        type="email"
                        value={editingVenue.managerEmail || ""}
                        onChange={(e) => setEditingVenue({ ...editingVenue, managerEmail: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Phone</label>
                      <input
                        type="tel"
                        value={editingVenue.managerPhone || ""}
                        onChange={(e) => setEditingVenue({ ...editingVenue, managerPhone: e.target.value })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB 4: FACILITIES & AMENITIES */}
              {modalActiveTab === "amenities" && (
                <div className="space-y-4">
                  
                  {/* General amenities flags */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">Amenities Checklist</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl font-sans text-xs">
                      {[
                        { label: "Parking Available", field: "parkingAvailable" },
                        { label: "Wi-Fi Enabled", field: "wifiAvailable" },
                        { label: "AV Setup Ready", field: "avEquipment" },
                        { label: "Projectors", field: "projectors" },
                        { label: "Sound System", field: "soundSystem" },
                        { label: "Stage Installed", field: "stage" },
                        { label: "Air Conditioning", field: "airConditioning" },
                        { label: "Catering Available", field: "cateringAvailable" },
                        { label: "Kitchen Access", field: "kitchenAccess" },
                        { label: "Green Rooms", field: "greenRooms" },
                        { label: "Wheelchair Access", field: "wheelchairAccessible" },
                        { label: "Power Backup", field: "powerBackup" }
                      ].map(item => {
                        const checked = !!(editingVenue as any)[item.field];
                        return (
                          <label key={item.field} className="flex items-center gap-1.5 cursor-pointer text-[var(--text-primary)] font-medium">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setEditingVenue({ ...editingVenue, [item.field]: !checked });
                              }}
                              className="rounded border-slate-700 bg-transparent text-indigo-500"
                            />
                            {item.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Services sync list */}
                  <div className="p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl space-y-2">
                    <span className="text-[9px] font-bold uppercase text-[var(--text-secondary)] block">Synchronized Services Tags (for catalog view):</span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {["AV Setup", "Security", "Staging", "Catering", "Valet Parking"].map(srv => {
                        const active = editingVenue.services.includes(srv);
                        return (
                          <button
                            key={srv}
                            type="button"
                            onClick={() => {
                              const updated = active 
                                ? editingVenue.services.filter(s => s !== srv)
                                  : [...editingVenue.services, srv];
                              setEditingVenue({ ...editingVenue, services: updated });
                            }}
                            className={`px-2 py-1 rounded border transition ${
                              active 
                                ? "bg-indigo-500/10 border-indigo-500/35 text-indigo-400 font-bold" 
                                : "bg-[var(--input-bg)] border-[var(--glass-border)] text-[var(--text-secondary)]"
                            }`}
                          >
                            {srv}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Dates Multi-select Checkboxes */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Manage Available Dates Selection</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--input-border)] max-h-24 overflow-y-auto font-sans text-xs">
                      {["2026-06-25", "2026-06-26", "2026-07-12", "2026-07-13", "2026-08-05", "2026-08-06", "2026-09-15", "2026-10-10", "2026-10-20"].map(dt => {
                        const isChecked = editingVenue.availableDates.includes(dt);
                        return (
                          <label key={dt} className="flex items-center gap-1.5 cursor-pointer text-[var(--text-primary)] font-medium">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const updated = isChecked
                                  ? editingVenue.availableDates.filter(d => d !== dt)
                                  : [...editingVenue.availableDates, dt];
                                setEditingVenue({ ...editingVenue, availableDates: updated });
                              }}
                              className="rounded border-slate-700 bg-transparent text-indigo-500"
                            />
                            {dt}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB 5: SAFETY & DOCUMENT MANAGEMENT */}
              {modalActiveTab === "compliance" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl font-sans text-xs">
                      <input
                        type="checkbox"
                        checked={!!editingVenue.fireSafetyCertified}
                        onChange={() => setEditingVenue({ ...editingVenue, fireSafetyCertified: !editingVenue.fireSafetyCertified })}
                        className="rounded border-slate-700 bg-transparent text-indigo-500"
                      />
                      <span>Fire Safety Certified</span>
                    </label>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">Emergency Exits Count</label>
                      <input
                        type="number"
                        value={editingVenue.emergencyExitsCount || 4}
                        onChange={(e) => setEditingVenue({ ...editingVenue, emergencyExitsCount: parseInt(e.target.value) || 1 })}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl font-sans text-xs">
                      <input
                        type="checkbox"
                        checked={!!editingVenue.securityAvailable}
                        onChange={() => setEditingVenue({ ...editingVenue, securityAvailable: !editingVenue.securityAvailable })}
                        className="rounded border-slate-700 bg-transparent text-indigo-500"
                      />
                      <span>Active On-site Security</span>
                    </label>
                  </div>

                  {/* Document Management Sim */}
                  <div className="p-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-[var(--glass-border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        Attached Compliance Documents ({editingVenue.documents?.length || 0})
                      </span>
                    </div>

                    {/* Document List */}
                    {(!editingVenue.documents || editingVenue.documents.length === 0) ? (
                      <p className="text-[11px] text-[var(--text-secondary)] italic">No certificates or agreements uploaded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {editingVenue.documents.map((doc, idx) => {
                          const isExpired = doc.expiryDate ? new Date(doc.expiryDate) < new Date("2026-06-09") : false;
                          return (
                            <div key={doc.id} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-2.5 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-[var(--text-primary)] block">{doc.name}</span>
                                <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">{doc.type}</span>
                                {doc.expiryDate && (
                                  <span className={`text-[9px] font-mono ml-2 ${isExpired ? "text-rose-400 font-bold" : "text-slate-500"}`}>
                                    Expires: {doc.expiryDate} {isExpired && "(EXPIRED)"}
                                  </span>
                                )}
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingVenue.documents || []).filter(d => d.id !== doc.id);
                                  setEditingVenue({ ...editingVenue, documents: updated });
                                }}
                                className="text-rose-400 hover:text-rose-300 font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Upload document simulation */}
                    <div className="p-3 bg-[var(--glass-bg)]/50 rounded-xl border border-[var(--glass-border)] space-y-3 font-sans">
                      <span className="font-bold text-[10px] uppercase text-[var(--text-secondary)] block">Upload Simulated Document</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          placeholder="Document Name (e.g. Fire Cert 2026)"
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded py-1 px-2 text-[11px] text-[var(--text-primary)] focus:outline-none"
                        />
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded py-1 px-2 text-[11px] text-[var(--text-primary)] focus:outline-none"
                        >
                          <option value="Contract">Rental Contract Agreement</option>
                          <option value="Insurance Certificate">Insurance Certificate</option>
                          <option value="Floor Plan">Floor Plan Blueprint</option>
                          <option value="Compliance Document">Safety/Compliance Document</option>
                        </select>
                        <input
                          type="date"
                          value={docExpiry}
                          onChange={(e) => setDocExpiry(e.target.value)}
                          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded py-1 px-2 text-[11px] text-[var(--text-primary)] focus:outline-none font-mono"
                          title="Expiration Date"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!docName.trim()) {
                            alert("Please enter a document name.");
                            return;
                          }
                          const newDoc = {
                            id: `doc-${Date.now()}`,
                            name: docName,
                            type: docType,
                            fileUrl: `/docs/simulated_${docName.toLowerCase().replace(/\s+/g, "_")}.pdf`,
                            expiryDate: docExpiry || undefined
                          };
                          setEditingVenue({
                            ...editingVenue,
                            documents: [...(editingVenue.documents || []), newDoc]
                          });
                          setDocName("");
                          setDocExpiry("");
                          alert("Document uploaded and attached successfully!");
                        }}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-1.5 px-3 rounded text-[10px] cursor-pointer"
                      >
                        Attach Document
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB 6: EVENT INTEGRATION & CONFLICTS */}
              {modalActiveTab === "events" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono">Linked Events Bookings</h4>
                  
                  {modalLinkedEventsInfo.length === 0 ? (
                    <div className="text-center py-8 italic text-[var(--text-secondary)] bg-[var(--input-bg)] rounded-xl border border-[var(--glass-border)]">
                      No active events or ticketing layouts are currently leasing this venue property.
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans">
                      {modalLinkedEventsInfo.map(item => {
                        return (
                          <div key={item.event.id} className="bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl p-4 space-y-2 text-xs">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-sm text-[var(--text-primary)] font-outfit">{item.event.title}</h5>
                                <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider mt-0.5">{item.event.category} Event</p>
                              </div>

                              <span className="font-mono text-indigo-400 font-bold">{item.date}</span>
                            </div>

                            {/* conflict diagnostics */}
                            {(item.capacityConflict || item.isDoubleBooked) && (
                              <div className="space-y-2 pt-2 border-t border-[var(--glass-border)]">
                                {item.capacityConflict && (
                                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg flex items-center gap-2 text-[10px] font-bold">
                                    <ShieldAlert className="w-4 h-4" />
                                    <span>Conflict: Event Ticket Capacity ({item.event.ticketInventory}) exceeds Venue Max Limit ({editingVenue.capacity}).</span>
                                  </div>
                                )}
                                
                                {item.isDoubleBooked && (
                                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg flex items-center gap-2 text-[10px] font-bold">
                                    <ShieldAlert className="w-4 h-4" />
                                    <span>Double Booking Detected: Date {item.date} is booked by both: "{item.event.title}" and "{item.doubleBookedWith}".</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)] pt-2 border-t border-[var(--glass-border)]">
                              <span>Tickets Expected: <strong>{item.event.ticketInventory}</strong></span>
                              <span>Moderate: <strong>{item.event.moderationStatus || "Approved"}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="flex justify-between items-center border-t border-[var(--glass-border)] pt-4">
              <div>
                {venues.some(v => v.id === editingVenue.id) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteVenue(editingVenue.id)}
                    className="bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                  >
                    Delete Property
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailedModalVenueId(null);
                    setEditingVenue(null);
                  }}
                  className="bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] font-semibold py-2.5 px-5 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveVenueDetails}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-indigo-500/15"
                >
                  Save Property Settings
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
