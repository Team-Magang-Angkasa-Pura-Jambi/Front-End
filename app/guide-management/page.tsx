import { GuideManagementPage } from "@/modules/GuideManagement/components/GuideManagementPage";
import { AuthLayouts } from "@/common/layout";
import { RoleGuard } from "@/common/guards/RoleGuard";


export default function Page() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
        <GuideManagementPage />;
      </RoleGuard>
    </AuthLayouts>
  )
}
