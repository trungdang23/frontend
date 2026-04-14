# Frontend App Architecture

## Mục tiêu

- Có kiến trúc đủ rõ để scaffold một lần cho đúng.
- Giữ ranh giới giữa app boot, feature code, và shared code.
- Tránh việc mọi thứ trôi dần về một thư mục `components/` hoặc `pages/` quá rộng.

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
        api/
        components/
        hooks/
        routes/
        types/
      landing/
      dashboard/
      profile/
      trips/
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
```

## Vai trò từng tầng

### `app/`

- bootstrap application
- route tree
- provider composition
- env/config binding
- global styles và tokens

### `features/`

- code theo nghiệp vụ hoặc theo route lớn
- chứa component, hook, query, mutation, feature-level types
- không import chéo lộn xộn giữa các feature

### `shared/`

- primitive UI
- API base client
- utility functions
- generic hooks
- shared types và assets

## Boundary giữa các loại state

### Server state

- đi qua query/mutation hooks
- không tự fetch thủ công bằng `useEffect` cho mọi màn

### Session state

- một auth/session module riêng
- chịu trách nhiệm hydrate, refresh, logout

### UI state cục bộ

- modal open
- dropdown
- tab
- filter panel
- draft form tạm

## Auth architecture đề xuất

- `AuthProvider` hoặc session provider ở cấp `app/providers`
- `ProtectedRoute` cho `/app/*`
- `GuestRoute` cho `/auth/*` nếu đã đăng nhập
- `sessionStorage/localStorage adapter` tách khỏi UI component

## API layer đề xuất

- `shared/api/http-client.ts`
- `shared/api/api-error.ts`
- `features/auth/api/*.ts`
- sau này thêm:
  - `features/trips/api/*.ts`
  - `features/community/api/*.ts`

## Shared UI primitives cần có sớm

- button
- input
- password field
- card
- dialog
- toast
- empty state
- page section
- navbar
- protected shell layout

## Naming convention đề xuất

- file: `kebab-case`
- component: `PascalCase`
- hooks: `useSomething`
- query keys: group theo feature như `['auth', 'me']`

## Env conventions đề xuất

- `VITE_API_BASE_URL`
- `VITE_APP_ENV`

## Điều cần tránh

- `shared/` trở thành chỗ chứa mọi thứ không biết để đâu
- một feature import trực tiếp internal component của feature khác
- token/session logic nằm rải rác trong nhiều component
- form submit tự viết validate lặp lại thay vì đi qua schema/form layer
