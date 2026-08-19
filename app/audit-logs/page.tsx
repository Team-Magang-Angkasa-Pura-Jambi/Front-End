import { RoleGuard } from "@/common/guards/RoleGuard";
import { AuthLayouts } from "@/common/layout";
import { AuditLogPage } from "@/modules/AuditLog/components/AuditLogPage";

export default function AuditLogs() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <AuditLogPage />
      </RoleGuard>
    </AuthLayouts>
  );
}
