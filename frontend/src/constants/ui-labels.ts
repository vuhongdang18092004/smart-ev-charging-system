export const UI_LABELS = {
  close: "Đóng",
  emptyTable: "Không có dữ liệu",
  pagination: "Phân trang",
  previousPage: "Trang trước",
  nextPage: "Trang sau",
  pageOf: (page: number, pageCount: number) => `Trang ${page} / ${pageCount}`,
  requestFailed: "Không thể hoàn tất yêu cầu. Vui lòng thử lại.",
} as const;
