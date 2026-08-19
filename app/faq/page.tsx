import { AuthLayouts } from "@/common/layout";
import { FAQPage } from "@/modules/FAQ/components/FAQPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pusat Bantuan & FAQ | Sentinel V2",
  description: "Dokumentasi dan panduan lengkap seluruh sistem Sentinel V2",
};

export default function Page() {
  return (
    <AuthLayouts>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <FAQPage />
      </div>
    </AuthLayouts>
  );
}
