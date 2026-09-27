import React from "react";
import "./globals.css";

export const metadata = {
  title: "Nila Clinic - Skin & Hair Care Center",
  description: "Premier Skin & Hair Care Clinic offering Dermatological Treatments, Hydra Facials, Keratin Hair Restoration & Laser Hair Care.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
