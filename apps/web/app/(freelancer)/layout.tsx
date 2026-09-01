import CustomCursor from "@/components/animations/CustomCursor";
import Navbar from "@/components/navigation/Navbar";
import { ApplicationProvider } from "@/contexts/ApplicationContext";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col selection:bg-moss selection:text-background font-sans">
      <CustomCursor />
      <Navbar />
      <main className="min-h-screen pt-24 px-4 sm:px-8 mx-auto w-full max-w-full">
        <ApplicationProvider>
          {children}
        </ApplicationProvider>
      </main>
    </div>
  );
}
