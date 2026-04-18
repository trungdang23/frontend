# Frontend Phase Checklist

## Scope

- Checklist này bám theo DRD và user stories mới tại ngày `2026-04-18`
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
- [~] `/app/trips/:tripId` đã là planner workspace, nhưng còn dùng itinerary bridge 2 cấp
- [ ] Chưa có UI cho `budgetMode/manualBudget`
- [ ] Chưa có UI cho `visibility`
- [ ] Chưa có planner tree recursive theo `PlanNode`
- [ ] Chưa có data-driven community
- [ ] Chưa có logout flow aligned hoàn toàn với backend target

## Tổng quan phase

| Phase | Mục tiêu                                          | Status      |
| ----- | ------------------------------------------------- | ----------- |
| 00    | Re-baseline tài liệu và contract theo DRD mới     | Completed   |
| 01    | Foundation app, routing, shared architecture      | Completed   |
| 02    | Auth và session aligned với DRD                   | In Progress |
| 03    | Trips metadata aligned với DRD                    | Todo        |
| 04    | Planner workspace trên `PlanNode`                 | Todo        |
| 05    | Public trip sharing                               | Todo        |
| 06    | Community minimal                                 | Todo        |
| 07    | Hardening, test, accessibility, release readiness | Todo        |

## Phase 00 - Re-baseline tài liệu và contract theo DRD mới

Status: `Completed`

- [x] Chốt route chính `/app/trips/:tripId` là planning workspace
- [x] Ghi rõ source hiện tại còn dùng itinerary bridge
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

Status: `In Progress`

- [x] `login`
- [x] `register`
- [x] `GET /auth/me`
- [x] `refresh`
- [x] Session persistence qua `localStorage`
- [x] Protected app shell
- [x] Redirect vào `/app`
- [ ] Logout flow dùng `POST /auth/logout`
- [ ] Xử lý expired session thống nhất trên toàn app
- [ ] Chuẩn hoá toast/banner cho auth errors
- [ ] Route-level verify cho login -> app -> reload -> refresh -> logout

## Phase 03 - Trips metadata aligned với DRD

Status: `Todo`

- [x] Routes `trips`, `new`, `detail`, `edit` đã có baseline
- [ ] Create/edit form thêm `budgetMode`
- [ ] Form conditionally hiện `manualBudget` khi `budgetMode = manual`
- [ ] Thêm `visibility`
- [ ] Rà lại validation:
  - `name` required
  - `startDate <= endDate`
  - `manualBudget >= 0`
- [ ] Detail/list hiển thị đúng metadata mới
- [ ] Chốt copy và empty states cho trip private/public
- [ ] Query invalidation đúng sau create/update/delete

## Phase 04 - Planner workspace trên `PlanNode`

Status: `Todo`

- [~] Route `/app/trips/:tripId` đã tồn tại và đang làm workspace
- [ ] Tạo types cho `PlanNode`
- [ ] Tạo API layer mới cho:
  - `GET /trips/:tripId/planner`
  - `POST /nodes`
  - `PATCH /nodes/:id`
  - `DELETE /nodes/:id`
- [ ] Chuyển main workspace từ itinerary bridge sang planner APIs
- [ ] Render full tree, không paginate
- [ ] Inline create/edit/delete node
- [ ] Không mở route sâu cho từng node
- [ ] Empty state cho trip chưa có node
- [ ] Loading dùng skeleton
- [ ] Error dùng toast/banner + retry
- [ ] Delete confirmation đủ rõ
- [ ] Query strategy bằng `TanStack Query`
- [ ] Cache defaults theo DRD:
  - `listTrips` stale `30s`
  - `tripDetail` stale `30s`
  - `planner` stale `0s`
  - `profile` stale `5m`
- [ ] Không build reorder phức tạp trước khi node CRUD ổn định

## Phase 05 - Public trip sharing

Status: `Todo`

- [ ] Có entrypoint xem trip public cho guest
- [ ] Có share CTA cho trip public
- [ ] Xử lý rõ các state:
  - public available
  - private denied
  - not found
- [ ] Guest chỉ xem, không thấy action mutate

## Phase 06 - Community minimal

Status: `Todo`

- [ ] Tạo community feed route
- [ ] Tạo post detail route
- [ ] Tạo create post flow
- [ ] Hỗ trợ create post from trip nếu backend mở
- [ ] Nếu comments được backend mở:
  - render list comments
  - create comment
- [ ] Nếu comments chưa có:
  - giữ UI ở trạng thái deferred rõ ràng, không giả production-ready

## Phase 07 - Hardening, test, accessibility, release readiness

Status: `Todo`

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

- [ ] Auth logout + session hardening
- [ ] Route-level auth verify

### Slice FE-B

- [ ] Trip form aligned với `budgetMode/manualBudget/visibility`
- [ ] Trip list/detail aligned với contract mới

### Slice FE-C

- [ ] Planner API layer mới
- [ ] `PlanNode` types
- [ ] planner tree render

### Slice FE-D

- [ ] Inline node CRUD
- [ ] loading/error/empty states
- [ ] query invalidation và retry

### Slice FE-E

- [ ] Public trip read UI
- [ ] share state handling

### Slice FE-F

- [ ] Community feed
- [ ] post detail
- [ ] create post
- [ ] optional comments

## Immediate next checks

- [ ] Chốt shape response planner với backend
- [ ] Chốt shape trip mới với backend
- [ ] Chốt visibility UX
- [ ] Chốt rollout: khi nào FE ngừng gọi itinerary endpoints
