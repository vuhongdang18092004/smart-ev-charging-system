export interface VehicleInfoRequest {
  brand_id: string;
  model: string;
  battery_kwh: number;
  range_nedc_km: number;
}

export interface VehicleInfo extends VehicleInfoRequest {
  id: string;
  created_by_user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}
