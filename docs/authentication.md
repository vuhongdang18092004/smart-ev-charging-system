# Xác thực ChargeOps

## Migration

Schema-only dump của `public` trên database phát triển được đối chiếu với PostgreSQL tạm dựng từ V1 lịch sử và V2–V4. Bỏ qua ACL, owner, comment của công cụ dump và khóa phiên dump. Hai schema khớp tại thời điểm kiểm tra. Chạy lại đối chiếu trước triển khai nếu database đã thay đổi.

1. Sao lưu và kiểm tra phục hồi. Kiểm tra mỗi trạm chỉ có một mức giá cổng khác NULL và không có nhiều hơn một ADMIN. Đối chiếu số lượng, ID và liên kết trạm của OPERATOR trước và sau.
2. Database mới, trống có thể chạy `FLYWAY_ENABLED=true` để áp dụng V1–V6.
3. Với database cũ khớp V4 và chưa có lịch sử Flyway, baseline chủ động tại version 4 bằng công cụ Flyway trong cửa sổ bảo trì. Chạy migrate với V5 và V6 sau đó. Giữ `baseline-on-migrate=false` khi chạy ứng dụng bình thường. Thử trên một bản phục hồi trước khi áp dụng cho database đang dùng.
4. Hibernate vẫn chạy `validate`. Khi tắt Flyway sau khi đã triển khai, schema vẫn phải có V6.

### Sao lưu và phục hồi trước cutover

- Dừng các tiến trình có quyền ghi, ghi nhận phiên bản ứng dụng hiện tại và kiểm tra lại schema, số bản ghi, liên kết trạm và điều kiện V5/V6. Chỉ lấy dấu vân tay của các trường account và liên kết để so sánh nội bộ, giữ các giá trị này ngoài log.
- Dùng `pg_dump -Fc` để tạo bản sao đầy đủ trong thư mục có ACL giới hạn, nằm ngoài repository. Giữ checksum SHA-256 của file. Nếu khôi phục sang cụm khác, sao lưu riêng các role cần thiết bằng `pg_dumpall --globals-only` khi được phép hoặc chuẩn bị cách tạo lại role, ownership và quyền truy cập. Bản sao và file globals chứa dữ liệu nhạy cảm.
- Kiểm tra `pg_restore --list`, sau đó phục hồi thật vào database khác với `--exit-on-error --single-transaction`. Đối chiếu schema, tổng số dòng từng bảng, ID và dấu vân tay của tài khoản, hash, profile và liên kết trạm. Khởi động bản backend cũ với bản phục hồi để xác nhận khả năng quay lui. Chạy thử baseline V4 rồi migrate V5–V6 trên bản sao.
- Nếu migrate thất bại, tiếp tục chặn ghi và kiểm tra `flyway_schema_history` cùng schema thật. V5 đã commit sẽ vẫn tồn tại nếu V6 thất bại. Nếu cần quay về V4, khôi phục bản sao vào database mới, xác minh rồi đổi cấu hình datasource về database đó và khởi động bản backend cũ. Giữ database lỗi để điều tra. Chỉ cân nhắc `flyway repair` sau khi xác định nguyên nhân và trạng thái schema, vì lệnh này chỉ sửa metadata lịch sử.

## Backend

Dùng cấu hình mẫu trong `backend/.env.example`. Tạo hai secret Base64 ngẫu nhiên độc lập, mỗi secret tối thiểu 32 byte. SMTP mặc định dùng Gmail, cổng 587, yêu cầu STARTTLS. Test tích hợp dùng JavaMailSender giả lập. Kiểm tra việc gửi thật với địa chỉ thử thuộc quyền quản lý riêng khi triển khai.

Nếu cấu hình email và mật khẩu bootstrap, backend chỉ khởi tạo ADMIN khi chưa có bản ghi ADMIN. Tài khoản ADMIN đã có được giữ nguyên. Người dùng mới hoặc tài khoản cũ chưa xác thực phải hoàn thành OTP lần đầu. Hai OPERATOR cũ vẫn dùng mật khẩu đang có, có thể yêu cầu mã qua `resend-otp`. Quản trị viên mời OPERATOR mới qua endpoint riêng; người được mời dùng OTP gửi qua email và `reset-password` để đặt mật khẩu lần đầu. Không gửi OTP ở mỗi lần đăng nhập.

`AUTH_ENABLED=true` bật các route xác thực và quy tắc JWT. `AUTH_LEGACY_BASIC_ENABLED=true` giữ đường Basic cho tài khoản quản trị cấu hình sẵn trong giai đoạn chuyển tiếp Web; đặt thành `false` khi cutover. API tạo OPERATOR cũ qua `POST /api/operators` bị chặn khi bật auth mới. OPERATOR dùng JWT chỉ truy cập và thay đổi trạm, ảnh, cổng thuộc quyền sở hữu; các API quản trị chung, quản trị review và báo cáo vẫn dành cho ADMIN. DRIVER có thể đọc trạm và quản lý xe cá nhân.

## Hợp đồng API

JSON dùng snake_case. Các phản hồi có dữ liệu dùng envelope `{ success, data }`.

| Method và route | Payload / kết quả |
| --- | --- |
| POST /api/auth/register | `{ name, email, password }` → 202 |
| POST /api/auth/verify-email | `{ email, otp }` → 204 |
| POST /api/auth/resend-otp | `{ email }` → 202 |
| POST /api/auth/login | `{ email, password, client }` → session |
| POST /api/auth/refresh | `{ refresh_token, client }` → session đã xoay |
| POST /api/auth/logout | `{ refresh_token, client }` → 204 |
| POST /api/auth/forgot-password | `{ email }` → 202, cùng phản hồi cho email không có tài khoản |
| POST /api/auth/reset-password | `{ email, otp, password }` → 204 |
| GET /api/auth/me | Bearer access token → hồ sơ |
| POST /api/admin/operators | ADMIN, `{ name, email }` → 202 |

Session gồm `access_token`, `refresh_token`, `expires_in` (giây), `user`. Hồ sơ gồm `id`, `name`, `email`, `role`, `email_verified`. `client` nhận `web` (ADMIN/OPERATOR) hoặc `mobile` (DRIVER). Đây là ràng buộc phân luồng theo vai trò, không phải xác thực thiết bị.

Gọi refresh tuần tự trong một phiên. Khi nhận lại refresh token đã xoay vòng, backend thu hồi cả họ token; chỉ một request đồng thời có thể xoay token. Thay đổi mật khẩu thu hồi các phiên. Request Bearer kiểm tra lại tài khoản và phiên tại backend. Giới hạn theo địa chỉ kết nối hiện giữ trong bộ nhớ theo instance. Khi triển khai nhiều instance hoặc sau proxy, cần rate limit tập trung ở ingress và cấu hình địa chỉ client tin cậy. Giới hạn OTP theo tài khoản dùng PostgreSQL.

## Kiểm thử

### Web BFF

Đặt `WEB_BACKEND_API_URL` trên Next.js server và `WEB_AUTH_ORIGIN` bằng origin công khai chính xác của Web (bao gồm cổng nếu có). Không đặt URL BFF backend trong biến `NEXT_PUBLIC_*`. Production yêu cầu HTTPS cho cookie `__Host-` và cấu hình origin. Giữ `WEB_AUTH_REFRESH_MAX_AGE` đồng bộ với thời hạn refresh của backend.

Trang `/login` dành cho ADMIN và OPERATOR. Các trang quản trị kiểm tra hồ sơ với backend từ server. OPERATOR chỉ có trang trạm. Trình duyệt đi qua `/api/bff`; BFF chỉ chuyển tiếp các route quản trị đã khai báo và kiểm tra Origin trên request ghi, đăng nhập, refresh và logout. Khi API trả 401, client phối hợp refresh trong một tab và dùng Web Locks để phối hợp giữa các tab được hỗ trợ. BFF gộp những lần refresh đồng thời trong cùng tiến trình. Với các trình duyệt không hỗ trợ Web Locks hoặc triển khai nhiều instance, hai request cũ vẫn có thể chạm chính sách thu hồi token khi dùng lại; khi đó cần đăng nhập lại.

Sau `npm run build` trong `frontend/`, chạy `node scripts/web-auth-smoke.mjs` để kiểm tra BFF tự động với backend giả lập. Để thử qua trình duyệt, dùng backend tạm đã bật JWT với SMTP giả lập hoặc tài khoản thử đã xác thực. Mở `/login`, kiểm tra cookie HttpOnly, thử mở `/operators` với OPERATOR và gửi một request ghi có Origin khác để xác nhận bị chặn. Web mới cần backend JWT hoạt động để đăng nhập; kích hoạt cơ chế mới trên môi trường đang dùng là bước riêng.

Bật `AUTH_INTEGRATION_TEST=true` chỉ với PostgreSQL tạm có dữ liệu giả lập. Chạy Maven Wrapper với Flyway và auth được bật, khóa thử ngẫu nhiên và cấu hình datasource trỏ tới database tạm. Các bài kiểm thử mock mail và không gửi SMTP thật.

### Mobile Expo

Dùng `mobile/.env.example` để tạo cấu hình local. `EXPO_PUBLIC_API_BASE_URL` bao gồm hậu tố `/api`. Android emulator có thể dùng `10.0.2.2`, còn máy thật dùng địa chỉ LAN của máy chạy backend. Bản production yêu cầu HTTPS. Backend phải bật JWT trước khi có thể đăng nhập. Expo Web hiển thị thông báo vì luồng này yêu cầu SecureStore trên Android hoặc iOS.

Mobile chỉ lưu refresh token và thông tin để tiếp tục xác thực gồm email, loại yêu cầu và thời điểm gửi ước tính trong SecureStore. Access token ở bộ nhớ. OTP và mật khẩu chỉ tồn tại trong form lúc nhập. Đồng hồ 5 phút và 60 giây dùng giá trị backend mặc định, còn backend quyết định mã còn hiệu lực và đã đủ điều kiện gửi lại hay chưa. Nếu mất mạng khi đăng xuất, ứng dụng xóa phiên cục bộ và hiển thị cảnh báo vì không xác nhận được việc thu hồi phiên trên máy chủ.

Trong `mobile/`, chạy `npx tsc --noEmit`, `npm run lint` và `npm run test:auth`. Với checkout chưa có kiểu route, chạy `npx expo start` một lần để Expo tạo `.expo/types`. Kiểm tra thêm trên thiết bị với backend tạm và OTP giả lập: đăng ký, đóng/mở trước và sau xác thực, đăng nhập, kiểm tra hồ sơ và đăng xuất.
