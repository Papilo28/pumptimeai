"use client";
import { useState } from "react";
import Link from "next/link";

const O = "#E8450A";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',-apple-system,sans-serif", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: "1.5rem" }}>
            <div style={{ width: 34, height: 34, background: O, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1a1a1a" }}>Pump Time <span style={{ color: O }}>AI</span></span>
          </Link>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#1a1a1a" }}>Welcome Back</h1>
          <p style={{ margin: "0.5rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>Sign in to your dashboard</p>
        </div>
        <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 18, padding: "2rem", display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "0.7rem 1rem", color: "#dc2626", fontSize: "0.85rem" }}>{error}</div>}
          {([["email","Email","email"],["password","Password","password"]] as [string,string,string][]).map(([f,l,t]) => (
            <div key={f}>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", color: "#1a1a1a", marginBottom: 6 }}>{l}</label>
              <input type={t} required value={(form as Record<string,string>)[f]} onChange={e => setForm({ ...form, [f]: e.target.value })}
                style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "0.75rem 1rem", fontSize: "0.95rem", outline: "none", color: "#1a1a1a", boxSizing: "border-box" }} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ background: O, color: "#fff", border: "none", padding: "0.9rem", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", marginTop: 4 }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1.25rem", color: "#9ca3af", fontSize: "0.85rem" }}>
          No account? <Link href="/" style={{ color: O, fontWeight: 600 }}>Book a demo</Link>
        </p>
      </div>
    </div>
  );
}
