"use client";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./components/logo";
import { Button } from "@/components/ui/button";
import {
  BadgeDollarSign,
  ClipboardList,
  Database,
  LayoutDashboard,
  LogOut,
  SquarePen,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

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

export const AuthLayouts = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Enter Data",
      href: "/enter-data",
      icon: <SquarePen className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Recap Data",
      href: "/recap-data",
      icon: <ClipboardList className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Data Master",
      href: "/data-master",
      icon: <Database className="h-5 w-5 shrink-0" />,
    },

    {
      label: "User Management",
      href: "/user-management",
      icon: <Users className="h-5 w-5 shrink-0" />,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden rounded-md border md:flex-row"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-hidden">
            <Logo />
            <motion.div
              className="mt-8 flex flex-col gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {links.map((link) => {
                // PENYEMPURNAAN: Logika isActive yang lebih cerdas
                // Untuk href "/", harus sama persis. Untuk yang lain, cek apakah path dimulai dengan href tersebut.
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
