// types.ts
export type Category =
  | "reading"
  | "price"
  | "spec"
  | "operator"
  | "logic"
  | "variable"
  | "constant";

export interface FormulaItem {
  id: string;
  type: Category;
  label: string;
  value: string;
  timeShift?: number; // 0 = Hari Ini, -1 = Kemarin
  meterId?: string;
  meterName?: string;
}

export interface FormulaDefinition {
  id: string;
  name: string;
  items: FormulaItem[];
  isMain: boolean;
}

export interface MeterSource {
  id: string;
  name: string;
  type: "MAIN" | "SUB";
  availableReadings: { id: string; label: string; value: string }[];
}

// constants.ts
export const AVAILABLE_METERS: MeterSource[] = [
  {
    id: "mtr_pln_001",
    name: "Meter Induk PLN (Terminal)",
    type: "MAIN",
    availableReadings: [
      { id: "rt_wbp", label: "WBP", value: "WBP" },
      { id: "rt_lwbp", label: "LWBP", value: "LWBP" },
      { id: "rt_total", label: "Total kWh", value: "Total_kWh" },
    ],
  },
  {
    id: "mtr_office_001",
    name: "Meter Lokal Kantor",
    type: "SUB",
    availableReadings: [
      { id: "rt_pagi", label: "Stand Pagi", value: "Pagi" },
      { id: "rt_sore", label: "Stand Sore", value: "Sore" },
    ],
  },
];

export const INITIAL_FORMULAS: FormulaDefinition[] = [
  {
    id: "var_kantor",
    name: "Hitung Pemakaian Kantor",
    isMain: false,
    items: [
      { id: "op_1", type: "operator", label: "(", value: "(" },
      {
        id: "r_sore",
        type: "reading",
        label: "Stand Sore",
        value: "Sore",
        meterId: "mtr_office_001",
        meterName: "Meter Lokal Kantor",
        timeShift: 0,
      },
      { id: "op_2", type: "operator", label: "-", value: "-" },
      {
        id: "r_pagi",
        type: "reading",
        label: "Stand Pagi",
        value: "Pagi",
        meterId: "mtr_office_001",
        meterName: "Meter Lokal Kantor",
        timeShift: 0,
      },
      { id: "op_3", type: "operator", label: ")", value: ")" },
    ],
  },
  {
    id: "main",
    name: "TOTAL NET TERMINAL",
    isMain: true,
    items: [],
  },
];
