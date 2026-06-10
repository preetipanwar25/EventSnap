import React from "react";
import { RefreshCw, Check, X, Info } from "lucide-react";
import { LogMessage } from "../types";

interface SagaConsoleProps {
  sagaLogs: LogMessage[];
  sagaState: "idle" | "order-created" | "tickets-reserved" | "promo-applied" | "payment-initiated" | "completed" | "rollback-started" | "rollback-complete";
  sagaType: "TICKET" | "BOOTH" | "VENUE";
  setSagaLogs: React.Dispatch<React.SetStateAction<LogMessage[]>>;
  setSagaState: React.Dispatch<React.SetStateAction<"idle" | "order-created" | "tickets-reserved" | "promo-applied" | "payment-initiated" | "completed" | "rollback-started" | "rollback-complete">>;
}

export const SagaConsole: React.FC<SagaConsoleProps> = ({
  sagaLogs,
  sagaState,
  sagaType,
  setSagaLogs,
  setSagaState
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-[var(--text-primary)] font-outfit">SAGA Kafka Orchestrator</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Real-time transaction trace simulation: <strong>{sagaType === "TICKET" ? "Attendee Ticket checkout" : sagaType === "BOOTH" ? "Vendor Booth lease" : "Venue-Event Alignment"} SAGA</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSagaLogs([]);
            setSagaState("idle");
          }}
          className="bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--text-secondary)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] rounded-xl flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear Logs
        </button>
      </div>

      {/* Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

        {/* Event Driven flow simulation */}
        <div className="lg:col-span-2 glass rounded-2xl border border-[var(--glass-border)] p-6 flex flex-col justify-between min-h-[480px] relative overflow-hidden">

          {/* Visual flowchart */}
          <div className="space-y-8 my-auto relative z-10">
            <div className="flex justify-between items-center gap-4 relative">

              {/* Background Connection Line */}
              <div className="absolute top-[20px] left-[5%] right-[5%] h-1 bg-[var(--node-border)] -z-10 rounded"></div>
              <div
                className={`absolute top-[20px] left-[5%] h-1 transition-all duration-700 -z-10 rounded ${sagaState === "rollback-started" || sagaState === "rollback-complete"
                  ? "bg-rose-500"
                  : sagaState === "completed"
                    ? "bg-emerald-500"
                    : "bg-sky-500"
                  }`}
                style={{
                  width: sagaState === "idle" ? "0%"
                    : sagaState === "order-created" ? "20%"
                      : sagaState === "tickets-reserved" ? "45%"
                        : sagaState === "promo-applied" ? "70%"
                          : sagaState === "payment-initiated" ? "90%"
                            : "100%"
                }}
              ></div>

              {/* Step 1 Node */}
              <div className="flex flex-col items-center gap-2 w-1/5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all-custom ${sagaState === "idle"
                  ? "border-[var(--node-border)] bg-[var(--node-bg)] text-[var(--text-secondary)]"
                  : sagaState === "order-created"
                    ? "border-sky-500 bg-sky-955 text-sky-400 shadow-md shadow-sky-900/30 scale-110"
                    : sagaState === "rollback-started" || sagaState === "rollback-complete"
                      ? "border-rose-500 bg-rose-950/20 text-rose-400"
                      : "border-emerald-500 bg-emerald-950/20 text-emerald-400"
                  }`}>
                  {sagaState === "idle" ? "1" : (sagaState === "order-created" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />)}
                </div>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] text-center font-mono">Order-Service</span>
              </div>

              {/* Step 2 Node */}
              <div className="flex flex-col items-center gap-2 w-1/5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all-custom ${sagaState === "idle" || sagaState === "order-created"
                  ? "border-[var(--node-border)] bg-[var(--node-bg)] text-[var(--text-secondary)]"
                  : sagaState === "tickets-reserved"
                    ? "border-sky-500 bg-sky-955 text-sky-400 shadow-md shadow-sky-900/30 scale-110"
                    : sagaState === "rollback-started" || sagaState === "rollback-complete"
                      ? "border-rose-500 bg-rose-950/20 text-rose-400"
                      : "border-emerald-500 bg-emerald-950/20 text-emerald-400"
                  }`}>
                  {sagaState === "idle" || sagaState === "order-created" ? "2" : (sagaState === "tickets-reserved" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />)}
                </div>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] text-center font-mono">
                  {sagaType === "TICKET" ? "Ticket-Service" : sagaType === "BOOTH" ? "Booth-Service" : "Venue-Service"}
                </span>
              </div>

              {/* Step 3 Node */}
              <div className="flex flex-col items-center gap-2 w-1/5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all-custom ${sagaState === "idle" || sagaState === "order-created" || sagaState === "tickets-reserved"
                  ? "border-[var(--node-border)] bg-[var(--node-bg)] text-[var(--text-secondary)]"
                  : sagaState === "promo-applied"
                    ? "border-sky-500 bg-sky-955 text-sky-400 shadow-md shadow-sky-905 scale-110"
                    : sagaState === "rollback-started" || sagaState === "rollback-complete"
                      ? "border-rose-500 bg-rose-950/20 text-rose-400 animate-pulse"
                      : "border-emerald-500 bg-emerald-950/20 text-emerald-400"
                  }`}>
                  {sagaState === "idle" || sagaState === "order-created" || sagaState === "tickets-reserved" ? "3" : (sagaState === "promo-applied" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />)}
                </div>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] text-center font-mono">
                  {sagaType === "VENUE" ? "Contract-Service" : "Promo-Service"}
                </span>
              </div>

              {/* Step 4 Node */}
              <div className="flex flex-col items-center gap-2 w-1/5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all-custom ${sagaState === "idle" || sagaState === "order-created" || sagaState === "tickets-reserved" || sagaState === "promo-applied"
                  ? "border-[var(--node-border)] bg-[var(--node-bg)] text-[var(--text-secondary)]"
                  : sagaState === "payment-initiated"
                    ? "border-sky-500 bg-sky-955 text-sky-400 shadow-md shadow-sky-905 scale-110"
                    : sagaState === "rollback-started" || sagaState === "rollback-complete"
                      ? "border-rose-500 bg-rose-950/20 text-rose-400 font-bold"
                      : "border-emerald-500 bg-emerald-950/20 text-emerald-400"
                  }`}>
                  {sagaState === "idle" || sagaState === "order-created" || sagaState === "tickets-reserved" || sagaState === "promo-applied" ? "4" : (sagaState === "payment-initiated" ? <RefreshCw className="w-4 h-4 animate-spin" /> : (sagaState === "rollback-started" || sagaState === "rollback-complete" ? "X" : <Check className="w-4 h-4" />))}
                </div>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] text-center font-mono">
                  {sagaType === "VENUE" ? "Billing-Service" : "Payment-API"}
                </span>
              </div>

              {/* Step 5 Node */}
              <div className="flex flex-col items-center gap-2 w-1/5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all-custom ${sagaState === "completed"
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : sagaState === "rollback-complete"
                    ? "border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                    : "border-[var(--node-border)] bg-[var(--node-bg)] text-[var(--text-secondary)]"
                  }`}>
                  {sagaState === "completed" ? <Check className="w-4 h-4" /> : (sagaState === "rollback-complete" ? <X className="w-4 h-4" /> : "5")}
                </div>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] text-center font-mono">
                  {sagaType === "VENUE" ? "Event-Service" : "Notify-Service"}
                </span>
              </div>

            </div>
          </div>

          {/* Architecture explanations */}
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-5 mt-6 space-y-3">
            <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-outfit">
              <Info className="w-4 h-4 text-sky-400" />
              How SAGA event-driven choreography works:
            </h4>
            <ul className="text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed list-disc pl-4">
              <li>Each microservice acts independently, triggered by Kafka domain events.</li>
              <li>
                {sagaType === "TICKET"
                  ? "Row locking (SELECT FOR UPDATE) isolates ticket inventory updates before initiating payment processing."
                  : sagaType === "BOOTH"
                    ? "Before acquiring slot locks, Order-Service conducts an event-driven validation of the Vendor Profile state."
                    : "Venue reservation allocates dates and validates venue capacity matching the expected audience level."}
              </li>
              <li>If a failure happens downstream (e.g. Stripe card decline), the orchestrator triggers <strong>compensating transactions</strong> to release the reserved slot.</li>
            </ul>
          </div>

        </div>

        {/* Console Logs Terminal */}
        <div className="glass rounded-2xl border border-[var(--glass-border)] p-5 flex flex-col justify-between h-[480px]">
          <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-3 mb-3">
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest font-mono flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Broker Feed
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono">Kafka 2.13</span>
          </div>

          {/* Log Output */}
          <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[11px] pr-2">
            {sagaLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-center px-4">
                <span>No active transactions. Complete checkout or booth bookings to listen to event brokers.</span>
              </div>
            ) : (
              sagaLogs.map((log, i) => (
                <div key={i} className="leading-relaxed border-l-2 border-white/5 pl-2">
                  <span className="text-slate-600">[{log.time}]</span>{" "}
                  <span className="text-sky-400 font-bold">{log.service}:</span>{" "}
                  <span className={
                    log.type === "success" ? "text-emerald-400"
                      : log.type === "error" ? "text-rose-400 font-semibold"
                        : log.type === "event" ? "text-indigo-400 italic"
                          : "text-[var(--text-primary)]"
                  }>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--glass-border)] flex items-center justify-between text-[10px] text-slate-500">
            <span>Topic subscriptions: 5 active</span>
            <span>SSL encrypted</span>
          </div>
        </div>

      </div>
    </div>
  );
};
