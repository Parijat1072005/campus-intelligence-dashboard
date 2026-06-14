import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusIQ — Unified Campus Intelligence",
  description:
    "One AI-powered dashboard for library, cafeteria, events, and academics.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-campus-bg text-campus-text font-body antialiased">
        {children}
      </body>
    </html>
  );
}
