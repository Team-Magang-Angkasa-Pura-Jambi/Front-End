import { RoleGuard } from "@/common/guards/RoleGuard";
import { AuthLayouts } from "@/common/layout";
import { AiLogsPage } from "@/modules/AiLogs/components/AiLogsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log AI Copilot | Sentinel V2",
  description: "Monitor aktivitas dan riwayat penggunaan AI Copilot",
};

export default function AiLogs() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
        <AiLogsPage />
      </RoleGuard>
    </AuthLayouts>
  );
}
