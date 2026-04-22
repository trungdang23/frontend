# Frontend Rebuild Digital Scrapbook Backlog

## Trạng thái

- Date: `2026-04-22`
- Status: `Active rebuild baseline`
- Owner area:
  - `frontend/documents`
  - `frontend/src`
- File này thay cho backlog `full-ui-redesign` cũ vì hướng mới không còn là redesign chung chung; nó đã được chốt rõ thành `Digital Scrapbook + fixed-layout supporting pages`.

## Mục tiêu rebuild

Rebuild frontend Journey quanh hai lớp trải nghiệm khác nhau nhưng cùng một brand:

- `fixed-layout surfaces` cho hầu hết website
- `freeform scrapbook journal editor` cho riêng khu nhật ký

Giai đoạn rebuild này tập trung vào:

- làm rõ route map mới
- chốt visual system mới
- định nghĩa engine cho journal editor
- giữ lại foundation backend/auth/deploy đang còn giá trị
- tránh việc cả team tiếp tục suy nghĩ theo UI dashboard cũ

Giai đoạn rebuild này chưa xử lý:

- đổi backend contract chỉ vì visual
- realtime collaboration
- AI-assisted layout
- export PDF/image production-ready
- thay database platform chỉ vì journal có object linh hoạt

## Quyết định chiến lược đã chốt

### 1. Chỉ journal là freeform

- `Trang chủ`, `Cộng đồng`, `Lập kế hoạch`, `Cá nhân`, auth, trip list, trip form dùng layout cố định.
- `Nhật ký` là surface duy nhất có object đặt tự do theo tọa độ.
- Điều này giữ scope editor ở mức kiểm soát được.

### 2. Tách planner và journal ở cấp route

- `planner` là structured workspace.
- `journal` là storytelling workspace.
- Không dùng một màn duy nhất để vừa lập kế hoạch vừa dàn trang scrapbook.

### 3. Giữ backend nền, thay presentation và editor runtime

- Giữ:
  - auth/session pipeline
  - `trips` domain
  - community/posts foundation
  - deploy flow
  - shared API client
- Thay:
  - route composition
  - design system
  - screen hierarchy
  - journal editing model

### 4. Giữ `PostgreSQL` làm nền tảng chính

- Journal scene nên đi theo hướng `PostgreSQL + JSONB + revisions`.
- Không chuyển hẳn sang `MongoDB` ở giai đoạn này.

## Screen inventory mục tiêu

| Surface | Route mục tiêu | Layout type | Trạng thái mong muốn |
| --- | --- | --- | --- |
| Trang chủ | `/` | fixed-layout | editorial landing, branded scrapbook feel |
| Cộng đồng | `/community` | fixed-layout | feed/list/detail, không freeform |
| Auth | `/auth/login`, `/auth/register` | fixed-layout | brand-aligned forms |
| Dashboard | `/app` | fixed-layout | overview ngắn gọn |
| Trips | `/app/trips` | fixed-layout | list + quick actions |
| Trip create/edit | `/app/trips/new`, `/app/trips/:tripId/edit` | fixed-layout | structured form |
| Planner | `/app/trips/:tripId/planner` | fixed-layout/structured | data-first workspace |
| Journal editor | `/app/trips/:tripId/journal` | freeform scrapbook | drag/drop, rotate, layer |
| Journal public view | `/trips/:tripId/journal` | scrapbook read-only | share/publish surface |
| Profile | `/app/profile` | fixed-layout | user/account summary |
| Compatibility | `/app/trips/:tripId` | redirect | về `planner` trong giai đoạn đầu |

## Deliverables bắt buộc trước khi code lớn

- doc foundation mới phản ánh rõ `fixed-layout vs freeform`
- route map mới
- stack decision cho editor runtime
- app architecture có module `journal`
- API integration plan cho journal scene persistence
- backlog implementation theo slice

## Những gì cần giữ từ repo hiện tại

### Giữ nguyên

- `src/app/config/env.ts`
- `src/app/providers/app-providers.tsx`
- `src/shared/api/*`
- `src/features/auth/api/*`
- `src/features/auth/session/*`
- `src/features/trips/api/trips-api.ts`
- `src/features/trips/api/trip-planning-api.ts`
- `src/features/community/api/posts-api.ts`
- `src/shared/i18n/*`
- `src/tests/*`
- CI/deploy workflow và runbook

### Viết lại hoặc scaffold lại

- runtime app tree trong `src/main.tsx`
- router
- public/protected shells
- shared UI primitives
- visual tokens
- toàn bộ screen-level presentation
- journal renderer và editor

### Phase-out sau khi cutover

- mọi mô tả cũ coi `/app/trips/:tripId` là workspace duy nhất
- các assumptions cũ kiểu "mọi page đều chỉ cần reskin"
- việc mở rộng tiếp `trip-planning-api.ts` như file trung tâm cho editor mới

## Các nguyên tắc rollout

### 1. Không biến cả site thành canvas

- Chỉ `journal` mới dùng scene/freeform.
- Các page còn lại phải giữ semantic HTML, responsive layout, accessibility tốt.

### 2. Screen-first rồi mới componentize

- Chốt flow từng màn trước.
- Chỉ tạo primitive khi thấy pattern thật.

### 3. Renderer trước, editor sau

- Xây `read-only journal renderer` trước.
- Sau đó mới thêm selection, toolbar, resize, rotate, autosave.
- Cách này giúp public view và edit mode dùng chung nền.

### 4. Scene model trước visual polish

- Phải chốt object schema, coordinate system, và save/load cycle trước khi dồn effort vào decoration.

### 5. Brand scrapbook phải có chủ đích

- Dùng tape, sticker, handwriting, paper texture như ngôn ngữ thị giác.
- Không rải trang trí vô tội vạ lên form, bảng, và flow cần clarity.

## Slice implementation đề xuất

## FR-A - Documentation reset và route map

### Mục tiêu

Đưa toàn bộ docs về đúng hiện trạng source và đúng định hướng sản phẩm mới.

### Việc cần làm

- [x] đổi tên file foundation cho đúng phạm vi
- [x] đổi tên backlog redesign cho đúng định hướng scrapbook
- [x] cập nhật README theo trạng thái rebuild hiện tại
- [x] chốt nguyên tắc `fixed-layout vs journal freeform`
- [x] chốt route map mới với `planner` và `journal` tách riêng
- [x] ghi rõ khuyến nghị `PostgreSQL + JSONB`
- [x] đồng bộ naming docs để bỏ numbering legacy và bám đúng trạng thái homepage `/`

### Acceptance criteria

- mọi doc active nói cùng một ngôn ngữ
- không còn claim sai kiểu "frontend đã có đầy đủ route production"

## FR-B - Brand system và fixed-layout foundation

### Mục tiêu

Tạo nền thị giác mới cho toàn site mà không phụ thuộc editor.

### Việc cần làm

- [ ] chốt color tokens, paper/background tokens, shadow, border, tape/sticker motif
- [ ] chốt type scale gồm text body rõ ràng và display/handwritten accent có kiểm soát
- [ ] dựng public shell
- [ ] dựng auth shell
- [ ] dựng protected shell
- [ ] định nghĩa reusable layout blocks cho hero, editorial section, card rail, inspector panel, sticky action bar

### Acceptance criteria

- fixed-layout pages nhìn cùng một brand nhưng vẫn dễ đọc
- không phụ thuộc journal editor mới render được home/community/auth

### FR-B1 - Homepage scrapbook implementation

### Mục tiêu

Biến route `/` từ placeholder thành homepage thật đầu tiên để chốt visual language, responsive behavior, và cách brand scrapbook thể hiện trên fixed-layout surface.

### Scope của lượt triển khai này

- [x] scaffold app bootstrap lại bằng `AppProviders + router + global styles`
- [x] dựng homepage hero theo tinh thần `journey---nhật-ký-hành-trình-việt-nam`
- [x] giữ sticky scrapbook navigation như lớp định hướng đầu tiên của trang chủ
- [x] dựng cụm polaroid, parchment map, preview cards, và torn-paper footer
- [x] đưa copy của homepage vào i18n thay vì hardcode rời rạc
- [x] giữ các surface khác ở mức preview ngay trên homepage để không lấn scope
- [ ] nối route thật cho `community`, `planner`, `journal`, `profile`
- [ ] thay ảnh demo bằng asset/content product thật

### Deferred rõ ràng sau homepage

- auth shell và auth screens theo visual mới
- public community route thật
- planner route thật
- journal route thật với renderer/editor riêng
- profile route thật

### FR-B1A - Homepage notebook alignment theo mẫu chốt ngày 2026-04-22

### Mục tiêu

Đưa route `/` về sát mẫu `journey---nhật-ký-hành-trình-việt-nam` theo đúng yêu cầu đã chốt, không giữ các khối preview/dashboard phát sinh từ lượt triển khai trước.

### Scope của lượt triển khai này

- [x] bám layout chính của thư mục mẫu cho `hero`, cụm polaroid, bản đồ và footer
- [x] loại bỏ nội dung `community` khỏi body homepage nhưng giữ item `Cộng Đồng` trên navigation dùng chung
- [x] bỏ language switch, khóa homepage về tiếng Việt
- [x] bỏ các khối vuông/card preview phụ để giữ cảm giác sổ tay ghi chú
- [x] giữ nguyên route map hiện tại, không mở rộng thêm surface mới ngoài homepage
- [x] cập nhật test/check liên quan sau khi thay đổi content structure

### Acceptance criteria

- homepage không còn preview grid hoặc section cộng đồng
- homepage không còn nút đổi ngôn ngữ
- giao diện chính mang hình thức giấy note/polaroid/parchment thay vì card grid vuông
- text hiển thị của homepage chỉ còn tiếng Việt

### FR-B1B - Shared navigation/footer responsiveness cleanup

### Mục tiêu

Làm `header navigation` và `footer` đủ gọn để dùng chung cho các tab khác, không gây khung cuộn ẩn trên mobile và không chiếm quá nhiều chiều cao ở các màn hình thấp.

### Scope của lượt triển khai này

- [x] giữ `Cộng Đồng` trong navigation nhưng không render section cộng đồng trong body homepage
- [x] bỏ horizontal scroll/overflow hidden frame ở navigation
- [x] để navigation tự wrap theo full chiều rộng màn hình nhỏ, đặc biệt mobile portrait
- [x] giữ navigation desktop ở trạng thái căn giữa và kích thước gần với code mẫu
- [x] giảm chiều cao khối main và footer để footer lộ ra sớm hơn trên viewport thấp

### FR-B1C - Shared chrome full-width single-row adjustment

### Mục tiêu

Giữ toàn bộ nút navigation trên đúng một hàng và bỏ các giới hạn chiều rộng không cần thiết ở `header/footer` để shared chrome không tự xuống hàng vì bị bó khung.

### Scope của lượt triển khai này

- [x] navigation header luôn nằm trên một hàng duy nhất
- [x] mobile dùng full chiều rộng thật của màn hình cho hàng navigation
- [x] desktop vẫn căn giữa, kích thước note vừa phải như code mẫu
- [x] bỏ `max-width` gây bó khung ở header/footer wrapper

### FR-B1D - Left hero spacing refinement

### Mục tiêu

Làm cụm hero bên trái thoáng hơn, tránh polaroid chụm sát nhau và tách khối hero khỏi bản đồ bên phải rõ hơn.

### Scope của lượt triển khai này

- [x] tăng khoảng cách giữa các polaroid ở desktop
- [x] đẩy toàn bộ cụm hero bên trái lệch trái nhẹ để thoáng hơn

### FR-B1E - Left hero ring centering refinement

### Mục tiêu

Làm vòng polaroid bên trái rộng hơn nữa và giữ tiêu đề chính luôn nằm đúng giữa vùng rỗng được vòng thẻ bao quanh.

### Scope của lượt triển khai này

- [x] tăng bán kính vòng polaroid thêm ở desktop
- [x] đẩy tâm của cả vòng card sang trái thêm
- [x] đẩy tiêu đề trung tâm theo cùng tâm để không đè lên thẻ

### FR-B1F - Left hero spacing expansion follow-up

### Mục tiêu

Tiếp tục nới khoảng rỗng ở giữa vòng card để tiêu đề trung tâm nằm gọn bên trong, không chạm bất kỳ polaroid nào.

### Scope của lượt triển khai này

- [x] tăng thêm khoảng cách của vòng card ở desktop
- [x] đẩy tâm hero sang trái thêm một nấc nữa
- [x] giữ tiêu đề nằm gọn trong vùng rỗng của vòng card

### FR-B1G - Hero title lock and hover personality pass

### Mục tiêu

Khóa tiêu đề trung tâm thành đúng 3 dòng, mỗi dòng 2 chữ, đồng thời thêm hover effect có cá tính riêng cho navigation và polaroid thay vì dùng một kiểu lặp lại.

### Scope của lượt triển khai này

- [x] khóa tiêu đề `Nhật Ký / Hành Trình / Việt Nam` thành 3 dòng cố định
- [x] giữ tiêu đề không tự xuống từng chữ riêng lẻ ở desktop
- [x] thêm hover variant khác nhau cho từng note ở navigation
- [x] thêm hover variant khác nhau cho từng polaroid card

### FR-B1H - Hero title intrinsic width stabilization

### Mục tiêu

Ổn định khối tiêu đề trung tâm theo đúng bề rộng nội dung thật để ba dòng `Nhật Ký / Hành Trình / Việt Nam` không còn phụ thuộc vào khung rộng cố định và không bị tách chữ ngoài ý muốn.

### Scope của lượt triển khai này

- [x] đổi khối tiêu đề sang sizing theo content thay vì `max-width` cố định
- [x] giữ anchor của title bám cùng tâm vòng polaroid khi khối chữ thay đổi bề rộng
- [x] tinh chỉnh font-size và line-height để ba dòng đứng gọn hơn trong vùng rỗng ở giữa

### FR-B1I - Homepage clean URL pass

### Mục tiêu

Loại bỏ trạng thái homepage tự nhảy sang URL có `#` do dùng placeholder fragment rỗng trong shared chrome của trang chủ.

### Scope của lượt triển khai này

- [x] thay toàn bộ `href="#"` của navigation homepage sang đường dẫn sạch
- [x] thay các footer placeholder link để không còn tạo `/#`
- [x] bổ sung test nhỏ để chặn việc đưa fragment rỗng quay trở lại

### FR-B1J - Polaroid hover lift and footer compaction refinement

### Mục tiêu

Sửa hover của polaroid để cả thẻ thật sự nổi lên thay vì chỉ ảnh bên trong phóng to, đồng thời nén footer xuống gọn hơn để ít chiếm chiều cao màn hình.

### Scope của lượt triển khai này

- [x] tách lớp `float` và lớp `hover` của polaroid để hover transform áp lên toàn bộ thẻ
- [x] giữ cá tính hover riêng cho từng polaroid sau khi tách animation
- [x] giảm padding, gap và scale trang trí của footer để footer thấp hơn

### FR-B1K - Navigation hover cleanup and extra footer reduction

### Mục tiêu

Làm hover của navigation gọn và đẹp hơn, tránh cảm giác rung lắc khó chịu, đồng thời đảm bảo các note như `Trang Chủ` và `Lập Kế Hoạch` có phản hồi hover rõ ràng. Cùng lượt này tiếp tục hạ chiều cao footer thêm một nấc.

### Scope của lượt triển khai này

- [x] thay hover navigation sang motion tinh gọn hơn, không dùng kiểu lắc mạnh
- [x] tăng độ rõ của hover trên `Trang Chủ` và `Lập Kế Hoạch`
- [x] giảm thêm chiều cao footer bằng cách nén tiếp logo, stamp và footer links

### FR-B1L - Navigation wiggle recovery without hover-exit reset

### Mục tiêu

Khôi phục cảm giác `lắc lắc` nhẹ cho từng note trên navigation nhưng không dùng cách làm khiến note bị re-trigger entry animation khi rời hover.

### Scope của lượt triển khai này

- [x] tách motion `drop-in` ban đầu khỏi motion `hover` của từng note
- [x] thêm lại hover wiggle nhẹ với cá tính riêng cho từng nút navigation
- [x] tránh trạng thái bỏ hover là note bị reset opacity/transform rồi hiện lại dần dần

## FR-C - Structured planner surfaces

### Mục tiêu

Làm planner thành khu rõ ràng, data-first, không cố giả scrapbook editor.

### Việc cần làm

- [ ] dựng trip list
- [ ] dựng trip create/edit form
- [ ] dựng planner workspace theo structured layout
- [ ] tách planner API client mới khỏi `trip-planning-api.ts` nếu backend `PlanNode` đã sẵn
- [ ] xử lý loading/error/empty states nhất quán

### Acceptance criteria

- planner nhìn cùng thương hiệu nhưng vẫn là workspace có cấu trúc
- budget/planner data đọc dễ hơn UI cũ

## FR-D - Journal scene renderer

### Mục tiêu

Có engine render một page scrapbook từ dữ liệu scene đã lưu.

### Việc cần làm

- [ ] chốt canonical page size
- [ ] chốt object schema tối thiểu
- [ ] render các object cơ bản:
  - [ ] photo
  - [ ] sticker
  - [ ] tape
  - [ ] text
  - [ ] callout/map-pin
- [ ] scale scene theo container
- [ ] render đúng `rotation` và `zIndex`
- [ ] dựng read-only journal page

### Acceptance criteria

- cùng một scene render ổn trên desktop và mobile
- object không drift vị trí khi reload ở viewport khác

## FR-E - Journal editor interactions

### Mục tiêu

Biến renderer thành editor usable thật.

### Việc cần làm

- [ ] select object
- [ ] drag object
- [ ] resize object
- [ ] rotate object
- [ ] change z-order
- [ ] lock/unlock object
- [ ] duplicate/delete object
- [ ] mở asset tray cho ảnh/sticker
- [ ] inspector cho style cơ bản
- [ ] dirty state + autosave indicator

### Acceptance criteria

- user có thể hoàn thành một page journal mà không đụng JSON thủ công
- editor usable bằng chuột trước, rồi touch/mobile follow-up nhưng không bị bỏ quên

## FR-F - Persistence, versioning, publish

### Mục tiêu

Kết nối editor với backend theo một contract bền vững.

### Việc cần làm

- [ ] chốt API draft cho journal page CRUD
- [ ] chốt save strategy:
  - [ ] snapshot save
  - [ ] debounce autosave
  - [ ] manual save fallback
- [ ] chốt revision model tối thiểu
- [ ] tách asset metadata khỏi scene payload
- [ ] dựng publish/read-only flow

### Acceptance criteria

- save/load vòng kín
- published journal render đúng scene đã lưu
- không cần đổi cả database platform để chạy feature này

## FR-G - Verification, cleanup, deploy smoke refresh

### Mục tiêu

Làm giai đoạn rebuild này đủ sạch để bước vào implementation thật mà không bị docs/source drift trở lại.

### Việc cần làm

- [ ] cập nhật smoke test plan theo route mới
- [ ] cập nhật deploy smoke checklist cho homepage baseline hiện tại rồi cho post-cutover
- [ ] gỡ các tham chiếu cũ còn sót tới route/workspace model cũ
- [ ] rà README và docs active list một lần cuối

### Acceptance criteria

- team đọc docs là hiểu đúng product direction ngay
- deploy/test docs không còn mô tả nhầm app cũ

## Decision log ngắn cần giữ trong giai đoạn này

### Chốt

- [x] chỉ journal là freeform
- [x] planner và journal tách route
- [x] `PostgreSQL + JSONB` là hướng khuyến nghị hiện tại
- [x] renderer dùng chung cho read-only và edit mode

### Chưa chốt

- [ ] thư viện editor runtime cụ thể sẽ là `react-konva` hay phương án tương đương
- [ ] contract backend cuối cùng cho journal pages
- [ ] scope mobile editing giai đoạn đầu rộng tới đâu
- [ ] asset upload provider/storage strategy

## Non-goals cần nhắc lại

- không redesign toàn site thành hệ grid tự do
- không mở thêm social complexity chỉ vì đã có community
- không đổi backend storage sang Mongo chỉ vì scene data linh hoạt
- không cố đạt "Figma-like editor" ở giai đoạn đầu

## Exit criteria cho frontend rebuild

- docs, source skeleton, và route map cùng một hướng
- fixed-layout pages có nền brand rõ
- journal có renderer và editor baseline dùng được
- storage/API strategy đủ rõ để backend và frontend làm song song
