# Frontend Route And Screen Plan

## Mục tiêu

- Chuyển `UI_demo.txt` từ state-machine demo thành route map production.
- Chỉ rõ màn nào làm ngay được với backend hiện tại và màn nào phụ thuộc phase backend sau.

## Route groups

### Public routes

- `/`
- `/auth/login`
- `/auth/register`
- `/community`
- `/community/:postId`

### Protected routes

- `/app`
- `/app/profile`
- `/app/trips`
- `/app/trips/new`
- `/app/trips/:tripId`
- `/app/trips/:tripId/edit`

## Screen map đề xuất

| Route | Màn hình | Auth | Nguồn dữ liệu | Ưu tiên |
| --- | --- | --- | --- | --- |
| `/` | Landing page | No | static content | P0 |
| `/auth/login` | Login | No | `POST /auth/login` | P0 |
| `/auth/register` | Register | No | `POST /auth/register` | P0 |
| `/app` | Dashboard | Yes | `GET /auth/me` + entrypoint tới `trips` | P0 |
| `/app/profile` | Profile | Yes | `GET /auth/me` | P0 |
| `/community` | Community teaser/feed | No | static trước, API sau | P2 |
| `/community/:postId` | Post detail | No | static trước, API sau | P2 |
| `/app/trips` | Trips list | Yes | `GET /trips` | P1 |
| `/app/trips/new` | Create trip | Yes | `POST /trips` | P1 |
| `/app/trips/:tripId` | Trip planning workspace | Yes | `GET /trips/:tripId` + itinerary/budget bridge hiện tại | P1 |
| `/app/trips/:tripId/edit` | Trip edit | Yes | `GET /trips/:tripId` + `PATCH /trips/:tripId` | P1 |

## Mapping từ `UI_demo.txt`

### Có thể giữ làm direction

- landing hero
- trending/community section
- auth card feel
- dashboard empty state
- trip cards visual direction
- profile summary visual tone

### Cần chuyển đổi khi làm production

- `view` state nội bộ trong demo phải đổi sang route thật
- demo auth giả phải bỏ hoàn toàn
- demo trip data local phải thay bằng API contract hoặc placeholder có chủ đích
- community feed local phải được đánh dấu là mock/read-only nếu backend chưa sẵn

## Thứ tự dựng screen hợp lý

1. `App shell`
2. `Login`
3. `Register`
4. `Protected route + session boot`
5. `Dashboard empty state`
6. `Profile summary`
7. `Landing production`
8. `Community teaser`
9. `Trips workspace`
10. `Planning + media + itineraries + budgets` workspace

## Scope đề xuất cho phase FE đầu tiên

### P0 - Làm ngay với backend hiện tại

- landing
- login
- register
- protected shell
- dashboard empty state
- profile summary
- logout
- expired session handling

### P1 - Đã hoàn thành với backend `trips` thật

- trip list
- create trip
- edit trip
- delete trip
- trip detail/workspace shell có media

### P2 - Chờ backend planning recursive expansion và `community`

- planning recursive nhiều tầng
- node editor modal hoặc drawer riêng
- motion polish sâu hơn cho planner
- community feed thật
- post detail thật
- like/comment/follow

## Điều cần tránh

- Không mở `itineraries` hoặc `budgets` production bằng mock rồi quên thay.
- Không để login/register nằm chung một screen state-machine nếu đã có route thật.
- Không để route protected phụ thuộc hoàn toàn vào client memory mà thiếu session boot strategy.
- Không biến planner thành hệ route sâu nếu cùng một màn list có thể giải quyết tốt hơn.
