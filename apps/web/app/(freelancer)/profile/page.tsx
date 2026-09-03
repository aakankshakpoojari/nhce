import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileView from "@/components/profile/ProfileView";

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["FREELANCER"]}>
      <ProfileView />
    </ProtectedRoute>
  );
}
