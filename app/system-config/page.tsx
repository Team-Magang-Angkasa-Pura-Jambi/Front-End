import { RoleGuard } from "@/common/guards/RoleGuard";
import { AuthLayouts } from "@/common/layout";
import { SystemConfigPage } from "@/modules/SystemConfig/components/SystemConfigPage";

export default function SystemConfig() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <SystemConfigPage />
      </RoleGuard>
    </AuthLayouts>
  );
}
