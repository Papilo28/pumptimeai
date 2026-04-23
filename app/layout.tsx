import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Pump Time AI — Never Miss a Concrete Pour Again",
  description: "The AI receptionist built for concrete pumping businesses.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter',-apple-system,sans-serif" }}>{children}</body>
    </html>
  );
}
