import { RoleGuard } from "@/common/guards/RoleGuard";
import { AuthLayouts } from "@/common/layout";
import MasterDataPage from "@/modules/masterData";

export default function EnterData() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SuperAdmin"]}>
        <MasterDataPage />
      </RoleGuard>
    </AuthLayouts>
  );
}
