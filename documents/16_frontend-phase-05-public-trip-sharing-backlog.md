# Frontend Phase 05 Public Trip Sharing Backlog

## Mục tiêu

Đóng `Phase 05` của frontend để guest có thể mở link trip public và xem planner ở chế độ read-only, trong khi owner vẫn tiếp tục chỉnh sửa qua workspace hiện tại.

Phase này tập trung vào:

- public trip list route cho guest
- public trip route cho guest
- public planner read-only UI
- share CTA trên owner workspace
- state `public available`, `private denied`, `not found`
- reuse tối đa từ trip/planner presenter hiện có mà không trộn scope với `community`

Phase này chưa xử lý:

- posts/community data-driven
- signed share links hoặc slug đẹp
- public budget summary live endpoint riêng
- SEO/Open Graph polish sâu
- owner/guest comment, reaction, like
- bất kỳ public mutation nào

## Trạng thái

- Status: `Implemented in source`
- Date: `2026-04-20`
- Owner area: `frontend/src/features/trips`
- Trạng thái source hiện tại:
  - owner workspace đã nằm ở `/app/trips/:tripId`
  - planner owner đã dùng `PlanNode` APIs mới
  - đã có route public `/trips` và `/trips/:tripId`
  - đã có share CTA thực tế từ trip detail khi trip ở trạng thái `public`
  - public trip page đã read-only và tách scope rõ khỏi `community`
  - app shell authenticated vẫn giữ quick links sang các route public để owner không bị kẹt trong khu riêng
- Dependency chặn:
  - backend `Phase 06` phải chốt public trip detail/planner contract
  - backend phải giữ rõ semantics `403 private denied` và `404 not found`
- Dependency mở ra sau khi xong:
  - `Phase 06 FE`
  - `Phase 07 FE`

## Quyết định rollout cần chốt

## 1. Public trip dùng route riêng ngoài app shell

Khuyến nghị route:

- `/trips/:tripId`

Giữ nguyên route owner:

- `/app/trips/:tripId`

Lý do:

- link share ngắn và dễ hiểu hơn
- không kéo guest vào protected shell
- không gây nhầm public trip với owner workspace

## 2. Public page là read-only tuyệt đối

Guest chỉ được thấy:

- trip metadata
- cover image nếu có
- planner tree read-only

Guest không được thấy:

- edit trip
- delete trip
- add/edit/delete planner node
- bất kỳ CTA mutate nào

## 3. Public page nên reuse contract và presenter từ owner flow

Khuyến nghị:

- dùng cùng `Trip` type nếu backend public detail trả cùng shape
- dùng cùng `PlanNode` type và tree builder
- chỉ thêm read-only layer thay vì clone toàn bộ planner UI

Lý do:

- giảm drift giữa public view và owner view
- giữ logic formatting ngày/chi phí/type label ở một chỗ
- cut implementation nhỏ hơn

## 4. Share card chỉ active khi trip là `public`

Phase này nên có:

- share card chỉ hiện khi `trip.visibility = public`
- CTA tạo bài viết từ chuyến đi public
- owner đã đăng nhập vẫn có thể quay lại public trip route từ app shell mà không cần logout

Không cần làm sớm:

- share sheet native
- email/invite flow
- QR code

## 5. Public states phải tách rõ `private denied` và `not found`

Public page cần xử lý riêng:

- loading
- fetch error
- public available
- private denied
- not found

Không gộp tất cả về một empty state chung.

## 6. Không block public page bởi budget summary auth-only

Public page không cần đợi public budget summary endpoint riêng trong phase này.

MVP có thể hiển thị:

- budget mode
- configured budget từ trip detail
- planner nodes read-only

Budget summary sống động theo endpoint auth-only là deferred.

## Contract frontend cần bám sau Phase 05

## Public route map

Thêm route public:

- `/trips/:tripId`

Route hiện có vẫn giữ:

- `/app/trips/:tripId`

## Public data sources

Khuyến nghị FE gọi:

- `GET /public/trips/:tripId`
- `GET /public/trips/:tripId/planner`

## Query keys khuyến nghị

- `["public-trips", "detail", tripId]`
- `["public-trips", "planner", tripId]`

Giữ tách biệt khỏi owner query keys để tránh cache lẫn semantics auth/public.

## Share link output

CTA copy link nên tạo URL:

```text
${window.location.origin}/trips/${tripId}
```

Nếu `navigator.clipboard` không sẵn, phase này có thể fallback sang error banner rõ ràng thay vì dựng flow copy phức tạp.

## Error semantics FE phải bám

- `403`:
  - render private denied state
- `404`:
  - render not found state
- error khác:
  - render retry state

## Slice FE-05A - Public route wiring và API layer

### Việc cần làm

- [x] Thêm route public `/trips`
- [x] Thêm route public `/trips/:tripId`
- [x] Lazy-load page public như các public route khác
- [x] Tạo API client cho:
  - `listPublicTrips`
  - `getPublicTripDetail`
  - `getPublicTripPlanner`
- [x] Tạo query keys riêng cho public trip
- [x] Giữ public API layer tách khỏi owner `trips-api.ts` và `planner-api.ts`

### File dự kiến

- `src/app/router/app-routes.tsx`
- `src/features/trips/public/api/public-trip-api.ts`
- `src/features/trips/public/lib/public-trip-query-keys.ts`
- `src/features/trips/public/routes/public-trip-page.tsx`

## Slice FE-05B - Public trip page shell và read-only planner render

### Việc cần làm

- [x] Tạo page public hiển thị trip header, date range, visibility, cover image, summary notes
- [x] Render planner tree read-only từ `PlanNode[]`
- [x] Reuse `buildPlannerTree` và presenter helpers hiện có
- [x] Không render mutation controls của planner
- [x] Chốt layout đủ tốt cho mobile và desktop
- [x] Nếu cần, tách read-only wrapper thay vì clone toàn bộ `PlannerWorkspace`

### File dự kiến

- `src/features/trips/public/routes/public-trip-page.tsx`
- `src/features/trips/public/components/public-trip-planner.tsx`
- refactor có kiểm soát ở:
  - `src/features/trips/planning/components/planner-tree.tsx`
  - `src/features/trips/planning/components/planner-node-row.tsx`
  - `src/features/trips/planning/lib/build-planner-tree.ts`

## Slice FE-05C - Share CTA trên owner workspace

### Việc cần làm

- [x] Hiển thị share card public ở owner trip detail khi `visibility = public`
- [x] Gỡ CTA `copy public link` và `open public route` để giữ owner workspace gọn hơn
- [x] Gỡ cả ô hiển thị public URL trong owner workspace để share card chỉ còn CTA có ích
- [~] Thêm explanatory state khi trip còn `private`
- [x] Không biến share CTA thành blocker cho flow edit/delete hiện có
- [x] Không hiển thị share CTA sai khi trip chưa public

### File dự kiến

- `src/features/trips/routes/trip-detail-page.tsx`
- `src/features/trips/components/trip-share-card.tsx` nếu cần tách component
- `src/shared/i18n/locales/vi.json`
- `src/shared/i18n/locales/en.json`

## Slice FE-05D - State UX cho `private denied`, `not found`, `retry`

### Việc cần làm

- [x] Tạo loading state phù hợp cho public trip page
- [x] Tạo `private denied` state với copy rõ đây là trip không public
- [x] Tạo `not found` state
- [x] Tạo generic fetch error state có retry
- [x] Giữ visual language đồng bộ với public pages hiện có
- [x] Không yêu cầu user đăng nhập chỉ để xem state denied/not found

### File dự kiến

- `src/features/trips/public/routes/public-trip-page.tsx`
- `src/shared/ui/public-page-skeleton.tsx` nếu cần mở variant mới
- `src/shared/i18n/locales/vi.json`
- `src/shared/i18n/locales/en.json`

## Slice FE-05E - Tests, route docs, regression safety

### Component / route tests

- [x] route public list render được public trips
- [x] route public render được trip public
- [x] route public render được planner read-only
- [x] `403` hiển thị private denied state
- [x] `404` hiển thị not found state
- [x] share CTA chỉ hiện khi trip public
- [x] public page không render mutate controls

### Docs

- [x] Cập nhật checklist/route plan sau khi implementation chốt
- [x] Ghi rõ public trip khác community teaser

### File dự kiến

- `src/tests/public-trip-page.test.tsx`
- `documents/01_frontend-phase-checklist.md`
- `documents/04_frontend-route-and-screen-plan.md`

## UX copy cần có trong phase này

- label cho `public trip`
- message cho `private denied`
- message cho `trip not found`
- label cho `copy public link`
- success message khi copy thành công
- error message khi copy thất bại
- helper text khi trip còn private và chưa share được

## Validation matrix của phase này

- route public không dùng protected shell
- public page không render action mutate
- share CTA chỉ active khi `visibility = public`
- `403` và `404` phải hiển thị khác nhau
- planner public read dùng `PlanNode` tree thật, không mock
- public trip không bị trộn với `community` route hoặc post detail

## Deferred rõ ràng sau phase này

- public budget summary endpoint riêng
- share token/signed link
- slug đẹp theo tên trip
- QR share
- owner banner kiểu “open editable workspace” trên public page
- SEO/Open Graph polish
- trip-to-post bridge

## Definition of done cho Phase 05

Phase này chỉ được gọi là done khi:

- guest mở được `/trips/:tripId` cho trip public
- guest mở được `/trips` để chọn public trip mà không cần biết `id`
- guest thấy planner tree ở chế độ read-only
- guest thấy state `private denied` rõ ràng cho trip private
- guest thấy state `not found` rõ ràng cho trip không tồn tại
- owner workspace `/app/trips/:tripId` vẫn giữ nguyên edit flow
- share card public chỉ hiện khi trip public
- public trip flow không kéo `community` vào cùng scope
- test đã có cho các state chính và không có mutate action nào lọt ra public page
