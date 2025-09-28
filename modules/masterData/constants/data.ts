import {
  EnergyType,
  Meter,
  PriceScheme,
  ReadingType,
  EfficiencyTarget,
} from "./types";

// Data Dummy untuk UI
export const dummyEnergyTypes: EnergyType[] = [
  {
    energy_type_id: 1,
    type_name: "Electricity",
    unit_of_measurement: "kWh",
    is_active: true,
  },
  {
    energy_type_id: 2,
    type_name: "Water",
    unit_of_measurement: "m³",
    is_active: true,
  },
  {
    energy_type_id: 3,
    type_name: "Solar",
    unit_of_measurement: "Liter",
    is_active: false,
  },
];

export const dummyReadingTypes: ReadingType[] = [
  {
    reading_type_id: 1,
    type_name: "WBP",
    energy_type: { type_name: "Electricity" },
  },
  {
    reading_type_id: 2,
    type_name: "LWBP",
    energy_type: { type_name: "Electricity" },
  },
  {
    reading_type_id: 3,
    type_name: "Consumption",
    energy_type: { type_name: "Water" },
  },
];

export const dummyMeters: Meter[] = [
  {
    meter_id: 1,
    meter_code: "ELEC-T1-001",
    location: "Terminal 1",
    status: "Active",
    energy_type: { type_name: "Electricity" },
  },
  {
    meter_id: 2,
    meter_code: "WATER-T2-001",
    location: "Terminal 2",
    status: "UnderMaintenance",
    energy_type: { type_name: "Water" },
  },
  {
    meter_id: 3,
    meter_code: "FUEL-GNS-001",
    location: "Genset Area",
    status: "Inactive",
    energy_type: { type_name: "Solar" },
  },
];

export const dummyPriceSchemes: PriceScheme[] = [
  {
    scheme_id: 1,
    scheme_name: "Tarif Listrik 2024",
    effective_date: "2024-01-01T00:00:00.000Z",
    is_active: true,
    energy_type: { type_name: "Electricity" },
  },
  {
    scheme_id: 2,
    scheme_name: "Tarif Air PDAM",
    effective_date: "2023-06-01T00:00:00.000Z",
    is_active: true,
    energy_type: { type_name: "Water" },
  },
];

export const dummyEfficiencyTargets: EfficiencyTarget[] = [
  {
    target_id: 1,
    kpi_name: "Penghematan Listrik Terminal",
    target_value: 5,
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    energy_type: { type_name: "Electricity" },
  },
  {
    target_id: 2,
    kpi_name: "Pengurangan Konsumsi Air",
    target_value: 10,
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    energy_type: { type_name: "Water" },
  },
];
