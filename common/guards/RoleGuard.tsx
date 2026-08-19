// common/guards/RoleGuard.tsx
"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "SUPER_ADMIN" | "ADMIN" | "TECHNICIAN";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!user) return;

    if (!allowedRoles.includes(user.role as Role)) {
      router.replace("/403");
    }
  }, [user, allowedRoles, router, isMounted]);

  // Prevent flash before hydration
  if (!isMounted) return null;

  // Not logged in — middleware will handle redirect, just render nothing
  if (!user) return null;

  // Wrong role — redirect in progress
  if (!allowedRoles.includes(user.role as Role)) return null;

  return <>{children}</>;
}
