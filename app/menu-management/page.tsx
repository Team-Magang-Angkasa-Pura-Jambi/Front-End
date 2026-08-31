import { Metadata } from "next";
import { MenuManagementPage } from "@/modules/MenuManagement/components/MenuManagementPage";

export const metadata: Metadata = {
  title: "Manajemen Menu - Sentinel",
  description: "Atur konfigurasi dan status navigasi menu sistem.",
};

import { AuthLayouts } from "@/common/layout";
import { RoleGuard } from "@/common/guards/RoleGuard";

export default function Page() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <MenuManagementPage />
      </RoleGuard>
    </AuthLayouts>
  );
}
