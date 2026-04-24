import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company") || "your business";

  const host = req.headers.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const gatherUrl = `${protocol}://${host}/api/twilio/twiml-demo/gather?company=${encodeURIComponent(company)}`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    Hello! Thanks for calling ${company}. This is your Pump Time A-I receptionist — I'm available 24 hours a day, 7 days a week, so your business never misses a job.
  </Say>
  <Pause length="1"/>
  <Say voice="Polly.Joanna" language="en-US">
    I can help you schedule a concrete pour, get a quote, or answer any questions about availability.
  </Say>
  <Pause length="1"/>
  <Gather numDigits="1" action="${gatherUrl}" timeout="6" method="POST">
    <Say voice="Polly.Joanna" language="en-US">
      Press 1 to book a pump. Press 2 for pricing. Press 3 to leave a message for the team.
    </Say>
  </Gather>
  <Say voice="Polly.Joanna" language="en-US">
    I didn't catch that. No problem — I'll have someone from ${company} call you back shortly. Thanks for calling Pump Time A-I. Goodbye!
  </Say>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
