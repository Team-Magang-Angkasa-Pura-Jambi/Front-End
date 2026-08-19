import { RoleGuard } from "@/common/guards/RoleGuard";
import { AuthLayouts } from "@/common/layout";
import { BugReportManagementPage } from "@/modules/BugReport/components/BugReportManagementPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laporan Bug & Pengaduan Developer | Sentinel V2",
  description: "Manajemen laporan bug dan pengaduan teknis Sentinel V2",
};

export default function Page() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <div className="container mx-auto px-4 py-8 md:px-6">
          <BugReportManagementPage />
        </div>
      </RoleGuard>
    </AuthLayouts>
  );
}
