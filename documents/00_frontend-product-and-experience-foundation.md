# Frontend Product And Experience Foundation

## Trạng thái

- Date: `2026-04-22`
- Status: `Active planning baseline`
- Scope: chốt nền sản phẩm và trải nghiệm cho lần rebuild frontend sau khi presentation layer cũ được thay bằng homepage baseline mới.

## Thực trạng repo hiện tại

- `frontend/` vẫn giữ `React + Vite + TypeScript`, toolchain, test baseline, i18n, auth/session modules, shared API client, và một số API modules cho `auth`, `trips`, `community`.
- Runtime UI hiện đã có baseline có chủ đích: `src/main.tsx` bootstrap app thật với homepage scrapbook ở `/`, trong khi các surface còn lại vẫn đang được dựng dần theo kiến trúc mới.
- Vì vậy, bộ doc này là source of truth cho giai đoạn hiện tại; không thể tiếp tục dùng các mô tả cũ kiểu "app đã có full route và full shell" nhưng cũng không được mô tả source như thể nó vẫn chỉ là placeholder.

## Những gì phải chốt ngay ở foundation

### 1. Chỉ `journal` là surface freeform

- Trang nhật ký là nơi người dùng được kéo thả tự do ảnh, sticker, tape, note, caption, map callout.
- Các surface còn lại như `Trang chủ`, `Cộng đồng`, `Lập kế hoạch`, `Cá nhân`, auth, trip list, trip form vẫn dùng layout cố định và responsive.
- Điều này giúp giữ brand scrapbook xuyên suốt nhưng không đẩy toàn bộ website vào một mô hình editor quá nặng.

### 2. Planner và journal phải tách thành hai workspace riêng

- Không nên nhồi cả planning lẫn storytelling vào cùng một màn `trip detail`.
- Route nền nên chuyển sang:
  - `/app/trips/:tripId/planner`
  - `/app/trips/:tripId/journal`
- Route cũ `/app/trips/:tripId` nên giữ như một `compatibility redirect` về `planner` để giảm gãy link và giảm rủi ro khi cutover.

### 3. Journal dùng mô hình `scene` có tọa độ tuyệt đối trong không gian trang chuẩn

- Không lưu vị trí object theo pixel của viewport hiện tại.
- Mỗi trang journal cần có `pageWidth`, `pageHeight`, và các object nằm trong một hệ tọa độ chuẩn của trang.
- Mỗi object tối thiểu cần:
  - `id`
  - `type`
  - `x`
  - `y`
  - `width`
  - `height`
  - `rotation`
  - `zIndex`
  - `locked`
  - payload theo loại object như `assetId`, `text`, `style`, `stickerKey`
- FE sẽ scale scene này theo container size để hiển thị trên desktop và mobile.

### 4. Phải tách `scene renderer` khỏi `editor controls`

- Cùng một dữ liệu journal phải render được ở hai mode:
  - `read-only viewer` cho public/private preview
  - `editor mode` cho owner chỉnh sửa
- Renderer chịu trách nhiệm vẽ scene.
- Editor chỉ thêm selection, drag, resize, rotate, layer reorder, toolbar, inspector, autosave state.
- Tách lớp này sớm sẽ giảm việc viết lại khi cần public read-only hoặc share view.

### 5. Mobile không được reflow scrapbook thành layout khác

- Journal page nên giữ tỷ lệ trang cố định và scale xuống, không tự "xếp lại" object.
- Trên mobile, editor cần ưu tiên:
  - zoom/pan
  - bottom sheet cho inspector
  - layer list gọn
- Fixed-layout pages vẫn phải responsive bình thường theo flow của web.

### 6. Brand mới là `Digital Scrapbook`, nhưng readability vẫn ưu tiên số một

- Từ khóa thị giác: giấy thủ công, polaroid, tape, sticker, nét viết tay, ghi chú cạnh ảnh, bản đồ có callout, hơi lệch và hơi chồng lớp.
- Không biến toàn bộ site thành collage lộn xộn.
- Nội dung dài, form, bảng thông tin, list, feed vẫn cần hierarchy rõ, khoảng trắng đủ, và độ đọc cao.

### 7. Giữ nền kỹ thuật hiện có, không đổi platform chỉ vì UI

- Giữ `SPA`, `React`, `Vite`, auth/session pipeline, shared API client, và deploy flow hiện tại.
- Không đổi endpoint chỉ vì đổi visual.
- Không đổi toàn bộ storage platform chỉ vì journal page có schema linh hoạt.

## Phân loại surface sản phẩm

| Nhóm | Route mục tiêu | Kiểu layout | Ghi chú |
| --- | --- | --- | --- |
| Public | `/` | fixed-layout | landing theo brand scrapbook nhưng cấu trúc ổn định |
| Public | `/community` | fixed-layout | feed/list/detail dùng card/editorial layout |
| Public | `/trips/:tripId/journal` | scrapbook read-only | xem nhật ký đã publish |
| Auth | `/auth/login`, `/auth/register` | fixed-layout | giàu brand nhưng không freeform |
| Protected | `/app` | fixed-layout | dashboard hoặc overview |
| Protected | `/app/trips` | fixed-layout | danh sách chuyến đi |
| Protected | `/app/trips/new` | fixed-layout | form tạo chuyến đi |
| Protected | `/app/trips/:tripId/planner` | fixed-layout/structured | lập kế hoạch và dữ liệu có cấu trúc |
| Protected | `/app/trips/:tripId/journal` | freeform scrapbook | editor tọa độ tự do |
| Protected | `/app/profile` | fixed-layout | hồ sơ cá nhân |
| Compatibility | `/app/trips/:tripId` | redirect | tạm thời đưa về planner |

## Các nguyên tắc nền cho implementation

### 1. Fixed-layout pages và scrapbook editor là hai loại UI khác nhau

- Fixed pages dùng React DOM, semantic HTML, responsive layout truyền thống.
- Scrapbook editor dùng scene model riêng, không ép các page khác chạy cùng engine.
- Brand tokens phải dùng chung, nhưng engine render không cần dùng chung.

### 2. Server state, editor state, và UI state phải tách ranh giới

- Server state: query/mutation cho auth, trips, posts, journal persistence.
- Editor state cục bộ: selection, drag state, hovered object, clipboard, undo/redo, draft dirty state.
- UI state thông thường: dialog, sheet, filter, toast.
- Không dùng một store toàn cục duy nhất cho mọi thứ.

### 3. Journal phải có object model đủ giàu nhưng vẫn kiểm soát được

- Object types giai đoạn đầu nên giới hạn ở:
  - `photo`
  - `sticker`
  - `tape`
  - `text`
  - `shape`
  - `map-pin` hoặc `callout`
- Chưa mở ngay `group`, `path drawing`, `rich text block`, `realtime multi-user`.
- Càng giới hạn sớm, editor càng dễ hoàn thiện end-to-end.

### 4. Scene data phải versioned từ đầu

- Mỗi page cần có `sceneVersion` hoặc `schemaVersion`.
- Điều này giúp sau này thêm object type hoặc đổi style payload mà không phá layout cũ.

### 5. Accessibility vẫn là bắt buộc

- Fixed pages phải dùng semantic markup và keyboard support đầy đủ.
- Với journal editor, không thể đạt semantic level như DOM content thường, nhưng vẫn phải có:
  - focus flow rõ cho toolbar, layer list, inspector
  - keyboard shortcuts hợp lý
  - text alternatives cho ảnh/sticker quan trọng khi render read-only

## Phạm vi chưa chốt hoặc chưa làm

- Chưa chuyển sang SSR hay `Next.js`.
- Chưa làm PWA/offline-first.
- Chưa làm realtime collaboration.
- Chưa làm AI-assisted layout hoặc AI planner.
- Chưa làm export PDF/image ở phase đầu của scrapbook editor.
- Chưa làm comment/reaction phức tạp trong editor.

## Khuyến nghị lưu trữ ở cấp nền tảng

- Giữ `PostgreSQL` làm database chính cho toàn sản phẩm.
- Với journal page, dùng mô hình lai:
  - dữ liệu quan hệ vẫn ở bảng chuẩn như `users`, `trips`, `assets`, `posts`
  - scene tự do của page được lưu dưới dạng `JSONB` có version
  - revision/history có thể lưu ở bảng riêng
- Chưa nên chuyển hẳn sang `MongoDB` ở giai đoạn này vì:
  - phần lớn domain hiện tại vẫn là dữ liệu quan hệ
  - backend đang bám `Prisma + PostgreSQL` khá sâu
  - chỉ journal page mới thực sự cần schema linh hoạt
- Chỉ cân nhắc lại Mongo khi sản phẩm chuyển mạnh sang document editor, realtime collaboration, patch nested object với tần suất rất cao, và nhiều feature khác cũng cùng cần schema-free persistence.

## Kết quả mong đợi sau khi áp foundation này

- Docs không còn mô tả sai trạng thái source.
- Team có ranh giới rõ giữa `fixed pages` và `journal editor`.
- Route map phản ánh đúng sản phẩm mới.
- Quyết định storage được chốt theo hướng thực dụng: `PostgreSQL + JSONB`, chưa đổi nền tảng vội.
