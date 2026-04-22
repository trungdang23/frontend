# Journey Frontend

Frontend package cho sản phẩm `journey`.

## Trạng thái hiện tại

- `frontend/` đã được scaffold thành app `React + Vite + TypeScript`.
- App hiện đã có baseline cho:
  - landing page
  - auth routes `login/register`
  - protected app shell
  - dashboard và profile summary từ `GET /auth/me`
  - session boot với `login/register/me/refresh/logout`
  - trips workspace thật với `list/create/detail/edit/delete`
  - trip metadata aligned với `budgetMode/manualBudget/visibility`
  - planner workspace thật trên `PlanNode` với recursive tree và inline node CRUD
  - public trip list + public trip detail/planner read cho guest
  - community feed/detail/create post đã dùng API thật
  - authenticated app shell vẫn giữ quick links sang `Khám phá`, `Chuyến đi public`, và `Cộng đồng`
- Các tài liệu trong `documents/` vẫn là nguồn tham chiếu chính để giữ roadmap không trượt khỏi scope.

## Target Implementation Snapshot

Frontend package này giữ source of truth triển khai cho giao diện Journey.

### Trải nghiệm mục tiêu

- auth thật với session boot/refresh/logout
- trips CRUD
- `/app/trips/:tripId` là planning workspace chính
- planner target là `PlanNode` tree
- trip có `budgetMode`, `manualBudget`, `visibility`
- có public trip list + read cho guest
- có community feed/detail/create post baseline
- community mở ở mức `posts` trước, rồi mới cân nhắc `comments`

### Contract FE cần bám

- Auth:
  - `login`
  - `register`
  - `me`
  - `refresh`
  - `logout`
- Trips:
  - create/list/detail/update/delete
  - `budgetMode`
  - `manualBudget`
  - `visibility`
- Planner:
  - `GET /trips/:id/planner`
  - `POST /nodes`
  - `PATCH /nodes/:id`
  - `DELETE /nodes/:id`
- Posts:
  - `POST /posts`
  - `GET /posts`
  - `GET /posts/:postId`

### Trạng thái migration hiện tại

- Route `/app/trips/:tripId` đã cutover sang planner APIs trên `PlanNode`.
- Source vẫn còn giữ `trip-planning-api.ts` cho legacy itinerary endpoints và route naming cũ, nhưng planner workspace và budget summary owner flow đã đọc contract `PlanNode`-based từ backend.
- Hardening còn lại quanh budget hiện tập trung vào việc giữ summary refetch đúng sau planner mutation và runtime verify mixed-currency trên deploy thật.
- Các route public `/, /trips, /community` vẫn giữ nguyên semantics public; khi người dùng đã đăng nhập, app shell vẫn phải cho phép quay lại các route này mà không tạo cảm giác bị kẹt trong khu riêng.

## Chạy package

```bash
pnpm install
pnpm dev
```

## Các lệnh verify hiện có

```bash
pnpm lint
pnpm build
npm test -- --run
```

## Phase 07 verify routine

### Trước khi push `main`

Chạy bộ verify tối thiểu của package:

```bash
npm test -- --run
pnpm lint
pnpm build
```

### Smoke route/integration đang được khóa

- login
- create trip
- add planner root node
- public trip read-only
- create community post

Browser e2e hiện vẫn deferred cho tới khi chốt được harness phù hợp với local/CI runtime cost.

### Sau mỗi deploy production

Theo checklist tại `documents/09_frontend-production-deploy-runbook.md`, tối thiểu phải rà:

- `/`
- `/auth/login`
- `/community`
- `/trips`
- một public trip detail/planner read-only
- logout quay về flow public/auth

Nếu deploy vừa đụng tới budget/planner, bổ sung thêm smoke owner flow ở `/app/trips/:tripId`.

## Mẫu handoff ngắn

Khi chốt một hardening slice hoặc một deploy verify, ưu tiên báo theo form ngắn:

- `Scope`: đã sửa hoặc verify phần nào
- `Local verify`: `npm test -- --run`, `pnpm lint`, `pnpm build`
- `Post-deploy smoke`: route nào đã rà và kết quả pass/fail
- `Deferred / residual risk`: phần nào còn để lại cho phase sau hoặc cho lần deploy kế tiếp

## Smoke verification hiện tại

- Phase hardening hiện đang dùng `Vitest + Testing Library` làm smoke route/integration layer trước khi mở browser e2e riêng.
- Smoke coverage hiện có:
  - login
  - create trip
  - add planner root node
  - public trip read-only
  - create community post
- Browser e2e hiện vẫn deferred cho tới khi chốt được harness phù hợp với local/CI runtime cost.

## GitHub Actions hiện có

- `frontend-ci`: tự chạy khi `push` và `pull_request`, dùng env test nội bộ để chạy `lint`, `test`, `build`
- `deploy-frontend`: tự chạy khi `push` vào `main`, đồng thời vẫn hỗ trợ `workflow_dispatch` để redeploy thủ công khi cần

## Env runtime hiện dùng

- `VITE_API_BASE_URL`
- `VITE_APP_ENV`

File mẫu: `.env.example`

Deploy thật không đọc giá trị này từ source. Workflow deploy frontend render `.env.production` từ GitHub `Variables`, ghi file đó trực tiếp trên máy đích qua self-hosted runner, rồi build và restart app tại `DEPLOY_PATH`.

Khi frontend được start từ self-hosted GitHub Actions runner, `scripts/start-production.sh` chủ động clear `RUNNER_TRACKING_ID` trước khi detach process để tránh việc runner dọn luôn runtime sau khi job kết thúc. Workflow deploy cũng có thêm một delayed local runtime verification trên self-hosted runner để bắt các lỗi kiểu "deploy pass nhưng process chết ngay sau khi job đóng" mà không phụ thuộc vào Cloudflare challenge ở public domain. Public-domain verification hiện vẫn được giữ như tín hiệu advisory để phát hiện lỗi Cloudflare/tunnel, nhưng không còn là blocking gate cho deploy frontend.

## Bộ docs active

- `documents/00_frontend-foundation.md`
- `documents/01_frontend-phase-checklist.md`
- `documents/02_frontend-stack-decision.md`
- `documents/05_frontend-api-integration-plan.md`
- `documents/06_frontend-app-architecture.md`
- `documents/07_frontend-definition-of-done.md`
- `documents/08_frontend-risk-and-dependencies.md`
- `documents/09_frontend-production-deploy-runbook.md`
- `documents/19_frontend-phase-08-full-ui-redesign-backlog.md`

## Giả định nền cho kế hoạch hiện tại

- Backend production hiện đã sẵn auth flow thật với:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
  - `POST /auth/refresh`
- Backend production hiện cũng đã sẵn `trips` CRUD thật với:
  - `POST /trips`
  - `GET /trips`
  - `GET /trips/:tripId`
  - `PATCH /trips/:tripId`
  - `DELETE /trips/:tripId`
- Backend production hiện cũng đã sẵn contract cho `itineraries` và `budgets` với:
  - `GET /trips/:tripId/itinerary`
  - `POST /trips/:tripId/itinerary/days`
  - `POST /trips/:tripId/itinerary/days/:dayId/activities`
  - `PATCH /trips/:tripId/itinerary/days/:dayId/activities/:activityId`
  - `GET /trips/:tripId/budget-summary`
- Backend production hiện cũng đã sẵn public trip read với:
  - `GET /public/trips`
  - `GET /public/trips/:tripId`
  - `GET /public/trips/:tripId/planner`
- Backend production hiện cũng đã sẵn community posts với:
  - `POST /posts`
  - `GET /posts`
  - `GET /posts/:postId`
- Dependency mở còn lại chủ yếu nằm ở budget hardening/runtime verification và các phase sau như `comments`.

## Mục tiêu của bộ planning này

- Giữ repo frontend gọn quanh docs nền, contract, hạ tầng, và redesign hiện hành.
- Tránh để backlog và visual direction cũ tiếp tục làm nhiễu quá trình thay toàn bộ UI.
- Chỉ ra rõ phần nào là nền kỹ thuật cần giữ và phần nào là presentation cần thay.

## Cấu trúc source hiện tại

```text
src/
  app/
  features/
  shared/
  tests/
```

## Bước tiếp theo hợp lý

1. Viết lại screen inventory và design principles cho UI mới.
2. Giữ nguyên foundation, API, auth/session, và deploy layer.
3. Cutover UI mới theo route hoặc screen group rồi mới xóa code presentation cũ.
