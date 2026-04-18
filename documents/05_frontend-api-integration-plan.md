# Frontend API Integration Plan

## Mục tiêu

- Chốt cách frontend bám vào backend theo DRD và user stories mới
- Tách rõ:
  - target contract cần build
  - current-source fallback đang tồn tại

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

## Session strategy theo DRD

- access token TTL ngắn
- refresh token TTL dài hơn
- FE lưu token ở `localStorage`
- app boot:
  - đọc session local
  - gọi `GET /auth/me`
  - nếu access fail thì gọi `POST /auth/refresh`
  - nếu refresh fail thì clear session và về `login`

## Auth contract target

### `POST /auth/register`

Request:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "User Name"
}
```

### `POST /auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### `GET /auth/me`

Headers:

- `Authorization: Bearer <access_token>`

### `POST /auth/refresh`

Request:

```json
{
  "refreshToken": "string"
}
```

### `POST /auth/logout`

Request khuyến nghị:

```json
{
  "refreshToken": "string"
}
```

Nếu backend chốt logout stateless, frontend vẫn phải:

- clear local session
- redirect `login`

## Trip contract target

### Endpoints

- `GET /trips?page=&size=`
- `POST /trips`
- `GET /trips/:id`
- `PATCH /trips/:id`
- `DELETE /trips/:id`

### Shape mục tiêu của `Trip`

```json
{
  "id": "string",
  "userId": "string",
  "name": "string",
  "startDate": "string",
  "endDate": "string",
  "budgetMode": "auto | manual",
  "manualBudgetAmount": 1000000,
  "manualBudgetCurrency": "VND",
  "visibility": "private | public",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### FE form mapping

- luôn có:
  - `name`
  - `startDate`
  - `endDate`
  - `budgetMode`
  - `visibility`
- chỉ hiện khi `budgetMode = manual`:
  - `manualBudgetAmount`
  - `manualBudgetCurrency`

## Planner contract target

### Endpoints

- `GET /trips/:id/planner`
- `POST /nodes`
- `PATCH /nodes/:id`
- `DELETE /nodes/:id`

### Shape mục tiêu của `PlanNode`

```json
{
  "id": "string",
  "tripId": "string",
  "parentId": "string | null",
  "type": "section | day | location | activity | note",
  "title": "string",
  "notes": "string | null",
  "startAt": "string | null",
  "endAt": "string | null",
  "costAmount": 100000,
  "costCurrency": "VND",
  "imageUrl": "string | null",
  "sortOrder": 0,
  "depth": 0,
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Response khuyến nghị cho `GET /trips/:id/planner`

```json
{
  "success": true,
  "data": {
    "trip": {},
    "nodes": []
  }
}
```

FE kỳ vọng:

- full tree
- không paginate
- đủ field để render list/tree

## Budget contract target

Budget summary nên bám logic:

- `auto -> sum(node.costAmount)`
- `manual -> manualBudget`

FE cần tối thiểu:

- total budget
- planned budget
- remaining budget
- raw per-currency nếu mixed currency

## Public trip contract target

FE cần public read path cho:

- trip public detail
- planner public read

Khuyến nghị backend trả cùng shape với private read, chỉ khác permission.

## Post contract target

### Endpoints

- `POST /posts`
- `GET /posts`
- khuyến nghị thêm `GET /posts/:postId`

### Shape mục tiêu

```json
{
  "id": "string",
  "userId": "string",
  "tripId": "string | null",
  "title": "string",
  "content": "string",
  "coverImageUrl": "string | null",
  "visibility": "public",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## TanStack Query strategy

- `listTrips`: stale `30s`
- `tripDetail`: stale `30s`
- `planner`: stale `0s`
- `profile`: stale `5m`

Mutation rules:

- trip create/update/delete phải invalidate `listTrips` và `tripDetail` liên quan
- node create/update/delete phải invalidate `planner`
- post create phải invalidate `posts`

## Current-source fallback cần ghi nhớ

Source hiện tại vẫn có itinerary bridge:

- `GET /trips/:tripId/itinerary`
- `POST /trips/:tripId/itinerary/days`
- `PATCH /trips/:tripId/itinerary/days/:dayId`
- `DELETE /trips/:tripId/itinerary/days/:dayId`
- `POST /trips/:tripId/itinerary/days/:dayId/activities`
- `PATCH /trips/:tripId/itinerary/days/:dayId/activities/:activityId`
- `DELETE /trips/:tripId/itinerary/days/:dayId/activities/:activityId`
- `GET /trips/:tripId/budget-summary`

Nguyên tắc dùng fallback:

- chỉ dùng để giữ app hiện tại chạy
- không mở rộng UI mới dựa dài hạn trên itinerary bridge
- khi planner API mới sẵn, route `/app/trips/:tripId` phải chuyển sang contract mới

## Error handling rules ở frontend

- protected request `401`:
  - refresh đúng 1 lần
  - retry đúng 1 lần
  - nếu vẫn fail thì clear session và về `login`
- planner/trips/posts:
  - show banner hoặc toast
  - có retry nếu là read request
- không leak raw response ra UI

## Điều không nên làm

- Không dựng planner tree production bằng mock data mà không ghi rõ
- Không tiếp tục mở rộng feature mới trên itinerary bridge nếu backend đã sẵn `PlanNode`
- Không hardcode `VITE_API_BASE_URL` trong source production
