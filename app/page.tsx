// The marketing landing page lives on Hostinger at pumptimeai.com.
// Anyone who hits app.pumptimeai.com directly gets redirected there.
// This redirect is also enforced in next.config.ts (permanent: false),
// but this server component acts as a safe fallback.

import { redirect } from "next/navigation";

export default function Home() {
  redirect(process.env.NEXT_PUBLIC_LANDING_URL || "https://pumptimeai.com");
}
