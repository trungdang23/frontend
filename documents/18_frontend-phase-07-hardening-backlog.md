# Frontend Phase 07 Hardening Backlog

## Mục tiêu

Đóng `Phase 07` của frontend để các flow đã có trở nên ổn định hơn trước khi mở thêm feature mới như `comments`, social interactions sâu hơn, hoặc cleanup lớn quanh planner/budget.

Phase này tập trung vào:

- hardening navigation giữa public và protected flows
- route-level integration tests cho auth/session/navigation
- smoke verify cho trips/planner/public/community flows
- rà responsive trên các màn hình chính
- rà accessibility ở mức release-ready
- chốt checklist verify sau deploy

Phase này chưa xử lý:

- `comments`
- likes, reactions, bookmark
- drag-and-drop reorder cho planner
- redesign lớn cho visual system
- đổi contract budget phía frontend trước khi backend chốt migration
- cleanup legacy itinerary bridge ở mức feature

## Trạng thái

- Status: `In progress`
- Date: `2026-04-20`
- Owner area:
  - `frontend/src`
  - `frontend/src/tests`
  - `frontend/documents`
- Trạng thái source hiện tại:
  - auth/session thật đã có
  - owner workspace thật đã có
  - public trip read đã có
  - community feed/detail/create post đã có
  - bug navigation sau login vừa cho thấy app shell/public shell vẫn là vùng cần hardening thêm
  - budget summary owner flow đã đọc summary `PlanNode`-based từ backend, nhưng vẫn cần khóa regression refetch sau planner mutation
  - guest public trip list/detail hiện đã có test coverage ở mức route/integration
  - session boot cho protected flow hiện đã có regression test riêng để tránh flash sai shell/route
- Dependency chặn:
  - nếu muốn browser e2e thật, cần chốt tool/harness trước khi thêm dev dependency mới
  - runtime verification cho mixed-currency budget summary trên deploy thật vẫn chưa được chốt
- Dependency mở ra sau khi xong:
  - `Phase 08 FE`
  - social expansion như `comments`
  - release confidence cao hơn cho deploy thật

## Quyết định rollout cần chốt

## 1. Ưu tiên regression người dùng thật trước

Phase này không nên mở thêm màn hình hay capability lớn mới.

Ưu tiên đúng là:

- không bị kẹt giữa public shell và protected shell
- auth/session không drift
- các route public vẫn truy cập được ngay cả khi user đã đăng nhập

## 2. Route-level tests đi trước browser e2e

Route-level tests hiện là lớp hardening rẻ nhất và sát bug vừa xảy ra nhất.

Chúng phải cover trước:

- login xong vào `/app`
- từ app shell vẫn vào được `/`, `/trips`, `/community`
- logout xong quay về flow public/auth đúng

Browser e2e là phase tiếp theo trong cùng backlog, không phải việc đầu tiên.

## 3. Smoke e2e giữ scope rất nhỏ

Nếu mở browser e2e, chỉ nên chọn các flow có giá trị phát hiện regression cao:

- login
- create trip
- add planner node
- open public trip
- create community post

Không nên mở e2e quá rộng ngay ở phase này.

## 4. Responsive và accessibility chỉ rà trên màn hình trọng yếu

Không cần audit toàn bộ app ở vòng đầu.

Ưu tiên:

- auth pages
- app shell
- trip detail/planner workspace
- public trip pages
- community feed/detail/create

## 5. Docs và verify phải đi cùng code hardening

Nếu phase này thêm test harness, verify command, hoặc production checklist mới, tài liệu gần nhất phải được cập nhật ngay trong cùng slice.

## Exit criteria cho Phase 07

- route-level tests đã khóa regression auth/public navigation
- app shell không còn tạo cảm giác bị kẹt trong khu riêng sau login
- smoke verify đã cover các flow cốt lõi hoặc đã ghi rõ phần deferred
- các màn hình chính đã được rà mobile + desktop
- các issue accessibility mức cao đã được xử lý hoặc ghi rõ deferred
- tài liệu verify/deploy liên quan đã khớp với source

## Slice FE-07A - Auth và public/protected navigation regression

### Mục tiêu

Khóa các bug kiểu:

- đăng nhập xong mất đường vào `Khám phá`
- đã đăng nhập nhưng khó quay lại `Cộng đồng`
- redirect sai giữa `GuestRoute` và `ProtectedRoute`
- logout xong vẫn giữ state cũ gây khó hiểu

### Focus hiện tại

- khóa `GuestRoute` để auth route không tự redirect vào chính nó khi `location.state.from` trỏ về `/auth/*`
- verify logout từ protected route vẫn đưa user về flow auth/public với notice rõ ràng và không làm mất khả năng quay lại route đang dở sau khi đăng nhập lại

### Việc cần làm

- [x] Thêm route-level tests cho:
  - login -> `/app`
  - từ app shell mở được `/`
  - từ app shell mở được `/trips`
  - từ app shell mở được `/community`
- [x] Verify `GuestRoute` không tạo redirect loop
- [x] Verify `ProtectedRoute` luôn trả về login khi chưa auth
- [x] Verify logout trả user về flow hợp lý với notice rõ ràng
- [x] Verify app shell/public shell không drift semantics navigation

### File dự kiến

- `src/tests/auth-session.test.tsx`
- `src/tests/app-shell-navigation.test.tsx`
- có thể thêm:
  - `src/tests/public-navigation.test.tsx`
  - `src/tests/protected-routing.test.tsx`

### Acceptance criteria

- bug “login xong không vào lại community/explore được” có test coverage rõ
- không còn regression navigation cơ bản mà thiếu test chặn

## Slice FE-07B - Route-level integration cho flows cốt lõi

### Mục tiêu

Khóa các flow quan trọng ở mức component/router integration, chưa cần browser thật.

### Việc cần làm

- [x] Test guest mở public trip list/detail
- [x] Test guest mở community feed/detail
- [x] Test direct visit `/app/trips/:tripId` khi chưa auth sẽ về login
- [x] Test login xong tiếp tục được flow đang dở nếu có `location.state.from`
- [x] Test planner mutation ở trip detail sẽ refetch budget summary thay vì chỉ refresh planner tree
- [x] Test session boot không flash sai shell hoặc route sai
- [x] Test create post flow từ protected shell không làm mất đường quay lại public community

### File dự kiến

- `src/tests/public-trips-page.test.tsx`
- `src/tests/public-trip-page.test.tsx`
- `src/tests/community-page.test.tsx`
- `src/tests/community-post-page.test.tsx`
- `src/tests/community-create-page.test.tsx`
- có thể thêm:
  - `src/tests/app-routing.test.tsx`

### Acceptance criteria

- các flow route chính chạy qua được bằng test trong môi trường hiện tại
- không còn phụ thuộc chỉ vào file review để tin route behavior

## Slice FE-07C - Smoke verification cho trips/planner/public/community

### Mục tiêu

Tạo một lớp verify end-to-end mỏng cho các use case có giá trị business cao nhất.

### Việc cần làm

- [x] Chốt approach:
  - phase này dùng test harness hiện có (`Vitest` + route/component integration) cho smoke verification
  - chưa thêm browser e2e tool khi chưa có quyết định rõ về harness và CI/runtime cost
- [x] Cover tối thiểu:
  - login
  - create trip
  - add planner root node
  - mở public trip read-only
  - create community post
- [x] Nếu chưa mở browser e2e trong phase này:
  - ghi rõ deferred reason
  - thay bằng smoke route/integration đủ mạnh

### File dự kiến

- nếu chưa thêm harness mới:
  - `src/tests/*`
- nếu mở harness mới:
  - `e2e/*`
  - `package.json`
  - `README.md`

### Acceptance criteria

- đã có kế hoạch verify end-to-end thực tế, không bỏ trống phần smoke
- quyết định về e2e tool không bị treo mơ hồ

## Slice FE-07D - Responsive pass cho màn hình chính

### Mục tiêu

Giảm rủi ro layout vỡ hoặc navigation khó dùng trên mobile/tablet.

### Focused sub-slice - 2026-04-21

- Scope của lượt này:
  - harden mobile navigation cho `public shell` và `app shell`
  - đảm bảo menu mobile không giữ state mở sai sau khi đổi route
  - hỗ trợ đóng menu bằng phím `Escape` cho keyboard users
  - thêm regression tests cho toggle state trong `SiteHeader` và `AppShell`
- File owner của lượt này:
  - `src/shared/ui/site-header.tsx`
  - `src/features/shell/routes/app-shell.tsx`
  - `src/tests/*`
- Deferred rõ trong lượt này:
  - focus trap đầy đủ cho mobile drawer
  - animation hoặc gesture cho navigation panel
  - redesign layout lớn cho auth/community/trip cards

### Focused sub-slice - 2026-04-21 (auth + detail density)

- Scope của lượt này:
  - giảm cảm giác chật ở `auth shell` trên màn hẹp bằng cách bỏ vertical centering sớm ở mobile
  - siết lại CTA mobile cho `trip detail`, `public trip detail`, `trip form`, và `community create form`
  - giảm rủi ro overflow ở title/detail card bằng `break-words` và image height responsive hơn
  - thêm section semantics cho các khối detail trọng yếu để screen reader dễ theo dõi hơn
- File owner của lượt này:
  - `src/features/auth/**`
  - `src/features/trips/**`
  - `src/features/community/**`
  - `src/tests/*`
- Deferred rõ trong lượt này:
  - viewport-specific screenshot regression
  - focus restoration đầy đủ sau mọi mutation success/error
  - redesign lớn cho information hierarchy ở planner/community feed

### Current pass - 2026-04-21

- Scope của đợt này:
  - compact `app shell` trên mobile để quick links và workspace nav không đè trải nghiệm chính
  - giảm rủi ro overflow ở planner tree và các card detail/public/community trên màn hình hẹp
  - giữ auth/trip/community forms đọc được và thao tác ổn ở mobile trước khi mở phase mới
- Artifact đã có trong source:
  - public/auth/protected shells đã có `skip link` + `main landmark` rõ ràng
  - `app shell` đã có toggle riêng cho workspace nav trên mobile
  - planner tree đã bỏ indent kiểu `margin-left` theo depth và chuyển sang nested border/padding ổn định hơn
  - heading và CTA ở trip/community/public detail + create/edit/list đã được nén lại cho màn hình hẹp
- Deferred rõ trong đợt này:
  - visual regression bằng browser e2e thật
  - audit viewport tự động cho toàn bộ route
  - redesign lớn cho card density hoặc information hierarchy

### Việc cần làm

- [ ] Rà login/register trên mobile
- [ ] Rà app shell với sidebar/nav/quick links trên mobile
- [ ] Rà trip detail + planner tree trên mobile và desktop hẹp
- [ ] Rà public trip detail/planner read-only
- [ ] Rà community feed/detail/create
- [ ] Chốt các fix layout nhỏ nếu phát hiện:
  - overflow
  - CTA khó chạm
  - text quá dài
  - spacing collapse

### File dự kiến

- `src/features/auth/**`
- `src/features/shell/**`
- `src/features/trips/**`
- `src/features/community/**`
- `src/app/styles/**`

### Acceptance criteria

- các màn hình chính dùng được ở mobile/desktop mà không cần workaround rõ ràng

## Slice FE-07E - Accessibility pass

### Mục tiêu

Đưa các flow cốt lõi lên mức an toàn hơn về keyboard, semantics, và feedback.

### Current pass - 2026-04-21

- Scope của đợt này:
  - thêm landmark/skip link cho public, auth, và protected shells
  - siết semantics cho navigation toggle, language toggle, và các vùng menu chính
  - nối field error với input/select/textarea quan trọng qua `aria-invalid` và `aria-describedby`
  - bổ sung focus treatment và `prefers-reduced-motion` baseline ở mức shared styles
- Artifact đã có trong source:
  - nav toggle và language toggle đã phản ánh state tốt hơn cho keyboard/screen reader
  - auth/trip/community forms đã nối error text với field trọng yếu qua `aria-describedby`
  - shared input controls đã tự phản ánh `aria-invalid` khi form báo lỗi
  - verify đã chạy sạch bằng `npm test -- --run`, `pnpm lint`, và `pnpm build`
- Deferred rõ trong đợt này:
  - focus restoration hoàn chỉnh sau mọi redirect hoặc mutation
  - screen-reader content audit cho toàn bộ copy động
  - browser assistive-tech pass ngoài môi trường test hiện có

### Việc cần làm

- [ ] Rà keyboard navigation cho:
  - app shell nav
  - quick links public
  - auth forms
  - trip form
  - planner inline actions
  - community create form
- [~] Rà label/role/name cho CTA chính
- [ ] Rà empty/loading/error states có copy đủ rõ
- [ ] Rà focus state sau redirect hoặc mutation quan trọng
- [ ] Rà motion có cần tôn trọng `prefers-reduced-motion` ở các phần đang dùng animation

### File dự kiến

- `src/shared/ui/**`
- `src/features/auth/**`
- `src/features/trips/**`
- `src/features/community/**`

### Acceptance criteria

- không còn issue accessibility mức cao ở các flow chính
- các action quan trọng đều dùng được bằng keyboard

### Current note

- Planner expand/collapse hiện đã có `aria-expanded` và `aria-controls`.
- `StatusBanner` hiện phân biệt `role="alert"` cho lỗi và `role="status"` cho trạng thái còn lại.

### Current pass - 2026-04-21 (planner keyboard flow)

- Scope của đợt này:
  - tự focus vào field nhập chính khi mở planner inline form cho root/create child/edit
  - trả focus lại nút kích hoạt sau khi cancel hoặc submit thành công ở planner inline actions
  - thêm regression tests cho keyboard flow ở `PlannerWorkspace` và `PlannerNodeRow`
- File owner của lượt này:
  - `src/features/trips/planning/components/**`
  - `src/shared/ui/button.tsx`
  - `src/tests/trip-planner.test.tsx`
- Deferred rõ trong lượt này:
  - focus restoration cho mọi mutation ngoài planner
  - shortcut keyboard nâng cao cho planner như reorder hoặc command palette
  - assistive-tech audit sâu ngoài harness test hiện có

### Current pass - 2026-04-21 (redirect + mutation notices)

- Scope của đợt này:
  - đưa focus vào notice banner khi user quay lại login sau logout/session expiry
  - đưa focus vào success notice sau redirect từ `trip create/edit/delete` và `community create`
  - đưa focus vào submit error banner ở `trip form` và `community post form` để keyboard/screen-reader users nhận feedback sớm hơn
- File owner của lượt này:
  - `src/shared/ui/status-banner.tsx`
  - `src/features/auth/**`
  - `src/features/trips/**`
  - `src/features/community/**`
  - `src/tests/*`
- Deferred rõ trong lượt này:
  - focus restoration cho mọi banner/info state còn lại ở public read-only screens
  - toast system hoặc announcement region riêng cho toàn app
  - audit assistive-tech ngoài môi trường test hiện có

### Current pass - 2026-04-21 (public empty + error states)

- Scope của đợt này:
  - đưa focus vào heading của `EmptyState` khi route public rơi vào `empty`, `not found`, hoặc `load error`
  - áp dụng cho các màn `public trips`, `public trip detail`, `community feed`, và `community post detail`
  - thêm regression tests để khóa keyboard focus ở các public read-only states quan trọng
- File owner của lượt này:
  - `src/shared/ui/empty-state.tsx`
  - `src/features/trips/public/**`
  - `src/features/community/routes/**`
  - `src/tests/*`
- Deferred rõ trong lượt này:
  - focus behavior cho mọi section-level state nằm sâu bên trong route public
  - assistive-tech audit ngoài test harness hiện có
  - live-region riêng cho loading states dài hoặc background refresh

## Slice FE-07F - Docs, verify command, và post-deploy checklist

### Mục tiêu

Biến hardening thành một phần có thể lặp lại, không phụ thuộc trí nhớ.

### Việc cần làm

- [x] Cập nhật README nếu phase này thêm verify command mới
- [ ] Nếu có e2e harness mới, document rõ command chạy local/CI
- [x] Ghi checklist verify sau deploy cho:
  - login
  - mở `/community`
  - mở `/trips`
  - mở public trip detail
  - logout
- [ ] Chốt cách báo cáo kết quả hardening trong final handoff

### File dự kiến

- `README.md`
- `documents/09_frontend-production-deploy-runbook.md`
- có thể thêm note vào:
  - `documents/01_frontend-phase-checklist.md`

### Acceptance criteria

- người khác vào repo vẫn biết cách verify phase hardening mà không cần hỏi lại

## Suggested execution order

1. FE-07A: auth/public navigation regression
2. FE-07B: route-level integration
3. FE-07D: responsive pass
4. FE-07E: accessibility pass
5. FE-07C: smoke e2e hoặc deferred decision
6. FE-07F: docs + post-deploy checklist

## Ưu tiên nên làm ngay

Nếu chỉ làm đúng một slice tiếp theo, nên làm:

- `FE-07A - Auth và public/protected navigation regression`

Lý do:

- bám trực tiếp bug vừa xảy ra
- chi phí nhỏ
- giá trị chống regression cao nhất
- không đòi quyết định thêm tool mới
