import { NextRequest, NextResponse } from "next/server";
import { callStore, leadStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  const email = req.cookies.get("userEmail")?.value || "";
  const name = req.cookies.get("userName")?.value || email.split("@")[0] || "User";
  const plan = req.cookies.get("userPlan")?.value || "starter";

  const calls = callStore.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const leads = leadStore.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const booked = calls.filter(c => c.outcome === "booked").length;
  const avgDur = calls.length > 0 ? Math.round(calls.reduce((s, c) => s + (c.duration || 0), 0) / calls.length) : 0;

  return NextResponse.json({
    user: { name, email, plan, subscriptionStatus: "active" },
    stats: { totalCalls: calls.length, totalLeads: leads.length, bookedAppointments: booked, avgDuration: avgDur },
    calls,
    leads,
  });
}
