"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

// "My Applications" is a freelancer-only marketplace area. Clients and
// signed-out visitors are blocked at the route level (ProtectedRoute renders
// the auth/role gate instead of the page content).
export default function ApplicationsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["FREELANCER"]}>{children}</ProtectedRoute>;
}
