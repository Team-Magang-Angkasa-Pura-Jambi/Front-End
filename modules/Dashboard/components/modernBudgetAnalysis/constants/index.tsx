import { Droplets, Fuel, Zap } from "lucide-react";

export const getEnergyIcon = (energyType) => {
  switch (energyType) {
    case "Water":
      return <Droplets className="w-4 h-4 mr-2 text-blue-500" />;
    case "Fuel":
      return <Fuel className="w-4 h-4 mr-2 text-orange-500" />;
    default:
      return <Zap className="w-4 h-4 mr-2 text-yellow-500" />;
  }
};
