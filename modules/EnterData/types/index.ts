export type DialogType =
  | "Electricity"
  | "Water"
  | "Fuel"
  | "Pax"
  | "Log"
  | null;
export interface CardInfo {
  id: string | number;
  type: "api" | "static";
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  unit?: string;
  energyTypeId?: number;
}


