"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Settings } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { masterDataGroups } from "../constants/data";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
};

const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function MasterDataPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <motion.div className="mb-8" initial="initial" animate="animate" variants={fadeInDown}>
        <h1 className="flex items-center text-3xl font-bold tracking-tight">
          <Settings className="text-primary mr-3 h-8 w-8" /> Manajemen Data Master
        </h1>
        <p className="text-muted-foreground mt-2">
          Pusat pengelolaan data inti aplikasi. Perubahan di sini akan memengaruhi seluruh sistem.
        </p>
      </motion.div>

      <Tabs defaultValue="asset-energy" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          {masterDataGroups.map((group) => (
            <TabsTrigger key={group.groupKey} value={group.groupKey}>
              <group.groupIcon className="mr-2 h-4 w-4" />
              {group.groupTitle}
            </TabsTrigger>
          ))}
        </TabsList>

        {masterDataGroups.map((group) => (
          <TabsContent key={group.groupKey} value={group.groupKey}>
            <motion.div initial="initial" animate="animate" variants={fadeInUp} className="w-full">
              <Tabs defaultValue={group.items?.[0]?.key} className="w-full space-y-4">
                <div className="no-scrollbar -mx-2 w-full overflow-x-auto px-2 pb-1">
                  <TabsList className="bg-muted flex h-10 w-full items-center justify-between rounded-lg p-1">
                    {group.items.map((item) => (
                      <TabsTrigger
                        key={item.key}
                        value={item.key}
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground flex flex-1 items-center justify-center px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all data-[state=active]:shadow-sm"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <AnimatePresence mode="wait">
                  {group.items.map((item) => (
                    <TabsContent key={item.key} value={item.key} asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full focus-visible:outline-none"
                      >
                        <div className="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm">
                          <div className="p-1">{item.component}</div>
                        </div>
                      </motion.div>
                    </TabsContent>
                  ))}
                </AnimatePresence>
              </Tabs>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
