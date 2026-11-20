import React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nilaclinic.vercel.app";

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nila Clinic - Skin & Hair Care Center",
    template: "%s | Nila Clinic",
  },
  description:
    "Premier Clinical Dermatology & Trichology Center in Tamil Nadu. Doctor-led US-FDA approved laser skin treatments, HydraFacials, PRP hair restoration, and clinical aesthetic care.",
  keywords: [
    "Nila Clinic",
    "Skin Clinic Theni",
    "Hair Clinic Madurai",
    "Dermatologist Theni",
    "Laser Hair Removal Chennai",
    "HydraFacial Tamil Nadu",
    "PRP Hair Treatment",
    "Acne Scar Removal",
    "Skin Whitening Clinic",
    "Dermatology & Cosmetology Center",
  ],
  authors: [{ name: "Nila Clinic Medical Team", url: siteUrl }],
  creator: "Nila Clinic",
  publisher: "Nila Clinic",
  applicationName: "Nila Clinic",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Nila Clinic - Skin & Hair Care Center",
    title: "Nila Clinic - Skin & Hair Care Center",
    description:
      "Premier Clinical Dermatology & Trichology Center in Tamil Nadu. Doctor-led US-FDA approved laser skin treatments, HydraFacials, PRP hair restoration, and clinical aesthetic care.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nila Clinic - Advanced Skin, Hair & Laser Aesthetic Care",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nila Clinic - Skin & Hair Care Center",
    description:
      "Premier Clinical Dermatology & Trichology Center in Tamil Nadu. Doctor-led US-FDA approved laser skin treatments, HydraFacials, PRP hair restoration.",
    images: ["/og-image.jpg"],
    creator: "@nilaclinic",
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Fallback Open Graph tags for legacy social crawlers */}
        <meta property="og:title" content="Nila Clinic - Skin & Hair Care Center" />
        <meta
          property="og:description"
          content="Premier Clinical Dermatology & Trichology Center in Tamil Nadu. Doctor-led US-FDA approved laser skin treatments, HydraFacials, PRP hair restoration, and clinical aesthetic care."
        />
        <meta property="og:image" content={`${siteUrl}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nila Clinic - Skin & Hair Care Center" />
        <meta
          name="twitter:description"
          content="Premier Clinical Dermatology & Trichology Center in Tamil Nadu. Doctor-led US-FDA approved laser skin treatments, HydraFacials, PRP hair restoration."
        />
        <meta name="twitter:image" content={`${siteUrl}/og-image.jpg`} />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
