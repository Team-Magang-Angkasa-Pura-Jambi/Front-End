export interface Location {
  location_id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number | null;
  parent: Location | null;
  _count?: {
    meters: number;
    children: number;
  };
}
