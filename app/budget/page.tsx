import { RoleGuard } from "@/common/guards/RoleGuard";
import { AuthLayouts } from "@/common/layout";
import AnnualBudgetPage from "@/modules/budget";

export default function EnterData() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
        <AnnualBudgetPage />
      </RoleGuard>
    </AuthLayouts>
  );
}
