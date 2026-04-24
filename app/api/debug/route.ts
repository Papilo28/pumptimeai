import { NextResponse } from "next/server";

// Safe debug endpoint — masks actual values, only confirms presence/format
export async function GET() {
  const sid   = process.env.TWILIO_ACCOUNT_SID   || "";
  const token = process.env.TWILIO_AUTH_TOKEN     || "";
  const from  = process.env.TWILIO_PHONE_NUMBER   || "";
  const stripe = process.env.STRIPE_SECRET_KEY    || "";
  const brevo  = process.env.BREVO_API_KEY        || "";

  return NextResponse.json({
    twilio: {
      account_sid:  sid   ? `${sid.slice(0,4)}...${sid.slice(-4)}  (len:${sid.length}, startsAC:${sid.startsWith("AC")})` : "NOT SET",
      auth_token:   token ? `${token.slice(0,4)}...${token.slice(-4)} (len:${token.length})` : "NOT SET",
      phone_number: from  ? from : "NOT SET",
      has_spaces:   {
        sid:   sid   !== sid.trim(),
        token: token !== token.trim(),
        from:  from  !== from.trim(),
      },
    },
    stripe: {
      key: stripe ? `${stripe.slice(0,7)}... (len:${stripe.length})` : "NOT SET",
    },
    brevo: {
      key: brevo ? `${brevo.slice(0,6)}... (len:${brevo.length})` : "NOT SET",
      list_id: process.env.BREVO_LIST_ID || "NOT SET",
    },
    env: {
      app_url:  process.env.NEXT_PUBLIC_APP_URL  || "NOT SET",
      node_env: process.env.NODE_ENV             || "NOT SET",
    },
  });
}
