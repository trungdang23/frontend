# Frontend Rebuild Checklist

## Scope

- Checklist này là source of truth ngắn gọn cho trạng thái frontend trong giai đoạn rebuild và chốt hướng `Digital Scrapbook`.
- Mục tiêu của file này là giữ cả team nhìn cùng một thực tế: homepage `/` đã có baseline thật, các surface còn lại đang được dựng dần, và journal editor chỉ là một phần của tổng trải nghiệm.

## Quy ước trạng thái

- `[x]` hoàn thành
- `[~]` đang chuyển tiếp hoặc còn cleanup
- `[ ]` chưa hoàn thành

## Thực trạng repo hiện tại

- [x] `frontend/` còn toolchain `React + Vite + TypeScript`
- [x] `src/main.tsx` đã bootstrap lại bằng `AppProviders + router`
- [x] route `/` đã có homepage scrapbook baseline thật
- [x] route `/community` đã có feed public đầu tiên
- [x] auth routes đã có shared chrome và session flow
- [x] route `/app/trips` đã có workspace list thật dùng dữ liệu trips hiện tại; `/app` redirect về đây
- [x] planner route hiện tại đã dùng `PlanNode` API client; trip-specific planner đã cut over sang `/app/trips/:tripId/planner`, route canonical owner-side đã có structured tree workspace + budget summary baseline, và `/app/planner?tripId=...` vẫn là compatibility redirect
- [x] profile route đã bind `journals/mine` và `trips`, có share modal cho kế hoạch/nhật ký
- [~] journal route đã có API client, renderer, editor tối giản, drag object, selected-object controls, autosave debounce và leave guard qua data router cho internal navigation; inspector/handles đầy đủ chưa có
- [x] shared API client vẫn còn
- [x] auth session modules vẫn còn
- [x] `trips` và `community` API modules vẫn còn
- [x] `planner-api.ts` cho `PlanNode` đã tồn tại dưới `features/trips/planning/api`
- [x] i18n baseline vẫn còn
- [x] test baseline vẫn còn
- [x] dead frontend itinerary bridge files đã được cleanup sau khi backend gỡ legacy itinerary support
- [~] runtime router/shell/UI primitives đã có cho các surface chính, `trips` workspace entry, và route public read-only cho plan/journal; canonical planner/journal cutover đã xong, app router đã lên data-router, và compatibility redirects vẫn đang được giữ trong giai đoạn chuyển tiếp

## Bộ docs active cần giữ

- [x] `00_frontend-product-and-experience-foundation.md`
- [x] `01_frontend-rebuild-checklist.md`
- [x] `02_frontend-stack-decision.md`
- [x] `03_frontend-api-integration-plan.md`
- [x] `04_frontend-app-architecture.md`
- [x] `05_frontend-definition-of-done.md`
- [x] `06_frontend-risk-and-dependencies.md`
- [x] `07_frontend-production-deploy-runbook.md`
- [x] `08_frontend-rebuild-digital-scrapbook-backlog.md`

## Quyết định nền đã chốt

- [x] chỉ `journal` là surface freeform
- [x] các page còn lại là `fixed-layout`
- [x] `planner` và `journal` tách thành hai workspace riêng
- [x] route cũ `/app/trips/:tripId` sẽ đóng vai trò compatibility redirect
- [x] hướng lưu trữ khuyến nghị là `PostgreSQL + JSONB`, chưa đổi hẳn sang Mongo

## Việc tài liệu đã xử lý trong lượt review này

- [x] đổi tên file foundation cho đúng phạm vi mới
- [x] đổi tên backlog redesign cho đúng định hướng scrapbook
- [x] cập nhật README cho đúng trạng thái source hiện tại
- [x] viết lại foundation theo hướng `fixed-layout + scrapbook journal`
- [x] cập nhật stack decision với editor/runtime/storage guidance
- [x] cập nhật API plan với journal scene model đề xuất
- [x] cập nhật architecture, definition of done, risk doc
- [x] đồng bộ naming docs để bỏ numbering legacy và khớp với homepage `/` hiện tại

## Frontend rebuild - Digital Scrapbook

Status: `In progress`

- [x] chốt hướng visual `Digital Scrapbook`
- [x] chốt ranh giới `fixed-layout vs freeform`
- [x] chốt route map mức nền cho `planner` và `journal`
- [x] dựng homepage scrapbook baseline ở `/`
- [~] dựng lại router và app shell; cutover canonical planner/journal routes và data-router migration đã xong, cleanup transition vẫn còn
- [~] dựng design token system mới; `@theme` tokens màu/font/paper đã có trong CSS, nhưng component-level spacing/radius/shadow primitives còn cần chuẩn hóa
- [~] dựng fixed-layout public/auth/protected surfaces
- [~] dựng `trips` workspace entry tại `/app/trips`; list thật cùng dedicated fixed-layout create/edit form đã có, nhưng bulk action/filter/sort nâng cao và cleanup compatibility vẫn deferred
- [~] dựng planner canonical workspace tại `/app/trips/:tripId/planner`; tree owner flow, node CRUD cơ bản, budget summary, và edit metadata qua route riêng đã có, nhưng reorder/editor chuyên biệt và notebook compatibility cleanup còn deferred
- [x] dựng journal scene renderer
- [~] dựng journal editor interactions tối giản cho note/ảnh/sticker/tape, drag object, selected-object controls, autosave debounce và leave guard qua data router; inspector đầy đủ còn deferred
- [~] chốt journal API contract phase đầu với `GET/PUT/PATCH/DELETE /trips/:tripId/journal`, `GET /journals/mine`, `GET /public/journals`, và `GET /public/trips/:tripId/journal`; page-level contract còn deferred
- [~] chốt asset flow phase đầu bằng owner-only journal image upload, asset library/delete, và signed URL delivery; cloud storage, orphan cleanup, và trip-delete cleanup còn deferred
- [x] cập nhật deploy smoke checklist theo route mới

## Điểm cần giữ kỷ luật trong giai đoạn này

- [ ] không mở rộng thêm UI cũ chỉ vì tiện
- [ ] không dùng editor engine cho các page fixed-layout
- [x] không lưu journal object theo pixel viewport hiện tại
- [x] không mở rộng tiếp `trip-planning-api.ts` cho journal editor; planner `PlanNode` client đã được tách riêng
- [x] không giữ lại dead itinerary bridge files sau khi backend đã drop route/schema legacy
- [ ] không đổi storage platform chỉ vì scene data nhìn giống document

## Definition of done cho đợt sync doc này

- [x] docs active dùng cùng một route model
- [x] docs không còn claim sai trạng thái source
- [x] foundation đã ghi rõ quyết định storage
- [x] backlog đã có slice cụ thể cho journal renderer/editor
- [~] deploy runbook đã được refresh cho staged deploy và cần cập nhật tiếp khi planner/journal route hoặc journal editor flow thay đổi thêm
