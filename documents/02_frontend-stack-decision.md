# Frontend Stack Decision

## Trạng thái

- Date: `2026-04-14`
- Status: `Implemented as scaffold baseline`
- Scope: stack và toolchain cho app frontend đầu tiên trong `frontend/`

## Mục tiêu của quyết định này

- Giảm số lượng lựa chọn mở khi bắt đầu scaffold.
- Chọn stack đủ hiện đại cho SPA production nhưng không quá nặng cho phase đầu.
- Giữ frontend bám sát tốc độ phát triển backend hiện tại.

## Đề xuất chốt cho phase scaffold đầu tiên

| Hạng mục | Lựa chọn đề xuất | Lý do |
| --- | --- | --- |
| Ngôn ngữ | `TypeScript` | đồng bộ với backend và giảm lỗi contract |
| Runtime | `Node.js LTS` | đồng bộ với workspace |
| Package manager | `pnpm` | đồng bộ repo và lockfile strategy |
| App framework | `React` | phù hợp SPA feature-driven |
| Build tool | `Vite` | scaffold nhanh, DX tốt, phù hợp SPA |
| Routing | `React Router` | route grouping rõ cho public/protected/app |
| Server state | `TanStack Query` | phù hợp dữ liệu API, cache, retry, invalidation |
| Form handling | `React Hook Form` | form auth và trip form gọn, dễ validate |
| Schema validation | `Zod` | typing tốt cho client-side form/data validation |
| Styling | `Tailwind CSS` + CSS variables | phù hợp reference UI và dễ token hóa |
| Icon strategy | `lucide-react` hoặc bộ icon tương đương | hợp với hướng UI hiện tại |
| Component test | `Vitest` + `Testing Library` | nhanh và hợp Vite |
| E2E smoke test | `Playwright` | đủ tốt cho login/session smoke |

## Điều không chốt ở giai đoạn này

- Chưa chốt SSR framework như `Next.js`.
- Chưa chốt animation library lớn.
- Chưa chốt headless component library ngoài.
- Chưa chốt analytics SDK.
- Chưa chốt domain production cuối cùng, nhưng đã chốt luồng preview deploy thủ công qua GitHub Actions.

## Lý do chưa chọn SSR ở phase đầu

- Backend hiện đi theo REST API tách riêng, auth cũng đã sẵn cho SPA.
- Giai đoạn gần nhất cần ưu tiên app shell, auth, dashboard, và tốc độ dựng UI.
- Chưa có yêu cầu SEO hoặc public content complexity đủ mạnh để bắt buộc SSR.
- Có thể chuyển sang SSR sau nếu product scope thay đổi, nhưng phase đầu nên giảm biến số.

## Hệ quả kiến trúc từ stack này

- App được xem là `SPA` với route public và protected.
- Tầng fetch/API client cần chuẩn hóa từ đầu.
- Server state đi qua query/mutation hooks thay vì tự quản lý thủ công bằng `useEffect` rải rác.
- Design token và utility classes cần được chuẩn hóa ngay từ app foundation.

## Ghi chú quan trọng về auth

- Backend hiện trả `accessToken` và `refreshToken` trong response body.
- Phase đầu của frontend cần chấp nhận điều này để đi nhanh.
- Về hardening lâu dài, nên cân nhắc chuyển `refreshToken` sang `httpOnly cookie` khi backend hỗ trợ.
