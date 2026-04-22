# Frontend Stack Decision

## Trạng thái

- Date: `2026-04-22`
- Status: `Re-evaluated for Phase 08 reset`
- Scope: chốt stack cho frontend mới với một editor scrapbook riêng cho journal nhưng không làm nặng toàn bộ website.

## Kết luận ngắn

- Giữ nền `React + Vite + TypeScript`.
- Giữ `TanStack Query`, `React Hook Form`, `Zod`.
- Giữ `Tailwind CSS + CSS variables`, nhưng dùng thêm authored CSS/token layer thay vì biến Tailwind thành toàn bộ design system.
- Chỉ journal editor mới cần editor runtime chuyên biệt.
- Chưa đổi sang `Next.js`, chưa đổi sang `MongoDB`.

## Giữ nguyên những gì

| Hạng mục | Quyết định | Lý do |
| --- | --- | --- |
| Ngôn ngữ | `TypeScript` | dữ liệu scene nhiều field, cần typing rõ |
| Runtime | `Node.js LTS` | đồng bộ workspace |
| Package manager | `pnpm` | đúng quy ước repo |
| App framework | `React` | phù hợp cho fixed-layout pages và editor composition |
| Build tool | `Vite` | nhanh, đơn giản, hợp với reset phase |
| Routing | `React Router` | đủ tốt cho public/protected/app routes |
| Server state | `TanStack Query` | phù hợp auth/trips/posts/journal persistence |
| Forms | `React Hook Form` | hợp cho auth/trip forms |
| Validation | `Zod` | rõ schema ở client |

## Điều cần đổi trong cách dùng stack

### 1. Styling không còn là "Tailwind là đủ"

- Giữ `Tailwind CSS` để xử lý utility layout nhanh.
- Nhưng brand scrapbook cần thêm:
  - CSS variables làm token
  - authored component styles cho paper texture, tape, stacked cards, handwriting accent
  - animation layer có chủ đích
- Không nên build toàn bộ giao diện mới bằng các class utility dài và khó đọc.

### 2. Không dùng generic component kit làm visual backbone

- UI mới có cá tính rất riêng, nên không nên phụ thuộc vào một bộ component generic theo kiểu dashboard SaaS.
- Có thể dùng headless/accessibility primitives chọn lọc khi cần, nhưng visual system phải là của Journey.

### 3. Editor state phải có ranh giới riêng

- Query cache không phù hợp để giữ selection, drag state, undo stack, hovered target, z-order draft.
- Editor cần một local state layer riêng, scoped cho feature `journal`.

## Công cụ nên thêm cho journal editor

| Hạng mục | Đề xuất | Trạng thái | Vì sao |
| --- | --- | --- | --- |
| Scene renderer/editor | `react-konva` hoặc engine canvas React-first tương đương | Khuyến nghị | hợp với free positioning, rotation, transform handles, z-index |
| Editor local state | `zustand` hoặc store nhẹ tương đương | Khuyến nghị | giữ editor state cục bộ, không làm nặng global app state |
| Immutable scene updates | `immer` hoặc helper thuần tương đương | Tùy chọn | dễ cập nhật object tree/revision |
| E2E browser tests | `Playwright` | Deferred tới khi editor baseline ổn | phù hợp để test drag/save/publish thật |

## Công cụ không nên dùng sai mục đích

### `dnd-kit`

- Hợp nếu sau này asset tray hoặc sortable layer list phức tạp.
- Không nên lấy làm engine chính cho scrapbook scene nếu scene đã có runtime riêng.

### Generic whiteboard/editor framework

- Chỉ cân nhắc nếu product chuyển hẳn thành document editor đa năng.
- Với scope hiện tại, dễ quá nặng và quá nhiều abstraction thừa.

## Khuyến nghị cụ thể cho journal editor

### Mô hình render

- Fixed-layout pages: dùng `React DOM`.
- Journal editor: dùng engine scene riêng.
- Journal public read-only: reuse chính renderer của journal editor nhưng tắt controls.

### Mô hình lưu vị trí

- Lưu object theo hệ tọa độ trang chuẩn.
- Không lưu theo pixel viewport.
- Scale scene ở runtime.

## Database/storage decision từ góc nhìn frontend

| Phương án | Khuyến nghị | Nhận xét |
| --- | --- | --- |
| `PostgreSQL + JSONB` | `Recommend now` | giữ domain relation mạnh, thêm được scene linh hoạt |
| `MongoDB` | `Not recommended now` | đổi platform lớn hơn nhu cầu hiện tại |

### Vì sao chưa nên đổi sang Mongo

- Backend hiện đã bám `Prisma + PostgreSQL` khá sâu.
- Chỉ journal page mới thật sự cần schema linh hoạt.
- Trips, users, posts, permissions, revisions, assets vẫn là dữ liệu quan hệ rõ ràng.
- `JSONB` là đủ tốt cho scene payload giai đoạn này.

### Khi nào mới nên mở lại câu hỏi Mongo

- editor trở thành domain trung tâm của toàn sản phẩm
- cần realtime collaboration nhiều người
- cần patch nested object cực thường xuyên ở quy mô lớn
- nhiều feature ngoài journal cũng chuyển sang document-shaped data

## Điều chưa chốt ở phase này

- Có cần thêm thư viện crop/asset editing ở client hay không
- Có cần undo/redo qua command stack phức tạp ngay phase đầu hay chỉ revision snapshot
- Có cần mobile editing full-feature từ phase 1 hay chỉ baseline usable

## Tóm tắt quyết định

- Giữ stack SPA hiện tại.
- Thêm engine editor chuyên biệt chỉ cho `journal`.
- Giữ database chính là `PostgreSQL`.
- Đầu tư vào scene model và token system thay vì đổi platform quá sớm.
