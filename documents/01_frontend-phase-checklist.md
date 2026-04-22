# Frontend Phase Checklist

## Scope

- Checklist này là source of truth ngắn gọn cho trạng thái frontend sau khi reset planning cho full UI redesign.
- Chỉ giữ những mục có giá trị lâu dài: nền kỹ thuật, contract đang khóa, và checklist triển khai redesign.

## Quy ước trạng thái

- `[x]` hoàn thành
- `[~]` đang chuyển tiếp hoặc còn cleanup
- `[ ]` chưa hoàn thành

## Contract hiện tại cần giữ nguyên

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
- Public trips:
  - `GET /public/trips`
  - `GET /public/trips/:tripId`
  - `GET /public/trips/:tripId/planner`
- Posts:
  - `POST /posts`
  - `GET /posts`
  - `GET /posts/:postId`

## Trạng thái nền hiện tại

- [x] Có app foundation `React + Vite + TypeScript`
- [x] Có router public/protected
- [x] Có HTTP client nền và auth/session pipeline thật
- [x] Có trips CRUD thật
- [x] Có planner workspace thật trên `PlanNode`
- [x] Có public trip read cho guest
- [x] Có community posts create/list/detail
- [~] Budget summary owner flow vẫn còn phần hardening và legacy cleanup
- [~] Source hiện vẫn chứa presentation layer cũ và cần được thay sạch trong Phase 08

## Bộ docs active nên giữ

- [x] `00_frontend-foundation.md`
- [x] `01_frontend-phase-checklist.md`
- [x] `02_frontend-stack-decision.md`
- [x] `05_frontend-api-integration-plan.md`
- [x] `06_frontend-app-architecture.md`
- [x] `07_frontend-definition-of-done.md`
- [x] `08_frontend-risk-and-dependencies.md`
- [x] `09_frontend-production-deploy-runbook.md`
- [x] `19_frontend-phase-08-full-ui-redesign-backlog.md`

## Cleanup docs cũ

- [x] Loại khỏi active docs các backlog/screen-plan cũ gắn với UI cũ
- [ ] Gỡ hết các tham chiếu còn sót tới docs đã xóa trong source và README nếu còn

## Phase 08 - Full UI redesign

Status: `In progress`

- [x] Chốt quyết định giữ contract, thay presentation
- [x] Chốt nguyên tắc giữ docs nền + docs hạ tầng, bỏ docs UI cũ
- [ ] Viết lại design principles cho UI mới
- [ ] Viết lại route map/screen inventory cho UI mới
- [ ] Dựng design system mới
- [ ] Dựng lại public surface
- [ ] Dựng lại protected workspace
- [ ] Cutover route-by-route khỏi UI cũ
- [ ] Xóa presentation files cũ sau khi từng route mới đã lên xong

## Definition of done cho cleanup đợt này

- [ ] README chỉ còn trỏ tới bộ docs active
- [ ] Bộ docs không còn backlog cũ gây nhiễu
- [ ] Deploy docs và infra docs vẫn nguyên vẹn
- [ ] Source code foundation không bị đụng tới chỉ vì reset UI
