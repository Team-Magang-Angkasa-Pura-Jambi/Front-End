"use client";

import { Settings } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
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
    <div className="container mx-auto py-8 px-4 md:px-6">
      <motion.div
        className="mb-8"
        initial="initial"
        animate="animate"
        variants={fadeInDown}
      >
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Settings className="mr-3 h-8 w-8 text-primary" /> Manajemen Data
          Master
        </h1>
        <p className="text-muted-foreground mt-2">
          Pusat pengelolaan data inti aplikasi. Perubahan di sini akan
          memengaruhi seluruh sistem.
        </p>
      </motion.div>

      <Tabs defaultValue="asset-energy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          {masterDataGroups.map((group) => (
            <TabsTrigger key={group.groupKey} value={group.groupKey}>
              <group.groupIcon className="mr-2 h-4 w-4" />
              {group.groupTitle}
            </TabsTrigger>
          ))}
        </TabsList>

        {masterDataGroups.map((group) => (
          <TabsContent key={group.groupKey} value={group.groupKey}>
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="w-full"
            >
              <Tabs defaultValue={group.items[0].key} className="w-full">
                <div className="w-full overflow-x-auto pb-2 no-scrollbar">
                  <TabsList className="w-full justify-start">
                    {group.items.map((item) => (
                      <TabsTrigger key={item.key} value={item.key}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {group.items.map((item) => (
                  <TabsContent key={item.key} value={item.key}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        {item.component}
                      </div>
                    </motion.div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
