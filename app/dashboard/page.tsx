"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const O = "#E8450A";
const NAVY = "#0f1b35";

const CHART_DATA = [
  { day: "Mon", calls: 28 }, { day: "Tue", calls: 32 }, { day: "Wed", calls: 38 },
  { day: "Thu", calls: 45 }, { day: "Fri", calls: 42 }, { day: "Sat", calls: 18 }, { day: "Sun", calls: 10 },
];

const DEMO_CALLS = [
  { id: "1", from: "(214) 555-0123", date: "Oct 24, 2023", timeAgo: "10 mins ago", duration: "2:14", status: "Booked", outcome: "7:00 AM Slot", summary: "Foundation pour, 40 yards, Dallas TX. Customer confirmed 7am slot Tuesday.", transcript: "AI: Hello, thanks for calling! How can I help?\nCaller: I need to book a pump for a foundation pour.\nAI: Happy to help! What size pour and where is the job located?\nCaller: About 40 yards, Dallas area.\nAI: Perfect, I have Tuesday at 7am available. Shall I book that?\nCaller: Yes please.\nAI: Booked! You'll get a confirmation text shortly." },
  { id: "2", from: "(817) 555-9876", date: "Oct 24, 2023", timeAgo: "45 mins ago", duration: "1:05", status: "Inquiry", outcome: "Pricing Info", summary: "Called to ask about pricing for a 60-yard slab pour. Sent pricing sheet via SMS.", transcript: "AI: Hello, thanks for calling!\nCaller: Hi, I just wanted to get some pricing info for a large pour.\nAI: Of course! What size pour are you looking at?\nCaller: About 60 yards for a commercial slab.\nAI: I'll send our pricing sheet to your number right now. Anything else?\nCaller: No that's all, thanks." },
  { id: "3", from: "(972) 555-4321", date: "Oct 24, 2023", timeAgo: "2 hours ago", duration: "3:22", status: "Booked", outcome: "1:00 PM Slot", summary: "Commercial slab, 80 yards, Plano TX. Booked 1pm slot Thursday.", transcript: "AI: Hello, thanks for calling Pump Time AI!\nCaller: Yes I need a concrete pump for a big commercial job.\nAI: Great! Can you tell me the job size and location?\nCaller: 80 yards, commercial slab in Plano.\nAI: I have Thursday at 1pm available for that size. Does that work?\nCaller: Perfect, let's do it.\nAI: Excellent! Booked for Thursday 1pm. You'll get a confirmation shortly." },
  { id: "4", from: "(214) 555-8888", date: "Oct 24, 2023", timeAgo: "4 hours ago", duration: "0:00", status: "Missed", outcome: "Out of Hours", summary: "Called at 11pm, outside business hours. Voicemail left.", transcript: "No transcript available — call received outside business hours." },
];

function UpgradeModal({ onClose, company }: { onClose: () => void; company: string }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "2.5rem 2rem", width: "100%", maxWidth: 540, position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#aaa" }}>✕</button>
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a" }}>Ready to Go Live?</h2>
        <p style={{ margin: "0 0 2rem", color: "#6b7280", fontSize: "0.9rem" }}>Choose a plan to activate real AI call answering for {company || "your business"}.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: "1.5rem" }}>
          {[
            { name:"The Starter Plan", price:"$299", desc:"1-2 trucks", features:["200 AI calls/mo","Booking automation","Call transcripts","1 phone number"], hot:false },
            { name:"The Pumper Plan", price:"$568", desc:"Growing operations", features:["Unlimited AI calls","Custom AI voice","Advanced analytics","3 phone numbers"], hot:true },
          ].map(plan => (
            <div key={plan.name} style={{ border: plan.hot ? `2px solid ${O}` : "1.5px solid #e5e7eb", borderRadius: 14, padding: "1.5rem", position: "relative", background: plan.hot ? "#fff8f5" : "#fff" }}>
              {plan.hot && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: O, color: "#fff", padding: "0.2rem 0.8rem", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" }}>POPULAR</div>}
              <h3 style={{ margin: "0 0 2px", fontSize: "0.9rem", fontWeight: 700 }}>{plan.name}</h3>
              <p style={{ margin: "0 0 10px", fontSize: "0.75rem", color: "#9ca3af" }}>{plan.desc}</p>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: 12 }}>{plan.price}<span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 400 }}>/mo</span></div>
              {plan.features.map(f => <div key={f} style={{ fontSize: "0.78rem", color: "#444", marginBottom: 6, display: "flex", gap: 6 }}><span style={{ color: O }}>✓</span>{f}</div>)}
            </div>
          ))}
        </div>
        <a href="/#pricing" style={{ display: "block", background: O, color: "#fff", padding: "1rem", borderRadius: 10, fontWeight: 700, fontSize: "1rem", textAlign: "center", textDecoration: "none" }}>
          Choose a Plan & Go Live →
        </a>
      </div>
    </div>
  );
}

type Call = typeof DEMO_CALLS[0];

function DashboardContent() {
  const params = useSearchParams();
  const isDemo = params.get("demo") === "true";
  const companyParam = params.get("company") || "";
  const nameParam = params.get("name") || "";

  const [tab, setTab] = useState("Overview");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [company, setCompany] = useState(companyParam || "your business");
  const [userName, setUserName] = useState(nameParam || "User");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsType, setSmsType] = useState("Booking Confirmation");
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState("");
  const [aiVoice, setAiVoice] = useState("Professional Male");
  const [autoBooking, setAutoBooking] = useState(true);
  const [smsConfirm, setSmsConfirm] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("Last 7 Days");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (companyParam) setCompany(companyParam);
    if (nameParam) setUserName(nameParam);
  }, [companyParam, nameParam]);

  const calls = DEMO_CALLS;
  const filteredCalls = calls.filter(c =>
    c.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = { calls: 142, booked: 38, revenue: "$26,400", hours: "12.5" };
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const statusStyle = (s: string) => {
    if (s === "Booked") return { background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" };
    if (s === "Missed") return { background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" };
    return { background: "#fef9c3", color: "#ca8a04", border: "1px solid #fde68a" };
  };

  const sendTestSMS = async () => {
    if (!smsPhone) return;
    setSmsSending(true); setSmsResult("");
    try {
      const res = await fetch("/api/twilio/sms", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: smsPhone, type: smsType, company }),
      });
      const d = await res.json();
      setSmsResult(d.success ? "✓ SMS sent successfully!" : "✗ " + (d.error || "Failed to send"));
    } catch { setSmsResult("✗ Failed to send SMS"); }
    finally { setSmsSending(false); }
  };

  const navItems = [
    { id: "Overview", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { id: "Call Logs", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 10.93 19.79 19.79 0 01.88 2.3 2 2 0 012.87.1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.22 14l.7 2.92z"/></svg> },
    { id: "Bookings", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { id: "AI Settings", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  ];

  const Sidebar = () => (
    <aside style={{ width: 240, background: "#fff", borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh", position: "sticky", top: 0, overflowY: "auto" }}>
      <div style={{ padding: "1.25rem 1.25rem 0", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 34, height: 34, background: O, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: "1rem" }}>Pump Time <span style={{ color: O }}>AI</span></span>
      </div>
      <nav style={{ padding: "1.5rem 0.75rem", flex: 1 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setTab(item.id); setSelectedCall(null); setSidebarOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "0.7rem 0.75rem", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: "0.88rem", fontWeight: tab === item.id ? 700 : 500, background: tab === item.id ? "#fff5f0" : "transparent", color: tab === item.id ? O : "#6b7280", marginBottom: 2 }}>
            <span style={{ color: tab === item.id ? O : "#9ca3af" }}>{item.icon}</span>{item.id}
          </button>
        ))}
      </nav>
      <div style={{ margin: "0 0.75rem 0.75rem", background: NAVY, borderRadius: 12, padding: "1.25rem" }}>
        <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Current Plan</div>
        <div style={{ fontWeight: 800, color: "#fff", fontSize: "0.9rem", marginBottom: 12 }}>The Pumper Plan</div>
        <button onClick={() => setShowUpgrade(true)} style={{ width: "100%", background: O, color: "#fff", border: "none", padding: "0.6rem", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit" }}>Upgrade</button>
      </div>
      <button onClick={() => setShowUpgrade(true)} style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0.75rem 1.25rem", padding: "0.6rem 0.75rem", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af", fontSize: "0.82rem", fontFamily: "inherit" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Exit Demo
      </button>
    </aside>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb", fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} company={company} />}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: "relative", zIndex: 201, width: 240 }}><Sidebar /></div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div style={{ display: "none" }} id="desktop-sidebar"><Sidebar /></div>
      <div id="desktop-sidebar-visible" style={{ display: "flex" }}><Sidebar /></div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button id="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "none", padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.95rem" }}>{tab}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </button>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a1a1a", lineHeight: 1.2 }}>{userName}</div>
              <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{company}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff5f0", border: `2px solid ${O}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.82rem", color: O }}>{initials}</div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "clamp(1rem,3vw,2rem)", overflowY: "auto" }}>

          {/* ── OVERVIEW ── */}
          {tab === "Overview" && (
            <div>
              <h1 style={{ margin: "0 0 0.3rem", fontSize: "clamp(1.4rem,3vw,1.75rem)", fontWeight: 800, color: "#1a1a1a" }}>Welcome to your Dashboard</h1>
              <p style={{ margin: "0 0 1.75rem", color: "#6b7280", fontSize: "0.88rem" }}>Here&apos;s how Pump Time AI is performing for {company}.</p>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: "1.5rem" }}>
                {[
                  { label:"Total Calls Handled", value:stats.calls, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 10.93 19.79 19.79 0 01.88 2.3 2 2 0 012.87.1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6z"/></svg>, bg:"#fff5f0" },
                  { label:"Jobs Booked", value:stats.booked, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, bg:"#f0fdf4" },
                  { label:"Revenue Generated", value:stats.revenue, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, bg:"#eff6ff" },
                  { label:"Hours Saved", value:stats.hours, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, bg:"#fff5f0" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "1.5rem" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>{s.icon}</div>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: "clamp(1.4rem,3vw,1.75rem)", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em" }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart + Test AI row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, marginBottom: "1.5rem", alignItems: "start" }}>
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "1.5rem", minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: 8 }}>
                    <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1a1a1a" }}>Call Volume</h2>
                    <select value={chartPeriod} onChange={e => setChartPeriod(e.target.value)} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.3rem 0.6rem", fontSize: "0.82rem", color: "#444", outline: "none", background: "#fff", cursor: "pointer" }}>
                      <option>Last 7 Days</option><option>Last 30 Days</option><option>Last 90 Days</option>
                    </select>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={CHART_DATA}>
                      <defs>
                        <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={O} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={O} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ border: "1px solid #f0f0f0", borderRadius: 8, fontSize: "0.82rem" }} />
                      <Area type="monotone" dataKey="calls" stroke={O} strokeWidth={2.5} fill="url(#callGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Test AI Agent */}
                <div style={{ background: O, borderRadius: 14, padding: "1.75rem", width: "clamp(220px,25vw,260px)", flexShrink: 0, color: "#fff" }}>
                  <h3 style={{ margin: "0 0 0.4rem", fontWeight: 800, fontSize: "1.05rem" }}>Test Your AI Agent</h3>
                  <p style={{ margin: "0 0 1.25rem", fontSize: "0.82rem", opacity: 0.85, lineHeight: 1.6 }}>Experience how the AI handles a call for {company}.</p>
                  <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "1rem", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em" }}>AI AGENT ONLINE</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: 1.6, opacity: 0.9 }}>
                      &ldquo;Hello! Thanks for calling {company}. Are you looking to book a pump for a 7 AM or 1 PM slot?&rdquo;
                    </p>
                  </div>
                  <button style={{ width: "100%", background: "#fff", color: O, border: "none", padding: "0.75rem", borderRadius: 10, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 10.93z"/></svg>
                    Start AI Test Call
                  </button>
                </div>
              </div>

              {/* Recent calls + Quick actions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "1.5rem", minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1a1a1a" }}>Recent Call Activity</h2>
                    <button onClick={() => setTab("Call Logs")} style={{ background: "none", border: "none", color: O, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>View All</button>
                  </div>
                  {calls.map((call, i) => (
                    <div key={call.id} onClick={() => { setTab("Call Logs"); setSelectedCall(call); }}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "0.85rem 0", borderBottom: i < calls.length - 1 ? "1px solid #f9fafb" : "none", cursor: "pointer" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: call.status === "Booked" ? "#dcfce7" : call.status === "Missed" ? "#fee2e2" : "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {call.status === "Booked" ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07z"/></svg>
                          : call.status === "Missed" ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07z"/></svg>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "0.9rem" }}>{call.from}</div>
                        <div style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: 2 }}>{call.timeAgo} • {call.duration}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ ...statusStyle(call.status), padding: "0.2rem 0.65rem", borderRadius: 99, fontSize: "0.72rem", fontWeight: 600, marginBottom: 3, display: "inline-block" }}>{call.status}</div>
                        <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{call.outcome}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "1.5rem", width: "clamp(200px,22vw,240px)", flexShrink: 0 }}>
                  <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, color: "#1a1a1a" }}>Quick Actions</h2>
                  {[
                    { label:"Download Report", icon:"⬇️" },
                    { label:"Update AI Voice", icon:"🎙️" },
                    { label:"Send Test SMS", icon:"✉️" },
                    { label:"Manage Schedule", icon:"📅" },
                    { label:"View Analytics", icon:"📊" },
                  ].map(action => (
                    <button key={action.label} onClick={() => action.label === "Update AI Voice" || action.label === "Send Test SMS" ? setTab("AI Settings") : null}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0.7rem 0", borderBottom: "1px solid #f9fafb", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.88rem", color: "#444", fontWeight: 500 }}>
                        <span>{action.icon}</span>{action.label}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CALL LOGS ── */}
          {tab === "Call Logs" && (
            <div>
              <h1 style={{ margin: "0 0 1.5rem", fontSize: "clamp(1.4rem,3vw,1.75rem)", fontWeight: 800, color: "#1a1a1a" }}>Calls</h1>
              {selectedCall ? (
                <div>
                  <button onClick={() => setSelectedCall(null)} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#444", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer", marginBottom: "1.5rem", fontFamily: "inherit", fontSize: "0.85rem" }}>← Back</button>
                  <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "2rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 20, marginBottom: "1.5rem" }}>
                      {[["From",selectedCall.from],["Duration",selectedCall.duration],["Status",selectedCall.status],["Outcome",selectedCall.outcome],["Date",selectedCall.date]].map(([k,v]) => (
                        <div key={k}><div style={{ fontSize: "0.72rem", color: "#9ca3af", marginBottom: 4 }}>{k}</div><div style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "0.9rem" }}>{v}</div></div>
                      ))}
                    </div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{ fontSize: "0.72rem", color: O, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>AI Summary</div>
                      <p style={{ margin: 0, color: "#444", lineHeight: 1.75, fontSize: "0.9rem", background: "#fafafa", borderRadius: 8, padding: "1rem" }}>{selectedCall.summary}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: O, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>Transcript</div>
                      <pre style={{ margin: 0, color: "#444", lineHeight: 1.8, fontSize: "0.85rem", background: "#fafafa", borderRadius: 8, padding: "1rem", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{selectedCall.transcript}</pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                      <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input placeholder="Search by phone number..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.55rem 0.75rem 0.55rem 2rem", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <button style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.55rem 1rem", background: "#fff", cursor: "pointer", fontSize: "0.82rem", color: "#444", fontFamily: "inherit" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> Filter
                    </button>
                    <button style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.55rem 1rem", background: "#fff", cursor: "pointer", fontSize: "0.82rem", color: "#444", fontFamily: "inherit" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export
                    </button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          {["CALLER","DATE & TIME","DURATION","STATUS","OUTCOME",""].map(h => (
                            <th key={h} style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.05em", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCalls.map((call, i) => (
                          <tr key={call.id} style={{ borderBottom: i < filteredCalls.length - 1 ? "1px solid #f9fafb" : "none" }}>
                            <td style={{ padding: "1rem 1.5rem", fontWeight: 700, color: "#1a1a1a", fontSize: "0.9rem" }}>{call.from}</td>
                            <td style={{ padding: "1rem 1.5rem" }}>
                              <div style={{ fontSize: "0.88rem", color: "#1a1a1a" }}>{call.date}</div>
                              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{call.timeAgo}</div>
                            </td>
                            <td style={{ padding: "1rem 1.5rem", fontSize: "0.88rem", color: "#444" }}>{call.duration}</td>
                            <td style={{ padding: "1rem 1.5rem" }}>
                              <span style={{ ...statusStyle(call.status), padding: "0.25rem 0.75rem", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600 }}>{call.status}</span>
                            </td>
                            <td style={{ padding: "1rem 1.5rem", fontSize: "0.88rem", color: "#444" }}>{call.outcome}</td>
                            <td style={{ padding: "1rem 1.5rem" }}>
                              <button onClick={() => setSelectedCall(call)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {tab === "Bookings" && (
            <div>
              <h1 style={{ margin: "0 0 1.5rem", fontSize: "clamp(1.4rem,3vw,1.75rem)", fontWeight: 800, color: "#1a1a1a" }}>Bookings</h1>
              <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "4rem 2rem", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 14, background: "#f9fafb", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a" }}>Your Bookings</h2>
                <p style={{ margin: "0 0 1.5rem", color: "#9ca3af", fontSize: "0.9rem" }}>You haven&apos;t made any bookings yet through the demo.</p>
                <button onClick={() => setShowUpgrade(true)} style={{ background: O, color: "#fff", border: "none", padding: "0.85rem 2rem", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", fontFamily: "inherit" }}>Book a Test Job</button>
              </div>
            </div>
          )}

          {/* ── AI SETTINGS ── */}
          {tab === "AI Settings" && (
            <div>
              <h1 style={{ margin: "0 0 1.5rem", fontSize: "clamp(1.4rem,3vw,1.75rem)", fontWeight: 800, color: "#1a1a1a" }}>Settings</h1>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 700 }}>

                {/* AI Agent Config */}
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "1.75rem" }}>
                  <h2 style={{ margin: "0 0 0.35rem", fontSize: "1rem", fontWeight: 700, color: "#1a1a1a" }}>AI Agent Configuration</h2>
                  <p style={{ margin: "0 0 1.5rem", color: "#9ca3af", fontSize: "0.85rem" }}>Customize how your AI receptionist interacts with callers.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a1a" }}>AI Voice Selection</div>
                        <div style={{ fontSize: "0.82rem", color: "#9ca3af", marginTop: 3 }}>Choose the voice profile for your agent.</div>
                      </div>
                      <select value={aiVoice} onChange={e => setAiVoice(e.target.value)} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.5rem 0.9rem", fontSize: "0.88rem", outline: "none", background: "#fff", cursor: "pointer", minWidth: 160 }}>
                        <option>Professional Male</option><option>Professional Female</option><option>Friendly Male</option><option>Friendly Female</option>
                      </select>
                    </div>
                    {[["Auto-Booking","Allow AI to directly book jobs into your calendar.",autoBooking,setAutoBooking],
                      ["SMS Confirmations","Send automatic SMS to customers after booking.",smsConfirm,setSmsConfirm]].map(([label, desc, val, setter]) => (
                      <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a1a" }}>{String(label)}</div>
                          <div style={{ fontSize: "0.82rem", color: "#9ca3af", marginTop: 3 }}>{String(desc)}</div>
                        </div>
                        <button onClick={() => (setter as (v: boolean) => void)(!val as boolean)}
                          style={{ width: 48, height: 26, borderRadius: 99, border: "none", cursor: "pointer", background: val ? O : "#e5e7eb", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: val ? 25 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </button>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button style={{ background: O, color: "#fff", border: "none", padding: "0.7rem 1.5rem", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}>Save Changes</button>
                    </div>
                  </div>
                </div>

                {/* Vapi Integration */}
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "1.75rem" }}>
                  <h2 style={{ margin: "0 0 0.35rem", fontSize: "1rem", fontWeight: 700, color: "#1a1a1a" }}>Vapi Voice Integration</h2>
                  <p style={{ margin: "0 0 1.5rem", color: "#9ca3af", fontSize: "0.85rem" }}>Real-time voice AI status and configuration.</p>
                  <div style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1a1a1a" }}>Vapi Connected</div>
                        <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: 2 }}>Your real-time voice agent is active and ready for calls.</div>
                      </div>
                    </div>
                    <div style={{ background: "#dcfce7", color: "#16a34a", padding: "0.2rem 0.65rem", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, border: "1px solid #bbf7d0" }}>LIVE</div>
                  </div>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: "0.82rem" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Assistant ID: <span style={{ color: "#444", fontFamily: "monospace" }}>7a2465d9...</span>
                  </div>
                </div>

                {/* Twilio Test */}
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "1.75rem" }}>
                  <h2 style={{ margin: "0 0 0.35rem", fontSize: "1rem", fontWeight: 700, color: "#1a1a1a" }}>Twilio Test Tools</h2>
                  <p style={{ margin: "0 0 1.5rem", color: "#9ca3af", fontSize: "0.85rem" }}>Verify your SMS integration by sending a test message.</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
                    {["Booking Confirmation","Status Update","Reminder"].map(t => (
                      <button key={t} onClick={() => setSmsType(t)}
                        style={{ padding: "0.4rem 0.9rem", borderRadius: 8, border: `1.5px solid ${smsType === t ? O : "#e5e7eb"}`, background: smsType === t ? "#fff5f0" : "#fff", color: smsType === t ? O : "#444", fontSize: "0.82rem", fontWeight: smsType === t ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>TEST PHONE NUMBER</label>
                      <input value={smsPhone} onChange={e => setSmsPhone(e.target.value)} placeholder="+15551234567"
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.65rem 0.9rem", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>TEST MESSAGE</label>
                      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.65rem 0.9rem", fontSize: "0.88rem", color: "#444", background: "#fafafa" }}>This is a test message from Pump Time AI.</div>
                    </div>
                  </div>
                  {smsResult && <div style={{ marginBottom: 12, padding: "0.6rem 1rem", borderRadius: 8, background: smsResult.startsWith("✓") ? "#dcfce7" : "#fee2e2", color: smsResult.startsWith("✓") ? "#16a34a" : "#dc2626", fontSize: "0.85rem" }}>{smsResult}</div>}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={sendTestSMS} disabled={smsSending || !smsPhone}
                      style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "0.7rem 1.5rem", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: smsPhone && !smsSending ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, opacity: smsPhone && !smsSending ? 1 : 0.6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      {smsSending ? "Sending..." : "Send Test SMS"}
                    </button>
                  </div>
                </div>

                {/* Company Profile */}
                <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "1.75rem" }}>
                  <h2 style={{ margin: "0 0 1.5rem", fontSize: "1rem", fontWeight: 700, color: "#1a1a1a" }}>Company Profile</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>COMPANY NAME</label>
                      <input value={company} onChange={e => setCompany(e.target.value)}
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.65rem 0.9rem", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>BUSINESS PHONE</label>
                      <input defaultValue="+18444911467"
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.65rem 0.9rem", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                    <button style={{ background: O, color: "#fff", border: "none", padding: "0.7rem 1.5rem", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}>Save Profile</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        #desktop-sidebar-visible { display: flex; }
        #mobile-menu-btn { display: none; }
        @media (max-width: 900px) {
          #desktop-sidebar-visible { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 768px) {
          .overview-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"Inter,sans-serif", color:"#9ca3af" }}>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
