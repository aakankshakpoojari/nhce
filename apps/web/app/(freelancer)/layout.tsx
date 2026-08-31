import CustomCursor from "@/components/animations/CustomCursor";
import Navbar from "@/components/navigation/Navbar";
import { RoleProvider } from "@/contexts/RoleContext";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="min-h-screen bg-[var(--color-charcoal)] text-[var(--color-off-white)] selection:bg-[#84CC16] selection:text-[#101312] font-sans">
        <CustomCursor />
        <Navbar />
        <main className="min-h-screen pt-24 px-8 mx-auto max-w-[1400px]">
          {children}
        </main>
      </div>
    </RoleProvider>
  );
}
