import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ParticleDrift from "@/components/ui/particle-drift";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "W3HIRE | Decentralized Web3 Talent & Escrow Protocol",
  description:
    "Next-generation Web3 freelance marketplace with smart contract escrows, instant settlements, and decentralized reputation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="bg-[#101312] text-[#F5F5F4] antialiased min-h-screen relative selection:bg-[#84CC16] selection:text-[#101312]">
        {/* Universal Persistent Canvas Layer - Visible on ALL pages */}
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
          <ParticleDrift />
        </div>

        {/* Dynamic App Route Pages with transparent background */}
        <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
          {children}
        </div>
      </body>
    </html>
  );
}