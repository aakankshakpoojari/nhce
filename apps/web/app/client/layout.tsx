import CustomCursor from "@/components/animations/CustomCursor";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col selection:bg-moss selection:text-background font-sans">
      <CustomCursor />
      <ProtectedRoute requiredRole="CLIENT">
        {children}
      </ProtectedRoute>
    </div>
  );
}
