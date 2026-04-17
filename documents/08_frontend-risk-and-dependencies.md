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
- trips CRUD
- itinerary APIs
- budget APIs
- CORS production cho frontend domain

### Chưa sẵn cho production FE

- community feed APIs
- post detail APIs
- like/comment/follow APIs

## Rủi ro kiến trúc hiện tại

### 1. Session storage phase đầu chưa phải hardening tối ưu

- Backend hiện trả token qua response body.
- FE phase đầu khó tránh việc lưu session client-side.
- Đây là điểm cần revisit sau khi backend hỗ trợ cookie-based refresh token.

### 2. Itinerary và budget UI rất dễ vượt scope trước backend

- `UI_demo.txt` có nhiều trạng thái timeline/budget hấp dẫn để làm sớm.
- Nếu dựng full UI `itineraries` hoặc `budgets` vượt ra ngoài contract Phase 05 hiện có, khả năng rework cao.

### 3. Community section dễ bị hiểu nhầm là production-ready

- Demo hiện có nhiều content card bắt mắt.
- Nếu không gắn label rõ, team có thể tưởng community feed thật đã sẵn.

### 4. Design system có nguy cơ trượt thành nhiều biến thể ad-hoc

- Reference demo giàu visual và nhiều one-off styling.
- Nếu không token hóa sớm, app sẽ khó mở rộng khi nhiều feature xuất hiện.

### 5. Frontend deploy rất dễ lệch API base URL nếu để env trong source

- Với Vite, build-time env đi vào bundle ngay lúc build.
- Nếu giữ URL thật trong source hoặc file env commit vào repo, preview và production rất dễ trỏ nhầm.
- Vì vậy build-time env cho deploy phải lấy từ GitHub `Variables`.

### 6. Root domain frontend cần route ổn định qua Cloudflare Tunnel

- Nếu tunnel config không có `buicojourney.com` và `www.buicojourney.com`, deploy thành công vẫn không có traffic public.
- Sau reboot máy, chỉ cần tunnel hostname và runtime scripts giữ nguyên là frontend vẫn có thể lên lại mà không đổi keys.

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

## Khuyến nghị thứ tự làm từ trạng thái hiện tại

1. Giữ ổn định auth flow thật
2. Giữ ổn định protected shell
3. Hoàn tất hardening cho dashboard/profile/trips
4. Chạy post-deploy verification trên domain thật
5. Nối frontend phase 06 cho `itineraries` và `budgets` theo contract thật
6. Chỉ mở `community` sau khi backend phase 06 sẵn

## Điều không nên làm tiếp theo

- Không nên dựng `itineraries` hoặc `budgets` production bằng mock rồi quên thay.
- Không nên làm community interactive trước khi có backend thật.
- Không nên vừa scaffold vừa đổi stack giữa chừng.
