# Frontend API Integration Plan

## Mục tiêu

- Ghi rõ contract nào đang tồn tại thật trong repo/backend hiện tại.
- Chỉ ra contract mới nào cần thêm cho journal editor.
- Giữ ranh giới rõ giữa `structured planner data` và `freeform journal scene data`.

## Thực trạng source frontend hiện tại

Các API modules còn giữ trong repo:

- `src/features/auth/api/auth-api.ts`
- `src/features/trips/api/trips-api.ts`
- `src/features/trips/planning/api/planner-api.ts`
- `src/features/community/api/posts-api.ts`
- `src/features/journal/api/journal-api.ts`

Nhận xét quan trọng:

- Runtime UI hiện đã wiring thật cho homepage, community, auth, planner canonical flow, profile, journal editor tối giản, và public read-only plan/journal routes.
- Planner `PlanNode` client đã được tách tại `src/features/trips/planning/api/planner-api.ts`.
- Route canonical `/app/trips/:tripId/planner` hiện là planner route chính cho trip đã lưu; `/app/planner?tripId=...` chỉ còn là compatibility redirect.
- Route canonical `/app/trips/:tripId/journal` hiện là journal route chính cho trip đã lưu; `/app/journal?tripId=...` chỉ còn là compatibility redirect.
- `2026-05-08`: dead frontend itinerary bridge files `trip-planning-api.ts` và `trip-planning.ts` đã bị gỡ sau khi backend production cleanup legacy itinerary endpoints và smoke xác nhận không còn caller active.

## Backend base hiện tại

- Base URL production: `https://api.buicojourney.com/api/v1`
- Frontend env:
  - `VITE_API_BASE_URL`
  - `VITE_APP_ENV`

## Response envelope

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "STRING",
    "message": "STRING"
  }
}
```

## Contract đang tồn tại và nên giữ

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`

### Trips

- `GET /trips`
- `POST /trips`
- `GET /trips/:tripId`
- `PATCH /trips/:tripId`
- `DELETE /trips/:tripId`

### Budget hiện còn là contract backend độc lập

- `GET /trips/:tripId/budget-summary`

Ghi chú:

- backend đã gỡ legacy itinerary endpoints khỏi source active và production docs
- frontend hiện không còn API client active nào cho `/trips/:tripId/itinerary...`
- nếu owner budget UI cần wiring lại sau này, nên tạo budget client riêng thay vì tái sinh `trip-planning-api.ts`

### Community posts

- `GET /posts`
- `GET /posts/:postId`
- `GET /posts/mine`
- `POST /posts`

### Journal current contract

- `GET /journals/mine`
- `GET /trips/:tripId/journal`
- `PUT /trips/:tripId/journal`
- `PATCH /trips/:tripId/journal`
- `DELETE /trips/:tripId/journal`
- `GET /public/journals`
- `GET /public/trips/:tripId/journal`
- `POST /trips/:tripId/journal/assets`
- `GET /journal-assets/:publicId`

## Contract dài hạn cần bổ sung cho sản phẩm mới

### Structured planner

Backend đã có `PlanNode` contract ổn định và frontend hiện đã có client riêng cho nhóm endpoint planner:

- `GET /trips/:tripId/planner`
- `POST /nodes`
- `PATCH /nodes/:nodeId`
- `DELETE /nodes/:nodeId`
- legacy/experimental sticker endpoints hiện vẫn có client:
  - `GET /nodes/:nodeId/stickers`
  - `PUT /nodes/:nodeId/stickers`

Planner là workspace dữ liệu có cấu trúc, không phải scrapbook scene.

### Journal editor

Journal cần một contract riêng, không nên nhét vào planner hoặc post payload.

Nhóm endpoint dài hạn đề xuất:

- `GET /trips/:tripId/journal`
- `GET /trips/:tripId/journal/pages/:pageId`
- `POST /trips/:tripId/journal/pages`
- `PATCH /trips/:tripId/journal/pages/:pageId`
- `DELETE /trips/:tripId/journal/pages/:pageId`
- `POST /trips/:tripId/journal/pages/:pageId/publish`
- `POST /trips/:tripId/journal/assets`

Phase đầu hiện đã có:

- `GET /trips/:tripId/journal`
- `PUT /trips/:tripId/journal`
- `PATCH /trips/:tripId/journal` để đổi riêng visibility của journal
- `DELETE /trips/:tripId/journal`
- `GET /journals/mine`
- `GET /public/journals`
- `GET /public/trips/:tripId/journal`
- `POST /trips/:tripId/journal/assets` để upload ảnh owner-only
- `GET /journal-assets/:publicId` để browser render ảnh đã upload bằng URL public/unlisted

Cách lưu một scene trên một record `trip_journals` đang đủ cho editor tối giản, nhưng sẽ khó mở rộng revision/page-level publish về sau nếu không tách page/assets/revisions thành contract riêng.

## Shape đề xuất cho journal page

```json
{
  "id": "page_01",
  "tripId": "trip_01",
  "title": "Hoi An Dem Long Den",
  "status": "draft | published",
  "sceneVersion": 1,
  "page": {
    "width": 1200,
    "height": 1600,
    "background": {
      "style": "paper-cream"
    }
  },
  "objects": [
    {
      "id": "obj_photo_01",
      "type": "photo",
      "x": 120,
      "y": 180,
      "width": 340,
      "height": 420,
      "rotation": -6,
      "zIndex": 3,
      "locked": false,
      "props": {
        "assetId": "asset_01",
        "frameStyle": "polaroid"
      }
    },
    {
      "id": "obj_sticker_01",
      "type": "sticker",
      "x": 860,
      "y": 210,
      "width": 96,
      "height": 96,
      "rotation": 12,
      "zIndex": 8,
      "locked": false,
      "props": {
        "stickerKey": "flower-orange"
      }
    }
  ],
  "updatedAt": "2026-04-22T12:00:00.000Z"
}
```

## Quy tắc dữ liệu cho journal scene

### 1. Dùng canonical page space

- `x`, `y`, `width`, `height` là giá trị trong không gian trang chuẩn.
- Không lưu vị trí theo viewport pixel hiện tại của client.

### 2. `objects` là payload linh hoạt, nhưng không vô tổ chức

- Mỗi object luôn phải có:
  - `id`
  - `type`
  - `x`
  - `y`
  - `width`
  - `height`
  - `rotation`
  - `zIndex`
  - `locked`
  - `props`
- Payload riêng theo loại object nằm trong `props` để base contract không phình theo từng loại object.

### 3. Asset metadata tách khỏi layout

- Scene chỉ nên giữ `assetId`, `alt`, crop/style metadata cần render.
- File upload thật, storage URL, mime type, và ownership nên nằm ở entity asset riêng.

### 4. Có `sceneVersion` từ đầu

- Giúp backend/frontend nâng schema dần mà không phá scene cũ.

## Save strategy đề xuất

### Giai đoạn đầu

- Editor sửa local state trước.
- FE debounce autosave khoảng `500ms - 1000ms` sau mutation cuối.
- Có `manual save fallback`.
- Trạng thái save nên có ít nhất:
  - `Saving...`
  - `Saved`
  - `Save failed`

### Giai đoạn sau

- Có thể thêm revision history hoặc publish snapshot riêng.
- Không cần làm operational transform hay realtime patch sync ở phase đầu.

## Query và cache strategy đề xuất

| Query key | Gợi ý | Ghi chú |
| --- | --- | --- |
| `['auth', 'me']` | stale `5m` | auth boot |
| `['trips', 'list']` | stale `30s` | list page |
| `['trips', 'detail', tripId]` | stale `30s` | structured trip info |
| `['trips', 'planner', tripId]` | stale `0s` hoặc very low | owner workspace structured |
| `['trips', 'journal', tripId]` | stale `0s` khi edit | editor cần dữ liệu mới nhất |
| `['journal-page', pageId]` | stale `0s` khi edit | có save/load vòng kín |
| `['posts', 'list']` | stale `30s` | community feed |

## Cleanup sub-slice - 2026-05-08

- Trigger:
  - backend production đã cleanup legacy itinerary support và smoke runtime xác nhận `/api/v1/trips/:id/itinerary` trả `404`
- Scope:
  - [x] rà static references tới itinerary API cũ trong frontend source
  - [x] xác nhận `trip-planning-api.ts` không còn import/caller active
  - [x] gỡ dead files:
    - `src/features/trips/api/trip-planning-api.ts`
    - `src/features/trips/types/trip-planning.ts`
  - [x] cập nhật doc API plan để không còn claim sai rằng itinerary bridge vẫn active trong frontend source
- Deferred:
  - nếu future UI cần owner budget summary screen riêng, tạo API client budget chuyên dụng

## Khuyến nghị file/module ở frontend

- Không tạo lại một bridge kiểu `trip-planning-api.ts` cho planner/journal.
- Giữ planner client hiện tại tại:
  - `features/trips/planning/api/planner-api.ts`
- Khi mở journal, tách thành:
  - `features/journal/api/journal-api.ts`
  - `features/journal/lib/journal-query-keys.ts`
  - `features/journal/types/journal.ts`
  - chỉ tách `features/journal/api/journal-assets-api.ts` nếu asset lifecycle/list/delete phình lớn hơn upload phase đầu hiện tại

## Khuyến nghị storage từ góc nhìn API

### Nên làm ngay

- Giữ `PostgreSQL`.
- Thêm bảng hoặc entity cho `journal pages`.
- Lưu `scene` bằng `JSONB`.
- Tách `assets` và `revisions` thành entity riêng nếu cần.

### Chưa nên làm ngay

- đổi sang `MongoDB`
- chia nhỏ thành patch document cực phức tạp
- mở realtime collaboration protocol

## Kết luận

- Planner và journal phải là hai contract riêng.
- Journal scene data linh hoạt nhưng vẫn có thể chạy tốt trên `PostgreSQL + JSONB`.
- Quyết định đúng ở phase này là chốt object schema, save strategy, và boundary module; chưa cần đổi database platform.
