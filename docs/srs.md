# Tài liệu đặc tả yêu cầu phần mềm (SRS)

## Smart EV Charging System

**Phiên bản:** 0.1  
**Trạng thái:** Draft

---

## 1. Giới thiệu

### 1.1. Mục đích

Smart EV Charging System là hệ thống hỗ trợ tìm kiếm, lựa chọn và quản lý các trạm sạc xe điện.

Hệ thống hướng đến hai nhóm người dùng chính:

- Người sử dụng xe điện: tìm kiếm và lựa chọn trạm sạc phù hợp.
- Chủ trạm sạc: quản lý và theo dõi hoạt động của các trạm sạc.

Hệ thống tập trung vào việc sử dụng dữ liệu về trạm sạc và tình trạng hoạt động để hỗ trợ người dùng lựa chọn trạm phù hợp, đồng thời hỗ trợ chủ trạm theo dõi và cải thiện hiệu quả sử dụng hạ tầng sạc.

### 1.2. Phạm vi

Hệ thống gồm ba thành phần chính:

- **Mobile:** Ứng dụng dành cho người sử dụng xe điện.
- **Frontend:** Ứng dụng web dành cho chủ trạm và quản lý hệ thống.
- **Backend:** Hệ thống xử lý nghiệp vụ, quản lý dữ liệu và cung cấp API cho các ứng dụng.

Trong phạm vi đồ án, dữ liệu hoạt động của các trạm sạc và xe điện được mô phỏng thay cho dữ liệu vận hành thực tế.

### 1.3. Mục tiêu

Hệ thống hướng đến các mục tiêu:

- Hỗ trợ người dùng tìm kiếm các trạm sạc phù hợp.
- Cung cấp thông tin về vị trí và tình trạng của trạm sạc.
- Hỗ trợ đánh giá tình trạng sử dụng của các trạm.
- Đưa ra gợi ý trạm sạc phù hợp dựa trên nhiều yếu tố.
- Hỗ trợ chủ trạm theo dõi hoạt động của trạm.
- Hỗ trợ phân bổ nhu cầu sạc giữa các trạm.
- Thử nghiệm và đánh giá các phương pháp giải quyết bài toán đề xuất và phân bổ nhu cầu sạc.

---

## 2. Tổng quan hệ thống

### 2.1. Mô hình hệ thống

Hệ thống được định hướng như một nền tảng bên thứ ba cung cấp dịch vụ hỗ trợ người sử dụng xe điện và các đơn vị vận hành trạm sạc.

Trong thực tế, hệ thống có thể nhận dữ liệu từ các đơn vị vận hành trạm sạc thông qua các phương thức tích hợp phù hợp.

Trong phạm vi đồ án, dữ liệu được xây dựng và mô phỏng nhằm phục vụ phát triển, kiểm thử và đánh giá hệ thống.

### 2.2. Đối tượng sử dụng

#### Người sử dụng xe điện

Người sử dụng xe điện có thể:

- Tìm kiếm trạm sạc.
- Xem thông tin trạm sạc.
- Xem tình trạng các cổng sạc.
- Xem khoảng cách đến trạm.
- Xem thông tin về công suất sạc.
- Nhận gợi ý trạm sạc phù hợp.
- Xem thông tin về thời gian chờ dự kiến.
- Xem đường đi đến trạm.

#### Chủ trạm

Chủ trạm có thể:

- Quản lý thông tin trạm sạc.
- Quản lý các cổng sạc.
- Theo dõi tình trạng hoạt động.
- Theo dõi nhu cầu sạc.
- Xem các thông tin thống kê và phân tích.
- Theo dõi mức độ sử dụng của trạm.
- Hỗ trợ đưa ra các quyết định nhằm cải thiện hiệu quả sử dụng trạm.

#### Quản trị viên

Quản trị viên có trách nhiệm quản lý các thông tin và hoạt động ở cấp độ hệ thống.

Các chức năng cụ thể của quản trị viên sẽ được xác định trong quá trình phát triển.

---

## 3. Các thành phần của hệ thống

### 3.1. Mobile Application

Ứng dụng mobile dành cho người sử dụng xe điện.

Các chức năng chính:

- Tìm kiếm trạm sạc.
- Xem danh sách trạm.
- Xem thông tin chi tiết trạm.
- Xem trạng thái trạm và cổng sạc.
- Nhận gợi ý trạm sạc.
- Xem thời gian chờ dự kiến.
- Hỗ trợ tìm đường đến trạm.

Công nghệ dự kiến:

- React Native
- TypeScript
- Expo

### 3.2. Web Application

Ứng dụng web dành chủ yếu cho chủ trạm và quản lý hệ thống.

Các chức năng chính:

- Quản lý trạm sạc.
- Quản lý cổng sạc.
- Theo dõi tình trạng hoạt động.
- Xem thống kê và dữ liệu sử dụng.
- Theo dõi nhu cầu sạc.
- Hỗ trợ quản lý hoạt động của trạm.

Công nghệ dự kiến:

- Next.js
- React
- TypeScript
- Tailwind CSS

### 3.3. Backend

Backend chịu trách nhiệm xử lý các nghiệp vụ chính của hệ thống.

Các chức năng chính:

- Cung cấp API cho Mobile và Web.
- Xử lý nghiệp vụ.
- Quản lý dữ liệu.
- Quản lý trạm sạc.
- Quản lý cổng sạc.
- Quản lý thông tin và trạng thái sạc.
- Xử lý dữ liệu mô phỏng.
- Xử lý chức năng gợi ý.
- Xử lý các phương pháp phân bổ và tối ưu.
- Cung cấp dữ liệu theo thời gian thực khi cần thiết.

Công nghệ dự kiến:

- Java
- Spring Boot
- PostgreSQL

---

## 4. Yêu cầu chức năng

### 4.1. Tìm kiếm trạm sạc

Hệ thống cho phép người sử dụng:

- Tìm kiếm trạm sạc.
- Xem các trạm sạc trong khu vực mong muốn.
- Lọc trạm theo một số tiêu chí.
- Sắp xếp danh sách trạm.
- Xem vị trí của trạm.

### 4.2. Xem thông tin trạm sạc

Hệ thống cung cấp các thông tin cơ bản của trạm như:

- Tên trạm.
- Vị trí.
- Khoảng cách.
- Số lượng cổng sạc.
- Công suất sạc.
- Trạng thái cổng sạc.
- Tình trạng hoạt động của trạm.

Các thông tin khác có thể được bổ sung trong quá trình phát triển.

### 4.3. Gợi ý trạm sạc

Hệ thống hỗ trợ đưa ra các trạm sạc phù hợp với nhu cầu của người sử dụng.

Việc gợi ý có thể xem xét các yếu tố như:

- Khoảng cách.
- Công suất sạc.
- Tình trạng cổng sạc.
- Thời gian chờ dự kiến.
- Thời gian sạc dự kiến.
- Mức độ sử dụng của trạm.
- Nhu cầu sạc của người sử dụng.

Phương pháp và thuật toán cụ thể sẽ được lựa chọn và đánh giá trong quá trình phát triển.

### 4.4. Ước lượng thời gian chờ

Hệ thống hỗ trợ ước lượng thời gian mà người sử dụng có thể phải chờ tại một trạm sạc.

Việc ước lượng có thể dựa trên:

- Các xe đang sạc.
- Các xe đang chờ.
- Trạng thái các cổng sạc.
- Công suất sạc.
- Thời gian sạc.
- Dữ liệu hoạt động trước đó.
- Dữ liệu mô phỏng.

Phương pháp ước lượng cụ thể sẽ được xác định trong quá trình nghiên cứu và phát triển.

### 4.5. Quản lý trạm sạc

Chủ trạm có thể:

- Xem thông tin các trạm thuộc quyền quản lý.
- Thêm và cập nhật thông tin trạm.
- Quản lý các cổng sạc.
- Theo dõi trạng thái các cổng.
- Theo dõi hoạt động sạc.

### 4.6. Theo dõi và phân tích hoạt động

Hệ thống hỗ trợ chủ trạm theo dõi các thông tin như:

- Số lượng phiên sạc.
- Mức độ sử dụng của trạm.
- Nhu cầu sạc theo thời gian.
- Thời gian có nhu cầu cao.
- Tình trạng sử dụng các cổng sạc.

Các chỉ số cụ thể sẽ được xác định dựa trên dữ liệu và phạm vi thực tế của đồ án.

### 4.7. Phân bổ nhu cầu sạc

Hệ thống hỗ trợ phân bổ nhu cầu sạc giữa nhiều trạm.

Mục tiêu bao gồm:

- Hạn chế tình trạng một số trạm quá tải.
- Tận dụng các trạm còn khả năng phục vụ.
- Giảm thời gian chờ của người sử dụng.
- Duy trì khoảng cách di chuyển hợp lý.
- Cải thiện mức độ sử dụng của hệ thống trạm sạc.

Các phương pháp hoặc thuật toán khác nhau có thể được triển khai và so sánh trong quá trình nghiên cứu.

### 4.8. Theo dõi trạng thái theo thời gian thực

Hệ thống có thể cập nhật các thông tin thay đổi theo thời gian như:

- Trạng thái cổng sạc.
- Phiên sạc.
- Số lượng xe đang chờ.
- Khả năng phục vụ của trạm.

Cơ chế cập nhật theo thời gian thực sẽ được hoàn thiện trong quá trình phát triển.

---

## 5. Dữ liệu mô phỏng

Do đồ án không có quyền truy cập vào dữ liệu vận hành thực tế của các mạng lưới trạm sạc, hệ thống sử dụng dữ liệu mô phỏng.

### 5.1. Dữ liệu trạm sạc

Dữ liệu mô phỏng có thể bao gồm:

- Thông tin trạm.
- Vị trí.
- Số lượng cổng sạc.
- Công suất cổng sạc.
- Trạng thái cổng.
- Lịch sử sử dụng.

### 5.2. Dữ liệu phiên sạc

Dữ liệu phiên sạc có thể bao gồm:

- Trạm sạc.
- Cổng sạc.
- Thời gian bắt đầu.
- Thời gian kết thúc.
- Thời gian sạc.
- Trạng thái phiên sạc.

### 5.3. Dữ liệu nhu cầu

Hệ thống có thể mô phỏng nhiều xe có nhu cầu sạc tại các thời điểm và vị trí khác nhau.

Các kịch bản mô phỏng có thể bao gồm:

- Thời điểm hoạt động bình thường.
- Giờ cao điểm.
- Trạm có mức sử dụng cao.
- Nhu cầu sạc phân bố không đồng đều.
- Nhiều xe cùng phát sinh nhu cầu trong một khoảng thời gian.

### 5.4. Mục đích mô phỏng

Dữ liệu mô phỏng được sử dụng để:

- Kiểm thử hệ thống.
- Mô phỏng hoạt động của các trạm sạc.
- Kiểm thử chức năng gợi ý.
- Kiểm thử các phương pháp phân bổ.
- So sánh các thuật toán.
- Đánh giá hiệu quả của các phương pháp được lựa chọn.

---

## 6. Yêu cầu phi chức năng

### 6.1. Hiệu năng

Hệ thống cần đảm bảo thời gian phản hồi hợp lý đối với các chức năng thông thường.

Các thuật toán gợi ý và tối ưu cần được đánh giá về thời gian xử lý.

### 6.2. Khả năng mở rộng

Kiến trúc hệ thống cần cho phép mở rộng số lượng người dùng, trạm sạc và dữ liệu mà không phải thay đổi lớn về kiến trúc.

### 6.3. Độ tin cậy

Hệ thống cần xử lý các yêu cầu không hợp lệ và các trạng thái bất thường mà không làm ảnh hưởng đến toàn bộ hệ thống.

### 6.4. Khả năng sử dụng

Ứng dụng mobile cần có giao diện đơn giản, dễ sử dụng và giúp người dùng nhanh chóng tìm được trạm sạc phù hợp.

Ứng dụng web cần cung cấp thông tin rõ ràng và thuận tiện cho chủ trạm theo dõi hoạt động.

### 6.5. Khả năng bảo trì

Hệ thống cần được xây dựng theo hướng module hóa để các phương pháp gợi ý hoặc tối ưu có thể được thay đổi, thử nghiệm và so sánh mà không ảnh hưởng lớn đến các thành phần khác.

---

## 7. Đánh giá thuật toán

Một trong những mục tiêu của đồ án là nghiên cứu và đánh giá các phương pháp khác nhau cho bài toán gợi ý và phân bổ nhu cầu sạc.

Các phương pháp có thể được đánh giá dựa trên những tiêu chí như:

- Thời gian chờ trung bình.
- Khoảng cách di chuyển.
- Thời gian xử lý.
- Mức độ sử dụng của các trạm.
- Mức độ cân bằng tải giữa các trạm.
- Số lượng yêu cầu được đáp ứng.

Các thuật toán cụ thể sẽ được xác định sau quá trình nghiên cứu.

---

## 8. Mô hình kinh doanh

Hệ thống được định hướng là một nền tảng bên thứ ba cung cấp dịch vụ cho người sử dụng xe điện và các đơn vị vận hành trạm sạc.

### 8.1. Đối với người sử dụng

Các chức năng cơ bản như tìm kiếm và gợi ý trạm sạc có thể được cung cấp miễn phí.

### 8.2. Đối với chủ trạm

Chủ trạm có thể trả phí để sử dụng các dịch vụ nâng cao của nền tảng, chẳng hạn như:

- Phân tích hoạt động.
- Phân tích nhu cầu.
- Tối ưu mức độ sử dụng trạm.
- Hỗ trợ phân bổ nhu cầu đến các trạm.
- Các dịch vụ hỗ trợ tăng mức độ sử dụng của trạm.

Mô hình thanh toán cụ thể không thuộc phạm vi chức năng cốt lõi của phiên bản hiện tại.

---

## 9. Phạm vi đồ án

### 9.1. Trong phạm vi

- Ứng dụng mobile cho người sử dụng xe điện.
- Ứng dụng web cho chủ trạm.
- Backend.
- Quản lý trạm sạc.
- Tìm kiếm và xem thông tin trạm.
- Theo dõi trạng thái trạm.
- Dữ liệu mô phỏng.
- Mô phỏng nhu cầu sạc.
- Gợi ý trạm sạc.
- Ước lượng thời gian chờ.
- Phân bổ nhu cầu sạc.
- Thử nghiệm và đánh giá các phương pháp.

### 9.2. Ngoài phạm vi hiện tại

Các chức năng sau chưa thuộc phạm vi chính của phiên bản hiện tại:

- Kết nối trực tiếp với trạm sạc vật lý.
- Tích hợp dữ liệu vận hành thực tế của các mạng lưới trạm.
- Thanh toán thực tế.
- Điều khiển thiết bị sạc.
- Thu thập dữ liệu trực tiếp từ xe điện.
- Tích hợp phần cứng trên xe.

Các chức năng này có thể được xem xét trong tương lai.

---

## 10. Định hướng phát triển

Các hướng phát triển có thể bao gồm:

- Tích hợp với API của các đơn vị vận hành trạm sạc.
- Dự đoán nhu cầu sạc.
- Dự đoán thời gian chờ.
- Các phương pháp tối ưu nâng cao.
- Tích hợp dịch vụ bản đồ và dẫn đường.
- Hỗ trợ nhiều mạng lưới trạm sạc.
- Sử dụng dữ liệu vận hành thực tế.

---

## 11. Trạng thái dự án

Dự án hiện đang ở giai đoạn khởi đầu.

Các yêu cầu, kiến trúc hệ thống, mô hình dữ liệu, phương pháp gợi ý, phương pháp phân bổ và kịch bản mô phỏng sẽ tiếp tục được hoàn thiện trong quá trình phát triển.