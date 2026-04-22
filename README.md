# Journey Frontend

Frontend package cho sản phẩm `journey`.

## Trạng thái hiện tại

- `frontend/` đang dùng `React + Vite + TypeScript`.
- Runtime UI không còn chỉ là placeholder. Route `/` đã được dựng thành homepage scrapbook đầu tiên để chốt visual direction cho lần rebuild này.
- Các surface khác như `community`, `planner`, `journal`, và `profile` hiện vẫn đang ở mức foundation/preview và sẽ được triển khai dần ở các slice tiếp theo.
- Những phần nền vẫn còn giá trị và đang được giữ:
  - shared API client + API error handling
  - auth session modules
  - `trips` và `community` API modules
  - i18n baseline
  - provider baseline với `TanStack Query`
  - test/toolchain baseline

## Hướng sản phẩm đang chốt

- Visual direction mới là `Digital Scrapbook`.
- Chỉ `journal` là surface custom tự do với tọa độ, rotation, z-index, kéo thả ảnh/sticker/tape/note.
- Các page còn lại vẫn là `fixed-layout pages`: bố cục cố định, responsive, thay đổi theo nội dung và hình ảnh chứ không thành editor tự do.
- `planner` và `journal` là hai workspace riêng:
  - `/app/trips/:tripId/planner`
  - `/app/trips/:tripId/journal`
- Route cũ `/app/trips/:tripId` nên được giữ như compatibility redirect về `planner`.
- Hướng lưu trữ được khuyến nghị hiện tại là `PostgreSQL + JSONB` cho scene journal, chưa nên đổi hẳn sang `MongoDB`.

## Docs nên đọc theo thứ tự

- `documents/00_frontend-product-and-experience-foundation.md`
- `documents/01_frontend-phase-checklist.md`
- `documents/02_frontend-stack-decision.md`
- `documents/03_frontend-api-integration-plan.md`
- `documents/04_frontend-app-architecture.md`
- `documents/05_frontend-definition-of-done.md`
- `documents/06_frontend-risk-and-dependencies.md`
- `documents/07_frontend-production-deploy-runbook.md`
- `documents/08_frontend-phase-08-digital-scrapbook-redesign-backlog.md`

## Chạy package

```bash
pnpm install
pnpm dev
```

## Verify hiện có

```bash
pnpm lint
pnpm test:run
pnpm build
```

## Ghi chú quan trọng

- Bộ doc trong `frontend/documents/` hiện là source of truth cho lần rebuild này.
- Không nên đọc state hiện tại của `src/` rồi giả định rằng product direction đã bị bỏ; ngược lại, source đang được dựng lại từng slice theo hướng `Digital Scrapbook`.
- Không nên tiếp tục mở rộng UI cũ hoặc dựng thêm route cũ dựa trên các giả định trước reset.
