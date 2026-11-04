import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PatioPing: new pool, fence and patio permit leads for contractors",
    template: "%s | PatioPing",
  },
  applicationName: "PatioPing",
  description:
    "New pool, fence and patio permits in your zip codes, in your inbox at 7 AM, with a simple pipeline to turn them into customers.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://patioping.com"),
  openGraph: { type: "website", siteName: "PatioPing", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export const viewport: Viewport = { themeColor: "#e2eef5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${instrument.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
