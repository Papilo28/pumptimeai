import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    const { to, company } = await req.json();
    if (!to) return NextResponse.json({ error: "Phone number required" }, { status: 400 });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const from       = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      console.error("Twilio env vars missing:", {
        accountSid: !!accountSid,
        authToken:  !!authToken,
        from:       !!from,
      });
      return NextResponse.json(
        { error: "Twilio credentials not configured in Railway environment variables" },
        { status: 500 }
      );
    }

    const host     = req.headers.get("host") || "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const twimlUrl = `${protocol}://${host}/api/twilio/twiml-demo?company=${encodeURIComponent(company || "your business")}`;
    const statusUrl = `${protocol}://${host}/api/twilio/status`;

    const client = twilio(accountSid.trim(), authToken.trim());

    const call = await client.calls.create({
      to:             to.trim(),
      from:           from.trim(),
      url:            twimlUrl,
      statusCallback: statusUrl,
      statusCallbackMethod: "POST",
    });

    return NextResponse.json({ success: true, sid: call.sid, status: call.status });

  } catch (err: unknown) {
    console.error("Twilio call error:", err);
    const message = err instanceof Error ? err.message : "Failed to place call";
    const code = (err as { code?: number }).code;
    return NextResponse.json({ error: message, code }, { status: 500 });
  }
}
