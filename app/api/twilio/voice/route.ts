import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get("From") as string || "Unknown";
  const callSid = formData.get("CallSid") as string || "";

  console.log(`Incoming call from ${from}, SID: ${callSid}`);

  const host = req.headers.get("host") || "";
  const statusUrl = `https://${host}/api/twilio/status`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    Hello! Thank you for calling. I am the AI assistant for this business.
    I can help you schedule an appointment today.
    Please tell me your name, the best time to meet, and what the appointment is regarding.
  </Say>
  <Record maxLength="120" action="${statusUrl}" transcribeCallback="${statusUrl}" playBeep="false" />
  <Say voice="Polly.Joanna">
    Thank you for your message. We will review it and confirm your appointment shortly. Goodbye!
  </Say>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function GET() {
  return NextResponse.json({ status: "Twilio voice webhook active" });
}
