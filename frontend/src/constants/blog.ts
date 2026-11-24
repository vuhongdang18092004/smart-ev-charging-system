export const BLOG_ROUTE = "/blog-posts";
export const BLOG_PAGE_SIZE = 10;
export const BLOG_LIMITS = {
  title: 255,
  summary: 500,
  thumbnail: 500,
} as const;
export const BLOG_STATUS = {
  draft: "DRAFT",
  pending: "PENDING_REVIEW",
  rejected: "REJECTED",
  published: "PUBLISHED",
  archived: "ARCHIVED",
} as const;
export const BLOG_STATUS_LABELS = {
  DRAFT: "Bản nháp",
  PENDING_REVIEW: "Chờ duyệt",
  REJECTED: "Bị từ chối",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã ẩn",
} as const;
export const BLOG_COPY = {
  title: "Bài viết Blog",
  description: "Quản lý, kiểm duyệt và xuất bản bài viết.",
  ownDescription: "Soạn thảo và theo dõi các bài viết của bạn.",
  create: "Tạo bài viết",
  heading: "Tiêu đề",
  summary: "Tóm tắt",
  content: "Nội dung",
  thumbnail: "URL ảnh đại diện",
  author: "ID tác giả",
  search: "Tìm theo tiêu đề",
  allStatuses: "Tất cả trạng thái",
  filter: "Lọc bài viết",
  detail: "Chi tiết bài viết",
  edit: "Sửa bài",
  submit: "Gửi duyệt",
  approve: "Duyệt và xuất bản",
  reject: "Từ chối",
  delete: "Xóa bài",
  reason: "Lý do từ chối",
  reviewer: "ID người duyệt",
  reviewedAt: "Thời điểm duyệt",
  publishedAt: "Thời điểm xuất bản",
  updatedAt: "Cập nhật lần cuối",
  slug: "Slug",
  empty: "Không có bài viết phù hợp.",
  invalidUrl: "Nhập URL HTTP hoặc HTTPS hợp lệ.",
  required: "Trường này là bắt buộc.",
  back: "Quay lại chi tiết",
  confirmSubmit:
    "Sau khi gửi duyệt, bạn sẽ chờ ADMIN phản hồi trước khi có thể sửa tiếp.",
  confirmApprove: "Bài viết sẽ hiển thị công khai sau khi duyệt.",
  confirmDelete: "Bài viết sẽ bị xóa khỏi danh sách.",
};
