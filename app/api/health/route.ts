import { NextResponse } from "next/server";

// Railway health check endpoint
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
