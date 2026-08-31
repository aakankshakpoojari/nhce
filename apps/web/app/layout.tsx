import ParticleDrift from "@/components/ui/particle-drift";
import "./globals.css";

export const metadata = {
  title: "W3HIRE | Decentralized Web3 Talent & Escrow Protocol",
  description:
    "Next-generation Web3 freelance marketplace with smart contract escrows, instant settlements, and decentralized reputation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
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