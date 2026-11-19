# PROJECT ARCHITECTURE & CODING RULES (EV CHARGING SYSTEM)

Bạn là Senior Fullstack Developer (Java Spring Boot & Next.js TypeScript). Mọi code sinh ra BẮT BUỘC phải tuân thủ cấu trúc thư mục và quy tắc dưới đây.

## 1. NGUYÊN TẮC CỐT LÕI (STRICT RULES)
- **No Hardcoding:** 
  - Frontend: Không hardcode mã màu hex (dùng Tailwind theme/tokens), không hardcode magic numbers, không hardcode text rời rạc (gom vào `constants/`).
- **Clean Architecture:** Tách biệt rạch ròi các tầng.  không gọi Axios trực tiếp trong UI Component (Frontend).

## 2. WORKFLOW THỰC THI KHI NHẬN TASK
Khi được yêu cầu implement tính năng mới, thực hiện theo đúng thứ tự:
1. Kiểm tra và tái sử dụng các class trong `components/base/` (Frontend). Nếu chưa có thì khởi tạo đúng chuẩn trước.
2. Code Frontend từ dưới lên: `types/` -> `schemas/` (Zod) -> `services/` (API calls) -> `hooks/` -> `components/features/` -> `app/` (Pages).
3. Tự kiểm tra lại toàn bộ import, kiểu dữ liệu (Strict TS) và lint rules trước khi kết thúc.

---

#### 3. File `frontend/FRONTEND_RULES.md` (Đặt trong thư mục `frontend/`)

```markdown
# FRONTEND RULES (NEXT.JS APP ROUTER + TYPESCRIPT)

## 1. CẤU TRÚC THƯ MỤC BẮT BUỘC
```text
src/
├── assets/            # Static assets qua build (images, svg, local fonts)
├── app/               # Next.js App Router (layout.tsx, page.tsx - giữ mỏng, chỉ gọi Feature Components)
├── components/
│   ├── base/          # UI tái sử dụng độc lập nghiệp vụ (BaseButton, BaseTable, BaseModal, BaseInput, BasePagination...)
│   └── features/      # Component theo từng domain (stations/, brands/, connectors/, operators/)
├── lib/               # Cấu hình thư viện cốt lõi (axiosClient.ts có interceptor xử lý lỗi chung)
├── hooks/             # Custom React Hooks (fetch data, debounce, pagination state...)
├── store/             # Global state (Zustand) nếu cần chia sẻ state giữa các màn hình
├── types/             # TypeScript interfaces/types khớp 100% với DTO Backend
├── schemas/           # Zod schemas để validate form input
├── services/          # Các hàm gọi API bằng axiosClient (chia theo domain: stationService.ts, brandService.ts...)
├── utils/             # Pure functions dùng chung (formatDate, formatCurrency...)
└── constants/         # Enums, API endpoints, nhãn hiển thị, hằng số (Cấm magic numbers/strings)
```

## 2. QUY TẮC CODE & LINTING KHẮT KHE
Naming Convention: Tên file và thư mục dùng kebab-case (ví dụ: station-list.tsx, use-stations.ts), riêng React Component bên trong dùng PascalCase.

TypeScript Strict: Tuyệt đối CẤM dùng any. Mọi response API, props, state đều phải định nghĩa interface rõ ràng trong src/types/.

Styling & Theme: Sử dụng TailwindCSS. Không dùng inline style hay mã màu hex cứng (như #123456). Định nghĩa màu sắc trong tailwind.config.ts và gọi qua class.

Architecture Boundaries:

File trong components/base/ không được import từ components/features/ hay services/.

File trong app/ chỉ làm nhiệm vụ routing và render component từ components/features/.

Husky & Quality: Đảm bảo code pass tsc --noEmit và eslint không có unused imports hay cảnh báo.