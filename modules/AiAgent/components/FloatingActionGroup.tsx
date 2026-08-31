"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, HelpCircle, MessageSquarePlus, X, Bug } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { ChatWidget } from "./ChatWidget";

export const FloatingActionGroup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeWidget, setActiveWidget] = useState<"chat" | null>(null);

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      setActiveWidget(null); // close widgets if menu closes
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Render Active Widget */}
      <AnimatePresence>
        {activeWidget === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 origin-bottom-right"
          >
            <ChatWidget onClose={() => setActiveWidget(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="flex flex-col-reverse items-center gap-3">
        {/* Main Toggle Button */}
        <Button
          onClick={toggleMenu}
          size="icon"
          className={`h-12 w-12 rounded-full shadow-lg transition-transform duration-300 ${
            isOpen ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground rotate-90" : "bg-primary hover:bg-primary/90 hover:scale-105"
          }`}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
        </Button>

        {/* Sub Buttons */}
        <AnimatePresence>
          {isOpen && !activeWidget && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="flex flex-col-reverse gap-3 overflow-hidden pb-1"
            >
              {/* Chat Button */}
              <div className="flex items-center justify-end gap-3 group">
                <span className="bg-background/90 backdrop-blur-md text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-200">
                  Sentinel AI Chat
                </span>
                <Button
                  onClick={() => setActiveWidget("chat")}
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <MessageSquarePlus className="h-5 w-5" />
                </Button>
              </div>

              {/* Bug Report Button */}
              <div className="flex items-center justify-end gap-3 group">
                <span className="bg-background/90 backdrop-blur-md text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-200">
                  Lapor Bug
                </span>
                <Button
                  size="icon"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-bug-report'))}
                  className="h-10 w-10 rounded-full shadow-md bg-background border border-border/50 text-foreground hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                >
                  <Bug className="h-4 w-4" />
                </Button>
              </div>

              {/* Help Button */}
              <div className="flex items-center justify-end gap-3 group">
                <span className="bg-background/90 backdrop-blur-md text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-200">
                  Pusat Bantuan
                </span>
                <Button
                  size="icon"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-page-guide'))}
                  className="h-10 w-10 rounded-full shadow-md bg-background border border-border/50 text-foreground hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
