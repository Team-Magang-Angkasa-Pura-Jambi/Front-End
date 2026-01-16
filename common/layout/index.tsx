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
  Crosshair, // Icon baru untuk dekorasi
} from "lucide-react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import React, { useMemo, useState } from "react";

// ... (Variants code TETAP SAMA) ...
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

// ... (allLinks TETAP SAMA) ...
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

// KOMPONEN DEKORASI BARU (Tech Tattoos)
const TechDecorations = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
      {/* 1. Grid Background (Base Texture) - Sudah ada sebelumnya, diperhalus */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15] dark:opacity-[0.1]" />

      {/* 2. Top Right HUD Block (Status Indikator) */}
      <div className="absolute right-0 top-0 p-8 opacity-40">
        <div className="flex flex-col items-end gap-1">
          <div className="bg-primary/40 h-1 w-16 rounded-full" />
          <div className="flex items-center gap-2">
            <span className="text-primary/60 font-mono text-[9px] uppercase tracking-[0.2em]">
              Sys.Online
            </span>
            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
          </div>
        </div>
        {/* Corner Bracket */}
        <div className="border-primary/20 absolute right-6 top-6 h-16 w-16 rounded-tr-xl border-r-2 border-t-2" />
      </div>

      {/* 3. Bottom Left Coordinates (Aviation Style) */}
      <div className="absolute bottom-8 left-8 opacity-30">
        <div className="flex flex-col gap-1">
          <div className="text-muted-foreground flex items-center gap-2 font-mono text-[10px]">
            <Crosshair className="text-primary/50 h-3 w-3" />
            <span>COORD: 01.62.S // 103.50.E</span>
          </div>
          <div className="from-primary/30 h-[1px] w-32 bg-gradient-to-r to-transparent" />
        </div>
      </div>

      {/* 4. Center/Large Circle (Abstract Radar) - Sangat Tipis */}
      <div className="border-primary/5 pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-50" />
      <div className="border-primary/10 pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-[spin_60s_linear_infinite] rounded-full border border-dashed opacity-30" />

      {/* 5. Decorative "Data Lines" di sisi kanan bawah */}
      <div className="absolute bottom-20 right-0 flex flex-col gap-2 opacity-20">
        <div className="bg-foreground/20 h-[2px] w-12" />
        <div className="bg-foreground/20 h-[2px] w-8" />
        <div className="bg-foreground/20 h-[2px] w-16" />
      </div>
    </div>
  );
};

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
          className="bg-background/80 fixed inset-0 z-[999] flex flex-col items-center justify-center backdrop-blur-sm"
        >
          <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
          <p className="text-muted-foreground mt-4 text-sm font-medium">
            Memuat Sesi...
          </p>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div
      className={cn(
        "bg-background flex h-screen w-full flex-col overflow-hidden md:flex-row"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="bg-card border-border justify-between gap-5 border-r">
          <div className="flex flex-1 flex-col overflow-hidden overflow-y-auto">
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

          <div className="flex flex-col gap-4">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Button
                onClick={handleLogout}
                variant="ghost"
                className={cn(
                  "text-muted-foreground hover:text-destructive hover:bg-destructive/10 group w-full justify-start transition-all duration-200"
                )}
              >
                <LogOut className="text-muted-foreground group-hover:text-destructive mr-2 h-5 w-5 shrink-0 transition-colors" />
                <span className={cn("font-medium", !open && "hidden")}>
                  Logout
                </span>
              </Button>
            </motion.div>

            <motion.div
              className={cn(
                "border-border text-muted-foreground flex flex-col border-t pt-4 text-[10px] transition-all duration-300",
                !open ? "h-0 overflow-hidden opacity-0" : "px-2 opacity-100"
              )}
            >
              <p className="text-foreground text-[9px] font-bold uppercase tracking-wider">
                Sultan Thaha Jambi
              </p>
              <p className="mt-0.5 font-medium">
                © {new Date().getFullYear()} Angkasa Pura Indonesia
              </p>
              <p className="mt-2 opacity-70">
                Developed by{" "}
                <span className="text-primary font-semibold">
                  Qulls Project
                </span>
              </p>
            </motion.div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content Area */}
      <main className="relative flex-1 overflow-y-auto p-4 md:p-8">
        {/* --- DEKORASI 'TECH TATTOOS' DISINI --- */}
        <TechDecorations />

        {/* Konten Utama (z-10 agar di atas dekorasi) */}
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
};
