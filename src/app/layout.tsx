import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PatioPing · New pool permit alerts for pool service companies",
  description:
    "Every new pool permit in your zip codes, in your inbox at 7 AM, with a simple pipeline to turn them into service accounts.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://patioping.com"),
  openGraph: { images: ["/brand/patioping-logo.png"] },
};

export const viewport: Viewport = { themeColor: "#0b3b66" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
