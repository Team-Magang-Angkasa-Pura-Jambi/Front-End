"use client";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./components/logo";
import { Button } from "@/components/ui/button";
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
import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo, useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

enum Role {
  Technician = "Technician",
  Admin = "Admin",
  SuperAdmin = "SuperAdmin",
}

const allLinks = [
  {
    label: "Dasbor",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-sky-500" />,
    allowedRoles: [Role.Technician, Role.Admin, Role.SuperAdmin],
  },
  {
    label: "Input Data",
    href: "/enter-data",
    icon: <FilePenLine className="h-5 w-5 shrink-0 text-green-500" />,
    allowedRoles: [Role.Technician, Role.Admin, Role.SuperAdmin],
  },
  {
    label: "Data Konsumsi",
    href: "/recap-data",
    icon: <BarChart3 className="h-5 w-5 shrink-0 text-violet-500" />,
    allowedRoles: [Role.Admin, Role.SuperAdmin, Role.Technician],
  },
  {
    label: "Data Pembacaan",
    href: "/recap-reading",
    icon: <BookText className="h-5 w-5 shrink-0 text-orange-500" />,
    allowedRoles: [Role.Admin, Role.SuperAdmin, Role.Technician],
  },
  {
    label: "Data Master",
    href: "/data-master",
    icon: <Database className="h-5 w-5 shrink-0 text-rose-500" />,
    allowedRoles: [Role.SuperAdmin, Role.Admin],
  },
  {
    label: "Akun Saya",
    href: "/profile",
    icon: <CircleUserRound className="h-5 w-5 shrink-0 text-blue-500" />,
    allowedRoles: [Role.SuperAdmin, Role.Admin, Role.Technician],
  },
  {
    label: "Manajemen Pengguna",
    href: "/user-management",
    icon: <Users className="h-5 w-5 shrink-0 text-teal-500" />,
    allowedRoles: [Role.SuperAdmin],
  },
  {
    label: "Anggaran",
    href: "/budget",
    icon: <Wallet className="h-5 w-5 shrink-0 text-emerald-500" />,
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
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Memuat Sesi...
          </p>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div
      className={cn(
        "flex h-screen w-full flex-col overflow-hidden rounded-md border bg-background md:flex-row"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 ">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-hidden">
            <Logo />
            <motion.div
              className="mt-8 flex flex-col gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* LANGKAH 3: Gunakan link yang sudah difilter */}
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
                    <SidebarLink link={link} isActive={isActive} open={open} />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start mt-2"
            >
              <LogOut className="h-5 w-5 shrink-0 mr-2" />
              <span className={cn("font-medium", !open && "hidden")}>
                Logout
              </span>
            </Button>
          </motion.div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
};
