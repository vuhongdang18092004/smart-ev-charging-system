export interface VehicleOption {
  id: string;
  brand_id: string;
  brand_name: string;
  model: string;
}

export interface UserVehicle {
  name: string;
  id: string;
  vehicle_info_id: string;
  vehicle_option?: VehicleOption;
}

export interface VehiclePage<T> {
  content: T[];
  total_pages: number;
}
