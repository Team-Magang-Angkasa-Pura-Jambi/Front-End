"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MenuService } from "@/modules/MenuManagement/services/menu.service";
import { MaintenancePage } from "./MaintenancePage";

export const MenuGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const menus = await MenuService.getAll();
        
        // Flatten menus to check routes
        const allMenus = menus.flatMap(group => [group, ...(group.children || [])]);
        
        const currentMenu = allMenus.find(m => m.route === pathname);
        
        if (currentMenu && currentMenu.status === "MAINTENANCE") {
          setIsMaintenance(true);
        } else {
          setIsMaintenance(false);
        }
      } catch (error) {
        console.error("Failed to fetch menu status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
};
