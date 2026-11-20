export const STATION_MEDIA_COPY = {
  locationType: "Loại địa điểm",
  parkingFeeType: "Phí đỗ xe",
  location: { public: "Công cộng", private: "Tư nhân" },
  parking: { free: "Miễn phí", paid: "Tính phí", unknown: "Chưa rõ" },
  rating: "Điểm đánh giá",
  unrated: "Chưa có đánh giá",
  ratingSummary: (score: string, count: string) => `${score}/5 · ${count} lượt`,
  images: "Ảnh trạm",
  noImages: "Trạm chưa có ảnh.",
  addImage: "Thêm ảnh",
  primary: "Ảnh đại diện",
  primaryHint: "Chọn một ảnh đại diện và nhập thứ tự hiển thị cho từng ảnh.",
  imageNumber: (number: number) => `Ảnh ${number}`,
  mediaNumber: (number: number) => `Đính kèm ${number}`,
  url: "URL tệp",
  thumbnail: "URL ảnh xem trước",
  caption: "Chú thích",
  media: "Tệp đính kèm",
  addMedia: "Thêm ảnh hoặc video",
  mediaType: "Loại tệp",
  mediaLabels: { image: "Ảnh", video: "Video" },
  openMedia: "Mở tệp gốc",
  urlHint: "Dùng URL HTTP hoặc HTTPS trỏ trực tiếp đến ảnh hoặc video.",
  invalidUrl: "Nhập URL HTTP hoặc HTTPS hợp lệ.",
  reviews: "Đánh giá",
  reports: "Báo cáo sự cố",
  createReview: "Gửi đánh giá",
  createReport: "Gửi báo cáo",
  noReviews: "Chưa có đánh giá cho trạm này.",
  noReports: "Chưa có báo cáo cho trạm này.",
  driverId: "UUID tài xế",
  driverHint: "Nhập UUID của tài khoản tài xế đã có trong hệ thống.",
  driver: (id: string) => `Tài xế ${id}`,
  comment: "Nhận xét",
  note: "Ghi chú",
  issueType: "Loại sự cố",
  allConnectors: "Không chỉ định đầu sạc",
  issueLabels: {
    broken: "Thiết bị hỏng",
    occupied_wrong: "Trạng thái sử dụng sai",
    closed: "Trạm đã đóng",
    wrong_info: "Thông tin không chính xác",
    other: "Sự cố khác",
  },
  reportStatus: {
    pending: "Chờ xử lý",
    verified: "Đã xác minh",
    rejected: "Đã từ chối",
  },
  stars: (rating: number) => `${rating}/5 sao`,
} as const;

export const LOCATION_TYPES = ["public", "private"] as const;
export const PARKING_FEE_TYPES = ["free", "paid", "unknown"] as const;
export const MEDIA_TYPES = ["image", "video"] as const;
export const REPORT_ISSUES = [
  "broken",
  "occupied_wrong",
  "closed",
  "wrong_info",
  "other",
] as const;
export const REVIEW_RATINGS = [1, 2, 3, 4, 5] as const;
export const DEFAULT_STATION_LOCATION = "public";
export const DEFAULT_PARKING_FEE = "unknown";
export const DEFAULT_MEDIA_TYPE = "image";
export const DEFAULT_REPORT_ISSUE = "broken";
export const IMAGE_MEDIA_TYPE = "image";
export const MEDIA_LIMITS = {
  url: 500,
  caption: 255,
  intMin: -2_147_483_648,
  intMax: 2_147_483_647,
} as const;
export const FEEDBACK_PAGE_SIZE = 5;
export const DEFAULT_MEDIA_SORT = 0;
export const STATION_PRIMARY_IMAGE_FIELD = "station-primary-image";
export const HTTP_MEDIA_URL_PATTERN = /^https?:\/\/[^/\\?#\s][^\\\s]*$/i;
