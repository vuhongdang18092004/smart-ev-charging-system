# Quản lý trạm sạc

Chạy thêm migration V5 sau V4. V5 chuyển giá từ cổng lên trạm, giữ `NULL` cho trạm chưa có giá và dừng nếu một trạm có nhiều giá khác nhau. Với dữ liệu cũ, hãy đối chiếu giá bằng `SELECT station_id, array_agg(DISTINCT price_per_kwh) FROM connectors GROUP BY station_id HAVING COUNT(DISTINCT price_per_kwh) > 1;` trước khi chạy V5 trong một transaction. V1 và V4 vẫn chứa cột giá cũ để các bước nâng cấp theo thứ tự có dữ liệu di chuyển. V5 khôi phục bảng xe cá nhân sau các bước V2/V3 và tạo danh mục nếu cần.

Request và response trạm có `price_per_kwh` và `phone`. Khi sửa trạm, bỏ qua hai trường này để giữ giá và số điện thoại hiện tại. Gửi `phone` rỗng để xóa số điện thoại. Hợp đồng connector sử dụng các trường riêng của cổng, còn giá nằm trong response trạm. Frontend cũ cần chuyển thao tác giá sang form trạm.

ADMIN quản lý toàn bộ danh mục qua `/api/brands` và `/api/vehicles-infor`. OPERATOR đọc và tạo bản ghi trong danh mục dùng chung, đồng thời chỉ sửa hoặc xóa bản ghi do chính mình tạo. Các bản ghi cũ có `created_by_user_id = NULL` và ADMIN quản lý. Xóa hãng còn liên kết trạm, mẫu xe hoặc chính sách sạc trả `409`. Xóa mẫu xe là xóa mềm và trả `409` khi còn xe cá nhân đang sử dụng.

DRIVER dùng `GET /api/vehicle-options` để chọn mẫu xe và `/api/user-vehicles` để quản lý xe cá nhân. API dùng phiên JWT hiện có và kiểm tra chủ xe theo tài khoản đã xác thực. Xóa xe cá nhân là xóa mềm. V8 thêm tên riêng cho xe cá nhân và điền tên xe cũ từ tên mẫu xe. POST và PUT nhận `name` tối đa 100 ký tự. Khi tạo, bỏ trống để dùng tên mẫu. Khi sửa, bỏ qua trường `name` để giữ tên hiện tại hoặc gửi chuỗi rỗng để dùng lại tên mẫu.

Backend yêu cầu PostgreSQL có schema từ `backend/src/main/resources/db/migration/`. Chạy các migration chưa áp dụng theo thứ tự đến V8 trước khi khởi động. V2 và V3 xóa `user_vehicles` nếu bảng còn tồn tại. V3 thêm thông tin trạm, các bảng media và tính lại điểm từ review hiện có. V4 chuyển tọa độ sang `DOUBLE PRECISION` và tách số lượng cổng cũ thành các bản ghi riêng. Backend sử dụng Hibernate ở chế độ `validate`. Đặt `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME` và `DB_PASSWORD` trong môi trường backend.

Cấu hình tài khoản quản trị bằng `SPRING_SECURITY_USER_NAME` và `SPRING_SECURITY_USER_PASSWORD`. Dùng tài khoản này đăng nhập trên frontend. API quản lý dùng HTTP Basic và cần HTTPS khi triển khai ngoài localhost. Thông tin đăng nhập chỉ được giữ trong bộ nhớ của tab. API tạo operator lưu tài khoản có vai trò `operator` và hồ sơ operator trong cùng transaction, với mật khẩu được băm bằng BCrypt.

Frontend mặc định ở `http://localhost:3000`, backend ở `http://localhost:8080/api`. Dùng `FRONTEND_ALLOWED_ORIGINS` và `NEXT_PUBLIC_API_BASE_URL` để đổi địa chỉ.

Response thành công gồm `success` và `data`, lỗi nghiệp vụ gồm `success`, `code` và `message`. JSON dùng snake_case. GET danh sách trạm nhận `keyword`, `brandId`, `operatorId`, `status`, `page` (từ 0) và `size` (tối đa 100). Kết quả sắp xếp theo tên và ID. POST trạm nhận `{ station, connectors }`. PUT trạm nhận các trường thông tin trạm. Xóa trạm là xóa mềm.

Mỗi connector là một cổng riêng. Mỗi nhóm trong `connectors` khi tạo trạm, hoặc body của `POST /api/stations/{id}/connectors`, nhận `quantity` từ 1 đến 50, mặc định 1. Có thể gửi `code_prefix` để sinh mã dạng `CCS-1`; nếu bỏ trống, mã có dạng `#1`. Để chỉ định mã chính xác, gửi `code` khi tạo một cổng và bỏ qua tiền tố. POST thêm cổng trả mảng các cổng đã tạo. `PUT /api/connectors/{id}` sửa thông tin và trạng thái của riêng cổng đó. `DELETE /api/connectors/{id}` xóa cổng và trả 204.

GET danh sách trạm hỗ trợ thêm hai tham số `locationType` và `parkingFeeType`. Response trạm có `location_type`, `parking_fee_type`, `avg_rating`, `rating_count` và `images`. Khi tạo trạm, có thể gửi `images` ở cấp ngoài hoặc trong `station`. Khi sửa trạm, bỏ qua `images` để giữ ảnh cũ hoặc gửi `[]` để xóa hết ảnh. Có thể thêm và xóa riêng ảnh qua `/api/stations/{stationId}/images`.

Review được tạo và liệt kê qua `/api/stations/{stationId}/reviews`, còn đọc, sửa và xóa từng review qua `/api/reviews/{id}`. Báo cáo được tạo và liệt kê qua `/api/stations/{stationId}/reports`, với chi tiết tại `/api/station-reports/{id}`. Khi tạo review hoặc báo cáo, tài khoản quản trị gửi `driver_id` của một user có vai trò driver. Ảnh và video được lưu dưới dạng URL HTTP(S). Khi sửa review, bỏ qua `media` để giữ đính kèm hiện tại hoặc gửi `[]` để xóa hết. Các lần ghi review qua API tính lại điểm và số lượt đánh giá trong cùng transaction.

Khi OPERATOR tạo hoặc sửa trạm, backend lấy ID đơn vị vận hành từ tài khoản đã xác thực. Có thể bỏ `operator_id` khỏi request của OPERATOR. ADMIN vẫn chỉ định chủ trạm. Quyền quản lý ảnh và connector kế thừa quyền trên trạm.

Trước khi duyệt áp dụng V7 lên PostgreSQL đang dùng, kiểm tra lịch sử Flyway và chạy truy vấn sau trên bản sao đã phục hồi. Nếu có kết quả, xử lý từng nhóm trùng theo các tham chiếu xe cá nhân trước khi tạo index.

```sql
SELECT brand_id, lower(btrim(model)) AS normalized_model, array_agg(id) AS model_ids
FROM vehicles_infor
WHERE deleted_at IS NULL
GROUP BY brand_id, lower(btrim(model))
HAVING count(*) > 1;
```
