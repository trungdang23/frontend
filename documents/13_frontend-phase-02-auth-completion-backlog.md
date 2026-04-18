# Frontend Phase 02 Auth Completion Backlog

## Mục tiêu

Đóng nốt Phase 02 của frontend để auth lifecycle hoàn chỉnh:

- login
- register
- me
- refresh
- logout
- expired-session handling

## Trạng thái

- Status: `Completed`
- Completed at: `2026-04-18`

## Trạng thái hiện tại

Đã có:

- login page
- register page
- auth provider
- session boot từ `localStorage`
- `GET /auth/me`
- refresh on `401`
- protected shell

Đã hoàn tất:

- logout flow gọi `POST /auth/logout`
- full expired-session behavior được chuẩn hóa
- route-level verify cho lifecycle đầy đủ

## Scope chi tiết

## Slice FE-02A - Auth API alignment

### Việc cần làm

- [x] Thêm `logout()` vào `features/auth/api/auth-api.ts`
- [x] Request body:
  - `refreshToken`
- [x] Bám response envelope của backend

### File dự kiến

- `src/features/auth/api/auth-api.ts`

## Slice FE-02B - Auth context logout flow

### Việc cần làm

- [x] Cập nhật `AuthProvider.logout`
- [x] Lấy `refreshToken` từ session hiện tại
- [x] Gọi `POST /auth/logout`
- [x] Dù request fail, vẫn clear local session để không khóa user ở client
- [x] Tách rõ 2 nhánh notice:
  - logout thành công
  - logout cục bộ sau khi request fail

### File dự kiến

- `src/features/auth/session/auth-context.tsx`
- `src/features/auth/session/session-types.ts`

## Slice FE-02C - Auth UI entrypoints

### Việc cần làm

- [x] Kiểm tra app shell đã có logout action rõ ràng chưa
- [x] Nếu chưa có, thêm logout CTA ở shell/profile area
- [x] Đảm bảo logout redirect về `login`
- [x] Auth notice hiện đúng sau logout

### File dự kiến

- `src/features/shell/routes/app-shell.tsx`
- hoặc component logout action liên quan

## Slice FE-02D - Expired session handling

### Việc cần làm

- [x] Chuẩn hóa unauthorized notice key
- [x] Chỉ refresh đúng 1 lần cho mỗi request chain
- [x] Sau refresh fail:
  - clear session
  - redirect về `login`
  - show notice session expired
- [x] Tránh loop unauthorized khi đang ở route protected

### File dự kiến

- `src/shared/api/http-client.ts`
- `src/features/auth/session/auth-context.tsx`
- `src/features/auth/routes/protected-route.tsx`

## Slice FE-02E - Route-level verify

### Scenarios cần verify

- [x] guest vào protected route bị redirect về login
- [x] login thành công vào `/app`
- [x] reload app khi có session hợp lệ
- [x] access token hết hạn nhưng refresh thành công
- [x] refresh fail thì logout về guest state
- [x] logout chủ động từ UI

### Test level

- [x] component/integration test cho auth provider
- [x] route-level integration test cho redirect behavior
- [x] smoke test tối thiểu cho lifecycle auth

## Slice FE-02F - Error copy và notice consistency

### Việc cần làm

- [x] Rà lại notice keys trong i18n
- [x] Tách rõ message cho:
  - login fail
  - register fail
  - session expired
  - session restore fail
  - logout success
  - logout fallback success
- [x] Không để message kỹ thuật lộ trực tiếp ra UI

### File dự kiến

- `src/shared/i18n/locales/vi.json`
- `src/shared/i18n/locales/en.json`
- `src/features/auth/lib/localize-auth-error.ts`

## Acceptance criteria

- Logout UI gọi backend logout endpoint
- Sau logout, session local bị clear
- User bị đưa về guest/login state đúng
- Khi access token hết hạn:
  - app thử refresh đúng 1 lần
  - nếu refresh fail thì logout sạch
- Auth notice nhất quán và không lặp vô hạn

## Implementation order đề xuất

1. Thêm auth API `logout`
2. Cập nhật `AuthProvider.logout`
3. Nối logout action ở shell nếu còn thiếu
4. Chuẩn hóa expired session handling
5. Thêm tests
6. Tick lại `Phase 02` checklist

## Rủi ro cần tránh

- Không phụ thuộc vào logout API thành công mới clear local session
- Không bắn nhiều request refresh song song không cần thiết
- Không để redirect loop giữa protected route và auth boot state
- Không để message logout/session expired chồng nhau

## Definition of done cho backlog này

- logout flow chạy end-to-end từ UI
- expired-session behavior ổn định
- auth lifecycle có route-level verify
- checklist Phase 02 của frontend đã được đóng sau khi verify xong
