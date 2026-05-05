# Frontend App Architecture

## Mục tiêu

- Dựng lại frontend theo kiến trúc phù hợp với hai loại UI khác nhau:
  - fixed-layout pages
  - scrapbook journal editor
- Giữ shared foundation gọn, không biến `shared/` thành kho đồ linh tinh.

## Thực trạng source hiện tại

- `src/main.tsx` đã bootstrap app thật với `AppProviders + router`.
- `app/providers`, `shared/api`, `auth/session`, `trips` API, `community` API, và i18n baseline vẫn còn.
- Route `/`, `/community`, `/auth/login`, `/auth/register`, `/app/planner`, `/app/profile`, `/app/trips/:tripId/planner`, `/app/trips/:tripId/journal`, `/public/trips/:tripId`, và `/public/trips/:tripId/journal` đã có screen thật.
- Route target `/app/trips/:tripId/planner` và `/app/trips/:tripId/journal` hiện là route chính thật; `/app/trips/:tripId`, `/app/planner?tripId=...`, và `/app/journal?tripId=...` là compatibility redirects.
- Journal feature hiện có API client, query key, type model, owner journal listing for profile, scene renderer, public read-only journal route, drag object, selected-object controls, manual save dirty state, và editor controls tối giản trên route journal. Editor shell tách riêng, resize handles, asset upload, và autosave vẫn deferred.

## Kiến trúc mục tiêu

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
      home/
      community/
      journal/
        api/
        routes/
        scene/
          renderer/
          editor/
          objects/
          transforms/
          history/
        components/
        hooks/
        lib/
        types/
      trips/
        planning/
          api/
          components/
          lib/
          types/
      profile/
      shell/
    shared/
      api/
      assets/
      hooks/
      i18n/
      lib/
      ui/
      types/
    tests/
```

## Boundary chính giữa các tầng

### `app/`

- bootstrap app
- app providers
- route tree
- env binding
- global styles và token registration

### `features/`

- code theo domain hoặc screen group
- mỗi feature tự giữ API hooks, routes, components, types riêng
- `journal` là feature riêng, không nên rải object model của nó vào khắp repo

### `shared/`

- HTTP client
- utility chung
- i18n
- generic hooks
- accessible primitives thực sự dùng chung

## Tách hai loại UI ngay trong architecture

### Fixed-layout surfaces

- dùng `React DOM`
- semantic HTML
- responsive bằng flow layout thông thường
- phù hợp cho:
  - home
  - auth
  - community
  - planner shell
  - trips list/form
  - profile

### Journal surfaces

- dùng `scene renderer`
- hiển thị object theo tọa độ
- có mode:
  - `viewer`
  - `editor`
- không ép các feature khác dùng cùng runtime

## Journal architecture đề xuất

### 1. `scene/renderer`

- nhận scene đã chuẩn hóa
- render các object theo `x/y/width/height/rotation/zIndex`
- không biết về autosave hoặc selection

### 2. `scene/editor`

- bọc renderer
- thêm:
  - selection box
  - drag/resize/rotate handles
  - layer reorder
  - snap guides nếu có
  - keyboard shortcuts

### 3. `objects/`

- mỗi object type có renderer riêng:
  - photo
  - sticker
  - tape
  - text
  - callout/map-pin

### 4. `transforms/`

- helper để:
  - scale scene theo viewport
  - clamp object trong trang
  - convert pointer position thành page-space

### 5. `history/`

- undo/redo hoặc revision helpers
- để riêng khỏi server state

## State boundaries

### Server state

- auth session
- trips data
- posts data
- journal page data đã persist

### Editor local state

- selected object ids
- hovered object
- drag in-progress
- current tool
- clipboard
- dirty state
- undo/redo stack

### UI chrome state

- dialog open/close
- asset tray open
- bottom sheet/tab state
- toast/banner state

## Route architecture đề xuất

- `/`
- `/community`
- `/auth/login`
- `/auth/register`
- `/app`
- `/app/trips`
- `/app/trips/new`
- `/app/trips/:tripId/planner`
- `/app/trips/:tripId/journal`
- `/app/profile`

Compatibility:

- `/app/trips/:tripId` là compatibility alias về planner.
- `/app/planner?tripId=...` redirect về `/app/trips/:tripId/planner`.
- `/app/journal?tripId=...` redirect về `/app/trips/:tripId/journal`.
- `/app/planner` không có `tripId` vẫn là entry tạo trip/planner mới; `/app/journal` không có `tripId` redirect về profile.

## Reuse chiến lược giữa viewer và editor

- `JournalSceneRenderer` phải là module dùng lại được ở:
  - editor page
  - public journal page đã có route `/public/trips/:tripId/journal`; còn thiếu discovery/publish workflow riêng
  - preview card/thumbnails
- `JournalEditorShell` mới là thứ mang toolbar, inspector, save status.

## Provider strategy

`AppProviders` hiện có thể tiếp tục là nơi giữ:

- `QueryClientProvider`
- `AuthProvider`
- `LanguageProvider`

Khi dựng lại app, chỉ nên thêm provider mới nếu thật sự là app-wide concern.

Không nên:

- nhét editor store thành app-wide provider vô điều kiện
- đẩy journal-specific concern vào root nếu chỉ một feature dùng

## Cấu trúc file nên tránh

- `shared/ui/` chứa quá nhiều component scrapbook-specific
- `trips/` và `journal/` import chéo presentation của nhau
- `main.tsx` phình to vì chứa route/layout/component wiring trực tiếp
- toàn bộ editor logic dồn trong một file page duy nhất

## Testing architecture đề xuất

### Unit/integration

- render object đúng style/layout
- transform helpers đúng
- save state transitions đúng

### Route/smoke

- app boot
- auth entry
- planner route load
- journal route load
- journal save/publish flow khi backend sẵn

## Kết luận

- Architecture mới phải coi `journal` là một feature engine riêng, không phải chỉ là một page nhiều CSS tuyệt đối.
- Phần còn lại của site vẫn nên giữ mô hình web app có cấu trúc để dễ bảo trì và dễ mở rộng.
