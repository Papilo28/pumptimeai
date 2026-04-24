import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pump Time AI — Never Miss a Concrete Pour Again",
  description: "The AI receptionist built for concrete pumping businesses. Answers every call, qualifies leads, and books jobs 24/7.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico",  sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Inline SVG favicon — works without a file upload */}
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23E8450A'/%3E%3Cpath d='M19 4L8 18h8l-3 10 13-14h-9l2-10z' fill='white'/%3E%3C/svg%3E"
        />
        <link rel="shortcut icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23E8450A'/%3E%3Cpath d='M19 4L8 18h8l-3 10 13-14h-9l2-10z' fill='white'/%3E%3C/svg%3E" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter',-apple-system,sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
