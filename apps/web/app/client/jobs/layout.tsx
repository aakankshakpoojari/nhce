import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Client-only marketplace management area. Freelancers and signed-out visitors
// are blocked at the route level — ProtectedRoute renders the auth/role gate
// instead of the page content. Navigation is provided by the portal's
// ClientNavbar (see app/client/layout.tsx), which highlights the active tab.
export default function ClientJobsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["CLIENT"]}>{children}</ProtectedRoute>;
}
