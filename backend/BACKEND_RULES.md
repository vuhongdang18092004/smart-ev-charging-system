# PROJECT ARCHITECTURE & CODING RULES (EV CHARGING SYSTEM)

Bạn là Senior Fullstack Developer (Java Spring Boot & Next.js TypeScript). Mọi code sinh ra BẮT BUỘC phải tuân thủ cấu trúc thư mục và quy tắc dưới đây.

## 1. NGUYÊN TẮC CỐT LÕI (STRICT RULES)
- **Database First:** Mọi Entity, DTO, Service và Frontend Type/Schema PHẢI đối chiếu chính xác từng cột, kiểu dữ liệu và ràng buộc trong file `backend/src/main/resources/db/migration/V1__initial_schema.sql`. Không tự ý bịa thêm cột không có trong SQL.
- **No Hardcoding:**
    - Backend: Không hardcode message lỗi/thông báo trong code Java, phải đưa vào `resources/text/` (ResourceBundle) và `common/constants/`.
- **Clean Architecture:** Tách biệt rạch ròi các tầng. Tuyệt đối không gọi Repository trực tiếp từ Controller (Backend) .

## 2. WORKFLOW THỰC THI KHI NHẬN TASK
Khi được yêu cầu implement tính năng mới, thực hiện theo đúng thứ tự:
1. Đọc file `backend/src/main/resources/db/migration/V1__initial_schema.sql` để nắm rõ schema các bảng liên quan.
2. Kiểm tra và tái sử dụng các class trong `common/base/` (Backend). Nếu chưa có thì khởi tạo đúng chuẩn trước.
3. Code Backend từ dưới lên: `Entity` -> `Repository` -> `DTO (Request/Response)` -> `Service & ServiceImpl` -> `Controller`.
4. Tự kiểm tra lại toàn bộ import, kiểu dữ liệu (Strict TS) và lint rules trước khi kết thúc.

# BACKEND RULES (SPRING BOOT)

Base package: `com.smart.evcharging.backend`

## 1. CẤU TRÚC THƯ MỤC BẮT BUỘC
```text
src/main/java/com/smart/evcharging/backend/
├── common/
│   ├── base/          # BaseEntity (@MappedSuperclass: id, createdAt, updatedAt, deletedAt), BaseController, BaseService<T, ID>, BaseServiceImpl
│   ├── constants/     # ErrorCodes, SystemConstants, RegexConstants
│   ├── exception/     # GlobalExceptionHandler (@RestControllerAdvice), CustomBusinessException
│   └── utils/         # Các hàm tiện ích
├── config/            # SecurityConfig, OpenApiConfig, DatabaseConfig
├── controller/        # Tầng HTTP API (Chỉ nhận DTO, gọi Service, trả về Response chuẩn qua BaseController)
├── dto/
│   ├── request/       # Request DTOs (Bắt buộc dùng Jakarta Validation: @NotNull, @NotBlank, @Valid...)
│   └── response/      # Response DTOs & PaginatedResponse
├── entity/            # JPA Entities (Kế thừa BaseEntity, map chuẩn xác với V1__initial_schema.sql)
├── repository/        # JpaRepository interfaces (và thư mục custom/ cho Native SQL/Criteria phức tạp)
└── service/
    ├── impl/          # Class thực thi (*ServiceImpl.java), đánh dấu @Service, @Transactional
    └── *Service.java  # Interface định nghĩa nghiệp vụ 
```

## 2. QUY TẮC CODE JAVA
Soft Delete: Với các bảng có cột deleted_at (như stations), câu lệnh DELETE phải cập nhật deleted_at = NOW() thay vì xóa vật lý. Các truy vấn GET danh sách/chi tiết mặc định phải lọc deleted_at IS NULL.

Transaction: Các API tạo/sửa dữ liệu lồng nhau (như POST /api/stations tạo trạm kèm danh sách connectors) BẮT BUỘC dùng @Transactional(rollbackFor = Exception.class).

Validation & Exception: Validate toàn bộ đầu vào ở tầng DTO Request. Mọi lỗi nghiệp vụ ném ra CustomBusinessException với mã lỗi lấy từ ErrorCodes và message lấy từ resources/text/messages.properties.

Lombok & Clean Code: Sử dụng Lombok hợp lý (@Getter, @Setter, @Builder, @RequiredArgsConstructor). Không dùng @Data trên JPA Entity để tránh lỗi vòng lặp toString/equals.