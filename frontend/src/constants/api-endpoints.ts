export const API_ENDPOINTS = {
  stations: "/stations",
  brands: "/brands",
  connectorTypes: "/connector-types",
  operators: "/operators",
  station: (id: string) => `/stations/${encodeURIComponent(id)}`,
  stationConnectors: (id: string) =>
    `/stations/${encodeURIComponent(id)}/connectors`,
  connector: (id: string) => `/connectors/${encodeURIComponent(id)}`,
} as const;
