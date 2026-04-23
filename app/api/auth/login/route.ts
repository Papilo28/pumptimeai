import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const existingEmail = req.cookies.get("userEmail")?.value;
    if (existingEmail === email) {
      return NextResponse.json({ success: true });
    }

    // For demo: accept any login and set session
    const res = NextResponse.json({ success: true });
    res.cookies.set("userEmail", email, { httpOnly: true, maxAge: 86400 * 7, path: "/" });
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
