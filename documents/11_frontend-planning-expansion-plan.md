# Frontend Planning Expansion Plan

## Mục tiêu

Tài liệu này chốt hướng triển khai frontend để bám DRD và user stories mới, với nguyên tắc:

- `/app/trips/:tripId` là planning workspace chính
- planner target là `PlanNode` tree, không còn coi itinerary 2 cấp là target cuối
- inline editing là primary editing mode
- UI ưu tiên list-first, không mở route sâu

## Trạng thái source hiện tại

Frontend hiện đã có baseline tốt ở các phần:

- auth flow
- protected shell
- trips list/create/detail/edit/delete
- planning workspace 2 cấp dựa trên itinerary bridge

Phần chưa aligned với DRD mới:

- trip form chưa có `budgetMode/manualBudget/visibility`
- planner chưa dùng `PlanNode`
- chưa có recursive tree
- chưa có public trip read
- community còn là teaser

## Quyết định UX chính

## 1. Route chính không đổi

Giữ:

- `/app/trips`
- `/app/trips/new`
- `/app/trips/:tripId`
- `/app/trips/:tripId/edit`

Lý do:

- route map hiện tại đã hợp lý
- không cần thêm route sâu cho node
- thay đổi nằm ở data contract và component structure, không nằm ở route explosion

## 2. `/app/trips/:tripId` là planner workspace, không quay lại thành metadata detail

Trang này phải chứa:

- trip header
- trip overview
- budget summary
- full planner tree

## 3. Editing ưu tiên inline

MVP planner mới dùng:

- inline create
- inline edit
- inline delete confirmation nhẹ

Drawer hoặc modal chỉ là phase sau nếu flow inline không đủ.

## 4. Planner ưu tiên nhìn được nhiều thông tin trên một màn

Node card nên hiển thị:

- title
- type
- thời gian
- chi phí
- notes preview
- image preview
- quick actions

## Screen architecture mục tiêu

## 1. Trips list

Mỗi card nên có:

- tên trip
- date range
- budget mode
- visibility
- manual budget preview nếu có
- quick actions

Nếu có cover image sau này thì coi là bổ trợ, không phải dependency chính của DRD mới.

## 2. Trip create/edit

Field tối thiểu:

- `name`
- `startDate`
- `endDate`
- `budgetMode`
- `manualBudgetAmount`
- `manualBudgetCurrency`
- `visibility`

Rule:

- `manualBudget*` chỉ hiện khi `budgetMode = manual`

## 3. Trip planning workspace

Ba vùng chính:

### Header

- title
- date range
- visibility badge
- actions: back, edit, delete, share nếu public

### Budget summary

- budget mode
- total budget
- planned budget
- remaining budget

### Planner tree

- full tree list
- add root node CTA
- empty state nếu chưa có node
- child indentation
- inline actions trên mỗi node

## Planner interaction model

## Read

- load full tree một lần
- không paginate
- expand/collapse theo node nếu cần

## Write

- add root node
- add child node
- edit node
- delete node

## Không làm sớm

- drag-and-drop reorder nhiều tầng
- route `/node/:id`
- side-by-side detail inspector phức tạp

## State rules theo DRD

- loading:
  - dùng skeleton
- error:
  - dùng toast hoặc banner
  - có retry cho read request
- mutation:
  - disable action khi đang submit
  - invalidate query sau success

## Query strategy

- `listTrips`: stale `30s`
- `tripDetail`: stale `30s`
- `planner`: stale `0s`
- `profile`: stale `5m`

## Component roadmap

## FE Slice 1 - Trip contract alignment

Component cần sửa:

- `TripForm`
- `TripsPage`
- `TripDetailPage`
- `TripEditPage`

Việc cần làm:

- thêm budget mode UI
- thêm manual budget conditional UI
- thêm visibility UI
- cập nhật validation và error copy

## FE Slice 2 - Planner API layer alignment

File/slice cần có:

```text
features/trips/planning/
  api/
  components/
  types/
  lib/
```

Việc cần làm:

- tạo `PlanNode` types
- tạo planner API client
- tách khỏi itinerary API cũ

## FE Slice 3 - Planner tree render

Component cần có:

- `PlannerTree`
- `PlannerNodeRow`
- `PlannerNodeMeta`
- `PlannerNodeActions`
- `PlannerEmptyState`

Việc cần làm:

- render recursive tree
- indent theo `depth`
- render node type badge
- render notes/time/cost/image

## FE Slice 4 - Inline node CRUD

Component cần có:

- `PlannerNodeCreateInline`
- `PlannerNodeEditInline`
- `PlannerDeleteConfirm`

Việc cần làm:

- add root node
- add child node
- edit node
- delete node
- invalidation/retry

## FE Slice 5 - Public trip read

Việc cần làm:

- public trip route hoặc public mode
- guest-safe actions
- private denied state
- share CTA

## FE Slice 6 - Community minimal

Việc cần làm:

- `CommunityPage`
- `CommunityPostPage`
- create post flow
- optional comment block nếu backend mở comments

## Editing strategy

## Giai đoạn 1

- inline editor ngay trong planner list

## Giai đoạn 2

- có thể thêm drawer editor cho node dài

## Giai đoạn 3

- chỉ cân nhắc reorder nâng cao sau khi CRUD ổn định

## Motion strategy

Motion vẫn nên có nhưng ở mức hỗ trợ:

- page enter nhẹ
- skeleton shimmer
- expand/collapse ngắn
- không làm motion nặng khi planner tree còn đang migrate

## Migration strategy từ source hiện tại

## Bước 1

Giữ UI itinerary hiện tại chạy được trong lúc backend chưa sẵn planner APIs mới.

## Bước 2

Ngay khi backend chốt `GET /trips/:id/planner` và node CRUD:

- FE tạo planner API layer mới
- FE chuyển workspace sang contract mới

## Bước 3

Khi workspace mới ổn:

- itinerary-specific UI chỉ giữ làm fallback ngắn hạn
- không mở thêm feature mới trên itinerary UI

## Acceptance mapping theo user stories

## US-4 đến US-8: Trip management

FE phải hỗ trợ:

- create trip
- list trips
- view trip
- edit trip
- delete trip

## US-9 đến US-12: Planning core

FE phải hỗ trợ:

- load planner full tree
- add node
- edit node
- delete node

## US-13: Budget

FE phải hiển thị:

- total budget
- mode auto/manual

## US-14 đến US-15: Community

FE phải hỗ trợ:

- create post từ trip hoặc tự do
- xem post public

## Definition of done cho planner FE

Planner FE chỉ được coi là aligned khi:

- đang dùng planner APIs trên `PlanNode`
- route `/app/trips/:tripId` không còn phụ thuộc flow chính vào itinerary bridge
- loading/error/empty states đã đủ
- mobile vẫn xem và thao tác được
- node CRUD chạy end-to-end
