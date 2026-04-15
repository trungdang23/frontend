# Journey Frontend

Frontend package cho sản phẩm `journey`.

## Trạng thái hiện tại

- `frontend/` đã được scaffold thành app `React + Vite + TypeScript`.
- App hiện đã có baseline cho:
  - landing page
  - auth routes `login/register`
  - protected app shell
  - dashboard empty state
  - profile summary từ `GET /auth/me`
  - session boot với `login/register/me/refresh`
- Các tài liệu trong `documents/` vẫn là nguồn tham chiếu chính để giữ roadmap không trượt khỏi scope.

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

## Env runtime hiện dùng

- `VITE_API_BASE_URL`
- `VITE_APP_ENV`

File mẫu: `.env.example`

Deploy thật không đọc giá trị này từ source. Workflow deploy frontend lấy build-time env từ GitHub `Variables`.

## Bộ tài liệu planning

- `documents/00_frontend-foundation.md`
- `documents/01_frontend-phase-checklist.md`
- `documents/02_frontend-stack-decision.md`
- `documents/03_frontend-design-principles.md`
- `documents/04_frontend-route-and-screen-plan.md`
- `documents/05_frontend-api-integration-plan.md`
- `documents/06_frontend-app-architecture.md`
- `documents/07_frontend-definition-of-done.md`
- `documents/08_frontend-risk-and-dependencies.md`

## Giả định nền cho kế hoạch hiện tại

- `UI_demo.txt` là reference về concept và visual direction, không phải source code production.
- Backend production hiện đã sẵn auth flow thật với:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
  - `POST /auth/refresh`
- Các phase `trips`, `itineraries`, `budgets`, và `community` của backend vẫn là dependency cho các phase frontend tương ứng.

## Mục tiêu của bộ planning này

- Chốt cấu trúc tài liệu và roadmap cho frontend trước khi viết code.
- Chốt nguyên tắc thiết kế và kiến trúc app ở mức đủ rõ để scaffold một lần cho đúng.
- Chỉ ra rõ phần nào có thể làm ngay với backend hiện tại và phần nào cần chờ backend phase tiếp theo.

## Cấu trúc source hiện tại

```text
src/
  app/
  features/
  shared/
  tests/
```

## Bước tiếp theo hợp lý

1. Cấu hình GitHub `Secrets` và `Variables` theo `documents/09_frontend-preview-deploy-runbook.md`.
2. Chạy `deploy-frontend` để đưa bản preview đầu tiên lên domain thật.
3. Test auth flow và i18n trên domain preview.
4. Chỉ mở `trips/community` khi backend phase tương ứng đã sẵn contract thật.
