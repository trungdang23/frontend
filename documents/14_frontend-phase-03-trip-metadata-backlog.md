# Frontend Phase 03 Trip Metadata Backlog

## Mục tiêu

Đóng `Phase 03` của frontend để toàn bộ trip screens aligned với contract mới của backend:

- `visibility`
- `budgetMode`
- `manualBudgetAmount`
- `manualBudgetCurrency`

Phase này chỉ xử lý trip metadata.

Phase này chưa xử lý:

- `PlanNode`
- planner tree mới
- public trip guest read
- community

## Trạng thái

- Status: `Completed`
- Completed at: `2026-04-18`
- Owner area: `frontend/src/features/trips`
- Dependency chặn:
  - backend `Phase 03` phải chốt response shape
- Dependency mở ra sau khi xong:
  - `Phase 04 FE`
  - `Phase 05 FE`

## Quyết định rollout cần chốt

## 1. Không đổi route map

Giữ nguyên:

- `/app/trips`
- `/app/trips/new`
- `/app/trips/:tripId`
- `/app/trips/:tripId/edit`

Phase 03 chỉ đổi data contract, form và trình bày metadata.

## 2. Planner workspace hiện tại chưa bị đụng mạnh

`/app/trips/:tripId` vẫn là route chính, nhưng ở Phase 03 chỉ cần:

- header đúng metadata mới
- budget summary preview đúng rule mới ở mức trip metadata
- không rewrite sang `PlanNode`

## 3. Field cũ còn lại của UI vẫn giữ

Tiếp tục giữ trong form/detail nếu backend vẫn trả:

- `destination`
- `summaryNotes`
- `coverImageUrl`
- `timezone`

Lý do:

- source hiện tại đã dùng
- bỏ sớm sẽ thành rework UX không cần thiết

## 4. Rule hiển thị manual budget

- `budgetMode = auto`:
  - ẩn input manual budget
  - detail/list hiển thị badge hoặc copy cho auto budget
- `budgetMode = manual`:
  - hiện `manualBudgetAmount`
  - hiện `manualBudgetCurrency`
  - validate bắt buộc

## Contract FE cần bám sau Phase 03

## Trip type

`Trip` type phải có thêm:

- `visibility`
- `budgetMode`
- `manualBudgetAmount`
- `manualBudgetCurrency`

## Form payload

`TripUpsertPayload` phải gửi:

- `name`
- `startDate`
- `endDate`
- `visibility`
- `budgetMode`
- `manualBudgetAmount`
- `manualBudgetCurrency`

và các field baseline còn giữ:

- `destination`
- `summaryNotes`
- `coverImageUrl`
- `timezone`

## Slice FE-03A - Types và API contract

### Việc cần làm

- [x] Cập nhật `Trip` type
- [x] Cập nhật `TripUpsertPayload`
- [x] Cập nhật mapper của `trips-api.ts`
- [x] Rà lại query result types cho list/detail
- [x] Chốt nếu cần helper presenter cho budget mode

### File dự kiến

- `src/features/trips/types/trip.ts`
- `src/features/trips/api/trips-api.ts`
- `src/features/trips/lib/trip-presenters.ts`

## Slice FE-03B - Form schema và defaults

### Việc cần làm

- [x] Thêm `budgetMode`
- [x] Thêm `visibility`
- [x] Thêm `manualBudgetAmount`
- [x] Thêm `manualBudgetCurrency`
- [x] Update default values cho create/edit
- [x] Validation:
  - `name` required
  - `startDate <= endDate`
  - `manualBudgetAmount >= 0`
  - `manualBudget*` required khi `budgetMode = manual`
  - `manualBudget*` clear khi `budgetMode = auto`

### File dự kiến

- `src/features/trips/lib/trip-form-defaults.ts`
- `src/features/trips/lib/trip-form-validators.ts`

## Slice FE-03C - `TripForm` UI alignment

### Việc cần làm

- [x] Thêm UI chọn `budgetMode`
- [x] Thêm UI chọn `visibility`
- [x] Render có điều kiện `manualBudgetAmount`
- [x] Render có điều kiện `manualBudgetCurrency`
- [x] Cập nhật error messages
- [x] Không để submit payload chứa manual budget rác khi `auto`
- [x] Giữ layout usable trên mobile và desktop

### File dự kiến

- `src/features/trips/components/trip-form.tsx`
- `src/shared/ui/*` nếu thiếu primitive phù hợp

## Slice FE-03D - Create/Edit pages

### Việc cần làm

- [x] `TripCreatePage` gửi payload mới
- [x] `TripEditPage` map initial values từ contract mới
- [x] Sau create/update, invalidation đúng cho:
  - list
  - detail
  - planner route hiện tại nếu đang dùng trip detail cache
- [x] Xử lý submit error copy nhất quán

### File dự kiến

- `src/features/trips/routes/trip-create-page.tsx`
- `src/features/trips/routes/trip-edit-page.tsx`
- `src/features/trips/api/trips-api.ts`

## Slice FE-03E - List/Detail presentation

### Việc cần làm

- [x] `TripsPage` hiển thị metadata mới
- [x] `TripListItem` hiển thị:
  - visibility badge
  - budget mode
  - manual budget preview nếu `manual`
- [x] `TripDetailPage` hiển thị:
  - visibility
  - budget mode
  - manual budget hoặc auto label
- [x] Chốt copy cho:
  - private trip
  - public trip
  - auto budget
  - manual budget

### File dự kiến

- `src/features/trips/components/trip-list-item.tsx`
- `src/features/trips/components/trip-list.tsx`
- `src/features/trips/routes/trips-page.tsx`
- `src/features/trips/routes/trip-detail-page.tsx`
- `src/features/trips/lib/trip-presenters.ts`

## Slice FE-03F - i18n và UX copy

### Việc cần làm

- [x] Thêm labels cho `visibility`
- [x] Thêm labels cho `budgetMode`
- [x] Thêm copy cho auto/manual budget
- [x] Thêm validation messages liên quan manual budget
- [x] Thêm badges/text cho private/public

### File dự kiến

- `src/shared/i18n/locales/vi.json`
- `src/shared/i18n/locales/en.json`

## Slice FE-03G - Tests

### Component/unit

- [x] `TripForm` render đúng khi `budgetMode = auto`
- [x] `TripForm` render đúng khi `budgetMode = manual`
- [x] submit create với payload `manual`
- [x] submit edit chuyển `manual -> auto` và clear manual budget
- [x] validation fail khi `manual` nhưng thiếu amount/currency

### Route/integration

- [x] create trip thành công với `manual/private`
- [x] edit trip thành công sang `auto/public`
- [x] list hiển thị badge/metadata mới
- [x] detail hiển thị contract mới
- [x] query invalidation sau mutate

### Test file dự kiến

- `src/tests/trip-form.test.tsx`
- `src/tests/trip-pages.test.tsx`
- hoặc file test gần feature nếu team muốn colocate

## Slice FE-03H - Docs và phase tracking

### Việc cần làm

- [x] Cập nhật `01_frontend-phase-checklist.md`
- [x] Cập nhật `11_frontend-planning-expansion-plan.md` nếu có chỉnh contract nhỏ
- [x] Cập nhật `README.md` phần current status
- [x] Ghi rõ Phase 04 mới được bắt đầu sau khi trip contract mới ổn định

## Thứ tự triển khai đề xuất

1. Chốt contract backend
2. Update types + API client
3. Update schema/defaults
4. Update `TripForm`
5. Update create/edit pages
6. Update list/detail presentation
7. Update i18n
8. Thêm tests
9. Cập nhật docs/checklist

## Rủi ro cần tránh

- Không trộn Phase 03 với planner rewrite
- Không để `TripForm` giữ state manual budget cũ khi user đổi về `auto`
- Không chỉ sửa create form mà quên edit/detail/list
- Không hardcode visibility copy trong component khi app đã có i18n
- Không invalidate thiếu query sau create/update/delete

## Acceptance criteria

- create/edit trip bám contract mới
- list/detail render đủ `visibility`, `budgetMode`, `manualBudget*`
- manual budget form behavior đúng
- error copy và labels nhất quán
- tests cover ít nhất create, edit, list/detail metadata
- checklist frontend có thể đóng `Phase 03` khi backend Phase 03 đã merge

## Definition of done

- FE không còn phải suy đoán trip contract
- người dùng tạo và sửa trip theo metadata mới mà không bị sót field
- workspace có thể chuyển sang Phase 04 mà không phải quay lại sửa trip form lần nữa
