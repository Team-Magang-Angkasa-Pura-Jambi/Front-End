import { AuthLayouts } from "@/common/layout";
import Dashboard from "@/modules";
import Image from "next/image";

export default function Home() {
  return (
    <AuthLayouts>
      <Dashboard />;
    </AuthLayouts>
  );
}
