export type DialogType = "Electricity" | "Water" | "Fuel" | "Pax" | "Log" | null;
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

export interface MasterMeter {
  meter_id: number;
  name: string;
}

export interface MasterReadingType {
  reading_type_id: number;
  type_name: string;
}

export interface MasterEnergyData {
  energy_type_id: number;
  name: string;
  unit_standard: string;
  meters: MasterMeter[];
  reading_types: MasterReadingType[];
  // annual_budgets bisa ditambahkan jika nanti diperlukan di UI form
}

export interface MasterEnergyResponse {
  status: {
    code: number;
    message: string;
  };
  data: MasterEnergyData;
}
