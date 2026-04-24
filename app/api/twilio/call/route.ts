import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { to, company } = await req.json();
    if (!to) return NextResponse.json({ error: "Phone number required" }, { status: 400 });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      return NextResponse.json({ error: "Twilio not configured" }, { status: 500 });
    }

    const host = req.headers.get("host") || "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const twimlUrl = `${protocol}://${host}/api/twilio/twiml-demo?company=${encodeURIComponent(company || "your business")}`;
    const statusUrl = `${protocol}://${host}/api/twilio/status`;

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: from,
          Url: twimlUrl,
          StatusCallback: statusUrl,
          StatusCallbackMethod: "POST",
        }).toString(),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, sid: data.sid, status: data.status });
    } else {
      console.error("Twilio call error:", data);
      return NextResponse.json({ error: data.message || "Failed to place call" }, { status: 400 });
    }
  } catch (err) {
    console.error("Call error:", err);
    return NextResponse.json({ error: "Failed to place call" }, { status: 500 });
  }
}
