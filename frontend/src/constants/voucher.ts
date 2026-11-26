export const VOUCHER_ROUTE = "/vouchers";
export const VOUCHER_PAGE_SIZE = 10;
export const VOUCHER_FIELDS = {
  prefix: 30,
  title: 200,
  money: 9999999999.99,
  quantity: 2147483647,
};
export const VOUCHER_STATUSES = {
  draft: "DRAFT",
  pending: "PENDING_APPROVAL",
  rejected: "REJECTED",
  active: "ACTIVE",
  expired: "EXPIRED",
  inactive: "INACTIVE",
} as const;
export const VOUCHER_STATUS_LABELS = {
  DRAFT: "Nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  REJECTED: "Bị từ chối",
  ACTIVE: "Đang hoạt động",
  EXPIRED: "Hết hạn",
  INACTIVE: "Tạm ngưng",
} as const;
export const VOUCHER_DISCOUNTS = {
  percent: "PERCENT",
  fixed: "FIXED_AMOUNT",
} as const;
export const VOUCHER_SCOPES = {
  global: "global",
  brand: "brand",
  station: "station",
} as const;
export const VOUCHER_COPY = {
  title: "Voucher sạc xe",
  description: "Quản lý chiến dịch giảm giá và theo dõi lượt nhận.",
  create: "Tạo voucher",
  edit: "Sửa voucher",
  detail: "Chi tiết voucher",
  prefix: "Tiền tố mã",
  prefixHint: "Dùng chữ, số hoặc dấu gạch ngang.",
  titleField: "Tên voucher",
  descriptionField: "Mô tả",
  discountType: "Loại giảm giá",
  percent: "Phần trăm",
  fixed: "Số tiền cố định (VNĐ)",
  discount: "Giá trị giảm",
  maxDiscount: "Giảm tối đa (VNĐ)",
  minOrder: "Đơn tối thiểu (VNĐ)",
  quantity: "Tổng số lượng",
  progress: "Lượt đã nhận",
  scope: "Phạm vi",
  global: "Toàn hệ thống",
  from: "Bắt đầu",
  until: "Kết thúc",
  validity: "Hiệu lực",
  search: "Tìm theo tên hoặc mã",
  all: "Tất cả",
  filter: "Lọc voucher",
  saveDraft: "Lưu nháp",
  submit: "Gửi duyệt",
  publish: "Phát hành ngay",
  approve: "Duyệt",
  reject: "Từ chối",
  delete: "Xóa voucher",
  reason: "Lý do từ chối",
  confirmDelete: "Xóa chiến dịch khỏi danh sách quản lý và dừng nhận mới?",
  confirmApprove: "Duyệt và mở nhận theo thời gian hiệu lực đã chọn?",
  confirmSubmit: "Gửi voucher này cho ADMIN kiểm duyệt?",
  invalidDates: "Thời gian kết thúc phải sau thời gian bắt đầu.",
  invalidAmount:
    "Kiểm tra số tiền, số lượng và mức giảm. Giảm phần trăm tối đa 100%.",
  locked:
    "Voucher đã có lượt nhận. Có thể sửa tên, mô tả, số lượng và điều khiển trạng thái.",
  required: "Trường này là bắt buộc.",
  empty: "Chưa có voucher phù hợp.",
  back: "Quay lại chi tiết",
};
