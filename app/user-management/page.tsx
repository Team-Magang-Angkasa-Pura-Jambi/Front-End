import { AuthLayouts } from "@/common/layout";
import UserManagementPage from "@/modules/UserManagement";

export default function UserManagement() {
  return (
    <AuthLayouts>
      <UserManagementPage />
    </AuthLayouts>
  );
}
