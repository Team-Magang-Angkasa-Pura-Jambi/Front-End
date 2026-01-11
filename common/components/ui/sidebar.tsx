"use client";
import React, { useState, createContext, useContext } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Link, { LinkProps } from "next/link";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile"; // 👈 Pastikan path ini benar

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
  isMobile: boolean; // 👈 Menambahkan isMobile ke Context
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

  // 1. Panggil Hook useIsMobile di sini
  const isMobile = useIsMobile();

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, isMobile }}>
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

export const SidebarBody = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
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
        "hidden h-full shrink-0 border-r border-slate-200 bg-white px-4 py-4 md:flex md:flex-col dark:border-slate-800 dark:bg-slate-950",
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
        <div className="absolute top-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.6)]" />
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
        "flex h-14 w-full flex-row items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950"
      )}
      {...props}
    >
      <div className="z-20 flex w-full justify-end">
        <IconMenu2
          className="cursor-pointer text-slate-700 dark:text-slate-200"
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
              "fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-white/95 p-10 backdrop-blur-sm dark:bg-slate-950/95",
              className
            )}
          >
            <div
              className="absolute top-10 right-10 z-50 cursor-pointer text-slate-800 transition-colors hover:text-red-500 dark:text-slate-200"
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

export const SidebarLink = ({
  link,
  className,
  isActive,
  ...rest
}: SidebarLinkProps &
  Omit<LinkProps, "href"> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  // 2. Ambil isMobile dari context
  const { open, setOpen, animate, isMobile } = useSidebar();

  return (
    <Link
      href={link.href}
      // 3. Tambahkan logic: Jika Mobile, tutup sidebar saat diklik
      onClick={() => {
        if (isMobile) {
          setOpen(false);
        }
      }}
      className={cn(
        "group/sidebar relative flex items-center justify-start gap-3 overflow-hidden rounded-md px-3 py-2.5",
        "mb-1 transition-all duration-300 ease-in-out",
        isActive
          ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200",
        className
      )}
      {...rest}
    >
      {isActive && (
        <motion.div
          layoutId="active-pill"
          className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "100%" }}
          transition={{ duration: 0.2 }}
        />
      )}

      <div
        className={cn(
          "flex h-6 w-6 flex-shrink-0 items-center justify-center transition-colors",
          isActive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-slate-500 group-hover/sidebar:text-slate-700 dark:text-slate-500 dark:group-hover/sidebar:text-slate-300"
        )}
      >
        {link.icon}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="!m-0 overflow-hidden !p-0 text-sm whitespace-pre transition duration-150 group-hover/sidebar:translate-x-1"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
