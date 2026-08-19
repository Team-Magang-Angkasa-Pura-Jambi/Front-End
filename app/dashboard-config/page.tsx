import { RoleGuard } from "@/common/guards/RoleGuard";
import { AuthLayouts } from "@/common/layout";
import { DashboardConfigPage } from "@/modules/DashboardConfig/components/DashboardConfigPage";

export default function DashboardConfig() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <DashboardConfigPage />
      </RoleGuard>
    </AuthLayouts>
  );
}
