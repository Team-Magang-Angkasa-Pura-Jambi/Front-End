export interface EfficiencyTarget {
  target_id: number;
  meter_id: number;
  kpi_name: string;
  period_start: string;
  period_end: string;
  target_percentage: number; // API mengirim string "0.05"
  baseline_value: number; // API mengirim string "150000.5"
  created_at: string;
  created_by?: string | null;
  // Relasi opsional (tergantung include backend)
  meter?: {
    meter_id: number;
    meter_code: string;
    energy_type?: {
      unit_of_measurement: string;
    };
  };
}
