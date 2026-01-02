export interface meters {
  meter_id: number;
  meter_code: string;
  location: string;
  status: Status;
  energy_type_id: number;
}

enum Status {
  "Active",
  "UnderMaintenance",
  "Inactive",
  "DELETED",
}
