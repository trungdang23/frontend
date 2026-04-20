# Frontend Phase Checklist

## Scope

- Checklist này bám theo DRD và user stories mới tại ngày `2026-04-20`
- `Status` phản ánh mức độ aligned với target product contract, không chỉ phản ánh app hiện tại đã có màn hình gì

## Quy ước trạng thái

- `[x]` hoàn thành và aligned với target
- `[~]` đã có baseline hoặc workaround, nhưng chưa aligned hoàn toàn
- `[ ]` chưa hoàn thành

## Target UX contract cần đạt

- Auth:
  - `login`
  - `register`
  - session boot
  - refresh
  - logout
- Trips:
  - create/list/detail/edit/delete
  - `budgetMode`
  - `manualBudget`
  - `visibility`
- Planner:
  - route `/app/trips/:tripId`
  - render full `PlanNode` tree
  - inline editing là primary mode
  - loading dùng skeleton
  - error dùng toast/banner + retry
- Public:
  - guest xem trip public
- Community:
  - create post
  - list public posts
  - post detail nếu backend mở

## Khoảng cách chính của source hiện tại

- [x] Có auth baseline thật
- [x] Có trips list/create/detail/edit/delete
- [x] `/app/trips/:tripId` đã là planner workspace trên `PlanNode`
- [x] Đã có UI cho `budgetMode/manualBudget`
- [x] Đã có UI cho `visibility`
- [x] Đã có planner tree recursive theo `PlanNode`
- [~] Budget summary đã đọc summary `PlanNode`-based qua endpoint hiện tại; phần còn lại là hardening refetch và runtime verify
- [x] Đã có public trip read
- [x] Đã có data-driven community
- [x] Người dùng đã đăng nhập vẫn có đường quay lại `Khám phá`, `Chuyến đi public`, và `Cộng đồng`
- [x] Đã có logout flow aligned hoàn toàn với backend target

## Tổng quan phase

| Phase | Mục tiêu                                          | Status    |
| ----- | ------------------------------------------------- | --------- |
| 00    | Re-baseline tài liệu và contract theo DRD mới     | Completed |
| 01    | Foundation app, routing, shared architecture      | Completed |
| 02    | Auth và session aligned với DRD                   | Completed |
| 03    | Trips metadata aligned với DRD                    | Completed |
| 04    | Planner workspace trên `PlanNode`                 | Completed |
| 05    | Public trip sharing                               | Completed |
| 06    | Community minimal                                 | Completed |
| 07    | Hardening, test, accessibility, release readiness | Todo      |

## Phase 00 - Re-baseline tài liệu và contract theo DRD mới

Status: `Completed`

- [x] Chốt route chính `/app/trips/:tripId` là planning workspace
- [x] Ghi rõ source hiện tại có legacy itinerary/budget bridge ngoài flow planner chính
- [x] Ghi rõ target planner model là `PlanNode`
- [x] Ghi rõ community hiện chưa production-ready

## Phase 01 - Foundation app, routing, shared architecture

Status: `Completed`

- [x] Scaffold app `React + Vite + TypeScript`
- [x] Chia `app/features/shared`
- [x] Có router public/protected
- [x] Có HTTP client nền
- [x] Có env config nền
- [x] Có build/lint/test scripts
- [x] Có README package

## Phase 02 - Auth và session aligned với DRD

Status: `Completed`

- [x] `login`
- [x] `register`
- [x] `GET /auth/me`
- [x] `refresh`
- [x] Session persistence qua `localStorage`
- [x] Protected app shell
- [x] Redirect vào `/app`
- [x] Sau khi đăng nhập, app shell vẫn giữ entrypoint rõ ràng sang các route public quan trọng
- [x] Logout flow dùng `POST /auth/logout`
- [x] Xử lý expired session thống nhất trên toàn app
- [x] Chuẩn hoá toast/banner cho auth errors
- [x] Route-level verify cho login -> app -> reload -> refresh -> logout

## Phase 03 - Trips metadata aligned với DRD

Status: `Completed`

- [x] Routes `trips`, `new`, `detail`, `edit` đã có baseline
- [x] Create/edit form thêm `budgetMode`
- [x] Form conditionally hiện `manualBudget` khi `budgetMode = manual`
- [x] Thêm `visibility`
- [x] Rà lại validation:
  - `name` required
  - `startDate <= endDate`
  - `manualBudget >= 0`
- [x] Detail/list hiển thị đúng metadata mới
- [x] Chốt copy và empty states cho trip private/public
- [x] Query invalidation đúng sau create/update/delete

## Phase 04 - Planner workspace trên `PlanNode`

Status: `Completed`

- [x] Route `/app/trips/:tripId` đã tồn tại và đang làm planner workspace chính
- [x] Tạo types cho `PlanNode`
- [x] Tạo API layer mới cho:
  - `GET /trips/:tripId/planner`
  - `POST /nodes`
  - `PATCH /nodes/:id`
  - `DELETE /nodes/:id`
- [x] Chuyển main workspace từ itinerary bridge sang planner APIs
- [x] Render full tree, không paginate
- [x] Inline create/edit/delete node
- [x] Không mở route sâu cho từng node
- [x] Empty state cho trip chưa có node
- [x] Loading dùng skeleton
- [x] Error dùng toast/banner + retry
- [x] Delete confirmation đủ rõ
- [x] Query strategy bằng `TanStack Query`
- [x] Cache defaults theo DRD:
  - `listTrips` stale `30s`
  - `tripDetail` stale `30s`
  - `planner` stale `0s`
  - `profile` stale `5m`
- [x] Không build reorder phức tạp trước khi node CRUD ổn định
- [x] Có test planner component/workspace baseline trong `src/tests/trip-planner.test.tsx`
- [~] Budget summary vẫn giữ endpoint hiện tại và được track ở backend `Phase 05`

## Phase 05 - Public trip sharing

Status: `Completed`

- [x] Chi tiết backlog tại `16_frontend-phase-05-public-trip-sharing-backlog.md`
- [x] Có entrypoint xem trip public cho guest
- [x] Có public trip list để guest chọn trip mà không cần biết `id`
- [x] Có share CTA cho trip public
- [x] Owner đã đăng nhập vẫn có quick links quay lại public trip/community/explore từ app shell
- [x] Xử lý rõ các state:
  - public available
  - private denied
  - not found
- [x] Guest chỉ xem, không thấy action mutate

## Phase 06 - Community minimal

Status: `Completed`

- [x] Chi tiết backlog tại `17_frontend-phase-06-community-minimal-backlog.md`
- [x] Tạo community feed route
- [x] Tạo post detail route
- [x] Tạo create post flow
- [x] Hỗ trợ create post from trip nếu backend mở
- [x] Community route vẫn dễ quay lại ngay cả khi người dùng đang ở protected shell
- [ ] Nếu comments được backend mở:
  - render list comments
  - create comment
- [x] Nếu comments chưa có:
  - giữ UI ở trạng thái deferred rõ ràng, không giả production-ready

## Phase 07 - Hardening, test, accessibility, release readiness

Status: `Todo`

- [ ] Chi tiết backlog tại `18_frontend-phase-07-hardening-backlog.md`
- [ ] Unit/component tests cho auth, trips, planner
- [ ] Route-level integration tests
- [ ] Smoke e2e cho:
  - login
  - create trip
  - add node
  - public trip read
- [ ] Rà responsive mobile/desktop
- [ ] Rà accessibility keyboard/focus
- [ ] Rà `prefers-reduced-motion`
- [ ] Post-deploy verification qua domain thật

## Slice giao việc theo FE

### Slice FE-A

- [x] Auth logout + session hardening
- [x] Route-level auth verify

### Slice FE-B

- [x] Trip form aligned với `budgetMode/manualBudget/visibility`
- [x] Trip list/detail aligned với contract mới

### Slice FE-C

- [x] Planner API layer mới
- [x] `PlanNode` types
- [x] planner tree render

### Slice FE-D

- [x] Inline node CRUD
- [x] loading/error/empty states
- [x] query invalidation và retry

### Slice FE-E

- [x] Public trip read UI
- [x] share state handling
- [x] Public trip list UI

### Slice FE-F

- [x] Community feed
- [x] post detail
- [x] create post
- [ ] optional comments

## Immediate next checks

- [x] Chốt shape response planner với backend
- [x] Chốt shape trip mới với backend
- [x] Chốt visibility UX
- [~] Workspace owner flow đã aligned với planner-first contract; phần legacy còn lại chủ yếu nằm ở itinerary support và runtime verify mixed-currency
