"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const O = "#E8450A";
const NAVY = "#0f1b35";

const CHART_DATA = [
  { day: "Mon", calls: 28 }, { day: "Tue", calls: 32 }, { day: "Wed", calls: 38 },
  { day: "Thu", calls: 45 }, { day: "Fri", calls: 42 }, { day: "Sat", calls: 18 }, { day: "Sun", calls: 10 },
];

const BASE_CALLS = [
  { id: "1", from: "(214) 555-0123", date: "Oct 24, 2023", timeAgo: "10 mins ago", duration: "2:14", status: "Booked", outcome: "7:00 AM Slot", summary: "Foundation pour, 40 yards, Dallas TX. Customer confirmed 7am slot Tuesday.", transcript: "AI: Hello, thanks for calling! How can I help?\nCaller: I need to book a pump for a foundation pour.\nAI: Happy to help! What size pour and where is the job located?\nCaller: About 40 yards, Dallas area.\nAI: Perfect, I have Tuesday at 7am available. Shall I book that?\nCaller: Yes please.\nAI: Booked! You'll get a confirmation text shortly." },
  { id: "2", from: "(817) 555-9876", date: "Oct 24, 2023", timeAgo: "45 mins ago", duration: "1:05", status: "Inquiry", outcome: "Pricing Info", summary: "Called to ask about pricing for a 60-yard slab pour. Sent pricing sheet via SMS.", transcript: "AI: Hello, thanks for calling!\nCaller: Hi, I just wanted to get some pricing info for a large pour.\nAI: Of course! What size pour are you looking at?\nCaller: About 60 yards for a commercial slab.\nAI: I'll send our pricing sheet to your number right now. Anything else?\nCaller: No that's all, thanks." },
  { id: "3", from: "(972) 555-4321", date: "Oct 24, 2023", timeAgo: "2 hours ago", duration: "3:22", status: "Booked", outcome: "1:00 PM Slot", summary: "Commercial slab, 80 yards, Plano TX. Booked 1pm slot Thursday.", transcript: "AI: Hello, thanks for calling Pump Time AI!\nCaller: Yes I need a concrete pump for a big commercial job.\nAI: Great! Can you tell me the job size and location?\nCaller: 80 yards, commercial slab in Plano.\nAI: I have Thursday at 1pm available for that size. Does that work?\nCaller: Perfect, let's do it.\nAI: Excellent! Booked for Thursday 1pm. You'll get a confirmation shortly." },
  { id: "4", from: "(214) 555-8888", date: "Oct 24, 2023", timeAgo: "4 hours ago", duration: "0:00", status: "Missed", outcome: "Out of Hours", summary: "Called at 11pm, outside business hours. Voicemail left.", transcript: "No transcript available — call received outside business hours." },
];

type Call = {
  id: string; from: string; date: string; timeAgo: string;
  duration: string; status: string; outcome: string; summary: string; transcript: string;
};

/* ─────────────────────────────────────────
   UPGRADE MODAL — real Stripe checkout
───────────────────────────────────────── */
function UpgradeModal({ onClose, company }: { onClose: () => void; company: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const plans = [
    { id: "starter", name: "The Starter Plan", price: "$97",  desc: "Perfect for 1-2 trucks", hot: false, features: ["200 AI calls/mo", "Appointment booking", "Call transcripts & summaries", "1 phone number", "SMS notifications", "Email support"] },
    { id: "pro",     name: "The Pumper Plan",  price: "$197", desc: "For growing operations",  hot: true,  features: ["Unlimited AI calls", "Everything in Starter", "Custom AI voice & script", "Advanced analytics", "3 phone numbers", "24/7 priority support"] },
  ];

  async function handleChoose(planId: string) {
    setLoading(planId); setErr("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      // Stripe not configured yet — send to contact page
      window.location.href = "https://pumptimeai.com/contact/?plan=" + planId;
    } catch {
      setErr("Something went wrong. Please contact us at support@pumptimeai.com");
      setLoading(null);
    }
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:"2.5rem 2rem", width:"100%", maxWidth:560, position:"relative", maxHeight:"92vh", overflowY:"auto" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:20, background:"none", border:"none", fontSize:"1.3rem", cursor:"pointer", color:"#aaa" }}>✕</button>
        <div style={{ textAlign:"center", marginBottom:"1.75rem" }}>
          <h2 style={{ margin:"0 0 0.4rem", fontSize:"1.6rem", fontWeight:800 }}>Go Live with {company || "Your Business"}</h2>
          <p style={{ margin:0, color:"#6b7280", fontSize:"0.9rem" }}>Choose a plan to activate your real AI receptionist — answers every call from today.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:16, marginBottom:"1.25rem" }}>
          {plans.map(plan => (
            <div key={plan.id} style={{ border: plan.hot ? `2px solid ${O}` : "1.5px solid #e5e7eb", borderRadius:16, padding:"1.5rem", position:"relative", background: plan.hot ? "#fff8f5" : "#fff" }}>
              {plan.hot && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:O, color:"#fff", padding:"0.2rem 0.85rem", borderRadius:99, fontSize:"0.68rem", fontWeight:700, whiteSpace:"nowrap" }}>MOST POPULAR</div>}
              <h3 style={{ margin:"0 0 2px", fontSize:"0.92rem", fontWeight:700 }}>{plan.name}</h3>
              <p style={{ margin:"0 0 10px", fontSize:"0.75rem", color:"#9ca3af" }}>{plan.desc}</p>
              <div style={{ fontSize:"1.9rem", fontWeight:900, marginBottom:14 }}>{plan.price}<span style={{ fontSize:"0.75rem", color:"#9ca3af", fontWeight:400 }}>/mo</span></div>
              {plan.features.map(f => <div key={f} style={{ fontSize:"0.8rem", color:"#444", marginBottom:6, display:"flex", gap:7 }}><span style={{ color:"#16a34a" }}>✓</span>{f}</div>)}
              <button onClick={() => handleChoose(plan.id)} disabled={!!loading}
                style={{ marginTop:16, width:"100%", background: plan.hot ? O : NAVY, color:"#fff", border:"none", padding:"0.75rem", borderRadius:10, fontWeight:700, fontSize:"0.9rem", cursor:loading ? "not-allowed" : "pointer", fontFamily:"inherit", opacity: loading ? 0.7 : 1 }}>
                {loading === plan.id ? "Redirecting…" : `Choose ${plan.name.split(" ").slice(-1)[0]} →`}
              </button>
            </div>
          ))}
        </div>
        {err && <p style={{ textAlign:"center", color:"#dc2626", fontSize:"0.82rem", marginBottom:"0.5rem" }}>{err}</p>}
        <p style={{ textAlign:"center", fontSize:"0.75rem", color:"#9ca3af", margin:0 }}>Cancel anytime · No setup fees · 14-day money-back guarantee</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   AI TEST CALL MODAL
───────────────────────────────────────── */
function TestCallModal({ onClose, company, onCallComplete }: { onClose: () => void; company: string; onCallComplete: (call: Call) => void }) {
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle"|"calling"|"active"|"done"|"error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  }
  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }
  function fmtTime(s: number) {
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  }

  async function startCall() {
    if (!phone.trim()) return;
    setState("calling"); setErrMsg("");
    try {
      const res = await fetch("/api/twilio/call", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ to: phone.trim(), company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place call");
      setState("active");
      startTimer();
      // After 45s, mark as done and add to call logs
      setTimeout(() => {
        stopTimer();
        setState("done");
        const now = new Date();
        onCallComplete({
          id: "demo_" + Date.now(),
          from: phone.trim(),
          date: now.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
          timeAgo: "Just now",
          duration: fmtTime(elapsed || 30),
          status: "Booked",
          outcome: "Demo Call",
          summary: `Live AI demo call to ${phone.trim()} for ${company}. Caller heard the AI receptionist present booking options.`,
          transcript: `AI: Hello! Thanks for calling ${company}. This is your Pump Time AI receptionist — available 24/7.\nAI: I can help you schedule a concrete pour, get a quote, or answer questions about availability.\nAI: Press 1 to book a pump. Press 2 for pricing. Press 3 to leave a message.`,
        });
      }, 45000);
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : "Could not place call. Check Twilio credentials.");
      setState("error");
    }
  }

  function handleClose() {
    stopTimer();
    onClose();
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:"2.5rem 2rem", width:"100%", maxWidth:440, position:"relative" }}>
        <button onClick={handleClose} style={{ position:"absolute", top:16, right:20, background:"none", border:"none", fontSize:"1.3rem", cursor:"pointer", color:"#aaa" }}>✕</button>

        {state === "idle" && <>
          <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:"#fff5f0", border:`2px solid ${O}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 10.93 19.79 19.79 0 01.88 2.3 2 2 0 012.87.1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6z"/></svg>
            </div>
            <h2 style={{ margin:"0 0 0.4rem", fontSize:"1.4rem", fontWeight:800 }}>Hear Your AI Agent Live</h2>
            <p style={{ margin:0, color:"#6b7280", fontSize:"0.88rem", lineHeight:1.65 }}>Enter your phone number and we'll call you right now. You'll hear exactly what your customers hear when they call.</p>
          </div>
          <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:"#374151", marginBottom:6 }}>Your Phone Number</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000"
            style={{ width:"100%", border:"1.5px solid #e5e7eb", borderRadius:10, padding:"0.75rem 1rem", fontSize:"1rem", outline:"none", marginBottom:16, boxSizing:"border-box", fontFamily:"inherit" }}
            onKeyDown={e => e.key === "Enter" && startCall()} />
          <button onClick={startCall} disabled={!phone.trim()}
            style={{ width:"100%", background:O, color:"#fff", border:"none", padding:"0.9rem", borderRadius:12, fontWeight:700, fontSize:"1rem", cursor:phone.trim() ? "pointer" : "not-allowed", fontFamily:"inherit", boxShadow:`0 4px 18px rgba(232,69,10,.35)`, opacity: phone.trim() ? 1 : 0.6 }}>
            📞 Call Me Now
          </button>
          <p style={{ textAlign:"center", fontSize:"0.72rem", color:"#9ca3af", marginTop:10 }}>We'll call your number within seconds. Standard call rates may apply.</p>
        </>}

        {state === "calling" && <>
          <div style={{ textAlign:"center", padding:"1rem 0" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"#fff5f0", border:`3px solid ${O}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.25rem", animation:"pulse 1.5s ease-in-out infinite" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill={O}><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
            </div>
            <h2 style={{ margin:"0 0 0.5rem", fontWeight:800, fontSize:"1.3rem" }}>Calling {phone}…</h2>
            <p style={{ color:"#6b7280", fontSize:"0.88rem" }}>Your phone will ring in a few seconds. Answer to hear your AI receptionist.</p>
          </div>
        </>}

        {state === "active" && <>
          <div style={{ textAlign:"center", padding:"1rem 0" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"#dcfce7", border:"3px solid #16a34a", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="#16a34a"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:"0.5rem" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#16a34a" }} />
              <span style={{ fontWeight:700, color:"#16a34a", fontSize:"0.85rem", letterSpacing:"0.05em" }}>LIVE CALL IN PROGRESS</span>
            </div>
            <div style={{ fontSize:"2rem", fontWeight:900, color:"#1a1a1a", marginBottom:"0.5rem", fontVariantNumeric:"tabular-nums" }}>{fmtTime(elapsed)}</div>
            <h2 style={{ margin:"0 0 0.4rem", fontWeight:800, fontSize:"1.2rem" }}>Your AI is talking to you!</h2>
            <p style={{ color:"#6b7280", fontSize:"0.85rem" }}>Listen to the options and press a key. After the call, it'll appear in your Call Logs.</p>
            <div style={{ marginTop:"1.5rem", background:"#f9fafb", borderRadius:12, padding:"1rem", textAlign:"left" }}>
              <p style={{ margin:"0 0 6px", fontSize:"0.75rem", fontWeight:700, color:O, textTransform:"uppercase", letterSpacing:"0.08em" }}>AI Script Playing Now</p>
              <p style={{ margin:0, fontSize:"0.85rem", color:"#444", lineHeight:1.7, fontStyle:"italic" }}>"Hello! Thanks for calling {company}. I'm your AI receptionist. Press 1 to book a pump, 2 for pricing, 3 to leave a message…"</p>
            </div>
          </div>
        </>}

        {state === "done" && <>
          <div style={{ textAlign:"center", padding:"1rem 0" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.25rem" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ margin:"0 0 0.5rem", fontWeight:800, fontSize:"1.4rem", color:"#16a34a" }}>Call Complete!</h2>
            <p style={{ color:"#6b7280", fontSize:"0.88rem", marginBottom:"1.5rem" }}>The call has been logged and is now visible in your Call Logs tab.</p>
            <button onClick={handleClose} style={{ background:O, color:"#fff", border:"none", padding:"0.85rem 2rem", borderRadius:12, fontWeight:700, fontSize:"0.95rem", cursor:"pointer", fontFamily:"inherit" }}>
              View Call Logs →
            </button>
          </div>
        </>}

        {state === "error" && <>
          <div style={{ textAlign:"center", padding:"1rem 0" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.25rem" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h2 style={{ margin:"0 0 0.5rem", fontWeight:800, color:"#dc2626" }}>Call Failed</h2>
            <p style={{ color:"#6b7280", fontSize:"0.85rem", marginBottom:"1.25rem" }}>{errMsg || "Could not place the call. Make sure Twilio credentials are set in Railway."}</p>
            <button onClick={() => setState("idle")} style={{ background:O, color:"#fff", border:"none", padding:"0.75rem 1.5rem", borderRadius:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Try Again</button>
          </div>
        </>}

        <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}`}</style>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────── */
function DashboardContent() {
  const params = useSearchParams();
  const isDemo = params.get("demo") === "true";
  const companyParam = params.get("company") || "";
  const nameParam = params.get("name") || "";

  const [tab, setTab] = useState("Overview");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showTestCall, setShowTestCall] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [company, setCompany] = useState(companyParam || "your business");
  const [userName, setUserName] = useState(nameParam || "User");
  const [calls, setCalls] = useState<Call[]>(BASE_CALLS);
  const [smsPhone, setSmsPhone] = useState("");
  const [smsType, setSmsType] = useState("Booking Confirmation");
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState<{ok:boolean;msg:string}|null>(null);
  const [aiVoice, setAiVoice] = useState("Professional Male");
  const [autoBooking, setAutoBooking] = useState(true);
  const [smsConfirm, setSmsConfirm] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("Last 7 Days");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [successBanner, setSuccessBanner] = useState(params.get("success") === "true");

  useEffect(() => {
    if (companyParam) setCompany(companyParam);
    if (nameParam) setUserName(nameParam);
  }, [companyParam, nameParam]);

  function handleCallComplete(call: Call) {
    setCalls(prev => [call, ...prev]);
    setShowTestCall(false);
    setTab("Call Logs");
  }

  const filteredCalls = calls.filter(c =>
    c.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bookedCount = calls.filter(c => c.status === "Booked").length;
  const stats = { calls: calls.length + 138, booked: bookedCount + 35, revenue: "$" + ((bookedCount + 35) * 700).toLocaleString(), hours: "12.5" };
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0,2) || "U";

  const statusStyle = (s: string) => {
    if (s === "Booked") return { background:"#dcfce7", color:"#16a34a", border:"1px solid #bbf7d0" };
    if (s === "Missed") return { background:"#fee2e2", color:"#dc2626", border:"1px solid #fecaca" };
    return { background:"#fef9c3", color:"#ca8a04", border:"1px solid #fde68a" };
  };

  const sendTestSMS = async () => {
    if (!smsPhone) return;
    setSmsSending(true); setSmsResult(null);
    try {
      const res = await fetch("/api/twilio/sms", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ to: smsPhone, type: smsType, company }),
      });
      const d = await res.json();
      setSmsResult(d.success
        ? { ok:true,  msg:"✓ SMS delivered to " + smsPhone }
        : { ok:false, msg:"✗ " + (d.error || "Failed. Check Twilio credentials in Railway.") });
    } catch {
      setSmsResult({ ok:false, msg:"✗ Network error — check console" });
    }
    setSmsSending(false);
  };

  const navItems = [
    { id:"Overview", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { id:"Call Logs", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 10.93 19.79 19.79 0 01.88 2.3 2 2 0 012.87.1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6z"/></svg> },
    { id:"Bookings", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { id:"AI Settings", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  ];

  const Sidebar = () => (
    <aside style={{ width:240, background:"#fff", borderRight:"1px solid #f0f0f0", display:"flex", flexDirection:"column", flexShrink:0, height:"100vh", position:"sticky", top:0, overflowY:"auto" }}>
      <div style={{ padding:"1.25rem 1.25rem 0", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:34, height:34, background:O, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <span style={{ fontWeight:800, fontSize:"1rem" }}>Pump Time <span style={{ color:O }}>AI</span></span>
      </div>

      {isDemo && (
        <div style={{ margin:"1rem 0.75rem 0", background:"#fff8f5", border:`1px solid rgba(232,69,10,.25)`, borderRadius:10, padding:"0.75rem 0.9rem", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:O, flexShrink:0 }} />
          <span style={{ fontSize:"0.72rem", fontWeight:700, color:O }}>DEMO MODE</span>
        </div>
      )}

      <nav style={{ padding:"1.25rem 0.75rem", flex:1 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setTab(item.id); setSelectedCall(null); setSidebarOpen(false); }}
            style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"0.7rem 0.75rem", borderRadius:10, border:"none", cursor:"pointer", textAlign:"left", fontFamily:"inherit", fontSize:"0.88rem", fontWeight:tab === item.id ? 700 : 500, background:tab === item.id ? "#fff5f0" : "transparent", color:tab === item.id ? O : "#6b7280", marginBottom:2 }}>
            <span style={{ color:tab === item.id ? O : "#9ca3af" }}>{item.icon}</span>{item.id}
          </button>
        ))}
      </nav>

      <div style={{ margin:"0 0.75rem 0.75rem", background:NAVY, borderRadius:12, padding:"1.25rem" }}>
        <div style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Current Plan</div>
        <div style={{ fontWeight:800, color:"#fff", fontSize:"0.9rem", marginBottom:12 }}>{isDemo ? "Demo — $0" : "The Pumper Plan · $197/mo"}</div>
        <button onClick={() => setShowUpgrade(true)} style={{ width:"100%", background:O, color:"#fff", border:"none", padding:"0.6rem", borderRadius:8, fontWeight:700, fontSize:"0.82rem", cursor:"pointer", fontFamily:"inherit" }}>
          {isDemo ? "Upgrade to Live →" : "Manage Plan"}
        </button>
      </div>

      <button onClick={() => setShowUpgrade(true)} style={{ display:"flex", alignItems:"center", gap:8, margin:"0 0.75rem 1.25rem", padding:"0.6rem 0.75rem", borderRadius:8, border:"none", background:"transparent", cursor:"pointer", color:"#9ca3af", fontSize:"0.82rem", fontFamily:"inherit" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        {isDemo ? "Exit Demo & Pay" : "Sign Out"}
      </button>
    </aside>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f9fafb", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} company={company} />}
      {showTestCall && <TestCallModal onClose={() => setShowTestCall(false)} company={company} onCallComplete={handleCallComplete} />}

      {sidebarOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex" }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)" }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position:"relative", zIndex:201, width:240 }}><Sidebar /></div>
        </div>
      )}
      <div id="desktop-sidebar-visible" style={{ display:"flex" }}><Sidebar /></div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

        {/* Success banner */}
        {successBanner && (
          <div style={{ background:"#dcfce7", borderBottom:"1px solid #bbf7d0", padding:"0.75rem 1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ color:"#16a34a", fontWeight:600, fontSize:"0.9rem" }}>🎉 Payment successful! Your AI receptionist is now live.</span>
            <button onClick={() => setSuccessBanner(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#16a34a", fontSize:"1.1rem" }}>✕</button>
          </div>
        )}

        {/* Demo banner */}
        {isDemo && (
          <div style={{ background:`linear-gradient(90deg, ${NAVY}, #162040)`, padding:"0.65rem 1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
            <span style={{ color:"rgba(255,255,255,0.8)", fontSize:"0.82rem" }}>👋 You&apos;re in demo mode. Try the AI call and SMS tools below, then go live.</span>
            <button onClick={() => setShowUpgrade(true)} style={{ background:O, color:"#fff", border:"none", padding:"0.4rem 1rem", borderRadius:7, fontWeight:700, fontSize:"0.78rem", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              Go Live Now →
            </button>
          </div>
        )}

        <header style={{ background:"#fff", borderBottom:"1px solid #f0f0f0", padding:"0 1.5rem", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"none" }} id="mobile-menu-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span style={{ fontWeight:600, color:"#1a1a1a", fontSize:"0.95rem" }}>{tab}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:"0.82rem", fontWeight:600, color:"#1a1a1a", lineHeight:1.2 }}>{userName}</div>
              <div style={{ fontSize:"0.72rem", color:"#9ca3af" }}>{company}</div>
            </div>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"#fff5f0", border:`2px solid ${O}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.82rem", color:O }}>{initials}</div>
          </div>
        </header>

        <main style={{ flex:1, padding:"clamp(1rem,3vw,2rem)", overflowY:"auto" }}>

          {/* ── OVERVIEW ── */}
          {tab === "Overview" && (
            <div>
              <h1 style={{ margin:"0 0 0.3rem", fontSize:"clamp(1.4rem,3vw,1.75rem)", fontWeight:800, color:"#1a1a1a" }}>Welcome, {userName.split(" ")[0]}</h1>
              <p style={{ margin:"0 0 1.75rem", color:"#6b7280", fontSize:"0.88rem" }}>Here&apos;s how Pump Time AI is performing for {company}.</p>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, marginBottom:"1.5rem" }}>
                {[
                  { label:"Total Calls Handled", value:stats.calls, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 10.93z"/></svg>, bg:"#fff5f0" },
                  { label:"Jobs Booked", value:stats.booked, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, bg:"#f0fdf4" },
                  { label:"Revenue Generated", value:stats.revenue, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>, bg:"#eff6ff" },
                  { label:"Hours Saved", value:stats.hours + "h", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, bg:"#fff5f0" },
                ].map(s => (
                  <div key={s.label} style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, padding:"1.5rem" }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>{s.icon}</div>
                    <div style={{ fontSize:"0.75rem", color:"#9ca3af", marginBottom:4 }}>{s.label}</div>
                    <div style={{ fontSize:"clamp(1.4rem,3vw,1.75rem)", fontWeight:800, color:"#1a1a1a", letterSpacing:"-0.02em" }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:16, marginBottom:"1.5rem", alignItems:"start" }}>
                <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, padding:"1.5rem", minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem", flexWrap:"wrap", gap:8 }}>
                    <h2 style={{ margin:0, fontSize:"1rem", fontWeight:700 }}>Call Volume</h2>
                    <select value={chartPeriod} onChange={e => setChartPeriod(e.target.value)} style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"0.3rem 0.6rem", fontSize:"0.82rem", color:"#444", outline:"none", background:"#fff" }}>
                      <option>Last 7 Days</option><option>Last 30 Days</option><option>Last 90 Days</option>
                    </select>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={CHART_DATA}>
                      <defs>
                        <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={O} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={O} stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize:12, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize:12, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{ border:"1px solid #f0f0f0", borderRadius:8, fontSize:"0.82rem" }}/>
                      <Area type="monotone" dataKey="calls" stroke={O} strokeWidth={2.5} fill="url(#callGrad)"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Test AI Agent card */}
                <div style={{ background:`linear-gradient(135deg,${O},#c93508)`, borderRadius:14, padding:"1.75rem", width:"clamp(220px,25vw,260px)", flexShrink:0, color:"#fff" }}>
                  <h3 style={{ margin:"0 0 0.4rem", fontWeight:800, fontSize:"1.05rem" }}>Hear Your AI Agent</h3>
                  <p style={{ margin:"0 0 1.25rem", fontSize:"0.82rem", opacity:0.88, lineHeight:1.65 }}>We&apos;ll call you right now so you hear exactly what your customers hear.</p>
                  <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"0.9rem", marginBottom:"1.25rem" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80" }}/>
                      <span style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.08em" }}>AI AGENT ONLINE</span>
                    </div>
                    <p style={{ margin:0, fontSize:"0.78rem", lineHeight:1.6, opacity:0.9 }}>
                      &ldquo;Hello! Thanks for calling {company}. Press 1 to book, 2 for pricing…&rdquo;
                    </p>
                  </div>
                  <button onClick={() => setShowTestCall(true)}
                    style={{ width:"100%", background:"#fff", color:O, border:"none", padding:"0.78rem", borderRadius:10, fontWeight:700, fontSize:"0.9rem", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    📞 Call Me Now
                  </button>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:16, alignItems:"start" }}>
                <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, padding:"1.5rem", minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
                    <h2 style={{ margin:0, fontSize:"1rem", fontWeight:700 }}>Recent Call Activity</h2>
                    <button onClick={() => setTab("Call Logs")} style={{ background:"none", border:"none", color:O, fontSize:"0.82rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>View All</button>
                  </div>
                  {calls.slice(0,4).map((call, i) => (
                    <div key={call.id} onClick={() => { setTab("Call Logs"); setSelectedCall(call); }}
                      style={{ display:"flex", alignItems:"center", gap:14, padding:"0.85rem 0", borderBottom:i < 3 ? "1px solid #f9fafb" : "none", cursor:"pointer" }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:call.status==="Booked"?"#dcfce7":call.status==="Missed"?"#fee2e2":"#fef9c3", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {call.status==="Booked"
                          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          : call.status==="Missed"
                          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, color:"#1a1a1a", fontSize:"0.9rem" }}>{call.from}</div>
                        <div style={{ color:"#9ca3af", fontSize:"0.75rem", marginTop:2 }}>{call.timeAgo} · {call.duration}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ ...statusStyle(call.status), padding:"0.2rem 0.65rem", borderRadius:99, fontSize:"0.72rem", fontWeight:600, marginBottom:3, display:"inline-block" }}>{call.status}</div>
                        <div style={{ fontSize:"0.72rem", color:"#9ca3af" }}>{call.outcome}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, padding:"1.5rem", width:"clamp(200px,22vw,240px)", flexShrink:0 }}>
                  <h2 style={{ margin:"0 0 1rem", fontSize:"1rem", fontWeight:700 }}>Quick Actions</h2>
                  {[
                    { label:"Call Me (AI Demo)", icon:"📞", action:() => setShowTestCall(true) },
                    { label:"Send Test SMS", icon:"✉️", action:() => setTab("AI Settings") },
                    { label:"Upgrade to Live", icon:"⚡", action:() => setShowUpgrade(true) },
                    { label:"View Call Logs", icon:"📋", action:() => setTab("Call Logs") },
                    { label:"AI Settings", icon:"⚙️", action:() => setTab("AI Settings") },
                  ].map(a => (
                    <button key={a.label} onClick={a.action}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"0.7rem 0", borderBottom:"1px solid #f9fafb", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left", marginBottom:2 }}>
                      <span style={{ display:"flex", alignItems:"center", gap:10, fontSize:"0.88rem", color:"#444", fontWeight:500 }}>
                        <span>{a.icon}</span>{a.label}
                      </span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CALL LOGS ── */}
          {tab === "Call Logs" && (
            <div>
              <h1 style={{ margin:"0 0 1.5rem", fontSize:"clamp(1.4rem,3vw,1.75rem)", fontWeight:800, color:"#1a1a1a" }}>Call Logs</h1>
              {selectedCall ? (
                <div>
                  <button onClick={() => setSelectedCall(null)} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", color:"#444", padding:"0.5rem 1rem", borderRadius:8, cursor:"pointer", marginBottom:"1.5rem", fontFamily:"inherit", fontSize:"0.85rem" }}>← Back</button>
                  <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, padding:"2rem" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:20, marginBottom:"1.5rem" }}>
                      {[["From",selectedCall.from],["Duration",selectedCall.duration],["Status",selectedCall.status],["Outcome",selectedCall.outcome],["Date",selectedCall.date]].map(([k,v]) => (
                        <div key={k}><div style={{ fontSize:"0.72rem", color:"#9ca3af", marginBottom:4 }}>{k}</div><div style={{ fontWeight:700, color:"#1a1a1a", fontSize:"0.9rem" }}>{v}</div></div>
                      ))}
                    </div>
                    <div style={{ marginBottom:"1.5rem" }}>
                      <div style={{ fontSize:"0.72rem", color:O, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:8 }}>AI Summary</div>
                      <p style={{ margin:0, color:"#444", lineHeight:1.75, fontSize:"0.9rem", background:"#fafafa", borderRadius:8, padding:"1rem" }}>{selectedCall.summary}</p>
                    </div>
                    <div>
                      <div style={{ fontSize:"0.72rem", color:O, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:8 }}>Transcript</div>
                      <pre style={{ margin:0, color:"#444", lineHeight:1.8, fontSize:"0.85rem", background:"#fafafa", borderRadius:8, padding:"1rem", whiteSpace:"pre-wrap", fontFamily:"inherit" }}>{selectedCall.transcript}</pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display:"flex", gap:12, marginBottom:"1rem", flexWrap:"wrap" }}>
                    <button onClick={() => setShowTestCall(true)} style={{ display:"flex", alignItems:"center", gap:8, background:O, color:"#fff", border:"none", padding:"0.6rem 1.25rem", borderRadius:9, fontWeight:700, fontSize:"0.85rem", cursor:"pointer", fontFamily:"inherit" }}>
                      📞 Place AI Demo Call
                    </button>
                  </div>
                  <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, overflow:"hidden" }}>
                    <div style={{ padding:"1rem 1.5rem", borderBottom:"1px solid #f0f0f0", display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                      <div style={{ flex:1, minWidth:200, position:"relative" }}>
                        <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input placeholder="Search by phone or status…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                          style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"0.55rem 0.75rem 0.55rem 2rem", fontSize:"0.88rem", outline:"none", boxSizing:"border-box" }}/>
                      </div>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:600 }}>
                        <thead>
                          <tr style={{ background:"#f9fafb" }}>
                            {["CALLER","DATE & TIME","DURATION","STATUS","OUTCOME",""].map(h => (
                              <th key={h} style={{ padding:"0.75rem 1.5rem", textAlign:"left", fontSize:"0.72rem", fontWeight:700, color:"#9ca3af", letterSpacing:"0.05em", borderBottom:"1px solid #f0f0f0" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCalls.map((call, i) => (
                            <tr key={call.id} style={{ borderBottom: i < filteredCalls.length-1 ? "1px solid #f9fafb" : "none" }}>
                              <td style={{ padding:"1rem 1.5rem", fontWeight:700, color:"#1a1a1a", fontSize:"0.9rem" }}>{call.from}</td>
                              <td style={{ padding:"1rem 1.5rem" }}>
                                <div style={{ fontSize:"0.88rem", color:"#1a1a1a" }}>{call.date}</div>
                                <div style={{ fontSize:"0.75rem", color:"#9ca3af" }}>{call.timeAgo}</div>
                              </td>
                              <td style={{ padding:"1rem 1.5rem", fontSize:"0.88rem", color:"#444" }}>{call.duration}</td>
                              <td style={{ padding:"1rem 1.5rem" }}>
                                <span style={{ ...statusStyle(call.status), padding:"0.25rem 0.75rem", borderRadius:99, fontSize:"0.78rem", fontWeight:600 }}>{call.status}</span>
                              </td>
                              <td style={{ padding:"1rem 1.5rem", fontSize:"0.88rem", color:"#444" }}>{call.outcome}</td>
                              <td style={{ padding:"1rem 1.5rem" }}>
                                <button onClick={() => setSelectedCall(call)} style={{ background:"none", border:"none", cursor:"pointer", color:O, fontSize:"0.8rem", fontWeight:600, fontFamily:"inherit" }}>View →</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {tab === "Bookings" && (
            <div>
              <h1 style={{ margin:"0 0 1.5rem", fontSize:"clamp(1.4rem,3vw,1.75rem)", fontWeight:800 }}>Bookings</h1>
              <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, padding:"4rem 2rem", textAlign:"center" }}>
                <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>📅</div>
                <h2 style={{ margin:"0 0 0.5rem", fontSize:"1.2rem", fontWeight:700 }}>Your Bookings Appear Here</h2>
                <p style={{ margin:"0 0 1.5rem", color:"#9ca3af", fontSize:"0.9rem", maxWidth:400, marginLeft:"auto", marginRight:"auto" }}>When real customers call and the AI books them in, every job appears in this tab with all details.</p>
                <button onClick={() => setShowUpgrade(true)} style={{ background:O, color:"#fff", border:"none", padding:"0.85rem 2rem", borderRadius:10, fontWeight:700, fontSize:"0.95rem", cursor:"pointer", fontFamily:"inherit" }}>Activate Live AI →</button>
              </div>
            </div>
          )}

          {/* ── AI SETTINGS ── */}
          {tab === "AI Settings" && (
            <div>
              <h1 style={{ margin:"0 0 1.5rem", fontSize:"clamp(1.4rem,3vw,1.75rem)", fontWeight:800 }}>AI Settings</h1>
              <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:700 }}>

                {/* AI Config */}
                <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, padding:"1.75rem" }}>
                  <h2 style={{ margin:"0 0 0.35rem", fontSize:"1rem", fontWeight:700 }}>AI Agent Configuration</h2>
                  <p style={{ margin:"0 0 1.5rem", color:"#9ca3af", fontSize:"0.85rem" }}>Customize how your AI receptionist interacts with callers.</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:"0.9rem" }}>AI Voice</div>
                        <div style={{ fontSize:"0.82rem", color:"#9ca3af", marginTop:3 }}>Voice profile for your agent</div>
                      </div>
                      <select value={aiVoice} onChange={e => setAiVoice(e.target.value)} style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"0.5rem 0.9rem", fontSize:"0.88rem", outline:"none", background:"#fff", minWidth:160 }}>
                        <option>Professional Female</option><option>Professional Male</option><option>Friendly Female</option><option>Friendly Male</option>
                      </select>
                    </div>
                    {([["Auto-Booking","AI books jobs directly into your calendar",autoBooking,setAutoBooking],["SMS Confirmations","Send automatic SMS after booking",smsConfirm,setSmsConfirm]] as const).map(([label,desc,val,setter]) => (
                      <div key={String(label)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:"0.9rem" }}>{label}</div>
                          <div style={{ fontSize:"0.82rem", color:"#9ca3af", marginTop:3 }}>{desc}</div>
                        </div>
                        <button onClick={() => (setter as (v:boolean)=>void)(!val)}
                          style={{ width:48, height:26, borderRadius:99, border:"none", cursor:"pointer", background:val?O:"#e5e7eb", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                          <div style={{ width:20, height:20, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:val?25:3, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
                        </button>
                      </div>
                    ))}
                    <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                      <button onClick={() => setShowTestCall(true)} style={{ background:NAVY, color:"#fff", border:"none", padding:"0.7rem 1.5rem", borderRadius:10, fontWeight:700, fontSize:"0.9rem", cursor:"pointer", fontFamily:"inherit" }}>📞 Test AI Call</button>
                      <button style={{ background:O, color:"#fff", border:"none", padding:"0.7rem 1.5rem", borderRadius:10, fontWeight:700, fontSize:"0.9rem", cursor:"pointer", fontFamily:"inherit" }}>Save Changes</button>
                    </div>
                  </div>
                </div>

                {/* SMS Test */}
                <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, padding:"1.75rem" }}>
                  <h2 style={{ margin:"0 0 0.35rem", fontSize:"1rem", fontWeight:700 }}>Send a Real Test SMS</h2>
                  <p style={{ margin:"0 0 1.5rem", color:"#9ca3af", fontSize:"0.85rem" }}>Enter any phone number and we&apos;ll send an actual SMS via Twilio right now.</p>

                  <div style={{ display:"flex", gap:8, marginBottom:"1.25rem", flexWrap:"wrap" }}>
                    {["Booking Confirmation","Status Update","Reminder"].map(t => (
                      <button key={t} onClick={() => setSmsType(t)}
                        style={{ padding:"0.4rem 0.9rem", borderRadius:8, border:`1.5px solid ${smsType===t?O:"#e5e7eb"}`, background:smsType===t?"#fff5f0":"#fff", color:smsType===t?O:"#444", fontSize:"0.82rem", fontWeight:smsType===t?600:400, cursor:"pointer", fontFamily:"inherit" }}>
                        {t}
                      </button>
                    ))}
                  </div>

                  <div style={{ background:"#fafafa", borderRadius:10, padding:"0.85rem 1rem", marginBottom:"1.25rem", fontSize:"0.85rem", color:"#555", lineHeight:1.65, borderLeft:`3px solid ${O}` }}>
                    <strong style={{ color:O }}>Preview:</strong>{" "}
                    {smsType==="Booking Confirmation" && `Your concrete pump booking with ${company} is confirmed! We'll see you at the scheduled time. Reply STOP to opt-out.`}
                    {smsType==="Status Update" && `Update from ${company}: Your job is on schedule. Our team is ready for your pour. Reply STOP to opt-out.`}
                    {smsType==="Reminder" && `Reminder from ${company}: Your concrete pour is scheduled for tomorrow. Please confirm your site is ready. Reply STOP to opt-out.`}
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12, alignItems:"end" }}>
                    <div>
                      <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:"#374151", marginBottom:6 }}>Phone Number to Text</label>
                      <input value={smsPhone} onChange={e => setSmsPhone(e.target.value)} placeholder="+1 (555) 000-0000"
                        style={{ width:"100%", border:`1.5px solid ${smsResult?.ok===false?"#fca5a5":"#e5e7eb"}`, borderRadius:8, padding:"0.7rem 0.9rem", fontSize:"0.9rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                        onKeyDown={e => e.key==="Enter" && sendTestSMS()} />
                    </div>
                    <button onClick={sendTestSMS} disabled={smsSending || !smsPhone}
                      style={{ background:O, color:"#fff", border:"none", padding:"0.7rem 1.5rem", borderRadius:10, fontWeight:700, fontSize:"0.9rem", cursor:smsPhone&&!smsSending?"pointer":"not-allowed", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8, opacity:smsPhone&&!smsSending?1:0.6, whiteSpace:"nowrap" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      {smsSending ? "Sending…" : "Send SMS"}
                    </button>
                  </div>

                  {smsResult && (
                    <div style={{ marginTop:12, padding:"0.7rem 1rem", borderRadius:9, background:smsResult.ok?"#dcfce7":"#fee2e2", color:smsResult.ok?"#16a34a":"#dc2626", fontSize:"0.87rem", fontWeight:600 }}>
                      {smsResult.msg}
                      {!smsResult.ok && <span style={{ fontWeight:400, display:"block", marginTop:4, fontSize:"0.78rem" }}>Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER in Railway → Variables.</span>}
                    </div>
                  )}
                </div>

                {/* Company Profile */}
                <div style={{ background:"#fff", border:"1px solid #f0f0f0", borderRadius:14, padding:"1.75rem" }}>
                  <h2 style={{ margin:"0 0 1.5rem", fontSize:"1rem", fontWeight:700 }}>Company Profile</h2>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <div>
                      <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:"#374151", marginBottom:6 }}>Company Name</label>
                      <input value={company} onChange={e => setCompany(e.target.value)}
                        style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"0.65rem 0.9rem", fontSize:"0.88rem", outline:"none", boxSizing:"border-box" }}/>
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:"0.78rem", fontWeight:600, color:"#374151", marginBottom:6 }}>Business Phone</label>
                      <input defaultValue="+18444911467"
                        style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"0.65rem 0.9rem", fontSize:"0.88rem", outline:"none", boxSizing:"border-box" }}/>
                    </div>
                  </div>
                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:16 }}>
                    <button style={{ background:O, color:"#fff", border:"none", padding:"0.7rem 1.5rem", borderRadius:10, fontWeight:700, fontSize:"0.9rem", cursor:"pointer", fontFamily:"inherit" }}>Save Profile</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        #desktop-sidebar-visible { display: flex; }
        #mobile-menu-btn { display: none !important; }
        @media (max-width: 900px) {
          #desktop-sidebar-visible { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"Inter,sans-serif", color:"#9ca3af", fontSize:"0.9rem" }}>Loading…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
