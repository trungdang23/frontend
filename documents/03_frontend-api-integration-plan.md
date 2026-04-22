# Frontend API Integration Plan

## Mục tiêu

- Ghi rõ contract nào đang tồn tại thật trong repo/backend hiện tại.
- Chỉ ra contract mới nào cần thêm cho journal editor.
- Giữ ranh giới rõ giữa `structured planner data` và `freeform journal scene data`.

## Thực trạng source frontend hiện tại

Các API modules còn giữ trong repo:

- `src/features/auth/api/auth-api.ts`
- `src/features/trips/api/trips-api.ts`
- `src/features/trips/api/trip-planning-api.ts`
- `src/features/community/api/posts-api.ts`

Nhận xét quan trọng:

- Runtime UI hiện chưa wiring các module này vào route thật vì app đang ở reset phase.
- `trip-planning-api.ts` vẫn còn mang nặng semantics `itinerary + budget` cũ.
- Nếu backend planner `PlanNode` tiếp tục là hướng chính cho planning workspace, frontend nên tách `planner-api.ts` riêng thay vì mở rộng tiếp file bridge cũ.

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

### Legacy itinerary + budget bridge đang còn trong source

- `GET /trips/:tripId/itinerary`
- `POST /trips/:tripId/itinerary/days`
- `PATCH /trips/:tripId/itinerary/days/:dayId`
- `DELETE /trips/:tripId/itinerary/days/:dayId`
- `POST /trips/:tripId/itinerary/days/:dayId/activities`
- `PATCH /trips/:tripId/itinerary/days/:dayId/activities/:activityId`
- `DELETE /trips/:tripId/itinerary/days/:dayId/activities/:activityId`
- `GET /trips/:tripId/budget-summary`

### Community posts

- `GET /posts`
- `GET /posts/:postId`
- `POST /posts`

## Hướng contract mới cần bổ sung cho sản phẩm mới

### Structured planner

Nếu backend đã có `PlanNode` contract ổn định, frontend nên tách riêng nhóm endpoint planner:

- `GET /trips/:tripId/planner`
- `POST /nodes`
- `PATCH /nodes/:nodeId`
- `DELETE /nodes/:nodeId`

Planner là workspace dữ liệu có cấu trúc, không phải scrapbook scene.

### Journal editor

Journal cần một contract riêng, không nên nhét vào planner hoặc post payload.

Nhóm endpoint đề xuất:

- `GET /trips/:tripId/journal`
- `GET /trips/:tripId/journal/pages/:pageId`
- `POST /trips/:tripId/journal/pages`
- `PATCH /trips/:tripId/journal/pages/:pageId`
- `DELETE /trips/:tripId/journal/pages/:pageId`
- `POST /trips/:tripId/journal/pages/:pageId/publish`
- `POST /trips/:tripId/journal/assets`

Nếu phase đầu muốn đơn giản hơn, có thể bắt đầu bằng:

- `GET /trips/:tripId/journal`
- `PUT /trips/:tripId/journal`

Nhưng cách này sẽ khó mở rộng revision/page-level publish về sau.

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
      "assetId": "asset_01",
      "frameStyle": "polaroid"
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
      "stickerKey": "flower-orange"
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
- Payload riêng theo loại object mới là phần linh hoạt.

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
| `['planner', tripId]` | stale `0s` hoặc very low | owner workspace structured |
| `['journal', tripId]` | stale `0s` khi edit | editor cần dữ liệu mới nhất |
| `['journal-page', pageId]` | stale `0s` khi edit | có save/load vòng kín |
| `['posts', 'list']` | stale `30s` | community feed |

## Khuyến nghị file/module ở frontend

- Không tiếp tục bơm editor logic vào `trip-planning-api.ts`.
- Tách thành:
  - `features/planner/api/planner-api.ts`
  - `features/journal/api/journal-api.ts`
  - `features/journal/api/journal-assets-api.ts`

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
