"use client";
import { Button } from "@/common/components/ui/button";
import { MenuGuard } from "@/common/components/MenuGuard";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/common/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Activity,
  BarChart3,
  BookText,
  Bug,
  Calculator,
  CircleUserRound,
  Crosshair,
  Database,
  FilePenLine,
  HelpCircle,
  LayoutDashboard,
  LayoutList,
  LayoutTemplate,
  LogOut,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { UniversalPageGuideModal } from "@/common/components/UniversalPageGuideModal";
import { Logo } from "./components/logo";

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
  Technician = "TECHNICIAN",
  Admin = "ADMIN",
  SuperAdmin = "SUPER_ADMIN",
}

// ─── Menu Groups ─────────────────────────────────────────────
interface MenuLink {
  label: string;
  href: string;
  icon: React.JSX.Element;
  allowedRoles: Role[];
}

interface MenuGroup {
  groupLabel: string;
  items: MenuLink[];
}

const menuGroups: MenuGroup[] = [
  {
    groupLabel: "Utama",
    items: [
      {
        label: "Dasbor",
        href: "/dashboard",
        icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.Technician, Role.Admin, Role.SuperAdmin],
      },
      {
        label: "Input Data",
        href: "/enter-data",
        icon: <FilePenLine className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.Technician, Role.Admin, Role.SuperAdmin],
      },
    ],
  },
  {
    groupLabel: "Riwayat",
    items: [
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
    ],
  },
  {
    groupLabel: "Manajemen",
    items: [
      {
        label: "Data Master",
        href: "/data-master",
        icon: <Database className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.SuperAdmin, Role.Admin],
      },
      {
        label: "Formula & Kalkulasi",
        href: "/calculation-templates",
        icon: <Calculator className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.SuperAdmin, Role.Admin],
      },
      {
        label: "Anggaran",
        href: "/budget",
        icon: <Wallet className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.SuperAdmin, Role.Admin],
      },
    ],
  },
  {
    groupLabel: "Pengaturan",
    items: [
      {
        label: "Konfigurasi Dashboard",
        href: "/dashboard-config",
        icon: <LayoutTemplate className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.SuperAdmin],
      },
      {
        label: "Konfigurasi Sistem",
        href: "/system-config",
        icon: <SlidersHorizontal className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.SuperAdmin],
      },
      {
        label: "Manajemen Menu",
        href: "/menu-management",
        icon: <LayoutList className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.SuperAdmin],
      },
      {
        label: "Panduan Sistem",
        href: "/guide-management",
        icon: <BookText className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.SuperAdmin],
      },
    ],
  },
  {
    groupLabel: "Monitoring",
    items: [
      {
        label: "Monitoring Server",
        href: "/server-monitoring",
        icon: <Activity className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.SuperAdmin]
      },
      {
        label: "Log Audit Sistem",
        href: "/audit-logs",
        icon: <ShieldCheck className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.SuperAdmin],
      },
      {
        label: "Pengaduan Bug & Error",
        href: "/bug-reports",
        icon: <Bug className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.SuperAdmin],
      },
    ],
  },
  {
    groupLabel: "Akun",
    items: [
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
        label: "Pusat Bantuan & FAQ",
        href: "/faq",
        icon: <HelpCircle className="h-5 w-5 shrink-0" />,
        allowedRoles: [Role.SuperAdmin, Role.Admin, Role.Technician],
      },
    ],
  },
];

// ─── Search Input ────────────────────────────────────────────
const SidebarSearch = ({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}) => {
  const { open } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="px-1 pb-1"
    >
      <div className="group relative flex items-center">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari menu..."
          className={cn(
            "h-8 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-7 text-xs text-slate-700 outline-none",
            "placeholder:text-slate-400",
            "transition-all duration-200",
            "focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20",
            "dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:placeholder:text-slate-500",
            "dark:focus:border-emerald-600 dark:focus:bg-slate-800 dark:focus:ring-emerald-500/10"
          )}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onClear}
              className="absolute right-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition-colors hover:bg-red-100 hover:text-red-500 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            >
              <X className="h-2.5 w-2.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Group Label ─────────────────────────────────────────────
const GroupLabel = ({ label }: { label: string }) => {
  const { open } = useSidebar();

  if (!open) {
    return (
      <div className="mx-auto my-2 h-[1px] w-5 rounded-full bg-slate-200 dark:bg-slate-700" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-1 mt-4 flex items-center gap-2 px-3 first:mt-0"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" />
    </motion.div>
  );
};


// KOMPONEN DEKORASI BARU (Tech Tattoos)
const TechDecorations = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15] dark:opacity-[0.1]" />

      <div className="absolute top-0 right-0 p-8 opacity-40">
        <div className="flex flex-col items-end gap-1">
          <div className="bg-primary/40 h-1 w-16 rounded-full" />
          <div className="flex items-center gap-2">
            <span className="text-primary/60 font-mono text-[9px] tracking-[0.2em] uppercase">
              Sys.Online
            </span>
            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
          </div>
        </div>

        <div className="border-primary/20 absolute top-6 right-6 h-16 w-16 rounded-tr-xl border-t-2 border-r-2" />
      </div>

      <div className="absolute bottom-8 left-8 opacity-30">
        <div className="flex flex-col gap-1">
          <div className="text-muted-foreground flex items-center gap-2 font-mono text-[10px]">
            <Crosshair className="text-primary/50 h-3 w-3" />
            <span>COORD: 01.62.S // 103.50.E</span>
          </div>
          <div className="from-primary/30 h-[1px] w-32 bg-gradient-to-r to-transparent" />
        </div>
      </div>

      <div className="border-primary/5 pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-50" />
      <div className="border-primary/10 pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-[spin_60s_linear_infinite] rounded-full border border-dashed opacity-30" />

      <div className="absolute right-0 bottom-20 flex flex-col gap-2 opacity-20">
        <div className="bg-foreground/20 h-[2px] w-12" />
        <div className="bg-foreground/20 h-[2px] w-8" />
        <div className="bg-foreground/20 h-[2px] w-16" />
      </div>
    </div>
  );
};

export const AuthLayouts = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter groups by role and search query
  const filteredGroups = useMemo(() => {
    if (!isMounted || !user?.role) return [];

    const role = user.role as Role;
    const query = searchQuery.toLowerCase().trim();

    return menuGroups
      .map((group) => {
        const roleFiltered = group.items.filter((item) =>
          item.allowedRoles.includes(role)
        );

        const searchFiltered = query
          ? roleFiltered.filter(
            (item) =>
              item.label.toLowerCase().includes(query) ||
              item.href.toLowerCase().includes(query) ||
              group.groupLabel.toLowerCase().includes(query)
          )
          : roleFiltered;

        return { ...group, items: searchFiltered };
      })
      .filter((group) => group.items.length > 0);
  }, [user?.role, isMounted, searchQuery]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  // Clear search when sidebar closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={cn("bg-background flex h-screen w-full flex-col overflow-hidden md:flex-row")}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="bg-card border-border justify-between gap-0 border-r">
          {/* Fixed Header: Logo */}
          <div className="shrink-0 pb-2">
            <Logo />
          </div>

          {/* Scrollable Menu Area */}
          <div className={cn(
            "flex min-h-0 flex-1 flex-col overflow-x-hidden",
            open ? "overflow-y-auto" : "overflow-y-hidden"
          )}>
            {/* Search Input */}
            <div className="shrink-0 pt-1">
              <AnimatePresence>
                <SidebarSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery("")}
                />
              </AnimatePresence>
            </div>

            {/* Grouped Menu */}
            <motion.div
              className="mt-2 flex flex-col gap-0 pb-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredGroups.length === 0 && searchQuery ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-2 px-3 py-8 text-center"
                >
                  <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    Menu &quot;{searchQuery}&quot; tidak ditemukan
                  </p>
                </motion.div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.groupLabel}>
                    <GroupLabel label={group.groupLabel} />
                    {group.items.map((link) => {
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
                  </div>
                ))
              )}
            </motion.div>
          </div>

          <div className="flex flex-col gap-4">
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className={cn(
                  "text-muted-foreground hover:text-destructive hover:bg-destructive/10 group w-full justify-start transition-all duration-200"
                )}
              >
                <LogOut className="text-muted-foreground group-hover:text-destructive mr-2 h-5 w-5 shrink-0 transition-colors" />
                <span className={cn("font-medium", !open && "hidden")}>Logout</span>
              </Button>
            </motion.div>

            <motion.div
              className={cn(
                "border-border text-muted-foreground flex flex-col border-t pt-4 text-[10px] transition-all duration-300",
                !open ? "h-0 overflow-hidden opacity-0" : "px-2 opacity-100"
              )}
            >
              <p className="text-foreground text-[9px] font-bold tracking-wider uppercase">
                Sultan Thaha Jambi
              </p>
              <p className="mt-0.5 font-medium">
                © {new Date().getFullYear()} Angkasa Pura Indonesia
              </p>
              <p className="mt-2 opacity-70">
                Developed by <span className="text-primary font-semibold">Qulls Project</span>
              </p>
            </motion.div>
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="relative flex-1 overflow-y-auto p-4">
        <TechDecorations />
        <div className="relative z-10"><MenuGuard>{children}</MenuGuard></div>
        <UniversalPageGuideModal />
      </main>
    </div>
  );
};
