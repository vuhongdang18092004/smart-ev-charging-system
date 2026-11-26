# Voucher giảm giá sạc xe

Web quản trị cung cấp danh sách, bộ lọc và biểu mẫu tại `/vouchers`. ADMIN phát hành theo toàn hệ thống, theo hãng hoặc theo trạm và kiểm duyệt chiến dịch của OPERATOR. OPERATOR chỉ quản lý chiến dịch của mình và chọn trạm mình quản lý.

DRIVER dùng tab **Ưu đãi sạc xe** để nhận voucher và kiểm tra ví. Việc cấp QR đánh dấu voucher là `USED`. Nếu lưu ảnh thất bại, có thể mở lại cùng mã ở tab **Đã dùng**. Voucher chưa cấp QR sẽ hết hạn sau `valid_to`. Mã QR chứa thông tin đọc được bằng camera và dùng múi giờ Việt Nam cho hạn thanh toán. Việc ứng dụng của hãng chấp nhận ưu đãi phụ thuộc vào hệ thống thanh toán bên ngoài.

Sau khi có lượt nhận đầu tiên, giữ nguyên điều khoản giảm giá, phạm vi, tiền tố và thời gian hiệu lực. Tạm ngưng hoặc xóa mềm chiến dịch dừng nhận mới. Voucher đã nhận vẫn có thể lấy QR trong thời hạn của nó.

Migration V10 thêm hai bảng `vouchers` và `user_vouchers`. Triển khai migration trên PostgreSQL đã sao lưu trước khi chạy phiên bản backend mới đối với database đang dùng.

Cài các dependency đã khóa phiên bản bằng `npm ci` trong thư mục mobile. App sử dụng `react-native-qrcode-svg` và `react-native-svg` để dựng mã, `expo-file-system` và `expo-media-library` để lưu PNG. Với development build hoặc bản phát hành, rebuild ứng dụng để nạp các module native và cấu hình quyền lưu ảnh.
