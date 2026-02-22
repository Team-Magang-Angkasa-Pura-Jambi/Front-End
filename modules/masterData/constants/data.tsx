import {
  Building,
  DollarSign,
  DollarSignIcon,
  Droplets,
  Tags,
  TrendingUp,
  Zap,
} from "lucide-react";

// import { ReadingTypeManagement } from "../components/ReadingTypeManagements";
import { UnifiedEnergyManagement } from "../pages/EnergyManagement";
import { EntityManagement } from "../pages/EntityManagement";
import { MeterManagement } from "../pages/MeterManagement";
import { SchemePriceManagement } from "../pages/SchemePriceManagement";
import { TargetEfficiencyManagement } from "../pages/targetEfficienyManagement";

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
        component: <UnifiedEnergyManagement />,
      },

      {
        key: "entities",
        title: "Entitas",
        icon: Tags,
        component: <EntityManagement />,
      },
    ],
  },
  {
    groupKey: "price-financial",
    groupTitle: "Harga & Finansial",
    groupIcon: DollarSign,
    items: [
      {
        key: "scheme-price",
        title: "Skema Harga",
        icon: DollarSignIcon,
        component: <SchemePriceManagement />,
      },
      // {
      //   key: "taxes",
      //   title: "Pajak",
      //   icon: Percent,
      //   component: <TaxManagement />,
      // },
      {
        key: "efficiency-targets",
        title: "Target Efisiensi",
        icon: TrendingUp,
        component: <TargetEfficiencyManagement />,
      },
    ],
  },
];
