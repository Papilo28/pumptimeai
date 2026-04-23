import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { to, type, company } = await req.json();
    if (!to) return NextResponse.json({ error: "Phone number required" }, { status: 400 });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      return NextResponse.json({ error: "Twilio credentials not configured" }, { status: 500 });
    }

    const messages: Record<string, string> = {
      "Booking Confirmation": `Your concrete pump booking with ${company || "Pump Time AI"} is confirmed! We'll see you at the scheduled time. Reply STOP to opt-out.`,
      "Status Update": `Update from ${company || "Pump Time AI"}: Your job is on schedule. Our team is ready for your pour. Reply STOP to opt-out.`,
      "Reminder": `Reminder from ${company || "Pump Time AI"}: Your concrete pour is scheduled for tomorrow. Please confirm your site is ready. Reply STOP to opt-out.`,
    };

    const body = messages[type] || `This is a test message from ${company || "Pump Time AI"}.`;

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, sid: data.sid });
    } else {
      return NextResponse.json({ error: data.message || "Failed to send SMS" }, { status: 400 });
    }
  } catch (err) {
    console.error("SMS error:", err);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
