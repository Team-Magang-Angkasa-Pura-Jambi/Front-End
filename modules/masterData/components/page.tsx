"use client";

import {
  Settings,
  
} from "lucide-react";
import React from "react";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { masterDataGroups } from "../constants/data";




export default function MasterDataPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Settings className="mr-3 h-8 w-8" />
          Manajemen Data Master
        </h1>
        <p className="text-muted-foreground mt-2">
          Pusat pengelolaan data inti aplikasi. Perubahan di sini akan
          memengaruhi seluruh sistem.
        </p>
      </div>

      <Tabs defaultValue="asset-energy" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {masterDataGroups.map((group) => (
            <TabsTrigger key={group.groupKey} value={group.groupKey}>
              <group.groupIcon className="mr-2 h-4 w-4" />
              {group.groupTitle}
            </TabsTrigger>
          ))}
        </TabsList>

        {masterDataGroups.map((group) => (
          <TabsContent
            key={group.groupKey}
            value={group.groupKey}
            className="pt-4"
          >
            <Tabs defaultValue={group.items[0].key} className="w-full">
              <div className="w-full overflow-x-auto pb-2">
                <TabsList>
                  {group.items.map((item) => (
                    <TabsTrigger key={item.key} value={item.key}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {group.items.map((item) => (
                <TabsContent key={item.key} value={item.key} className="pt-4">
                  {item.component}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
