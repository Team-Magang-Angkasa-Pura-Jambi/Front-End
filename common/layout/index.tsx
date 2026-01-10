"use client";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/common/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./components/logo";
import { Button } from "@/common/components/ui/button";
import {
  BarChart3,
  BookText,
  CircleUserRound,
  Database,
  FilePenLine,
  Loader2,
  LayoutDashboard,
  LogOut,
  Users,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import React, { useMemo, useState } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.3 },
  },
};

enum Role {
  Technician = "Technician",
  Admin = "Admin",
  SuperAdmin = "SuperAdmin",
}

// PERBAIKAN 1: Hapus class warna (text-sky-500, dll).
// Biarkan icon netral, warna ditangani oleh logic SidebarLink & CSS Vars.
const allLinks = [
  {
    label: "Dasbor",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
    allowedRoles: [Role.Technician, Role.Admin, Role.SuperAdmin],
  },
  {
    label: "Input Data",
    href: "/enter-data",
    icon: <FilePenLine className="h-5 w-5 shrink-0" />,
    allowedRoles: [Role.Technician, Role.Admin, Role.SuperAdmin],
  },
  {
    label: "Riwayat Konsumsi",
    href: "/recap-data",
    icon: <BarChart3 className="h-5 w-5 shrink-0" />,
    allowedRoles: [Role.Admin, Role.SuperAdmin, Role.Technician],
  },
  {
    label: "Riwayat Pencatatan",
    href: "/recap-reading",
    icon: <BookText className="h-5 w-5 shrink-0" />,
    allowedRoles: [Role.Admin, Role.SuperAdmin, Role.Technician],
  },
  {
    label: "Data Master",
    href: "/data-master",
    icon: <Database className="h-5 w-5 shrink-0" />,
    allowedRoles: [Role.SuperAdmin, Role.Admin],
  },
  {
    label: "Akun Saya",
    href: "/profile",
    icon: <CircleUserRound className="h-5 w-5 shrink-0" />,
    allowedRoles: [Role.SuperAdmin, Role.Admin, Role.Technician],
  },
  {
    label: "Manajemen Pengguna",
    href: "/user-management",
    icon: <Users className="h-5 w-5 shrink-0" />,
    allowedRoles: [Role.SuperAdmin],
  },
  {
    label: "Anggaran",
    href: "/budget",
    icon: <Wallet className="h-5 w-5 shrink-0" />,
    allowedRoles: [Role.SuperAdmin, Role.Admin],
  },
];

export const AuthLayouts = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const visibleLinks = useMemo(() => {
    if (!user?.role) return [];
    return allLinks.filter((link) =>
      link.allowedRoles.includes(user.role as Role)
    );
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  if (!user) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          // Gunakan bg-background dan text-muted-foreground
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Memuat Sesi...
          </p>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div
      className={cn(
        // PERBAIKAN 2: Gunakan bg-background agar sesuai tema (Soft Slate)
        "flex h-screen w-full flex-col overflow-hidden bg-background md:flex-row"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody
          // Sidebar menggunakan bg-card agar sedikit kontras dengan bg-background
          className="justify-between gap-5 bg-card border-r border-border"
        >
          <div className="flex flex-1 flex-col overflow-y-auto overflow-hidden">
            <Logo />
            <motion.div
              className="mt-8 flex flex-col gap-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {visibleLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <motion.div
                    key={link.href}
                    variants={itemVariants}
                    className="relative"
                  >
                    <SidebarLink
                      key={link.href}
                      link={link}
                      isActive={isActive}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Section Bawah: Logout & Copyright */}
          <div className="flex flex-col gap-4">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Button
                onClick={handleLogout}
                variant="ghost"
                // PERBAIKAN 3: Tombol Logout yang "Sopan" (Subtle)
                // Default: Muted. Hover: Destructive (Merah)
                className={cn(
                  "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 group transition-all duration-200"
                )}
              >
                <LogOut className="h-5 w-5 shrink-0 mr-2 text-muted-foreground group-hover:text-destructive transition-colors" />
                <span className={cn("font-medium", !open && "hidden")}>
                  Logout
                </span>
              </Button>
            </motion.div>

            {/* FOOTER COPYRIGHT */}
            <motion.div
              className={cn(
                "flex flex-col border-t border-border pt-4 text-[10px] text-muted-foreground transition-all duration-300",
                !open ? "opacity-0 h-0 overflow-hidden" : "px-2 opacity-100"
              )}
            >
              <p className="font-bold text-foreground uppercase tracking-wider text-[9px]">
                Sultan Thaha Jambi
              </p>
              <p className="mt-0.5 font-medium">
                © {new Date().getFullYear()} Angkasa Pura Indonesia
              </p>
              <p className="mt-2 opacity-70">
                Developed by{" "}
                <span className="font-semibold text-primary">
                  Qulls Project
                </span>
              </p>
            </motion.div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* PERBAIKAN 4: Background Texture di Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {/* Grid halus menggunakan var(--border) dan opacity rendah */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.2]" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
};
