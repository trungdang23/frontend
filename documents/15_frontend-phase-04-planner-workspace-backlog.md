# Frontend Phase 04 Planner Workspace Backlog

## Mục tiêu

Đóng `Phase 04` của frontend để `/app/trips/:tripId` chuyển từ itinerary bridge 2 cấp sang planner workspace dựa trên `PlanNode`.

Phase này tập trung vào:

- planner API layer mới
- render full planner tree
- inline create/edit/delete cho node
- loading/error/empty states cho workspace
- cutover route hiện tại mà không đổi route map

Phase này chưa xử lý:

- public trip route cho guest
- share flow
- community feed/post detail
- drag-and-drop reorder nhiều tầng
- route sâu cho từng node
- migrate budget summary sang contract mới của backend

## Trạng thái

- Status: `Implemented in source`
- Date: `2026-04-20`
- Owner area: `frontend/src/features/trips`
- Ghi chú re-baseline:
  - tài liệu này giữ backlog lịch sử của phase planner
  - source hiện tại đã có planner workspace trên `PlanNode`
  - các phần chưa làm tiếp đã được tách sang `Phase 05` public trip sharing và `Phase 07` hardening
- Dependency chặn:
  - backend `Phase 04` phải chốt planner response shape
  - backend `Phase 04` phải chốt node CRUD contract và delete semantics
- Dependency mở ra sau khi xong:
  - `Phase 05 FE`
  - `Phase 07 FE`

## Quyết định rollout cần chốt

## 1. Không đổi route map

Giữ nguyên:

- `/app/trips`
- `/app/trips/new`
- `/app/trips/:tripId`
- `/app/trips/:tripId/edit`

`/app/trips/:tripId` tiếp tục là planner workspace chính.

Phase này chỉ thay data source, component structure và interaction model của workspace hiện có.

## 2. Planner layer mới tách khỏi itinerary bridge hiện tại

Không tiếp tục mở rộng `trip-planning-api.ts` theo model cũ:

- `GET /trips/:tripId/itinerary`
- `POST /trips/:tripId/itinerary/days`
- `PATCH /trips/:tripId/itinerary/days/:dayId`
- `POST /trips/:tripId/itinerary/days/:dayId/activities`

Phase 04 phải có planner layer mới riêng để tránh trộn `TripItineraryDay/Activity` với `PlanNode`.

Khuyến nghị cấu trúc:

```text
src/features/trips/planning/
  api/
  components/
  lib/
  types/
```

Bridge cũ chỉ giữ tạm cho đến khi cutover hoàn tất.

## 3. FE render từ full planner dataset, không paginate

FE không giả lập pagination hoặc lazy route cho node.

Workspace load một lần:

- trip detail metadata
- budget summary hiện tại
- planner dataset đầy đủ

Khuyến nghị FE nhận `nodes` dạng flat list đã được sort ổn định, rồi build tree ở client từ:

- `id`
- `parentId`
- `depth`
- `sortOrder`

Lý do:

- mutation invalidation đơn giản hơn
- edit local state ít coupling với nested JSON
- dễ reuse cho tree row renderer và inline composer

## 4. Inline editing là primary mode

MVP Phase 04 ưu tiên:

- add root node inline
- add child node inline
- edit node inline
- delete confirmation nhẹ

Không mở drawer editor riêng trừ khi vướng blocker UX rõ ràng.

## 5. Query strategy phải bám `TanStack Query`

Frontend đã có `@tanstack/react-query` và route hiện tại cũng đang dùng.

Phase 04 nên chuẩn hoá query keys cho:

- `["trips", "detail", tripId]`
- `["trips", "budget-summary", tripId]`
- `["trips", "planner", tripId]`

Cache defaults mục tiêu:

- `listTrips`: stale `30s`
- `tripDetail`: stale `30s`
- `planner`: stale `0s`
- `profile`: stale `5m`

## Contract FE cần bám sau Phase 04

## Planner read result

Khuyến nghị shape FE bám:

```ts
type TripPlannerResult = {
  trip: Trip;
  nodes: PlanNode[];
};
```

## PlanNode type

```ts
type PlanNode = {
  id: string;
  tripId: string;
  parentId: string | null;
  type: 'section' | 'day' | 'location' | 'activity' | 'note';
  title: string;
  notes: string | null;
  startAt: string | null;
  endAt: string | null;
  costAmount: number | null;
  costCurrency: string | null;
  imageUrl: string | null;
  sortOrder: number;
  depth: number;
  createdAt: string;
  updatedAt: string;
};
```

## Node mutation payload tối thiểu

Create/update payload cần bám các field:

- `tripId`
- `parentId`
- `type`
- `title`
- `notes`
- `startAt`
- `endAt`
- `costAmount`
- `costCurrency`
- `imageUrl`
- `sortOrder`

## Slice FE-04A - Planner types và API contract

### Việc cần làm

- [x] Tạo `PlanNode` types
- [x] Tạo `TripPlannerResult`
- [x] Tạo planner API client mới cho:
  - `GET /trips/:tripId/planner`
  - `POST /nodes`
  - `PATCH /nodes/:id`
  - `DELETE /nodes/:id`
- [x] Chuẩn hoá mapper response/error cho planner APIs
- [x] Giữ tách biệt rõ với itinerary bridge types cũ

### File dự kiến

- `src/features/trips/planning/types/plan-node.ts`
- `src/features/trips/planning/api/planner-api.ts`
- `src/features/trips/planning/lib/planner-query-keys.ts`

## Slice FE-04B - Tree normalization và presenter helpers

### Việc cần làm

- [x] Tạo helper build tree từ flat nodes
- [x] Tạo helper sort node ổn định theo `parentId + sortOrder`
- [x] Tạo presenter cho:
  - node type label
  - time range
  - cost preview
  - empty child state
- [x] Chốt rule hiển thị cho node không có thời gian/chi phí/ảnh

### File dự kiến

- `src/features/trips/planning/lib/build-planner-tree.ts`
- `src/features/trips/planning/lib/planner-presenters.ts`
- `src/features/trips/planning/lib/planner-node-form-defaults.ts`

## Slice FE-04C - Workspace cutover trên `/app/trips/:tripId`

### Việc cần làm

- [x] Tách phần planner workspace khỏi implementation itinerary cũ trong `TripDetailPage`
- [x] Giữ trip header và metadata summary đúng contract hiện tại
- [x] Giữ budget summary từ endpoint hiện tại cho đến `Phase 05`
- [x] Gắn planner query mới vào route hiện tại
- [x] Không còn dependency chính vào:
  - `getTripItinerary`
  - `createItineraryDay`
  - `createItineraryActivity`

### File dự kiến

- `src/features/trips/routes/trip-detail-page.tsx`
- `src/features/trips/planning/components/planner-workspace.tsx`
- `src/features/trips/planning/components/planner-tree.tsx`

## Slice FE-04D - Inline node CRUD

### Việc cần làm

- [x] Add root node inline
- [x] Add child node inline
- [x] Edit node inline
- [x] Delete node với confirmation rõ ràng
- [x] Disable action khi mutation đang chạy
- [x] Invalidate planner query sau success
- [x] Hiển thị mutation error nhất quán bằng banner/toast

### File dự kiến

- `src/features/trips/planning/components/planner-node-row.tsx`
- `src/features/trips/planning/components/planner-node-actions.tsx`
- `src/features/trips/planning/components/planner-node-inline-form.tsx`
- `src/features/trips/planning/components/planner-delete-confirm.tsx`

## Slice FE-04E - State UX, mobile usability và fallback

### Việc cần làm

- [x] Skeleton cho trip planner load ban đầu
- [x] Error banner + retry cho planner read
- [x] Empty state cho trip chưa có node
- [x] Expand/collapse state cho tree dài
- [x] Giữ layout usable trên mobile ở mức MVP của phase planner
- [x] Không để action mutate lẫn với action điều hướng

### File dự kiến

- `src/features/trips/routes/trip-detail-page.tsx`
- `src/features/trips/planning/components/planner-empty-state.tsx`
- `src/features/trips/planning/components/planner-skeleton.tsx`

## Slice FE-04F - i18n, tests và bridge retirement note

### Việc cần làm

- [x] Thêm copy cho node types
- [x] Thêm copy cho create/edit/delete planner actions
- [x] Thêm copy cho planner empty/loading/error states
- [x] Cập nhật test cho planner workspace sau cutover
- [x] Ghi rõ bridge retirement note:
  - itinerary UI không còn là flow chính
  - chỉ giữ tạm cho rollback ngắn hạn nếu cần

### File dự kiến

- `src/shared/i18n/locales/vi.json`
- `src/shared/i18n/locales/en.json`
- `src/tests/trip-metadata.test.tsx`
- test planner mới trong `src/tests/`

## Definition of done cho Phase 04 FE

Phase 04 chỉ được coi là xong khi:

- `/app/trips/:tripId` đang đọc planner từ planner APIs mới
- user có thể add/edit/delete node end-to-end
- itinerary bridge không còn là data source chính của workspace
- planner có loading/error/empty states đủ dùng
- budget summary hiện tại vẫn hiển thị đúng trong lúc chờ `Phase 05`
- mobile vẫn xem và thao tác được ở tree mức MVP
