import {
  Building,
  Calculator,
  DollarSign,
  DollarSignIcon,
  Droplets,
  TrendingUp,
  Zap,
} from "lucide-react";

import { CalculationTemplateManagement } from "../view/CalculationTemplateManagement";
import { UnifiedEnergyManagement } from "../view/EnergyManagement";
import { MeterManagement } from "../view/MeterManagement";
import { SchemePriceManagement } from "../view/SchemePriceManagement";
import { TargetEfficiencyManagement } from "../view/targetEfficienyManagement";

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
        key: "calculation-formulas",
        title: "Kalkulasi & Rumus",
        icon: Calculator,
        component: <CalculationTemplateManagement />,
      },
      // {
      //   key: "entities",
      //   title: "Entitas & Lokasi",
      //   icon: MapPin,
      //   component: <EntityManagement />,
      // },
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
      {
        key: "efficiency-targets",
        title: "Target Efisiensi",
        icon: TrendingUp,
        component: <TargetEfficiencyManagement />,
      },
    ],
  },
];
