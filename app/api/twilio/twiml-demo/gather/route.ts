import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company") || "your business";
  const formData = await req.formData();
  const digit = formData.get("Digits") as string || "";

  let twiml = `<?xml version="1.0" encoding="UTF-8"?><Response>`;

  if (digit === "1") {
    twiml += `
  <Say voice="Polly.Joanna" language="en-US">
    Great! Let's get that booked. I'll need a few quick details. What's the pour size in cubic yards, and what's the site address?
  </Say>
  <Pause length="1"/>
  <Say voice="Polly.Joanna" language="en-US">
    In the real version, I would gather all your job details right now and book it straight into your calendar — no hold music, no callbacks. That's Pump Time A-I. Visit pump-time-ai dot com to get started. Goodbye!
  </Say>`;
  } else if (digit === "2") {
    twiml += `
  <Say voice="Polly.Joanna" language="en-US">
    Our plans start at ninety seven dollars per month for one to two truck operations, and one hundred and ninety seven dollars per month for unlimited AI calls and growing fleets.
  </Say>
  <Pause length="1"/>
  <Say voice="Polly.Joanna" language="en-US">
    I'll text you our full pricing sheet right now. Visit pump-time-ai dot com to sign up and activate your AI receptionist. Goodbye!
  </Say>`;
  } else if (digit === "3") {
    twiml += `
  <Say voice="Polly.Joanna" language="en-US">
    No problem. Please leave your name and the best callback number after the tone. We'll have someone from ${company} reach out within the hour.
  </Say>
  <Pause length="1"/>
  <Say voice="Polly.Joanna" language="en-US">
    In the live version, this message would be transcribed by AI and added to your lead dashboard automatically. Thanks for calling Pump Time A-I. Goodbye!
  </Say>`;
  } else {
    twiml += `
  <Say voice="Polly.Joanna" language="en-US">
    Thanks for experiencing Pump Time A-I. Your business could have this working on every inbound call within minutes of signing up. Visit pump-time-ai dot com to get started. Goodbye!
  </Say>`;
  }

  twiml += `</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
