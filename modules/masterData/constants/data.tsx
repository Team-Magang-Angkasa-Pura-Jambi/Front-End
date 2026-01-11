import {
  Building,
  DollarSign,
  DollarSignIcon,
  Droplets,
  Landmark,
  Percent,
  Ruler,
  Tags,
  TrendingUp,
  Zap,
} from "lucide-react";

import { MeterManagement } from "../components/MeterManagement";
import { TypeEnergyManagement } from "../components/TypeEnergyManagement";
import { ReadingTypeManagement } from "../components/ReadingTypeManagements";
import { CategoryManagement } from "../components/CategoryManagement";
import { TariffGroupManagement } from "../components/TariffGroupManagement";
import { SchemePriceManagement } from "../components/SchemePriceManagement";
import { TaxManagement } from "../components/TaxManagement";
import { TargetEfficiencyManagement } from "../components/targetEfficienyManagement";

export const masterDataGroups = [
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
