"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import React from "react";

type ActiveTab = "meters" | "price_schemes";

interface MasterDataHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onAddClick: () => void;
}

export const MasterDataHeader: React.FC<MasterDataHeaderProps> = ({
  activeTab,
  onTabChange,
  onAddClick,
}) => (
  <div className="flex items-center justify-between">
    <div className="space-y-1">
      <h1 className="text-3xl font-bold">Data Master</h1>
      <p className="text-muted-foreground">
        Kelola data inti sistem seperti meteran dan skema harga.
      </p>
    </div>
    <div className="flex items-center space-x-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as ActiveTab)}
      >
        <TabsList>
          <TabsTrigger value="meters">Meter</TabsTrigger>
          <TabsTrigger value="price_schemes">Skema Harga</TabsTrigger>
        </TabsList>
      </Tabs>
      <Button onClick={onAddClick}>
        <PlusCircle className="mr-2 h-4 w-4" /> Tambah Data
      </Button>
    </div>
  </div>
);
