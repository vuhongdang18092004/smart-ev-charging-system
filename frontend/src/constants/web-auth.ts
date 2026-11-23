export const WEB_AUTH_ROUTES = {
  login: "/login",
  renew: "/session-renew",
  stations: "/stations",
  bff: "/api/bff",
  auth: "/api/auth",
} as const;

export const WEB_ROLE = { admin: "admin", operator: "operator" } as const;
export const WEB_AUTH_COPY = {
  intro: "Đăng nhập bằng email quản trị hoặc email đơn vị vận hành.",
  verify: "Xác thực email",
  resend: "Gửi mã xác thực",
  forgot: "Quên mật khẩu",
  reset: "Đặt lại mật khẩu",
  otp: "Mã OTP",
  newPassword: "Mật khẩu mới",
  returnToLogin: "Quay lại đăng nhập",
  verified: "Email đã được xác thực. Bạn có thể đăng nhập.",
  resetComplete: "Đã đặt lại mật khẩu. Hãy đăng nhập lại.",
  codeSent: "Nếu email đủ điều kiện, hệ thống sẽ gửi mã xác thực.",
  renewing: "Đang khôi phục phiên đăng nhập…",
  renewFailed: "Chưa thể khôi phục phiên đăng nhập.",
  signOutFailed: "Chưa thể đăng xuất. Vui lòng thử lại.",
  authUnavailable: "Dịch vụ xác thực đang không khả dụng.",
  otpInvalid: "Mã xác thực không đúng hoặc đã hết hạn.",
  accountDisabled: "Tài khoản không được phép đăng nhập trên Web.",
  rateLimited: "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.",
  verificationRequired: "Xác thực email một lần trước khi đăng nhập.",
  inviteOperator: "Mời đơn vị vận hành",
} as const;
export const WEB_AUTH_LIMITS = {
  email: 255,
  passwordMin: 8,
  passwordBytes: 72,
  otp: 6,
} as const;
