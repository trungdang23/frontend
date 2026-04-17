# Frontend Phase Checklist

## Quy ước trạng thái

- `[x]` hoàn thành
- `[ ]` chưa hoàn thành
- `Status` của phase được cập nhật thủ công theo tiến độ thực tế

## Giả định hiện tại

- [x] Đã có concept UI tham chiếu trong `UI_demo.txt`
- [x] Đã có backend production cho auth
- [x] Đã có CORS cho frontend domain
- [x] Đã có planning docs nền cho frontend
- [x] Đã scaffold source frontend thực tế
- [x] Đã chốt domain deploy frontend
- [x] Đã có CI riêng cho frontend

## Tổng quan phase

| Phase | Mục tiêu | Status |
| --- | --- | --- |
| 00 | Chốt planning và baseline frontend | Completed |
| 01 | Chốt stack và scaffold app frontend | Completed |
| 02 | Xây dựng auth flow và protected app shell | Completed |
| 03 | Xây dựng landing và public surface | Completed |
| 04 | Xây dựng dashboard, profile, và empty states có dữ liệu thật | Completed |
| 05 | Xây dựng `trips` workspace | Completed |
| 06 | Xây dựng `itineraries` và `budgets` workspace | Todo |
| 07 | Xây dựng `community` experience | Blocked by BE Phase 06 |
| 08 | Hardening, test, accessibility, và deploy | Todo |

## Phase 00 - Chốt planning và baseline frontend

Status: `Completed`

- [x] Tạo package README cho frontend
- [x] Tạo foundation document
- [x] Tạo phase checklist
- [x] Tạo stack decision document
- [x] Tạo design principles document
- [x] Tạo route và screen plan
- [x] Tạo API integration plan
- [x] Tạo app architecture plan
- [x] Tạo definition of done
- [x] Tạo risk và dependency notes

## Phase 01 - Chốt stack và scaffold app frontend

Status: `Completed`

- [x] Chốt framework và toolchain scaffold
- [x] Khởi tạo project frontend trong `frontend/`
- [x] Tạo cấu trúc thư mục theo `app/features/shared`
- [x] Tạo app router và route groups public/protected
- [x] Tạo HTTP client nền
- [x] Tạo config env nền
- [x] Tạo shared response/error handling strategy
- [x] Tạo token và design variable nền
- [x] Tạo lint, format, test, build scripts
- [x] Tạo `frontend/README.md` mô tả cách chạy package sau khi scaffold

## Phase 02 - Xây dựng auth flow và protected app shell

Status: `Completed`

- [x] Tạo route `login`
- [x] Tạo route `register`
- [x] Kết nối `POST /auth/login`
- [x] Kết nối `POST /auth/register`
- [x] Kết nối `GET /auth/me`
- [x] Kết nối `POST /auth/refresh`
- [x] Tạo session persistence strategy
- [x] Tạo protected route guard
- [x] Tạo app shell cho khu vực đăng nhập
- [x] Tạo logout flow rõ ràng

## Phase 03 - Xây dựng landing và public surface

Status: `Completed`

- [x] Tạo landing page production thay vì demo state-machine
- [x] Chốt hero, CTA, và section hierarchy
- [x] Tạo public navigation
- [x] Tạo mobile navigation pattern
- [x] Tạo community teaser hoặc read-only blocks nếu cần
- [x] Tạo loading skeleton cho public image-heavy sections nếu public surface chuyển sang dữ liệu động
- [x] Chốt copy baseline tiếng Việt

## Phase 04 - Xây dựng dashboard, profile, và empty states có dữ liệu thật

Status: `Completed`

- [x] Tạo dashboard route trong protected area
- [x] Tạo empty state khi chưa có chuyến đi
- [x] Tạo profile summary từ `GET /auth/me`
- [x] Tạo session boot flow khi refresh trình duyệt
- [x] Tạo unauthorized và expired-session handling
- [x] Tạo toast hoặc banner feedback cho auth actions

## Phase 05 - Xây dựng `trips` workspace

Status: `Completed`

- [x] Tạo backlog thực thi chi tiết cho `trips` workspace trong `documents/10_frontend-trips-execution-backlog.md`
- [x] Thay placeholder routes bằng page thật cho `trips`, `trips/new`, `trips/:tripId`, `trips/:tripId/edit`
- [x] Thêm route index `/app/trips` và nối lại protected navigation tới khu vực này
- [x] Tạo API layer `features/trips/api` cho create/list/detail/update/delete
- [x] Tạo types và mapper cho `Trip`, `TripListMeta`, `TripSort`
- [x] Tạo form tạo/chỉnh sửa chuyến đi với validation phía client
- [x] Tạo loading, empty, error, not-found state cho list/detail/edit
- [x] Tạo mutation feedback rõ ràng cho create/update/delete
- [x] Chốt verify tối thiểu cho Phase 05: lint, test, build

## Phase 06 - Xây dựng `itineraries` và `budgets` workspace

Status: `Todo`

- [ ] Tạo timeline/day planner UI
- [ ] Tạo budget summary UI
- [ ] Kết nối API itinerary và budget
- [ ] Tạo validation và inline feedback cho activity form
- [ ] Tạo chart hoặc progress UI cho ngân sách

## Phase 07 - Xây dựng `community` experience

Status: `Blocked by BE Phase 06`

- [ ] Tạo community feed route
- [ ] Tạo post detail route
- [ ] Kết nối like/comment/follow nếu backend đã sẵn
- [ ] Tạo author profile entrypoints
- [ ] Tạo moderation-safe empty/error state

## Phase 08 - Hardening, test, accessibility, và deploy

Status: `Todo`

- [x] Thêm GitHub Actions CI riêng cho frontend
- [ ] Thêm unit/component test cho auth và shared UI quan trọng
- [ ] Thêm route-level integration tests
- [ ] Thêm smoke e2e cho login -> dashboard
- [ ] Kiểm tra accessibility các flow chính
- [ ] Kiểm tra responsive trên mobile và desktop
- [x] Chốt env runtime cho frontend
- [x] Chốt deploy target
- [ ] Chạy post-deploy verification

## Immediate Todo Sau Planning

- [x] Review và chốt stack đề xuất
- [x] Review và chốt route map phase 1
- [x] Chốt session strategy cho auth phase đầu
- [x] Bắt đầu scaffold `frontend/`
- [x] Chốt domain deploy frontend
- [ ] Test login/register/me/refresh qua domain frontend thật
- [x] Quyết định mức polish tiếp theo cho landing/public section trước khi mở phase 08
- [ ] Chốt ưu tiên hardening tiếp theo trong phase 08
