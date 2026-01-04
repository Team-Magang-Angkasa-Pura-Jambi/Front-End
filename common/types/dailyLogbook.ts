export interface DailyLogbook {
  log_id: number;
  log_date: string;
  meter_id: number;
  consumption_change_percent: string;
  savings_value: string | null;
  savings_cost: string | null;
  overage_value: string;
  overage_cost: string;
  summary_notes: string;
  manual_notes: string | null;
  edited_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}
