import { RoleGuard } from "@/common/guards/RoleGuard";
import { AuthLayouts } from "@/common/layout";
import UserManagementPage from "@/modules/UserManagement";

export default function UserManagement() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SuperAdmin" ]}>
        <UserManagementPage />
      </RoleGuard>
    </AuthLayouts>
  );
}
