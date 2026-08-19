import { RoleGuard } from "@/common/guards/RoleGuard";
import { AuthLayouts } from "@/common/layout";
import { ServerMonitoringPage } from "@/modules/ServerMonitoring/components/ServerMonitoringPage";

export default function ServerMonitoring() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <ServerMonitoringPage />
      </RoleGuard>
    </AuthLayouts>
  );
}
