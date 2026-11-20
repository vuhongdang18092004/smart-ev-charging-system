export const CONNECTOR_STATUSES = [
  "available",
  "occupied",
  "maintenance",
  "out_of_service",
] as const;

export const CONNECTOR_STATUS_LABELS = {
  available: "Rảnh",
  occupied: "Đang sử dụng",
  maintenance: "Đang sửa",
  out_of_service: "Ngừng hoạt động",
} as const;

export const CONNECTOR_PORT_COPY = {
  code: "Mã cổng",
  codePrefix: "Tiền tố mã cổng",
  quantity: "Số cổng cần tạo",
  status: "Trạng thái cổng",
} as const;

export const CONNECTOR_DEFAULT_STATUS = "available";
export const CONNECTOR_DEFAULT_QUANTITY = 1;
export const CONNECTOR_MAX_QUANTITY = 50;
export const CONNECTOR_CODE_LENGTH = 50;
export const CONNECTOR_PREFIX_LENGTH = 39;
