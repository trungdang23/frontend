# Frontend Foundation

## Mục tiêu

- Xây dựng frontend cho `journey` theo hướng dễ mở rộng, dễ bảo trì, và có thể phát triển từng phase mà không phá vỡ cấu trúc tổng.
- Chốt nền kỹ thuật để có thể thay toàn bộ UI mà không phải đập lại routing, session flow, API wiring, và deploy.
- Tách rõ phần public experience, auth experience, và application workspace để scale dần khi `trips`, `budgets`, và `community` được mở rộng.
- Giữ contract với backend ổn định trong lúc visual system và screen composition được thay mới hoàn toàn.

## Phạm vi giai đoạn đầu

- Chưa tối ưu cho SEO nâng cao hay SSR.
- Chưa làm PWA hay offline-first.
- Chưa làm analytics, A/B testing, hoặc personalization.
- Tập trung dựng app SPA với các nhóm tính năng theo thứ tự:
  - landing và public marketing surface
  - auth flow thật với backend
  - protected app shell
  - dashboard và profile mức nền
  - trips, planner, public trip sharing, community theo tiến độ backend

## Snapshot sản phẩm hiện tại

### Product priority

- planner là trung tâm
- social là lớp hỗ trợ
- MVP không làm:
  - upload media thật
  - AI planner
  - realtime collaboration
  - follow/reaction/notification phức tạp

### Target route map

- Public:
  - `/`
  - `/auth/login`
  - `/auth/register`
  - `/community`
- Protected:
  - `/app`
  - `/app/trips`
  - `/app/trips/new`
  - `/app/trips/:tripId`
  - `/app/trips/:tripId/edit`

### Target workspace behavior

- `/app/trips/:tripId` là planning workspace chính
- planner target là `PlanNode` tree
- inline editing là primary mode
- loading dùng skeleton
- error dùng toast/banner + retry

### Contract freeze trong đợt redesign hiện tại

- giữ nguyên auth/session pipeline
- giữ nguyên route semantics ở mức sản phẩm
- giữ nguyên endpoint contracts hiện tại cho auth, trips, planner, public trips, và posts
- chỉ thay lớp thể hiện và design system, không đổi endpoint chỉ vì lý do thị giác

## Nguyên tắc nền cho frontend

### 1. Tách cấu trúc theo route và feature

- Không nhồi toàn bộ UI vào một `App.tsx` lớn.
- Mỗi route lớn cần có feature boundary riêng.
- Shared UI primitives và shared utilities phải tách khỏi feature code.

### 2. Server state và UI state tách riêng

- Dữ liệu từ API được quản lý riêng khỏi state hiển thị cục bộ của component.
- Không dùng một store duy nhất cho mọi loại state.
- Token/session, filters, modal state, và form state phải có ranh giới rõ.

### 3. UI trước hết phải rõ ràng rồi mới đẹp

- Mỗi màn hình cần có primary action rõ ràng.
- Loading, error, empty state phải được thiết kế ngay từ đầu.
- Form auth và form tạo chuyến đi phải ưu tiên clarity hơn animation.

### 4. Responsive là baseline, không phải phase sau

- Thiết kế và implementation phải nghĩ theo mobile-first.
- Desktop chỉ là mở rộng từ mobile, không phải bản khác hẳn.
- Các route trọng yếu phải dùng tốt trên màn nhỏ trước khi polish desktop.

### 5. Accessibility là một phần của definition of done

- Keyboard navigation, focus visible, semantic markup, và contrast phải được coi là yêu cầu mặc định.
- Không dùng color-only để truyền tải trạng thái.
- Dialog, dropdown, toast, tabs phải có hành vi truy cập rõ ràng.

### 6. Design token là nguồn sự thật của visual system

- Màu, spacing, typography, radius, shadow, và motion phải đi qua token hoặc CSS variable.
- Không để UI trôi dần thành nhiều style one-off.
- Khi cần biến thể component, ưu tiên mở rộng từ primitive có sẵn.

### 7. Không làm giả production flow khi đã có contract backend thật

- Auth phải bám đúng contract backend đang chạy thật.
- Không giữ demo flow login giả sau khi đã có API thật.
- Các tính năng chưa có API thật phải được đánh dấu là blocked hoặc dùng placeholder có chủ đích.

## Bản đồ tính năng mức cao

- Public:
  - landing
  - auth
  - community teaser hoặc read-only sections
- Protected:
  - dashboard
  - profile
  - trips workspace
  - planner workspace
- Cross-cutting:
  - app shell
  - auth session
  - notifications/toasts
  - form validation
  - API client

## Cấu trúc thư mục đề xuất

```text
frontend/
  src/
    app/
      config/
      providers/
      router/
      styles/
    features/
      auth/
      landing/
      dashboard/
      profile/
      trips/
      budgets/
      community/
      shell/
    shared/
      api/
      lib/
      hooks/
      ui/
      types/
      assets/
    tests/
  documents/
```

## Ghi chú

- Tài liệu này là baseline lâu dài cho frontend, không gắn với một visual direction cụ thể.
- Bộ docs active nên chỉ giữ các tài liệu nền như foundation, checklist, stack, API integration, app architecture, definition of done, risk, deploy runbook, và redesign backlog hiện hành.
