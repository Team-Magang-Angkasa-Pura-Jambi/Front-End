import { EnergyTypeName } from "@/common/types/energy";
import { Droplets, Fuel, Zap } from "lucide-react";

export const getEnergyIcon = (energyType: EnergyTypeName) => {
  switch (energyType) {
    case "Water":
      return <Droplets className="mr-2 h-4 w-4 text-blue-500" />;
    case "Fuel":
      return <Fuel className="mr-2 h-4 w-4 text-orange-500" />;
    default:
      return <Zap className="mr-2 h-4 w-4 text-yellow-500" />;
  }
};
