# Frontend Phase 08 Full UI Redesign Backlog

## Mục tiêu

Đóng `Phase 08` của frontend để thay mới toàn bộ lớp giao diện của Journey, không xem UI hiện tại là nền cần giữ lại.

Phase này tập trung vào:

- reset visual language của toàn bộ app
- thay mới public surface và protected workspace theo một hệ thống giao diện mới
- tách redesign khỏi hardening hiện tại để tránh vá tiếp UI sắp bị bỏ
- giữ product contract, route semantics, và backend integration ổn định trong lúc thay UI
- chuẩn hóa lại design system, layout primitives, và screen composition trước khi code giao diện mới

Phase này chưa xử lý:

- đổi backend contract chỉ vì lý do thị giác
- mở thêm feature mới ngoài scope đã có
- dọn legacy API bridge nếu không ảnh hưởng trực tiếp tới cutover UI
- browser e2e toàn diện trước khi chốt screen map mới

## Trạng thái

- Status: `Planned`
- Date: `2026-04-22`
- Owner area:
  - `frontend/documents`
  - `frontend/src`
- Context hiện tại:
  - source frontend đang có baseline production usable
  - `Phase 07` đang là hardening/release-readiness cho baseline đó
  - định hướng mới là không giữ lại UI hiện có
  - vì vậy redesign cần được tách riêng thành phase mới thay vì tiếp tục polish `src` theo visual cũ

## Quyết định chiến lược đã chốt

## 1. Không reuse visual system hiện tại

Phase này mặc định:

- không giữ layout hiện tại chỉ vì đã tồn tại
- không giữ button/card/form/navbar styles hiện tại chỉ vì đã có code
- không xem `UI_demo.txt` là template để copy lại

Có thể giữ lại:

- business flow
- route contract
- API wiring
- state management patterns nào vẫn hữu ích

## 2. Freeze chỉnh sửa UI cũ trong lúc chốt redesign spec

Trước khi bước vào implementation mới:

- không mở thêm các lượt polish nhỏ cho `frontend/src` nếu không phải blocker bug
- không trộn full redesign với hardening còn dang dở trong cùng một slice code
- ưu tiên chốt spec, screen inventory, và rollout plan trước

## 3. Giữ domain contract, thay lớp thể hiện

Redesign là thay:

- visual language
- hierarchy
- density
- navigation feel
- component system

Redesign không mặc định thay:

- route semantics
- auth flow contract
- trip/planner/public/community data contract

Nếu redesign làm lộ ra nhu cầu đổi route hoặc contract, phần đó phải được ghi riêng như decision cần phê duyệt, không đổi ngầm trong lúc dựng UI.

## Deliverables cần có trước khi code lớn

- screen inventory mới cho toàn app
- route map sau redesign
- design principles mới thay thế baseline hiện tại
- token foundation mới:
  - color
  - typography
  - spacing
  - radius
  - shadow
  - motion
- layout primitives mới cho:
  - public shell
  - auth shell
  - protected app shell
  - planner workspace
- migration plan từ UI cũ sang UI mới

## Inventory giữ, thay, xóa

## 1. Nên giữ

Đây là các phần không nên đập đi chỉ vì đổi toàn bộ UI:

- deploy và runtime:
  - `frontend/deploy/`
  - `frontend/documents/09_frontend-production-deploy-runbook.md`
  - workflow CI/deploy hiện có
- app/runtime foundation:
  - `src/main.tsx`
  - `src/app/config/env.ts`
  - `src/app/providers/app-providers.tsx`
  - `src/app/router/router.tsx`
  - `src/app/router/app-routes.tsx`
- auth/session và API infrastructure:
  - `src/shared/api/*`
  - `src/features/auth/api/*`
  - `src/features/auth/session/*`
  - `src/features/auth/routes/guest-route.tsx`
  - `src/features/auth/routes/protected-route.tsx`
- feature data contracts:
  - `src/features/trips/api/trips-api.ts`
  - `src/features/trips/planning/api/planner-api.ts`
  - `src/features/trips/public/api/public-trip-api.ts`
  - `src/features/community/api/posts-api.ts`
  - `src/features/**/types/*`
  - `src/features/**/lib/*query*`
  - validator/default modules nào thuần dữ liệu
- i18n và copy system:
  - `src/shared/i18n/*`
  - giữ nguyên thuật ngữ tiếng Việt hiện có nếu không có quyết định content strategy mới
- tests theo behavior:
  - auth/session/routing/integration tests nên được giữ làm regression net
  - có thể phải viết lại selector hoặc copy assertions, nhưng không nên bỏ lớp verify này

## 2. Nên thay mới hoàn toàn

Đây là nơi UI cũ đang thể hiện trực tiếp và nên được xem là thay thế, không phải polish:

- global visual layer:
  - `src/app/styles/base.css`
  - `src/app/styles/index.css`
  - `src/app/styles/tokens.css`
- shared UI primitives:
  - `src/shared/ui/*`
- screen-level và feature-level presentation:
  - `src/features/auth/components/*`
  - `src/features/community/components/*`
  - `src/features/trips/components/*`
  - `src/features/trips/planning/components/*`
  - `src/features/trips/public/components/*`
  - `src/features/landing/routes/landing-page.tsx`
  - `src/features/dashboard/routes/dashboard-page.tsx`
  - `src/features/profile/routes/profile-page.tsx`
  - `src/features/shell/routes/app-shell.tsx`
  - `src/features/community/routes/*`
  - `src/features/trips/routes/*`
  - `src/features/auth/routes/login-page.tsx`
  - `src/features/auth/routes/register-page.tsx`
- skeleton/loading surfaces:
  - `src/app/router/workspace-route-skeleton.tsx`
  - `src/shared/ui/public-page-skeleton.tsx`

## 3. Nên xóa hoặc phase-out sau khi cutover

Những phần này không nên sống lâu trong codebase redesign:

- legacy planning bridge:
  - `src/features/trips/api/trip-planning-api.ts`
  - file này hiện chỉ còn `getTripBudgetSummary` được dùng ở UI mới; các itinerary endpoints còn lại nên tách hoặc xóa khi cutover planner/budget hoàn tất
- docs gắn trực tiếp với visual direction cũ hoặc backlog rollout cũ

Khuyến nghị:

- xóa ngay các doc visual cũ sau khi đã rút phần contract còn hữu ích sang:
  - `01_frontend-phase-checklist.md`
  - `05_frontend-api-integration-plan.md`
  - `06_frontend-app-architecture.md`
  - `19_frontend-phase-08-full-ui-redesign-backlog.md`

## 4. Nhóm nên giữ nhưng có thể refactor tên/file

- `app-routes.tsx` có thể giữ route semantics nhưng viết lại layout composition
- `app-providers.tsx` có thể giữ QueryClient/AuthProvider nhưng cần bơm thêm design-system providers nếu UI mới cần
- tests có thể tách lại theo feature mới, nhưng vẫn giữ các scenario business hiện tại
- `trip-detail-page.tsx` nên được viết lại mạnh, nhưng contract planner/budget hiện tại vẫn nên được giữ

## Scope màn hình phải thiết kế lại

- `/`
- `/auth/login`
- `/auth/register`
- `/community`
- `/community/:postId`
- `/app`
- `/app/profile`
- `/app/trips`
- `/app/trips/new`
- `/app/trips/:tripId`
- `/app/trips/:tripId/edit`
- `/app/community/new`

## Nguyên tắc redesign

## 1. Thay đồng bộ, không thay nửa vời

- tránh tình trạng public đã đổi ngôn ngữ thị giác nhưng protected shell vẫn thuộc hệ cũ
- nếu rollout theo slice, mỗi slice vẫn phải hoàn chỉnh ở mức trải nghiệm, không để xen lẫn hai UI trái tính cách trên cùng một flow

## 2. Thiết kế theo screen-first, không component-first

- chốt hierarchy và trải nghiệm từng màn trước
- chỉ trừu tượng component sau khi nhìn ra pattern lặp thật
- không bắt đầu bằng việc đổi màu token rồi giữ nguyên bố cục cũ

## 3. Planner là màn bản lề

`/app/trips/:tripId` là nơi cần được ưu tiên cao nhất trong redesign vì:

- đây là workspace chính của sản phẩm
- đây là màn gắn với contract planner/budget thực
- đây là nơi UI cũ dễ lộ giới hạn nhất nếu chỉ reskin

## 4. Public và protected phải cùng một ngôn ngữ thương hiệu

- landing/community không được giống product marketing tách rời app
- protected shell không được rơi về generic dashboard nếu brand mới mang tính editorial hoặc travel-first

## 5. Giữ tiếng Việt UX nhất quán

- tiếp tục giữ các thuật ngữ như `chuyến đi`, `lịch trình`, `ngân sách`, `cộng đồng`
- nếu đổi content strategy, phải chốt ở cấp copy system thay vì hardcode từng màn

## Slice rollout đề xuất

## Slice FE-08A - Product UI reset và screen inventory

### Mục tiêu

Chốt rõ Journey sau redesign muốn trông như gì và từng route có vai trò gì.

### Việc cần làm

- [ ] audit lại toàn bộ route hiện có dưới góc nhìn UI mới
- [ ] xác định màn nào giữ semantics, màn nào gộp lại, màn nào cần tách
- [ ] chốt primary action cho từng screen
- [ ] chốt visual direction mới bằng từ khóa rõ ràng
- [ ] ghi rõ những gì tuyệt đối không reuse từ UI cũ

### Acceptance criteria

- có một screen inventory mới đủ rõ để bắt đầu wireframe
- không còn mơ hồ kiểu “đổi toàn bộ UI” nhưng chưa rõ đổi những màn nào

## Slice FE-08B - Design system foundation mới

### Mục tiêu

Tạo nền giao diện mới đủ mạnh để public và protected cùng dùng.

### Việc cần làm

- [ ] thay mới design principles
- [ ] định nghĩa token mới
- [ ] định nghĩa typography scale mới
- [ ] định nghĩa layout/container/grid mới
- [ ] định nghĩa primitives mới cho button, input, card, dialog, banner, navigation
- [ ] chốt motion rules và `prefers-reduced-motion`

### Acceptance criteria

- có foundation đủ để dựng màn mới mà không phải chế style ad-hoc từng nơi

## Slice FE-08C - Public surface redesign

### Mục tiêu

Thay mới hoàn toàn landing, auth, community theo visual system mới.

### Việc cần làm

- [ ] redesign landing
- [ ] redesign login/register
- [ ] redesign community feed
- [ ] redesign post detail
- [ ] redesign public trip discovery/read surfaces nếu route public vẫn giữ

### Acceptance criteria

- public experience đã mang đúng visual direction mới
- user mới vào app không còn nhìn thấy dấu vết UI cũ

## Slice FE-08D - Protected workspace redesign

### Mục tiêu

Thay mới app shell, dashboard, trips list/form, trip detail/planner, profile.

### Việc cần làm

- [ ] redesign app shell navigation
- [ ] redesign dashboard
- [ ] redesign trips list
- [ ] redesign create/edit trip forms
- [ ] redesign planner workspace
- [ ] redesign profile summary
- [ ] redesign create community post trong protected flow

### Acceptance criteria

- protected experience đã cùng ngôn ngữ với public surface
- planner workspace trở thành màn mạnh nhất về hierarchy và usability

## Slice FE-08E - Cutover, cleanup, verify

### Mục tiêu

Chuyển sang UI mới mà không làm vỡ contract và regression cốt lõi.

### Việc cần làm

- [ ] xóa hoặc cô lập UI primitives cũ không còn dùng
- [ ] cập nhật tests bị lệ thuộc text/structure cũ
- [ ] rà responsive mobile/tablet/desktop cho screen mới
- [ ] rà accessibility ở các flow chính
- [ ] cập nhật README và runbook nếu verify flow thay đổi

### Acceptance criteria

- source không còn lẫn lộn nửa hệ cũ nửa hệ mới
- route chính vẫn chạy trên contract hiện tại

## Rủi ro cần kiểm soát

- redesign biến thành reskin nếu không chốt lại screen hierarchy
- implementation sớm hơn spec làm scope trôi
- planner workspace bị đổi visual nhưng không cải thiện usability thật
- test suite gãy hàng loạt do thay đổi copy/structure mà không có kế hoạch cập nhật
- trộn redesign với hardening branch hiện tại làm khó review và khó deploy

## Bước tiếp theo hợp lý nhất

1. Chốt `screen inventory` và `route map` mới.
2. Viết lại `design principles` cho visual direction mới.
3. Chọn một màn anchor để khóa hệ thiết kế mới trước.
4. Sau khi ba phần trên rõ, mới bắt đầu code `frontend/src`.

## Màn anchor khuyến nghị

Màn nên được dùng làm anchor đầu tiên:

- `trip detail / planner workspace`

Lý do:

- đây là màn khác biệt sản phẩm rõ nhất
- màn này ép mình chốt navigation, density, card/tree patterns, form patterns, và budget summary presentation cùng lúc
- nếu planner mới ổn, phần còn lại của protected UI sẽ dễ bám theo hơn
