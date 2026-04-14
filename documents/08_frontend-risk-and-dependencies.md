# Frontend Risk And Dependencies

## Mục tiêu

- Chỉ ra rõ các dependency giữa frontend plan với backend reality.
- Giảm khả năng scaffold FE rồi mới phát hiện thiếu contract hoặc lệch scope.

## Dependency chính từ backend

### Đã sẵn và dùng được ngay

- auth register
- auth login
- auth me
- auth refresh
- CORS production cho frontend domain

### Chưa sẵn cho production FE

- trips CRUD
- itinerary APIs
- budget APIs
- community feed APIs
- post detail APIs
- like/comment/follow APIs

## Rủi ro kiến trúc hiện tại

### 1. Session storage phase đầu chưa phải hardening tối ưu

- Backend hiện trả token qua response body.
- FE phase đầu khó tránh việc lưu session client-side.
- Đây là điểm cần revisit sau khi backend hỗ trợ cookie-based refresh token.

### 2. Trips UI rất dễ vượt scope trước backend

- `UI_demo.txt` có nhiều trạng thái `trips` hấp dẫn để làm sớm.
- Nếu dựng full UI trips trước khi BE phase 04 sẵn, khả năng rework cao.

### 3. Community section dễ bị hiểu nhầm là production-ready

- Demo hiện có nhiều content card bắt mắt.
- Nếu không gắn label rõ, team có thể tưởng community feed thật đã sẵn.

### 4. Design system có nguy cơ trượt thành nhiều biến thể ad-hoc

- Reference demo giàu visual và nhiều one-off styling.
- Nếu không token hóa sớm, app sẽ khó mở rộng khi nhiều feature xuất hiện.

## Risk giảm thiểu bằng planning hiện tại

- Chốt route map trước khi scaffold
- Chốt stack trước khi scaffold
- Chốt feature ordering theo readiness của backend
- Chốt design principles trước khi viết shared UI
- Chốt auth/session strategy trước khi viết protected shell

## Các quyết định nên giữ rõ trong tài liệu

- Phase nào dùng API thật
- Phase nào chỉ dùng placeholder có chủ đích
- Phase nào bị block bởi backend
- Screen nào là P0, P1, P2

## Khuyến nghị thứ tự làm sau planning

1. Scaffold app foundation
2. Auth flow thật
3. Protected shell
4. Dashboard empty state + profile
5. Landing polish
6. Trips workspace khi backend phase 04 sẵn

## Điều không nên làm tiếp theo

- Không nên code trip detail production ngay.
- Không nên làm community interactive trước khi có backend thật.
- Không nên vừa scaffold vừa đổi stack giữa chừng.
