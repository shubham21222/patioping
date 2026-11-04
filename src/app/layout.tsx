import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PatioPing — New pool & backyard permit alerts for contractors",
  description:
    "Daily alerts for new pool and backyard building permits in your area, with a built-in CRM to turn them into customers.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://patioping.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
