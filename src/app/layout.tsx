import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kontraktor Hero — Jadi Superhero Bisnis Konstruksi",
  description:
    "Kursus bisnis konstruksi paling komprehensif di Indonesia. Kuasai RAB, cash flow, SOP, dan strategi scaling dari kontraktor ke developer properti.",
  keywords: [
    "kursus kontraktor",
    "bisnis konstruksi",
    "RAB bangunan",
    "kontraktor pemula",
    "developer properti",
    "kontraktor hero",
  ],
  openGraph: {
    title: "Kontraktor Hero — Jadi Superhero Bisnis Konstruksi",
    description:
      "Sistem teruji jadi kontraktor profitable. 6 modul + 80+ bonus template senilai Rp 3.4 juta. Sudah dipakai 500+ kontraktor.",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use sandbox URL for testing, production URL when MIDTRANS_IS_PRODUCTION=true
  const snapUrl = process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <Script
          src={snapUrl}
          data-client-key={clientKey}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

