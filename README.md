# Journey Frontend

Frontend package cho sản phẩm `journey`.

## Trạng thái hiện tại

- `frontend/` đang dùng `React + Vite + TypeScript`.
- Runtime UI không còn chỉ là placeholder. Route `/` đã được dựng thành homepage scrapbook đầu tiên để chốt visual direction cho lần rebuild này.
- Route `/community`, auth, planner, journal editor, và profile đã có route thật trong app router.
- Planner trip-specific hiện chạy trực tiếp ở `/app/trips/:tripId/planner` và dùng `PlanNode` API client riêng; `/app/planner?tripId=...` được giữ làm compatibility redirect.
- Profile đã bind dữ liệu thật từ `journals/mine` và `trips`; journal hiện có API client, renderer và editor tối giản để thêm note/ảnh/sticker/tape, kéo object, đổi layer, xoay nhẹ, autosave debounce và lưu qua `PUT /trips/:tripId/journal`. Profile cũng có share modal cho kế hoạch và nhật ký với `private | public` riêng từng loại; route read-only `/public/trips/:tripId` có CTA copy kế hoạch vào tài khoản, còn `/public/trips/:tripId/journal` đọc theo journal visibility riêng. Community feed đang gộp public posts, public trips, và public journals. Leave guard thực dụng hiện chặn reload/close tab và click điều hướng nội bộ khi còn thay đổi chưa lưu hoặc đang lưu; resize handles, asset upload thật, history/revision và multi-tab conflict handling vẫn chưa dựng.
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
- Route cũ `/app/trips/:tripId` được giữ như compatibility redirect về `planner`.
- Trong source hiện tại, `/app/trips/:tripId/planner` và `/app/trips/:tripId/journal` là route chính thật; `/app/planner?tripId=...` và `/app/journal?tripId=...` chỉ còn là compatibility redirects.
- Hướng lưu trữ hiện tại là `PostgreSQL + JSONB` cho scene journal phase đầu, chưa nên đổi hẳn sang `MongoDB`.

## Docs nên đọc theo thứ tự

- `documents/00_frontend-product-and-experience-foundation.md`
- `documents/01_frontend-rebuild-checklist.md`
- `documents/02_frontend-stack-decision.md`
- `documents/03_frontend-api-integration-plan.md`
- `documents/04_frontend-app-architecture.md`
- `documents/05_frontend-definition-of-done.md`
- `documents/06_frontend-risk-and-dependencies.md`
- `documents/07_frontend-production-deploy-runbook.md`
- `documents/08_frontend-rebuild-digital-scrapbook-backlog.md`

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
- Deploy production hiện dùng staged `dist` sync trên máy đích để tránh cửa sổ runtime đọc bundle lỗi trong lúc build.
- Ảnh mặc định dùng chung cho frontend nên đặt trong `public/images/defaults/` để có URL public ổn định dạng `/images/defaults/<ten-file>`.
- Không nên đọc state hiện tại của `src/` rồi giả định rằng product direction đã bị bỏ; ngược lại, source đang được dựng lại từng slice theo hướng `Digital Scrapbook`.
- Không nên tiếp tục mở rộng UI cũ hoặc dựng thêm route cũ dựa trên các giả định trước reset.
