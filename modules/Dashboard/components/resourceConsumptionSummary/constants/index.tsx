import { Droplet, Fuel, LucideIcon, Zap } from "lucide-react";

export const statConfig: Record<
  string,
  { icon: LucideIcon; iconBgColor: string }
> = {
  Electricity: { icon: Zap, iconBgColor: "bg-yellow-500" },
  Water: { icon: Droplet, iconBgColor: "bg-sky-500" },
  Fuel: { icon: Fuel, iconBgColor: "bg-orange-500" },
};
