import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileView from "@/components/profile/ProfileView";

export default function ClientProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["CLIENT"]}>
      <ProfileView />
    </ProtectedRoute>
  );
}
