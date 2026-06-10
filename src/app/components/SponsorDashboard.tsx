import React from "react";
import { BarChart2, Award } from "lucide-react";
import { UserProfile, Event, SponsorApplication } from "../types";

interface SponsorDashboardProps {
  users: UserProfile[];
  events: Event[];
  sponsorApplications: SponsorApplication[];
  setSponsorApplications: React.Dispatch<React.SetStateAction<SponsorApplication[]>>;
  checkSuspended: () => boolean;
  addSagaLog: (service: string, message: string, type: "info" | "success" | "error" | "event") => void;
  addNotification: (title: string, message: string, roleTarget?: string) => void;
}

export const SponsorDashboard: React.FC<SponsorDashboardProps> = ({
  users,
  events,
  sponsorApplications,
  setSponsorApplications,
  checkSuspended,
  addSagaLog,
  addNotification
}) => {
  const activeSponsor = users.find(u => u.role === "SPONSOR");
  const isSuspended = activeSponsor?.status === "SUSPENDED";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-[fadeIn_0.3s_ease-out]">

      {/* Left Column: Sponsor Profile */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl font-sans"></div>
          <div className="flex justify-between items-start relative z-10 font-sans">
            <div>
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block font-bold">Brand Corporate Profile</span>
              <h4 className="text-base font-bold text-[var(--text-primary)] mt-0.5 font-outfit">Apex Sponsors Inc.</h4>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${isSuspended ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
              {isSuspended ? "Suspended" : "Active"}
            </span>
          </div>

          <div className="p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl space-y-2 text-xs relative z-10 text-[var(--text-primary)] font-sans">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Representative:</span>
              <span className="font-semibold">Alex Rivera</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Email:</span>
              <span className="font-semibold">sponsor@apex.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Corporate URL:</span>
              <span className="font-semibold text-sky-400 font-mono">apex.com</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--glass-border)]">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Upload Brand Assets (Logo / Banners)</label>
            <input type="file" className="text-xs text-[var(--text-secondary)] file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-500/15 file:text-sky-300 hover:file:bg-sky-500/25 cursor-pointer" />
            <span className="text-[8px] text-[var(--text-secondary)] block">Upload high-res SVG/PNG vectors for banner placements.</span>
          </div>
        </div>
      </div>

      {/* Middle & Right Column: Interactive Sponsor Dashboard */}
      <div className="lg:col-span-2 space-y-6">

        {/* Sponsor Brand Analytics */}
        <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            Brand exposure &amp; Reach Analytics
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">Estimated sponsor impressions and reach statistics calculated across platform listing views.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-4 rounded-xl text-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold font-sans">Brand Impressions</span>
              <span className="text-2xl font-bold text-sky-400 mt-1 block">42,500</span>
              <span className="text-[9px] text-[var(--text-secondary)] italic font-sans">+1.5k live catalog views</span>
            </div>

            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-4 rounded-xl text-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold font-sans">Logo Click-Throughs</span>
              <span className="text-2xl font-bold text-amber-400 mt-1 block">1,840</span>
              <span className="text-[9px] text-emerald-400 font-sans font-bold">4.3% CTR Average</span>
            </div>

            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-4 rounded-xl text-center">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold font-sans">Total Reach</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">12 Events</span>
              <span className="text-[9px] text-[var(--text-secondary)] italic font-sans">Across 4 State Properties</span>
            </div>
          </div>
        </div>

        {/* Browse and Buy Sponsorship Packages */}
        <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
          <h4 className="text-base font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Acquire Sponsorship Opportunities
          </h4>
          <p className="text-xs text-[var(--text-secondary)]">Review corporate sponsorship tiers configured by organizers and purchase packages.</p>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 font-sans">
            {events
              .filter(e => e.sponsorPackages && e.sponsorPackages.length > 0 && (e.moderationStatus === undefined || e.moderationStatus === "APPROVED"))
              .slice(0, 10)
              .map(ev => (
                <div key={ev.id} className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)] space-y-3 text-xs font-sans">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <span className="font-bold text-sm text-[var(--text-primary)] block font-outfit">{ev.title}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono font-bold">Date: {ev.date} · Location: {ev.location}</span>
                    </div>
                    <span className="text-[9px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase">
                      Opportunities Open
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {ev.sponsorPackages?.map(pkg => {
                      const isPurchased = sponsorApplications.some(sa => sa.eventId === ev.id && sa.packageId === pkg.id && sa.status === "APPROVED");
                      const isPending = sponsorApplications.some(sa => sa.eventId === ev.id && sa.packageId === pkg.id && sa.status === "PENDING");

                      return (
                        <div key={pkg.id} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-3 rounded-lg flex flex-col justify-between gap-3 font-sans">
                          <div>
                            <div className="flex justify-between items-start font-sans">
                              <span className="font-bold text-[var(--text-primary)]">{pkg.name}</span>
                              <span className="font-mono text-amber-400 font-bold">${pkg.price.toLocaleString()}</span>
                            </div>
                            <p className="text-[9px] text-[var(--text-secondary)] mt-1">Benefits: {pkg.benefits.join(", ")}</p>
                          </div>

                          {isPurchased ? (
                            <span className="w-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-center font-bold font-mono py-1 rounded text-[10px] uppercase">
                              Active Sponsor
                            </span>
                          ) : isPending ? (
                            <span className="w-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-center font-bold font-mono py-1 rounded text-[10px] uppercase">
                              Application Pending
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (checkSuspended()) return;
                                const confirmPay = confirm(`Purchase package "${pkg.name}" ($${pkg.price}) for ${ev.title}?`);
                                if (confirmPay) {
                                  const newApp: SponsorApplication = {
                                    id: `sp-app-${Date.now()}`,
                                    eventId: ev.id,
                                    eventTitle: ev.title,
                                    packageId: pkg.id,
                                    packageName: pkg.name,
                                    packagePrice: pkg.price,
                                    sponsorId: "usr-4",
                                    companyName: "Apex Sponsors Inc.",
                                    logoUrl: "Apex_Logo.svg",
                                    status: "PENDING",
                                    timestamp: new Date().toLocaleDateString(),
                                    deliverables: [
                                      { name: "Submit logo SVG vectors", completed: true },
                                      { name: "Approve stage banner mock layout", completed: false },
                                      { name: "Deliver promotional swag bag items", completed: false }
                                    ]
                                  };
                                  setSponsorApplications(prev => [...prev, newApp]);
                                  addSagaLog("Order-Service", `Sponsor corporate initiated payment checkout for Package: ${pkg.name}. Awaiting coordinator approval.`, "info");
                                  addNotification("Sponsorship Application Submitted", `Your purchase request for ${pkg.name} package was submitted to Organizer.`, "SPONSOR");
                                  alert("🎗️ Sponsorship purchased! Application submitted. Awaiting Event Organizer validation.");
                                }
                              }}
                              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] py-1 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 font-outfit"
                            >
                              <Award className="w-3.5 h-3.5" /> Buy Sponsorship
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Sponsor Deliverables List */}
        <div className="glass rounded-2xl border border-[var(--glass-border)] p-6 space-y-4">
          <h4 className="text-base font-bold text-[var(--text-primary)] font-outfit">Sponsor Deliverables &amp; Tracking</h4>
          <p className="text-xs text-[var(--text-secondary)]">Complete and trace the compliance items configured for your active event sponsorships.</p>

          <div className="space-y-3 font-sans">
            {sponsorApplications.length === 0 ? (
              <p className="text-[10px] text-[var(--text-secondary)] italic text-center py-4">No active sponsorships. Purchase packages above to load deliverables checklist.</p>
            ) : (
              sponsorApplications.map(app => (
                <div key={app.id} className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)] space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[var(--glass-border)]">
                    <div>
                      <span className="font-bold text-[var(--text-primary)] font-outfit text-sm">{app.eventTitle}</span>
                      <span className="text-[10px] text-amber-400 block font-mono mt-0.5">{app.packageName} (${app.packagePrice})</span>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${app.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] text-[var(--text-secondary)] uppercase font-mono font-bold">Compliance Checklist:</span>
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
                              addSagaLog("Sponsor-Service", `Toggled deliverable: ${del.name} for package: ${app.packageName}`, "info");
                            }}
                            className="rounded border-slate-700 bg-transparent text-amber-500 focus:ring-0 cursor-pointer"
                          />
                          <span className={del.completed ? "line-through text-slate-500" : ""}>{del.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
