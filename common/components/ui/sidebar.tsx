"use client";
import React, { useState, createContext, useContext } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Link, { LinkProps } from "next/link";
import { cn } from "@/lib/utils"; // Pastikan path utils Anda benar
import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion";

// --- Types ---
interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarLinkProps {
  link: Links;
  className?: string;
  isActive?: boolean;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

// --- Context ---
const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// --- Provider ---
export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

// --- Main Components ---

export const Sidebar = (props: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return <SidebarProvider {...props}>{props.children}</SidebarProvider>;
};

// SidebarBody menerima props animasi, tapi memilahnya untuk child components
export const SidebarBody = (props: HTMLMotionProps<"div">) => {
  return (
    <>
      <DesktopSidebar {...props} />
      {/* MobileSidebar adalah div biasa, jadi kita filter props animasi 
         dengan casting ke HTMLAttributes agar TypeScript tidak error 
      */}
      <MobileSidebar {...(props as React.HTMLAttributes<HTMLDivElement>)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children?: React.ReactNode }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col bg-white dark:bg-slate-950 shrink-0 border-r border-slate-200 dark:border-slate-800",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "80px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {!open && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_2px_rgba(16,185,129,0.6)]" />
      )}
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-14 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 w-full"
      )}
      {...props}
    >
      <div className="flex justify-end z-20 w-full">
        <IconMenu2
          className="text-slate-700 dark:text-slate-200 cursor-pointer"
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed h-full w-full inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm p-10 z-[100] flex flex-col justify-between",
              className
            )}
          >
            <div
              className="absolute right-10 top-10 z-50 text-slate-800 dark:text-slate-200 cursor-pointer hover:text-red-500 transition-colors"
              onClick={() => setOpen(!open)}
            >
              <IconX />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Menggunakan LinkProps dari next/link untuk type safety yang lebih baik
export const SidebarLink = ({
  link,
  className,
  isActive,
  ...rest
}: SidebarLinkProps &
  Omit<LinkProps, "href"> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { open, animate } = useSidebar();

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2.5 px-3 rounded-md relative overflow-hidden",
        "transition-all duration-300 ease-in-out mb-1",
        isActive
          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200",
        className
      )}
      {...rest}
    >
      {isActive && (
        <motion.div
          layoutId="active-pill"
          className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "100%" }}
          transition={{ duration: 0.2 }}
        />
      )}

      <div
        className={cn(
          "h-6 w-6 flex-shrink-0 flex items-center justify-center transition-colors",
          isActive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-slate-500 dark:text-slate-500 group-hover/sidebar:text-slate-700 dark:group-hover/sidebar:text-slate-300"
        )}
      >
        {link.icon}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre !p-0 !m-0 overflow-hidden"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
