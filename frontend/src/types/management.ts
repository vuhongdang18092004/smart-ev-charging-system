export type BrandType = "vehicle" | "station" | "both";
export type CurrentType = "AC" | "DC";
export type OperatorAccess =
  "open_to_all" | "closed" | "open_to_specific" | "unknown";
export type StationAccess = OperatorAccess | "inherit";
export type StationStatus =
  "open" | "closed" | "temporarily_closed" | "maintenance";

export interface Brand {
  id: string;
  name: string;
  type: BrandType | null;
}
export interface ConnectorType {
  id: string;
  code: string;
  name: string;
  current_type: CurrentType;
}
export interface Operator {
  id: string;
  name: string;
  email: string;
  access_type: OperatorAccess;
}

export interface Station {
  id: string;
  operator_id: string;
  brand_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: StationStatus | null;
  is_24_7: boolean | null;
  opening_time: string | null;
  closing_time: string | null;
  access_type: StationAccess;
  source_url: string | null;
  last_synced_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Connector {
  id: string;
  station_id: string;
  connector_type_id: string;
  power_kw: number | null;
  quantity: number;
  price_per_kwh: number | null;
}

export interface StationDetail {
  station: Station;
  connectors: Connector[];
}
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

export interface StationFilters {
  keyword: string;
  brandId: string;
  operatorId: string;
  status: string;
  page: number;
  size: number;
}

export interface BrandRequest {
  name: string;
  logo_url?: string | null;
  website?: string | null;
  type?: BrandType | null;
}
export interface ConnectorTypeRequest {
  code: string;
  name: string;
  current_type: CurrentType;
  active?: boolean | null;
  sort_order?: number | null;
}
export interface OperatorRequest {
  name: string;
  email: string;
  password: string;
  access_type?: OperatorAccess | null;
  api_endpoint?: string | null;
}
export interface StationRequest {
  operator_id: string;
  brand_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status?: StationStatus | null;
  is_24_7?: boolean | null;
  opening_time?: string | null;
  closing_time?: string | null;
  access_type?: StationAccess | null;
  source_url?: string | null;
}
export interface ConnectorRequest {
  connector_type_id: string;
  power_kw?: number | null;
  quantity?: number | null;
  price_per_kwh?: number | null;
}
export interface CreateStationRequest {
  station: StationRequest;
  connectors?: ConnectorRequest[] | null;
}
