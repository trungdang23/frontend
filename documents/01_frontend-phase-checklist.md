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
- [ ] Chưa scaffold source frontend thực tế
- [ ] Chưa chốt domain deploy frontend

## Tổng quan phase

| Phase | Mục tiêu | Status |
| --- | --- | --- |
| 00 | Chốt planning và baseline frontend | Completed |
| 01 | Chốt stack và scaffold app frontend | Todo |
| 02 | Xây dựng auth flow và protected app shell | Todo |
| 03 | Xây dựng landing và public surface | Todo |
| 04 | Xây dựng dashboard, profile, và empty states có dữ liệu thật | Todo |
| 05 | Xây dựng `trips` workspace | Blocked by BE Phase 04 |
| 06 | Xây dựng `itineraries` và `budgets` workspace | Blocked by BE Phase 05 |
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

Status: `Todo`

- [ ] Chốt framework và toolchain scaffold
- [ ] Khởi tạo project frontend trong `frontend/`
- [ ] Tạo cấu trúc thư mục theo `app/features/shared`
- [ ] Tạo app router và route groups public/protected
- [ ] Tạo HTTP client nền
- [ ] Tạo config env nền
- [ ] Tạo shared response/error handling strategy
- [ ] Tạo token và design variable nền
- [ ] Tạo lint, format, test, build scripts
- [ ] Tạo `frontend/README.md` mô tả cách chạy package sau khi scaffold

## Phase 02 - Xây dựng auth flow và protected app shell

Status: `Todo`

- [ ] Tạo route `login`
- [ ] Tạo route `register`
- [ ] Kết nối `POST /auth/login`
- [ ] Kết nối `POST /auth/register`
- [ ] Kết nối `GET /auth/me`
- [ ] Kết nối `POST /auth/refresh`
- [ ] Tạo session persistence strategy
- [ ] Tạo protected route guard
- [ ] Tạo app shell cho khu vực đăng nhập
- [ ] Tạo logout flow rõ ràng

## Phase 03 - Xây dựng landing và public surface

Status: `Todo`

- [ ] Tạo landing page production thay vì demo state-machine
- [ ] Chốt hero, CTA, và section hierarchy
- [ ] Tạo public navigation
- [ ] Tạo mobile navigation pattern
- [ ] Tạo community teaser hoặc read-only blocks nếu cần
- [ ] Tạo loading skeleton cho public image-heavy sections
- [ ] Chốt copy baseline tiếng Việt

## Phase 04 - Xây dựng dashboard, profile, và empty states có dữ liệu thật

Status: `Todo`

- [ ] Tạo dashboard route trong protected area
- [ ] Tạo empty state khi chưa có chuyến đi
- [ ] Tạo profile summary từ `GET /auth/me`
- [ ] Tạo session boot flow khi refresh trình duyệt
- [ ] Tạo unauthorized và expired-session handling
- [ ] Tạo toast hoặc banner feedback cho auth actions

## Phase 05 - Xây dựng `trips` workspace

Status: `Blocked by BE Phase 04`

- [ ] Tạo route list/detail/create/edit cho trips
- [ ] Kết nối API create/list/detail/update/delete của `trips`
- [ ] Tạo form tạo chuyến đi
- [ ] Tạo empty, loading, error state cho danh sách chuyến đi
- [ ] Tạo optimistic UX hoặc mutation feedback phù hợp

## Phase 06 - Xây dựng `itineraries` và `budgets` workspace

Status: `Blocked by BE Phase 05`

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

- [ ] Thêm unit/component test cho auth và shared UI quan trọng
- [ ] Thêm route-level integration tests
- [ ] Thêm smoke e2e cho login -> dashboard
- [ ] Kiểm tra accessibility các flow chính
- [ ] Kiểm tra responsive trên mobile và desktop
- [ ] Chốt env runtime cho frontend
- [ ] Chốt deploy target
- [ ] Chạy post-deploy verification

## Immediate Todo Sau Planning

- [ ] Review và chốt stack đề xuất
- [ ] Review và chốt route map phase 1
- [ ] Chốt session strategy cho auth phase đầu
- [ ] Bắt đầu scaffold `frontend/`
