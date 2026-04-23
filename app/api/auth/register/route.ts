import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-12-18.acacia",
});

const PRICES: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || "",
  pro: process.env.STRIPE_PRICE_PRO || "",
  agency: process.env.STRIPE_PRICE_AGENCY || "",
};

export async function POST(req: NextRequest) {
  try {
    const { name, email, plan = "starter" } = await req.json();
    if (!name || !email) return NextResponse.json({ error: "Name and email required" }, { status: 400 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const customer = await stripe.customers.create({ email, name, metadata: { plan } });
    const priceId = PRICES[plan];

    const res = NextResponse.json({ success: true, redirectUrl: "/dashboard" });
    res.cookies.set("userEmail", email, { httpOnly: true, maxAge: 86400 * 7, path: "/" });
    res.cookies.set("userName", name, { httpOnly: true, maxAge: 86400 * 7, path: "/" });
    res.cookies.set("userPlan", plan, { httpOnly: true, maxAge: 86400 * 7, path: "/" });
    res.cookies.set("customerId", customer.id, { httpOnly: true, maxAge: 86400 * 7, path: "/" });

    if (!priceId) return res;

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/signup?cancelled=true`,
      metadata: { plan, email },
    });

    const resWithCheckout = NextResponse.json({ checkoutUrl: session.url });
    resWithCheckout.cookies.set("userEmail", email, { httpOnly: true, maxAge: 86400 * 7, path: "/" });
    resWithCheckout.cookies.set("userName", name, { httpOnly: true, maxAge: 86400 * 7, path: "/" });
    resWithCheckout.cookies.set("userPlan", plan, { httpOnly: true, maxAge: 86400 * 7, path: "/" });
    resWithCheckout.cookies.set("customerId", customer.id, { httpOnly: true, maxAge: 86400 * 7, path: "/" });
    return resWithCheckout;

  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
