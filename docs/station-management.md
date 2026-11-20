# Quản lý trạm sạc

Backend yêu cầu PostgreSQL có schema từ `backend/src/main/resources/db/migration/`. Chạy các migration chưa áp dụng theo thứ tự V1 đến V4 trước khi khởi động. V2 và V3 xóa `user_vehicles` nếu bảng còn tồn tại. V3 thêm thông tin trạm, các bảng media và tính lại điểm từ review hiện có. V4 chuyển tọa độ sang `DOUBLE PRECISION` và tách số lượng cổng cũ thành các bản ghi riêng. Backend sử dụng Hibernate ở chế độ `validate`. Đặt `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME` và `DB_PASSWORD` trong môi trường backend.

Cấu hình tài khoản quản trị bằng `SPRING_SECURITY_USER_NAME` và `SPRING_SECURITY_USER_PASSWORD`. Dùng tài khoản này đăng nhập trên frontend. API quản lý dùng HTTP Basic và cần HTTPS khi triển khai ngoài localhost. Thông tin đăng nhập chỉ được giữ trong bộ nhớ của tab. API tạo operator lưu tài khoản có vai trò `operator` và hồ sơ operator trong cùng transaction, với mật khẩu được băm bằng BCrypt.

Frontend mặc định ở `http://localhost:3000`, backend ở `http://localhost:8080/api`. Dùng `FRONTEND_ALLOWED_ORIGINS` và `NEXT_PUBLIC_API_BASE_URL` để đổi địa chỉ.

Response thành công gồm `success` và `data`, lỗi nghiệp vụ gồm `success`, `code` và `message`. JSON dùng snake_case. GET danh sách trạm nhận `keyword`, `brandId`, `operatorId`, `status`, `page` (từ 0) và `size` (tối đa 100). Kết quả sắp xếp theo tên và ID. POST trạm nhận `{ station, connectors }`. PUT trạm nhận các trường thông tin trạm. Xóa trạm là xóa mềm.

Mỗi connector là một cổng riêng. Mỗi nhóm trong `connectors` khi tạo trạm, hoặc body của `POST /api/stations/{id}/connectors`, nhận `quantity` từ 1 đến 50, mặc định 1. Có thể gửi `code_prefix` để sinh mã dạng `CCS-1`; nếu bỏ trống, mã có dạng `#1`. Để chỉ định mã chính xác, gửi `code` khi tạo một cổng và bỏ qua tiền tố. POST thêm cổng trả mảng các cổng đã tạo. `PUT /api/connectors/{id}` sửa thông tin và trạng thái của riêng cổng đó. `DELETE /api/connectors/{id}` xóa cổng và trả 204.

GET danh sách trạm hỗ trợ thêm hai tham số `locationType` và `parkingFeeType`. Response trạm có `location_type`, `parking_fee_type`, `avg_rating`, `rating_count` và `images`. Khi tạo trạm, có thể gửi `images` ở cấp ngoài hoặc trong `station`. Khi sửa trạm, bỏ qua `images` để giữ ảnh cũ hoặc gửi `[]` để xóa hết ảnh. Có thể thêm và xóa riêng ảnh qua `/api/stations/{stationId}/images`.

Review được tạo và liệt kê qua `/api/stations/{stationId}/reviews`, còn đọc, sửa và xóa từng review qua `/api/reviews/{id}`. Báo cáo được tạo và liệt kê qua `/api/stations/{stationId}/reports`, với chi tiết tại `/api/station-reports/{id}`. Khi tạo review hoặc báo cáo, tài khoản quản trị gửi `driver_id` của một user có vai trò driver. Ảnh và video được lưu dưới dạng URL HTTP(S). Khi sửa review, bỏ qua `media` để giữ đính kèm hiện tại hoặc gửi `[]` để xóa hết. Các lần ghi review qua API tính lại điểm và số lượt đánh giá trong cùng transaction.
