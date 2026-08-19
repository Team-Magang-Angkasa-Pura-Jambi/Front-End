import { AuthLayouts } from "@/common/layout";
import Dashboard from "@/modules/Dashboard";

export default function Home() {
  return (
    <AuthLayouts>
      <Dashboard />;
    </AuthLayouts>
  );
}
