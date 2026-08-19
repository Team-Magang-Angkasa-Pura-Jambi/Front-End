import { RoleGuard } from "@/common/guards/RoleGuard";
import { AuthLayouts } from "@/common/layout";
import { CalculationTemplatesPage } from "@/modules/CalculationTemplates/components/CalculationTemplatesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formula & Kalkulasi Engine | Sentinel V2",
  description: "Pusat konfigurasi rumus matematika dan kalkulasi otomatis energi",
};

export default function Page() {
  return (
    <AuthLayouts>
      <RoleGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
        <div className="container mx-auto px-4 py-8 md:px-6">
          <CalculationTemplatesPage />
        </div>
      </RoleGuard>
    </AuthLayouts>
  );
}
