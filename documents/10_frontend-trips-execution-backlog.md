# Frontend Trips Execution Backlog

## Trạng thái

- Date: `2026-04-16`
- Status: `Completed`
- Scope: Phase 05 cho `trips` workspace trên frontend

## Mục tiêu

- Thay toàn bộ placeholder hiện tại của `trips` bằng flow thật.
- Bám sát contract backend `trips` đã có, không tự bẻ shape response ở frontend.
- Chia việc thành các slice nhỏ đủ cụ thể để code ngay.

## Contract backend đã sẵn

### Endpoints

- `POST /trips`
- `GET /trips?page=0&size=20&sort=startDate,asc`
- `GET /trips/:tripId`
- `PATCH /trips/:tripId`
- `DELETE /trips/:tripId`

### Shape của `Trip`

```json
{
  "id": "string",
  "userId": "string",
  "name": "string",
  "destination": "string",
  "startDate": "string",
  "endDate": "string",
  "timezone": "string",
  "budgetAmount": 1000000,
  "budgetCurrency": "VND",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Shape của list response

```json
{
  "success": true,
  "data": [Trip],
  "meta": {
    "page": 0,
    "size": 20,
    "sort": "startDate,asc",
    "totalElements": 1,
    "totalPages": 1
  }
}
```

## Ràng buộc implementation

- Ưu tiên bám pattern đang có:
  - `features/<feature>/api/*.ts`
  - `shared/api/http-client.ts`
  - route pages nằm trong `features/trips/routes`
- Không thêm production dependency mới nếu chưa cần.
- Chưa cần React Query/TanStack Query ở slice đầu; có thể dùng `useEffect` + feature-local state nếu đi nhanh hơn và vẫn rõ ràng.
- Chưa hardening theo optimistic update phức tạp; feedback mutation rõ ràng là đủ cho phase đầu.

## File target nên có sau Phase 05

```text
src/features/trips/
  api/
    trips-api.ts
  components/
    trip-form.tsx
    trip-list.tsx
    trip-list-item.tsx
    trip-delete-button.tsx
  lib/
    trip-form-defaults.ts
    trip-form-validators.ts
    trip-query-params.ts
  types/
    trip.ts
  routes/
    trips-page.tsx
    trip-create-page.tsx
    trip-detail-page.tsx
    trip-edit-page.tsx
```

## Thứ tự thực thi đề xuất

### Slice 00 - Foundation và route wiring

Mục tiêu:

- Mở đường cho page thật mà chưa cần dựng toàn bộ UI hoàn chỉnh.

Việc làm:

- Tạo `src/features/trips/types/trip.ts`
- Tạo `src/features/trips/api/trips-api.ts`
- Đổi router ở `src/app/router/app-routes.tsx`:
  - thêm `/app/trips`
  - thay `TripsPlaceholderPage` bằng:
    - `TripsPage`
    - `TripCreatePage`
    - `TripDetailPage`
    - `TripEditPage`
- Thêm navigation item `Trips` trong `src/features/shell/routes/app-shell.tsx`

Definition of done:

- Route tree đã có `index/new/detail/edit`
- App shell nhìn thấy đường vào `Trips`
- Chưa cần UI đẹp, nhưng không còn placeholder cứng

### Slice 01 - API layer và type mapping

Mục tiêu:

- Chốt shape dữ liệu một lần để page code không phải đoán contract.

Việc làm:

- Tạo types:
  - `Trip`
  - `TripListMeta`
  - `TripListResult`
  - `TripSort`
- Tạo các hàm API:
  - `listTrips(query)`
  - `getTripDetail(tripId)`
  - `createTrip(payload)`
  - `updateTrip(tripId, payload)`
  - `deleteTrip(tripId)`
- Chuẩn hóa query params:
  - `page`
  - `size`
  - `sort`

Definition of done:

- Mọi call `trips` đi qua `features/trips/api/trips-api.ts`
- Không còn fetch inline trong route page

### Slice 02 - Trips list page

Mục tiêu:

- Có `/app/trips` hoạt động thật và đủ state cơ bản.

Việc làm:

- Tạo `TripsPage`
- Gọi `GET /trips`
- Render 4 state:
  - loading
  - empty
  - error
  - loaded
- Tạo `TripList` + `TripListItem`
- Mỗi item có CTA:
  - xem chi tiết
  - sửa
- Có CTA tạo chuyến đi mới

Definition of done:

- User vào `/app/trips` thấy list thật nếu có data
- Nếu chưa có trip nào, empty state phải dẫn tới `/app/trips/new`

### Slice 03 - Trip create page

Mục tiêu:

- Luồng tạo chuyến đi đầu tiên phải chạy end-to-end.

Việc làm:

- Tạo `TripCreatePage`
- Tạo `TripForm`
- Field cần có:
  - `name`
  - `destination`
  - `startDate`
  - `endDate`
  - `timezone`
  - `budgetAmount`
  - `budgetCurrency`
- Validation tối thiểu phía client:
  - required cho tất cả field
  - `endDate >= startDate`
  - `budgetAmount > 0`
- Submit gọi `POST /trips`
- Success:
  - redirect sang `/app/trips/:tripId`
- Error:
  - hiện message rõ ràng

Definition of done:

- CTA ở dashboard `/app` tạo được trip thật
- Sau create, user vào detail page của trip vừa tạo

### Slice 04 - Trip detail page

Mục tiêu:

- Có màn detail đủ dùng để xác nhận dữ liệu vừa tạo.

Việc làm:

- Tạo `TripDetailPage`
- Gọi `GET /trips/:tripId`
- Render:
  - title
  - destination
  - date range
  - timezone
  - budget
  - created/updated timestamps nếu hữu ích
- Thêm CTA:
  - edit
  - back to list
- Tạo state:
  - loading
  - error
  - not found / unauthorized fallback

Definition of done:

- User có thể đi từ list -> detail -> back
- Sau create redirect, detail hiển thị đúng data

### Slice 05 - Trip edit page

Mục tiêu:

- Có thể sửa trip hiện có mà không tạo màn hình riêng biệt hoàn toàn.

Việc làm:

- Tạo `TripEditPage`
- Reuse `TripForm`
- Load dữ liệu detail để prefill form
- Submit gọi `PATCH /trips/:tripId`
- Success:
  - redirect về detail
- Error:
  - giữ nguyên draft hiện tại

Definition of done:

- Edit flow không duplicate form logic với create
- User sửa được ít nhất `name`, `destination`, `date`, `budget`

### Slice 06 - Delete flow

Mục tiêu:

- Có thể xóa trip và quay về list an toàn.

Việc làm:

- Tạo `TripDeleteButton`
- Đặt ở detail page và/hoặc edit page
- Có confirm state rõ ràng
- Gọi `DELETE /trips/:tripId`
- Success:
  - redirect `/app/trips`
- Error:
  - message rõ ràng

Definition of done:

- Xóa xong không để user ở route detail đã mất dữ liệu

### Slice 07 - Dashboard bridge và polish tối thiểu

Mục tiêu:

- Dọn các điểm nối từ dashboard/shell sang `trips` để flow thật liền mạch.

Việc làm:

- Cập nhật `DashboardPage`
  - nếu cần, thêm CTA phụ tới `/app/trips`
- Cập nhật copy i18n:
  - `Trips`
  - list empty state
  - create/edit labels
  - delete confirm
- Dọn style để `trips` nhìn cùng visual language với dashboard/profile

Definition of done:

- User có thể đi:
  - dashboard -> create
  - dashboard -> trips list
  - list -> detail -> edit -> delete

## Verify tối thiểu cho Phase 05

- `pnpm lint`
- `npm test -- --run`
- `pnpm build`

## Thứ tự PR hợp lý

1. PR 1:
   - Slice 00 + Slice 01
2. PR 2:
   - Slice 02 + Slice 03
3. PR 3:
   - Slice 04 + Slice 05
4. PR 4:
   - Slice 06 + Slice 07 + verify

## Điểm chưa làm ở phase này

- filter/search trips nâng cao
- pagination UI nhiều trang
- optimistic update phức tạp
- timezone selector nâng cao
- budget chart
- itinerary/budget sub-workspace
