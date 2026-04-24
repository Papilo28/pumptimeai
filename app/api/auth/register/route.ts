import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createBrevoContact } from "@/lib/brevo";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const stripeReady =
  STRIPE_KEY.startsWith("sk_test_") || STRIPE_KEY.startsWith("sk_live_");

const stripe = stripeReady
  ? new Stripe(STRIPE_KEY, { apiVersion: "2024-12-18.acacia" })
  : null;

const PRICES: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || "",
  pro:     process.env.STRIPE_PRICE_PRO     || "",
  agency:  process.env.STRIPE_PRICE_AGENCY  || "",
};

function buildCookieResponse(
  payload: object,
  email: string,
  name: string,
  plan: string,
  customerId?: string
) {
  const res = NextResponse.json(payload);
  const cookieOpts = { httpOnly: true, maxAge: 86400 * 7, path: "/" };
  res.cookies.set("userEmail", email, cookieOpts);
  res.cookies.set("userName", name, cookieOpts);
  res.cookies.set("userPlan", plan, cookieOpts);
  if (customerId) res.cookies.set("customerId", customerId, cookieOpts);
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, plan = "demo", company, phone } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email required" },
        { status: 400 }
      );
    }

    // ── Always create Brevo contact immediately (fire & forget) ──
    createBrevoContact({
      email,
      name,
      phone,
      company,
      plan,
      source: "pumptimeai.com signup",
    }).catch(err => console.error("Brevo async error:", err));

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://app.pumptimeai.com";

    // ── No Stripe configured or demo plan: go straight to dashboard ──
    if (!stripeReady || !stripe) {
      console.log(`Register (no Stripe): ${email}, plan=${plan}, company=${company}`);
      return buildCookieResponse(
        { success: true, redirectUrl: `/dashboard` },
        email, name, plan
      );
    }

    // ── Stripe configured: create customer ──
    let customerId = "";
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { plan, company: company || "", phone: phone || "" },
      });
      customerId = customer.id;
    } catch (stripeErr) {
      console.error("Stripe customer create failed, proceeding without:", stripeErr);
      return buildCookieResponse(
        { success: true, redirectUrl: `/dashboard` },
        email, name, plan
      );
    }

    const priceId = PRICES[plan];

    // No price mapped for this plan (e.g. "demo") — go to dashboard
    if (!priceId) {
      return buildCookieResponse(
        { success: true, redirectUrl: `/dashboard` },
        email, name, plan, customerId
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url:  `${appUrl}/signup?cancelled=true`,
      metadata: { plan, email, company: company || "" },
    });

    return buildCookieResponse(
      { checkoutUrl: session.url },
      email, name, plan, customerId
    );

  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 500 }
    );
  }
}
