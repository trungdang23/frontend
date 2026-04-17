# Frontend API Integration Plan

## Mục tiêu

- Chốt cách frontend bám vào backend hiện tại.
- Tránh sai contract ở auth ngay từ phase scaffold.
- Chỉ ra rõ phần nào dùng API thật ngay và phần nào chưa nên gọi.

## Backend base hiện tại

- Base URL production: `https://api.buicojourney.com/api/v1`
- Frontend env đề xuất sau khi scaffold:
  - `VITE_API_BASE_URL=https://api.buicojourney.com/api/v1`
- Với deploy thật, giá trị `VITE_API_BASE_URL` phải được cấp từ GitHub `Variables`, không hardcode trong source.

## Response envelope hiện tại

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
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password.",
    "details": "Invalid email or password.",
    "path": "/api/v1/auth/login",
    "timestamp": "2026-04-14T00:00:00.000Z"
  }
}
```

## Auth contract hiện đã sẵn

### `POST /auth/register`

Request:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "User Name"
}
```

Response data:

```json
{
  "user": {
    "id": "string",
    "email": "user@example.com",
    "displayName": "User Name",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "tokens": {
    "tokenType": "Bearer",
    "accessToken": "string",
    "accessTokenExpiresIn": 900,
    "refreshToken": "string",
    "refreshTokenExpiresIn": 604800
  }
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

Response data:

- cùng shape với `register`

### `GET /auth/me`

Headers:

- `Authorization: Bearer <access_token>`

Response data:

```json
{
  "user": {
    "id": "string",
    "email": "user@example.com",
    "displayName": "User Name",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### `POST /auth/refresh`

Request:

```json
{
  "refreshToken": "string"
}
```

Response data:

```json
{
  "tokens": {
    "tokenType": "Bearer",
    "accessToken": "string",
    "accessTokenExpiresIn": 900,
    "refreshToken": "string",
    "refreshTokenExpiresIn": 604800
  }
}
```

## Lưu ý quan trọng cho frontend

- `register` nhận `displayName`, không phải `fullName`
- `me` trả `data.user`
- `refresh` trả `data.tokens`
- Backend đã có CORS cho `https://buicojourney.com`

## Session strategy đề xuất cho phase đầu

### Mục tiêu

- Giữ auth UX ổn định khi refresh trang.
- Không làm FE phức tạp quá sớm.

### Đề xuất

- Lưu session object vào `localStorage` trong phase đầu:
  - `accessToken`
  - `refreshToken`
  - thông tin user tối thiểu
- Khi app boot:
  - đọc session local
  - nếu có access token thì gọi `GET /auth/me`
  - nếu access token lỗi nhưng còn refresh token thì thử `POST /auth/refresh` một lần
  - nếu refresh fail thì clear session và điều hướng về `login`

### Rủi ro cần ghi nhận

- Đây không phải cách hardening tốt nhất về lâu dài.
- Sau khi backend hỗ trợ cookie-based refresh token, nên chuyển `refreshToken` sang `httpOnly cookie`.

## Request pipeline đề xuất

1. HTTP client đọc `accessToken` hiện tại.
2. Protected request tự gắn header `Authorization`.
3. Nếu nhận `401` ở protected request:
   - thử refresh đúng 1 lần
   - cập nhật session
   - retry request cũ đúng 1 lần
4. Nếu vẫn fail:
   - clear session
   - redirect `login`
   - hiển thị thông báo session hết hạn

## Những phần chưa nên nối API thật ngay

- community feed thật
- post detail thật
- follow/like/comment

## Trips contract hiện đã sẵn

Frontend có thể nối API thật cho `trips` với các endpoint:

- `GET /trips?page=0&size=20&sort=startDate,asc`
- `GET /trips/:tripId`
- `POST /trips`
- `PATCH /trips/:tripId`
- `DELETE /trips/:tripId`

Shape `Trip` hiện backend trả:

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

List response trả `data: Trip[]` kèm:

```json
{
  "meta": {
    "page": 0,
    "size": 20,
    "sort": "startDate,asc",
    "totalElements": 1,
    "totalPages": 1
  }
}
```

Frontend nên dùng contract này để mở Phase 05 thay vì giữ placeholder.

## Itinerary và budget contract hiện đã sẵn

Frontend có thể mở Phase 06 bằng API thật với các endpoint:

- `GET /trips/:tripId/itinerary`
- `POST /trips/:tripId/itinerary/days`
- `POST /trips/:tripId/itinerary/days/:dayId/activities`
- `PATCH /trips/:tripId/itinerary/days/:dayId/activities/:activityId`
- `GET /trips/:tripId/budget-summary`

Shape `itinerary` response hiện backend trả:

```json
{
  "tripId": "string",
  "startDate": "2026-07-12",
  "endDate": "2026-07-15",
  "days": [
    {
      "id": "string",
      "tripId": "string",
      "date": "2026-07-12",
      "activities": [
        {
          "id": "string",
          "itineraryDayId": "string",
          "title": "Lantern Walk",
          "startsAt": "18:30",
          "location": "Hoi An Old Town",
          "notes": "string",
          "costAmount": 250000,
          "costCurrency": "VND",
          "position": 1,
          "createdAt": "date",
          "updatedAt": "date"
        }
      ],
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

`POST /trips/:tripId/itinerary/days` hiện nhận:

```json
{
  "date": "2026-07-12"
}
```

`POST /trips/:tripId/itinerary/days/:dayId/activities` hiện nhận:

```json
{
  "title": "Lantern Walk",
  "startsAt": "18:30",
  "location": "Hoi An Old Town",
  "notes": "Bring camera",
  "costAmount": 250000,
  "costCurrency": "VND"
}
```

`PATCH /trips/:tripId/itinerary/days/:dayId/activities/:activityId` cho phép update từng phần của activity với cùng shape field như create.

`GET /trips/:tripId/budget-summary` hiện trả:

```json
{
  "tripId": "string",
  "currency": "VND",
  "totalBudgetAmount": 2000000,
  "totalPlannedAmount": 250000,
  "remainingAmount": 1750000,
  "totalDays": 1,
  "totalActivities": 1,
  "isOverBudget": false
}
```

Frontend Phase 06 nên bám đúng contract này trước khi mở rộng chart, drag/drop, hay inline planner phức tạp.

## Cách xử lý các phần chưa có backend

- Với public/community section:
  - cho phép dùng placeholder content có chủ đích
- Với protected/trips section:
  - ưu tiên empty state hoặc feature-flag placeholder
- Không dùng local fake data để giả vờ như đã production-ready
