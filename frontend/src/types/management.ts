export type BrandType = "vehicle" | "station" | "both";
export type CurrentType = "AC" | "DC";
export type OperatorAccess =
  "open_to_all" | "closed" | "open_to_specific" | "unknown";
export type StationAccess = OperatorAccess | "inherit";
export type OperatorStatus = "active" | "banned" | "pending";
export type StationStatus =
  "open" | "closed" | "temporarily_closed" | "maintenance";
export type StationLocationType = "public" | "private";
export type ParkingFeeType = "free" | "paid" | "unknown";

export interface StationImage {
  id: string;
  url: string;
  caption: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface StationImageRequest {
  url: string;
  caption?: string | null;
  is_primary?: boolean | null;
  sort_order?: number | null;
}

export interface BrandSummary {
  id: string;
  name: string;
  type: BrandType | null;
}
export interface Brand extends BrandSummary {
  created_by_user_id?: string | null;
  logo_url: string | null;
  website: string | null;
}
export interface AllowedBrand extends BrandSummary {
  logoUrl: string | null;
}
export interface ConnectorType {
  id: string;
  code: string;
  name: string;
  current_type: CurrentType;
  is_active: boolean | null;
  sort_order: number | null;
}
export interface Operator {
  id: string;
  name: string;
  email: string;
  access_type: OperatorAccess;
  status: OperatorStatus | null;
  api_endpoint: string | null;
  allowedBrands: BrandSummary[];
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
  location_type: StationLocationType;
  parking_fee_type: ParkingFeeType;
  avg_rating: number;
  rating_count: number;
  images: StationImage[];
}

export interface Connector {
  id: string;
  station_id: string;
  connector_type_id: string;
  power_kw: number | null;
  price_per_kwh: number | null;
  code: string | null;
  status: ConnectorStatus;
}

export type ConnectorStatus =
  "available" | "occupied" | "maintenance" | "out_of_service";

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
  locationType: string;
  parkingFeeType: string;
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
export type UpdateBrandRequest = BrandRequest;
export interface UpdateConnectorTypeRequest extends Omit<
  ConnectorTypeRequest,
  "active"
> {
  is_active?: boolean | null;
}
export interface OperatorRequest {
  name: string;
  email: string;
  password: string;
  access_type?: OperatorAccess | null;
  api_endpoint?: string | null;
}
export interface UpdateOperatorRequest extends Omit<
  OperatorRequest,
  "password"
> {
  password?: string | null;
  status?: OperatorStatus | null;
}
export interface AllowedBrandsRequest {
  brandIds: string[];
}
export interface StationRequest {
  operator_id?: string;
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
  location_type?: StationLocationType | null;
  parking_fee_type?: ParkingFeeType | null;
  images?: StationImageRequest[] | null;
}
export interface ConnectorRequest {
  connector_type_id: string;
  power_kw?: number | null;
  price_per_kwh?: number | null;
  code?: string | null;
  status?: ConnectorStatus | null;
}
export interface CreateConnectorsRequest extends ConnectorRequest {
  quantity?: number | null;
  code_prefix?: string | null;
}
export interface CreateStationRequest {
  station: StationRequest;
  connectors?: CreateConnectorsRequest[] | null;
  images?: StationImageRequest[] | null;
}
