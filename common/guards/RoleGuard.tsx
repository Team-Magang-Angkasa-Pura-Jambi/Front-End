// common/guards/RoleGuard.tsx
"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Role = "Technician" | "Admin" | "SuperAdmin";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    if (!allowedRoles.includes(user.role as Role)) {
      router.replace("/403");
    }
  }, [user, allowedRoles, router]);

  if (!user) return null;

  if (!allowedRoles.includes(user.role as Role)) {
    return null;
  }

  return <>{children};</>;
}
