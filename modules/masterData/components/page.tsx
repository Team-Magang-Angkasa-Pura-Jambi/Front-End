"use client";

import {
  Settings,
  Users,
  ShieldCheck,
  Building,
  DollarSign,
  FileText,
  Zap,
  Droplets,
  Ruler,
  TrendingUp,
  Landmark,
  Percent,
  Tags,
  MoreHorizontal,
  PlusCircle,
  DollarSignIcon,
} from "lucide-react";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";

// Asumsi Anda menggunakan shadcn/ui untuk komponen ini
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./dataTable";
import { MeterManagement } from "./MeterManagement";
import { TypeEnergyManagement } from "./TypeEnergyManagement";
import { TariffGroupManagement } from "./TariffGroupManagement";
import { TargetEfficiencyManagement } from "./targetEfficienyManagement";
import { ReadingTypeManagement } from "./ReadingTypeManagements";
import { TaxManagement } from "./TaxManagement";
import { SchemePriceManagement } from "./SchemePriceManagement";
import { CategoryManagement } from "./CategoryManagement";

function PlaceholderManagementComponent({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Fungsionalitas untuk mengelola {title.toLowerCase()} akan ditampilkan
          di sini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Komponen ini sedang dalam pengembangan.
        </p>
      </CardContent>
    </Card>
  );
}

// =============================================
// STRUKTUR DATA BARU UNTUK TABS BERSARANG
// =============================================
const masterDataGroups = [
  {
    groupKey: "asset-energy",
    groupTitle: "Aset & Energi",
    groupIcon: Building,
    items: [
      {
        key: "meters",
        title: "Meter",
        icon: Zap,
        component: <MeterManagement />,
      },
      {
        key: "energy-types",
        title: "Jenis Energi",
        icon: Droplets,
        component: <TypeEnergyManagement />,
      },
      {
        key: "reading-types",
        title: "Jenis Pembacaan",
        icon: Ruler,
        component: <ReadingTypeManagement />,
      },
      {
        key: "category",
        title: "Kategori",
        icon: Tags,
        component: <CategoryManagement />,
      },
    ],
  },
  {
    groupKey: "price-financial",
    groupTitle: "Harga & Finansial",
    groupIcon: DollarSign,
    items: [
      {
        key: "tariff-groups",
        title: "Golongan Tarif",
        icon: Landmark,
        component: <TariffGroupManagement />,
      },
      {
        key: "scheme-price",
        title: "Skema Harga",
        icon: DollarSignIcon,
        component: <SchemePriceManagement />,
      },
      {
        key: "taxes",
        title: "Pajak",
        icon: Percent,
        component: <TaxManagement />,
      },
      {
        key: "efficiency-targets",
        title: "Target Efisiensi",
        icon: TrendingUp,
        component: <TargetEfficiencyManagement />,
      },
    ],
  },
];

// =============================================
// KOMPONEN UTAMA (HALAMAN DATA MASTER)
// =============================================
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
