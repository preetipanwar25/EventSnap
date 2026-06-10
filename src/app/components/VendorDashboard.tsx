import React, { useState } from "react";
import { ShieldAlert, Store, Smartphone } from "lucide-react";
import { VendorProfile, BoothApplication, Booth, Event, VendorLead, VendorSale } from "../types";

interface VendorDashboardProps {
  activeVendorProfile: VendorProfile | null;
  setActiveVendorProfile: (p: VendorProfile | null) => void;
  vendorProfiles: VendorProfile[];
  setVendorProfiles: React.Dispatch<React.SetStateAction<VendorProfile[]>>;
  boothApplications: BoothApplication[];
  setBoothApplications: React.Dispatch<React.SetStateAction<BoothApplication[]>>;
  booths: Booth[];
  setBooths: React.Dispatch<React.SetStateAction<Booth[]>>;
  events: Event[];
  selectedEvent: Event | null;
  vendorLeads: VendorLead[];
  setVendorLeads: React.Dispatch<React.SetStateAction<VendorLead[]>>;
  vendorSales: VendorSale[];
  setVendorSales: React.Dispatch<React.SetStateAction<VendorSale[]>>;
  otpVerificationEnabled: boolean;
  addSagaLog: (service: string, message: string, type: "info" | "success" | "error" | "event") => void;
  addNotification: (title: string, message: string, roleTarget?: string) => void;
  checkSuspended: () => boolean;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({
  activeVendorProfile,
  setActiveVendorProfile,
  vendorProfiles,
  setVendorProfiles,
  boothApplications,
  setBoothApplications,
  booths,
  setBooths,
  events,
  selectedEvent,
  vendorLeads,
  setVendorLeads,
  vendorSales,
  setVendorSales,
  otpVerificationEnabled,
  addSagaLog,
  addNotification,
  checkSuspended
}) => {
  // Vendor Registration State
  const [vendorRegStep, setVendorRegStep] = useState<"form" | "otp">("form");
  const [regBusinessName, setRegBusinessName] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCategory, setRegCategory] = useState("Technology");
  const [vendorOtpInput, setVendorOtpInput] = useState("");
  const [vendorOtpError, setVendorOtpError] = useState<string | null>(null);
  const [pendingVendorProfile, setPendingVendorProfile] = useState<VendorProfile | null>(null);

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
        alert("Business Profile verified! You are now authorized to lease event spaces.");
      }
    } else {
      setVendorOtpError("Invalid verification code. Please enter '987654'.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-[fadeIn_0.3s_ease-out]">

      {/* Left Column: Vendor Profile / Registration */}
      <div className="lg:col-span-1 space-y-6">
        {!activeVendorProfile ? (
          <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/25">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--text-primary)] font-outfit">Vendor Registration</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Setup your business profile to lease trade booths.</p>
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
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Mexican">Mexican Food</option>
                      <option value="Italian">Italian Food</option>
                      <option value="Apparel & Swag">Apparel & Swag</option>
                      <option value="Crafts">Crafts</option>
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
                      placeholder="luigi@woodfiredpizza.it"
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
                      placeholder="+1 555-8833"
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Business Certifications *</label>
                  <select className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none">
                    <option>Health Department Permit &amp; Business Tax License</option>
                    <option>Retail Seller Certificate</option>
                    <option>Non-Profit/Community General Liability Permit</option>
                  </select>
                  <span className="text-[9px] text-[var(--text-secondary)] mt-1 block">Simulation automatically uploads mock documents.</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition font-outfit"
                >
                  Register Vendor Profile
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyVendorOtp} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-[var(--text-secondary)] font-semibold">Enter SMS Verification OTP</label>
                    <span className="text-[10px] text-slate-500">Test OTP: <strong>987654</strong></span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={vendorOtpInput}
                    onChange={(e) => setVendorOtpInput(e.target.value)}
                    placeholder="e.g. 987654"
                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-center text-sm tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full font-mono font-bold"
                  />
                  {vendorOtpError && (
                    <p className="text-rose-400 text-xs font-semibold text-center mt-1">{vendorOtpError}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVendorRegStep("form");
                      setPendingVendorProfile(null);
                    }}
                    className="w-1/2 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs font-semibold py-2 rounded-xl text-[var(--text-secondary)] hover:border-slate-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition font-outfit"
                  >
                    Verify & Access
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-4 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl font-sans"></div>
            <div className="flex justify-between items-start relative z-10 font-sans">
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block font-bold">Vendor Profile</span>
                <h4 className="text-base font-bold text-[var(--text-primary)] mt-0.5 font-outfit">{activeVendorProfile.businessName}</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveVendorProfile(null);
                }}
                className="text-[var(--text-secondary)] hover:text-rose-400 text-xs font-semibold"
              >
                Disconnect
              </button>
            </div>

            <div className="p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl space-y-2 text-xs relative z-10 text-[var(--text-primary)] font-sans">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Owner:</span>
                <span className="font-semibold">{activeVendorProfile.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Email:</span>
                <span className="font-semibold">{activeVendorProfile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Category:</span>
                <span className="font-semibold text-amber-400 font-mono uppercase">{activeVendorProfile.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{activeVendorProfile.status}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Middle & Right Column: Interactive Vendor Dashboard */}
      <div className="lg:col-span-2 space-y-6">
        {activeVendorProfile ? (
          <>
            {/* During-Event Actions & Leads Scanner */}
            <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                During-Event Dashboard (Live coordination)
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Manage your live operations, collect attendee leads, and log booth sales transactions.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Check-In Status */}
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-4 rounded-xl text-center space-y-2">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Venue Check-In</span>
                  <button
                    type="button"
                    onClick={() => {
                      alert("✅ Check-In Successful! Venue authorities notified via SMS OTP.");
                      addSagaLog("Vendor-Service", `Vendor ${activeVendorProfile.businessName} checked-in at the venue.`, "success");
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 px-4 rounded-lg text-xs transition font-outfit w-full"
                  >
                    Scan Booth QR
                  </button>
                </div>

                {/* Lead Collector */}
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-4 rounded-xl text-center space-y-2">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold font-mono">Lead Collection</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleAttendees = [
                        { name: "John Smith", email: "john@smith.com" },
                        { name: "Alice Johnson", email: "alice@johnson.net" },
                        { name: "Bob Miller", email: "bob@miller.org" },
                        { name: "Elena Rostova", email: "elena@rostova.ru" },
                        { name: "David K.", email: "david@k.com" }
                      ];
                      const randomLead = sampleAttendees[Math.floor(Math.random() * sampleAttendees.length)];
                      const newLead: VendorLead = {
                        id: `lead-${Date.now()}`,
                        vendorId: activeVendorProfile.id,
                        eventId: selectedEvent?.id || "evt-1",
                        attendeeName: randomLead.name,
                        attendeeEmail: randomLead.email,
                        timestamp: new Date().toLocaleTimeString()
                      };
                      setVendorLeads(prev => [newLead, ...prev]);
                      addSagaLog("Vendor-Service", `Collected contact lead: ${randomLead.name} (${randomLead.email})`, "success");
                      alert(`🎉 Lead captured: ${randomLead.name} (${randomLead.email})!`);
                    }}
                    className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition font-outfit w-full"
                  >
                    Scan Attendee Ticket QR
                  </button>
                </div>

                {/* Sales Logger */}
                <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-4 rounded-xl text-center space-y-2">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Log Booth Transaction</span>
                  <button
                    type="button"
                    onClick={() => {
                      const desc = prompt("Enter product/service description:", "Dev Swag Bag");
                      const price = prompt("Enter sale amount ($):", "25");
                      if (desc && price) {
                        const amount = parseFloat(price);
                        if (isNaN(amount)) {
                          alert("Invalid price entered.");
                          return;
                        }
                        const newSale: VendorSale = {
                          id: `sale-${Date.now()}`,
                          vendorId: activeVendorProfile.id,
                          eventId: selectedEvent?.id || "evt-1",
                          productName: desc,
                          amount,
                          timestamp: new Date().toLocaleTimeString()
                        };
                        setVendorSales(prev => [newSale, ...prev]);
                        addSagaLog("Vendor-Service", `Logged booth sale: ${desc} ($${amount})`, "success");
                        alert(`💰 Transaction logged successfully!`);
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 px-4 rounded-lg text-xs transition font-outfit w-full"
                  >
                    + Log Sale
                  </button>
                </div>
              </div>
            </div>

            {/* Leads and Sales Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Collected Leads */}
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-border)]">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] font-outfit">Collected Attendee Leads ({vendorLeads.filter(l => l.vendorId === activeVendorProfile.id).length})</h4>
                  {vendorLeads.filter(l => l.vendorId === activeVendorProfile.id).length > 0 && (
                    <button
                      onClick={() => {
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vendorLeads.filter(l => l.vendorId === activeVendorProfile.id)));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute("download", `Leads_${activeVendorProfile.businessName}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                        addSagaLog("Vendor-Service", "Leads database exported by vendor.", "info");
                      }}
                      className="text-[10px] text-sky-400 hover:text-sky-300 font-bold font-sans"
                    >
                      Download JSON
                    </button>
                  )}
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 text-xs pr-1">
                  {vendorLeads.filter(l => l.vendorId === activeVendorProfile.id).length === 0 ? (
                    <p className="text-[10px] text-[var(--text-secondary)] italic text-center py-6">No leads collected yet. Scan attendee QR tickets above!</p>
                  ) : (
                    vendorLeads.filter(l => l.vendorId === activeVendorProfile.id).map(l => (
                      <div key={l.id} className="flex justify-between items-center p-2 rounded-lg bg-[var(--input-bg)] border border-[var(--glass-border)]">
                        <div>
                          <span className="font-bold text-[var(--text-primary)]">{l.attendeeName}</span>
                          <span className="text-[10px] text-[var(--text-secondary)] block font-mono">{l.attendeeEmail}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">{l.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sales Tracking */}
              <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-border)]">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] font-outfit">Booth Sales Tracker</h4>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Total: ${vendorSales.filter(s => s.vendorId === activeVendorProfile.id).reduce((acc, curr) => acc + curr.amount, 0)}
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 text-xs pr-1">
                  {vendorSales.filter(s => s.vendorId === activeVendorProfile.id).length === 0 ? (
                    <p className="text-[10px] text-[var(--text-secondary)] italic text-center py-6">No sales recorded yet. Log transactions above!</p>
                  ) : (
                    vendorSales.filter(s => s.vendorId === activeVendorProfile.id).map(s => (
                      <div key={s.id} className="flex justify-between items-center p-2 rounded-lg bg-[var(--input-bg)] border border-[var(--glass-border)]">
                        <div>
                          <span className="font-bold text-[var(--text-primary)]">{s.productName}</span>
                          <span className="text-[9px] text-slate-500 block font-mono">{s.timestamp}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">${s.amount}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Booth Lease Applications */}
            <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
              <h4 className="text-base font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                <Store className="w-5 h-5 text-sky-400" />
                Apply for Booth Space at Events
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">Search and rent available trade booths or food truck slots in upcoming listings.</p>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {events.filter(e => e.moderationStatus === undefined || e.moderationStatus === "APPROVED").slice(0, 10).map(ev => {
                  const eventBooths = booths.filter(b => b.eventId === ev.id && b.status === "AVAILABLE");
                  return (
                    <div key={ev.id} className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-[var(--text-primary)] block font-outfit">{ev.title}</span>
                        <div className="text-[10px] text-[var(--text-secondary)] font-mono flex gap-2">
                          <span>Date: {ev.date}</span>
                          <span>•</span>
                          <span>Location: {ev.location}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase inline-block mt-1 font-mono">
                          {eventBooths.length} Booths Available
                        </span>
                      </div>

                      {eventBooths.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (checkSuspended()) return;
                            const bh = eventBooths[0];
                            const terms = confirm(`Rent "${bh.name}" ($${bh.price})?\nClick OK for FULL payment, Cancel for DEPOSIT (25%).`);
                            const selectTerms = terms ? "FULL" : "DEPOSIT";
                            const amountPaid = selectTerms === "FULL" ? bh.price : Math.round(bh.price * 0.25);

                            const newApp: BoothApplication = {
                              id: `app-${Date.now()}`,
                              eventId: ev.id,
                              eventTitle: ev.title,
                              boothId: bh.id,
                              boothName: bh.name,
                              vendorId: activeVendorProfile.id,
                              vendorName: activeVendorProfile.businessName,
                              category: activeVendorProfile.category,
                              price: bh.price,
                              status: "PENDING",
                              paymentTerms: selectTerms,
                              amountPaid,
                              documents: ["Licence_Permit.pdf", "Liability_Insurance.pdf"],
                              timestamp: new Date().toLocaleDateString()
                            };

                            setBoothApplications(prev => [...prev, newApp]);
                            addSagaLog("Order-Service", `Vendor initiated booth lease checkout for Slot: ${bh.name}. PENDING approval.`, "info");
                            addNotification("Booth Application Submitted", `Your booth application for ${ev.title} was submitted. Payment terms: ${selectTerms}.`, "VENDOR");
                            alert("🎪 Booth lease application submitted! Awaiting Event Organizer approval.");
                          }}
                          className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition shrink-0"
                        >
                          Lease Booth Slot
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback and Organizer Rating */}
            <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
              <h4 className="text-base font-bold text-[var(--text-primary)] font-outfit">Submit Feedback to Event Organizer</h4>
              <p className="text-xs text-[var(--text-secondary)]">Rate the organizer's event coordination and infrastructure services.</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("📝 Feedback submitted successfully to Organizer console!");
                  addSagaLog("Vendor-Service", `Vendor submitted post-event rating/feedback to Organizer.`, "success");
                  e.currentTarget.reset();
                }}
                className="space-y-3 text-xs"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block font-sans">Select Event</label>
                    <select className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none">
                      {events.slice(0, 3).map(e => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block font-sans">Coordination Rating</label>
                    <select className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg py-1.5 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none">
                      <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                      <option value="4">⭐⭐⭐⭐ (Good)</option>
                      <option value="3">⭐⭐⭐ (Average)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block font-sans">Comments/Notes</label>
                  <textarea rows={2} placeholder="Write comments regarding power supply, foot traffic, security, or support..." className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] w-full focus:outline-none resize-none font-sans" />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 px-4 rounded-lg transition">Submit Coordination Feedback</button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="glass rounded-2xl border border-[var(--glass-border)] p-12 text-center text-[var(--text-secondary)]">
            <p>Please register and verify a Vendor Business profile on the left to load operational dashboard panel.</p>
          </div>
        )}
      </div>
    </div>
  );
};
