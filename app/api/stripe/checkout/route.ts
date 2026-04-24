import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const stripeReady =
  STRIPE_KEY.startsWith("sk_test_") || STRIPE_KEY.startsWith("sk_live_");

const stripe = stripeReady
  ? new Stripe(STRIPE_KEY, { apiVersion: "2024-12-18.acacia" })
  : null;

const PRICES: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || "",
  pro: process.env.STRIPE_PRICE_PRO || "",
  agency: process.env.STRIPE_PRICE_AGENCY || "",
};

export async function POST(req: NextRequest) {
  try {
    if (!stripeReady || !stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const { plan, email, name } = await req.json();

    // Read email from cookie if not provided
    const cookieEmail = req.cookies.get("userEmail")?.value;
    const cookieName = req.cookies.get("userName")?.value;
    const customerId = req.cookies.get("customerId")?.value;

    const customerEmail = email || cookieEmail || "";
    const customerName = name || cookieName || "";

    const priceId = PRICES[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `No price configured for plan: ${plan}` },
        { status: 400 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://app.pumptimeai.com";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${appUrl}/dashboard?cancelled=true`,
      metadata: { plan, email: customerEmail },
    };

    // Use existing customer if available, otherwise create with email
    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    if (customerName && !customerId) {
      sessionParams.customer_creation = "always";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
