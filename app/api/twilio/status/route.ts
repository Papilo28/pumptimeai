import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { callStore, leadStore } from "@/lib/store";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "placeholder");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const callSid = formData.get("CallSid") as string || "";
    const callStatus = formData.get("CallStatus") as string || "";
    const from = formData.get("From") as string || "Unknown";
    const duration = parseInt(formData.get("CallDuration") as string || "0");
    const transcriptionText = formData.get("TranscriptionText") as string || "";

    console.log(`Call ${callSid}: status=${callStatus}, duration=${duration}s`);

    if (callStatus === "completed" || transcriptionText) {
      let summary = `Call from ${from}, lasted ${duration} seconds.`;
      let outcome = duration > 20 ? "callback" : "no_answer";
      let leadName = "";
      let leadEmail = "";
      let sentiment = "neutral";

      if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== "placeholder") {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = `You are an AI appointment booking assistant. Analyze this call and respond ONLY with valid JSON, no markdown:
{
  "summary": "1-2 sentence summary",
  "outcome": "booked or callback or no_answer or not_interested or information_only",
  "sentiment": "positive or neutral or negative",
  "lead_name": "caller name if mentioned or empty string",
  "lead_email": "email if mentioned or empty string"
}

Call from: ${from}
Duration: ${duration} seconds
Transcript: ${transcriptionText || "Not available"}`;

          const result = await model.generateContent(prompt);
          const text = result.response.text().replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(text);
          summary = parsed.summary || summary;
          outcome = parsed.outcome || outcome;
          sentiment = parsed.sentiment || sentiment;
          leadName = parsed.lead_name || "";
          leadEmail = parsed.lead_email || "";
        } catch (aiErr) {
          console.error("Gemini error:", aiErr);
        }
      }

      const callId = `call_${Date.now()}_${callSid.slice(-6)}`;
      callStore.push({
        id: callId,
        userId: "default",
        from,
        duration,
        status: callStatus,
        summary,
        transcript: transcriptionText || undefined,
        outcome,
        sentiment,
        createdAt: new Date().toISOString(),
      });

      if (outcome === "booked" || leadName || duration > 20) {
        leadStore.push({
          id: `lead_${Date.now()}`,
          userId: "default",
          name: leadName || from,
          email: leadEmail || undefined,
          phone: from,
          status: outcome === "booked" ? "booked" : "new",
          notes: summary,
          createdAt: new Date().toISOString(),
        });
      }

      console.log(`Saved call ${callId}, outcome: ${outcome}`);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Status callback error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}
