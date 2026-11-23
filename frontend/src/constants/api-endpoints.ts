export const API_ENDPOINTS = {
  stations: "/stations",
  brands: "/brands",
  vehicleInfoList: "/vehicles-infor",
  vehicleInfo: (id: string) => `/vehicles-infor/${encodeURIComponent(id)}`,
  connectorTypes: "/connector-types",
  operators: "/operators",
  inviteOperator: "/admin/operators",
  brand: (id: string) => `/brands/${encodeURIComponent(id)}`,
  connectorType: (id: string) => `/connector-types/${encodeURIComponent(id)}`,
  operator: (id: string) => `/operators/${encodeURIComponent(id)}`,
  operatorAllowedBrands: (id: string) =>
    `/operators/${encodeURIComponent(id)}/allowed-brands`,
  station: (id: string) => `/stations/${encodeURIComponent(id)}`,
  stationConnectors: (id: string) =>
    `/stations/${encodeURIComponent(id)}/connectors`,
  connector: (id: string) => `/connectors/${encodeURIComponent(id)}`,
  stationImages: (id: string) => `/stations/${encodeURIComponent(id)}/images`,
  stationImage: (stationId: string, imageId: string) =>
    `/stations/${encodeURIComponent(stationId)}/images/${encodeURIComponent(imageId)}`,
  stationReviews: (id: string) => `/stations/${encodeURIComponent(id)}/reviews`,
  review: (id: string) => `/reviews/${encodeURIComponent(id)}`,
  stationReports: (id: string) => `/stations/${encodeURIComponent(id)}/reports`,
  stationReport: (id: string) => `/station-reports/${encodeURIComponent(id)}`,
} as const;
