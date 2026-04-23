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

### FR-B0 - Public default image library seed

### Mục tiêu

Tạo một chỗ lưu ảnh mặc định ổn định trong frontend để các surface public có thể dùng cùng một convention URL thay vì tiếp tục rải link ngoài.

### Scope của lượt triển khai này

- [x] tạo thư mục public cho ảnh mặc định trong frontend
- [x] chốt convention URL public cho ảnh trong thư mục này
- [x] ghi lại quy ước ngắn trong README để các lượt sau dùng thống nhất

### FR-B2 - Community feed implementation from approved journal sample

### Mục tiêu

Mở route `community` thật đầu tiên sau homepage, dùng body bám sát mẫu `journey-travel-journal` nhưng giữ shared header/footer đúng chrome của Journey homepage.

### Scope của lượt triển khai này

- [x] tách `header navigation` và `footer` khỏi `home` thành shared chrome components
- [x] dựng route `/community` thật trong app router
- [x] map body community theo mẫu `journey-travel-journal` mà không thêm dependency `motion`
- [x] bind feed vào contract `CommunityPost` hiện tại thay vì data model riêng của mẫu
- [x] derive `region`, `rotation`, `tapeColor` ở frontend cho phase đầu
- [x] giữ `likes/comments` ở mức visual decoration, chưa đòi backend field mới

### FR-B3 - Planner board card alignment cleanup

### Mục tiêu

Làm phần hero board của route `planner` khớp hơn với planner page đã chốt, ưu tiên clarity thay vì dàn card tự do dễ chồng lấn.

### Scope của lượt triển khai này

- [x] bỏ cụm heading phụ kiểu `creative journey/chuyến đi sáng tạo`, chỉ giữ tiêu đề `Lập kế hoạch`
- [x] đổi cụm polaroid card bên trái từ layout absolute sang layout có cấu trúc, card đồng kích thước
- [x] căn card trải đều trong cột trái và loại bỏ tình trạng card che nhau trên desktop
- [x] giữ scrapbook tone nhưng không làm phần phải đổi quá nhiều

### FR-B3A - Planner heading and arrow flow polish

### Mục tiêu

Siết lại cụm heading và flow dẫn mắt ở planner board để title rõ hơn và các card thể hiện một nhịp itinerary liên tục.

### Scope của lượt triển khai này

- [x] đổi font của heading `Lập kế hoạch` sang display font khác với card labels và căn giữa heading
- [x] thêm mũi tên uốn lượn nối `Travel Itinerary` với card đầu tiên trong desktop layout
- [x] thêm chuỗi mũi tên uốn lượn nối lần lượt các card ngày `1-2`, `3-4`, `5-6`, `7-8`
- [x] đồng bộ day label card theo đúng chuỗi ngày mới để flow mũi tên không bị lệch nhịp

### FR-B3B - Planner heading and arrow placement correction

### Mục tiêu

Sửa lại heading và các đường nối trong planner board để typography rõ ràng hơn và arrow flow thật sự bám đúng vị trí card.

### Scope của lượt triển khai này

- [x] giữ `Lập kế hoạch` luôn trên một hàng ở planner heading
- [x] căn trái dòng `Travel Itinerary` thay vì căn giữa
- [x] đưa lớp hiển thị của arrow lên trên cụm card để không bị che
- [x] chỉnh lại path và toạ độ các arrow để nối đúng vị trí giữa subtitle và các card

### FR-B3C - Planner subtitle separation and arrow gutter routing

### Mục tiêu

Tách subtitle khỏi cụm title để có offset trái rõ ràng, đồng thời chuyển toàn bộ arrow flow sang các khoảng trống giữa card thay vì đè lên ảnh.

### Scope của lượt triển khai này

- [x] tách `Travel Itinerary` khỏi thẻ cha căn giữa của heading chính
- [x] dịch cụm subtitle sang trái bằng layout riêng thay vì chỉ dùng `text-left`
- [x] tạo thêm khoảng trắng quanh và giữa các card để arrow có hành lang riêng
- [x] vẽ lại các arrow path để chỉ chạm cạnh hoặc góc card, không chạy đè qua mặt card

### FR-B3D - Planner arrow anchor correction

### Mục tiêu

Đưa các mũi tên itinerary về đúng các điểm neo giữa cạnh/góc card theo flow mà product đã chốt, đồng thời làm arrowhead nhìn rõ trên desktop.

### Scope của lượt triển khai này

- [x] tăng độ rõ của stroke và arrowhead để đầu mũi tên nhìn thấy được
- [x] đưa arrow layer lên trên cụm card nhưng vẫn route path ở gutter ngoài card
- [x] neo đường `1-2 -> 3-4` giữa hai cạnh trên của hai card hàng trên
- [x] neo đường `3-4 -> 5-6` từ góc dưới trái card phải trên tới điểm giữa cạnh trên card trái dưới
- [x] neo đường `5-6 -> 7-8` từ góc trên phải card trái dưới tới cạnh trên card phải dưới

### FR-B3E - Planner arrow scale and gutter spacing refinement

### Mục tiêu

Giảm cảm giác arrow quá to và nắn lại path theo các gutter thật sự của layout để không còn đè lên card.

### Scope của lượt triển khai này

- [x] giảm kích thước marker và stroke của arrow
- [x] tăng khoảng cách ngang/dọc giữa các card trong desktop grid để có gutter rõ hơn
- [x] dời các path vào các gutter ngoài card thay vì chạy sát vùng card

### FR-B3F - Planner top crop and first-row arrow correction

### Mục tiêu

Loại bỏ tình trạng planner board bị đẩy lên trên viewport và neo lại hai đường đầu sao cho thật sự nối từ subtitle/cạnh trên card mà không đè lên card.

### Scope của lượt triển khai này

- [x] bỏ cách canh dọc làm mép trên của planner board bị đẩy lên và che heading
- [x] thêm top spacing để title và mép trên của sổ luôn nhìn thấy được
- [x] neo lại đường `Travel -> 1-2` từ subtitle tới cạnh trên card đầu tiên
- [x] neo lại đường `1-2 -> 3-4` để chạy ngoài card và nối giữa hai cạnh trên

### FR-B3G - Planner no-scroll fit and top-gutter arrows

### Mục tiêu

Thu nhỏ planner board để fit viewport tốt hơn trên desktop, đồng thời đẩy hai arrow đầu lên hẳn gutter phía trên hàng card.

### Scope của lượt triển khai này

- [x] giảm scale tổng thể của planner board trên desktop để tránh phải scroll
- [x] giảm thêm một nhịp chiều cao và spacing ở planner board để fit tốt hơn
- [x] dời đường `Travel -> 1-2` lên hẳn vùng trên card
- [x] dời đường `1-2 -> 3-4` lên trên card và giữ hai đầu neo ở cạnh trên
- [x] giữ nguyên hai đường `3-4 -> 5-6` và `5-6 -> 7-8`

### FR-B3H - Planner top-arrow vertical lift

### Mục tiêu

Tinh lại đúng vị trí dọc của hai arrow đầu trên planner board sau khi scale tổng thể đã ổn.

### Scope của lượt triển khai này

- [x] chỉ đẩy lên thêm hai đường `Travel -> 1-2` và `1-2 -> 3-4`
- [x] giữ nguyên kích thước board và hai đường dưới

### FR-B3I - Planner top-arrow final lift

### Mục tiêu

Đẩy thêm hai arrow đầu sau khi phần còn lại của planner board đã ổn.

### Scope của lượt triển khai này

- [x] đẩy thêm một nhịp dọc cho hai đường `Travel -> 1-2` và `1-2 -> 3-4`
- [x] giữ nguyên mọi kích thước và các arrow còn lại

### FR-B3J - Planner card image source hardening

### Mục tiêu

Loại bỏ phụ thuộc vào ảnh ngoài cho planner board để các card luôn hiển thị ổn định.

### Scope của lượt triển khai này

- [x] thêm ảnh local mặc định cho bốn planner card trong `public/images/defaults`
- [x] đổi planner page sang dùng asset local thay vì URL ngoài

### FR-B4 - Footer density and spacing cleanup

### Mục tiêu

Giảm chiều cao footer và nới nhịp ba cụm link để footer gọn hơn nhưng vẫn dễ quét.

### Scope của lượt triển khai này

- [x] giảm chiều cao tổng thể của footer
- [x] đổi label `Về chúng tôi` thành `Về tôi`
- [x] tăng khoảng cách giữa ba link footer

### FR-B5 - Planner notebook depth treatment

### Mục tiêu

Làm planner board giống một quyển sổ thật hơn bằng cách thêm bìa và nhiều lớp giấy phía dưới thay vì chỉ có một tờ mỏng.

### Scope của lượt triển khai này

- [x] thêm lớp bìa dưới body của planner, cùng mép trên nhưng chìa ra ở hai cạnh trái/phải
- [x] thêm nhiều lớp giấy phía dưới để tạo cảm giác quyển sổ dày hơn
- [x] giữ layout bên trong planner board không đổi đáng kể

### FR-B5A - Planner notebook depth visibility pass

### Mục tiêu

Làm hiệu ứng bìa và độ dày của quyển sổ nhìn ra ngay thay vì quá chìm dưới thân sổ.

### Scope của lượt triển khai này

- [x] tăng phần bìa chìa ra ở hai cạnh trái/phải
- [x] làm các lớp giấy lộ rõ hơn ở cạnh dưới và cạnh phải
- [x] tăng tương phản giữa bìa và các lớp giấy để hiệu ứng dày nhìn rõ

### FR-B5B - Planner page-turn create action

### Mục tiêu

Thêm hành động `Tạo kế hoạch` với hiệu ứng lật sách mềm và trang trắng ở mặt sau để chuẩn bị cho flow planner creation tiếp theo.

### Scope của lượt triển khai này

- [x] thêm nút `Tạo kế hoạch` ở góc dưới bên phải của nửa trang phải
- [x] dựng hiệu ứng lật sách bằng CSS 3D thay vì đổi trạng thái cứng
- [x] hiển thị mặt sau là spread trắng của quyển sổ, chưa có nội dung
- [x] thêm nút quay lại từ spread trắng để test/lặp lại hiệu ứng

### FR-B5C - Planner half-page 3D flip correction

### Mục tiêu

Sửa hiệu ứng lật để chỉ lật đúng nửa trang phải như lật sách thật, thay vì xoay cả spread.

### Scope của lượt triển khai này

- [x] giữ nửa trái ở trạng thái tĩnh
- [x] tách nửa phải thành một sheet 3D riêng có mặt trước và mặt sau
- [x] xoay sheet phải quanh gáy ở giữa quyển sổ
- [x] tăng cảm giác cong/mềm của cú lật bằng timing và shadow phù hợp hơn

### FR-B5D - Planner full-body height fit

### Mục tiêu

Làm quyển sổ planner chiếm gần hết chiều cao phần body khả dụng trên desktop nhưng không dính sát header/footer, đồng thời bỏ tình trạng phần dưới bị cắt.

### Scope của lượt triển khai này

- [x] bỏ chiều cao cứng của spread desktop và cho notebook bám theo `main` height khả dụng
- [x] giảm các khoảng đệm dọc đang làm notebook bị hụt chỗ ở cạnh dưới
- [x] giữ lại một nhịp khoảng trống nhỏ với header/footer để notebook không bị dính mép
- [x] xác nhận lại các card hàng dưới không còn bị cắt

### FR-B5D - Planner spread height recovery

### Mục tiêu

Khôi phục đủ chiều cao của spread desktop sau khi chuyển sang half-page flip để phần nửa dưới của quyển sổ không bị cắt mất.

### Scope của lượt triển khai này

- [x] tăng lại chiều cao desktop của spread container
- [x] tăng chiều cao tối thiểu của từng page trong spread
- [x] đảm bảo card ngày `5-6` và `7-8` hiển thị trở lại

### Acceptance criteria

- `/community` dùng chung header/footer với homepage
- body community giữ layout/filter/polaroid feel gần mẫu đã chốt
- page render được với dữ liệu thật từ `GET /posts`
- không cần đổi contract backend hiện tại để lên bản đầu

### FR-B2A - Community sample fidelity cleanup

### Mục tiêu

Siết lại `/community` để body không tự thêm intro copy hay label ngoài mẫu đã chốt.

### Scope của lượt triển khai này

- [x] bỏ label `Cộng đồng` phía trên cụm filter vùng miền
- [x] bỏ khối title/description/summary thêm ngoài mẫu ngay trên feed
- [x] giữ lại chỉ các phần body cốt lõi của mẫu: filter, doodle, grid card, và state fallback khi thật sự cần

### FR-B2B - Community card title simplification

### Mục tiêu

Rút gọn phần heading của card bài viết để chỉ còn tên chuyến đi trên một dòng, không giữ metadata và tag phụ gây lệch so với mẫu đang chốt.

### Scope của lượt triển khai này

- [x] bỏ eyebrow `Câu chuyện cộng đồng` khỏi card bài viết
- [x] đổi title card sang ưu tiên `trip.name` thay vì `post.title`
- [x] giới hạn title card còn đúng một dòng
- [x] bỏ dòng ngày tháng trong phần metadata của card
- [x] bỏ chip tag ở đáy card vì title đã dùng trực tiếp tên chuyến đi

### FR-B2C - Community card title source correction

### Mục tiêu

Đưa card community về đúng yêu cầu hiển thị tên bài post thay vì tên chuyến đi.

### Scope của lượt triển khai này

- [x] đổi presenter của community card sang ưu tiên `post.title`
- [x] giữ fallback an toàn nếu title rỗng
- [x] thêm test nhỏ để khóa lại nguồn title của card

### FR-B2D - Community duplicate title cleanup

### Mục tiêu

Giữ mỗi card community chỉ có một tiêu đề bài post chính, không lặp lại title thêm lần nữa trong placeholder của card.

### Scope của lượt triển khai này

- [x] bỏ title lặp trong placeholder khi card không có ảnh bìa
- [x] giữ lại đúng một title chính trên card

### FR-B3 - Auth scrapbook gate cho planner và profile

### Mục tiêu

Biến các điểm vào `Lập Kế Hoạch` và `Cá Nhân` từ homepage thành route thật có chặn đăng nhập, đồng thời dựng màn `Đăng Nhập` theo visual cuốn sổ mở gần ảnh tham chiếu và mở được sang `Đăng Ký`.

### Scope của lượt triển khai này

- [x] thêm route `auth/login` và `auth/register`
- [x] dựng trang `Đăng Nhập` theo bố cục notebook mở, khác mẫu đăng ký nhưng cùng chất liệu giấy/sổ tay
- [x] giữ text trên auth screen gọn đúng các nhãn cốt lõi của mẫu, không thêm intro copy thừa
- [x] thêm nút mở sang page đăng ký khi chưa có tài khoản
- [x] nối `Lập Kế Hoạch` và `Cá Nhân` sang route protected thật thay vì trỏ về `/`
- [x] đảm bảo khi đăng nhập xong người dùng quay lại route protected vừa chọn

### FR-B3A - Profile sample-body integration with shared public chrome

### Mục tiêu

Đưa route `Cá Nhân` về sát mẫu `journey-app` cho phần body, nhưng vẫn dùng đúng shared `header/footer` hiện có của các page public thay vì dựng chrome riêng cho khu cá nhân.

### Scope của lượt triển khai này

- [x] bỏ `private-page-shell` khỏi route `/app/profile`
- [x] dùng lại `SharedHeader` và `SharedFooter` thông qua `PublicPageShell`
- [x] map đúng phần body theo mẫu `journey-app`, không tự thêm section/copy ngoài mẫu
- [x] giữ flow sau đăng nhập quay lại đúng route protected mà người dùng vừa bấm, đặc biệt với `Lập Kế Hoạch` và `Cá Nhân`
- [x] cập nhật test nhỏ để khóa hành vi redirect và route profile

### FR-B3B - Auth shared chrome and profile data binding

### Mục tiêu

Đưa `Đăng Nhập` và `Đăng Ký` vào đúng shared `header/footer` của site, đồng thời thay phần dữ liệu tĩnh ở `Cá Nhân` bằng dữ liệu thật từ DB: tab `Nhật ký của tôi` là các bài viết đã đăng, tab `Kế hoạch đã lưu` là các kế hoạch đã tạo.

### Scope của lượt triển khai này

- [x] bọc `auth/login` và `auth/register` bằng shared `header/footer` như các page public khác
- [x] giữ nguyên body notebook của auth screens, không tự thêm layout chrome riêng
- [x] nối tab `Nhật ký của tôi` với bài viết của current user từ backend
- [x] nối tab `Kế hoạch đã lưu` với danh sách trip của current user từ backend
- [x] thay số liệu chính trên card trái bằng dữ liệu thật có thể lấy được từ auth/posts/trips hiện tại
- [x] cập nhật test/check nhỏ nhất liên quan đến contract mới

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
- [x] nối route thật cho `community`
- [ ] nối route thật cho `planner`, `journal`, `profile`
- [ ] thay ảnh demo bằng asset/content product thật

### Deferred rõ ràng sau homepage

- auth shell và auth screens theo visual mới
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

### FR-B1K - Homepage polaroid ring expansion

### Mục tiêu

Mở rộng vòng polaroid trên homepage để có đủ 12 mốc ảnh, vẫn giữ cách phân bổ đều theo chiều kim đồng hồ quanh tiêu đề trung tâm.

### Scope của lượt triển khai này

- [x] thêm 4 polaroid card mới vào vòng ảnh homepage
- [x] giữ dữ liệu card đi qua cùng presenter/i18n hiện tại thay vì hardcode trong component
- [x] cập nhật test số lượng polaroid để khóa cấu hình 12 vị trí

### FR-B1O - Polaroid clock distribution refinement

### Mục tiêu

Làm vòng polaroid tròn hơn sau khi tăng lên 12 thẻ, tránh cảm giác bị bẹp ngang và tránh dồn card vào hai cụm 3 giờ và 9 giờ.

### Scope của lượt triển khai này

- [x] đẩy các card 1 giờ, 2 giờ, 10 giờ, 11 giờ lên gần 12 giờ hơn
- [x] đẩy các card 4 giờ, 5 giờ, 7 giờ, 8 giờ xuống gần 6 giờ hơn
- [x] giữ nguyên cơ chế phân bố theo thứ tự dữ liệu hiện tại của vòng 12 card

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

### FR-B1M - Replace broken external polaroid photo links

### Mục tiêu

Khôi phục các polaroid card bị mất ảnh do một số URL external cũ đã bị gỡ hoặc trả `404`.

### Scope của lượt triển khai này

- [x] xác nhận card nào đang dùng URL ảnh hỏng
- [x] thay các link hỏng của `Huế`, `Hội An`, `Nha Trang`, `Sa Pa` bằng nguồn public còn hoạt động
- [x] giữ nguyên các card còn hiển thị bình thường để tránh đổi visual không cần thiết

### FR-B1N - Footer social stamp hover and silhouette refinement

### Mục tiêu

Làm các nút mạng xã hội ở footer nổi bật hơn khi hover, sáng màu hơn, phóng to rõ hơn, và có silhouette gần với con tem thay vì giữ lớp khung vuông phía sau.

### Scope của lượt triển khai này

- [x] bỏ lớp khung nền lệch phía sau social stamps
- [x] đổi visual stamp sang viền tem răng cưa và inner border rõ hơn
- [x] tăng hover lift, scale, glow và độ sáng nền cho từng social stamp

## FR-C - Structured planner surfaces

### Mục tiêu

Làm planner thành khu rõ ràng, data-first, không cố giả scrapbook editor.

### Scope của lượt triển khai này

- [x] đưa `planner` về đúng body notebook tham chiếu từ `demo.txt`
- [x] giữ `header/footer` luôn hiển thị, chỉ cuộn phần body ở giữa
- [x] ẩn thanh scrollbar ở vùng body chung của các page dùng shared shell
- [x] tách contract layout của từng public page khỏi `PublicPageShell`
- [x] thêm test guard để width, gutter và page-specific spacing không bị kéo lên shared shell
- [x] chỉ giữ `community` là page public có scroll dọc; các page còn lại phải fit trong body giữa header/footer
- [x] thêm route `journal` thật để note điều hướng không rơi nhầm về homepage
- [x] loại bỏ toàn bộ CTA, form và nội dung tự phát sinh khỏi page `planner`
- [x] nới body `home` ra gần nhịp rộng của `community`, tránh cảm giác bị nhốt trong khung
- [x] trả lại gutter hai bên cho `planner` để không dính mép màn hình
- [x] kéo cụm polaroid của `home` vào trong body để không còn bị cắt bên trái

### Việc cần làm

- [ ] dựng trip list
- [ ] dựng trip create/edit form
- [ ] dựng planner workspace theo structured layout
- [ ] tách planner API client mới khỏi `trip-planning-api.ts` nếu backend `PlanNode` đã sẵn
- [ ] xử lý loading/error/empty states nhất quán

### Acceptance criteria

- planner nhìn cùng thương hiệu nhưng vẫn là workspace có cấu trúc
- budget/planner data đọc dễ hơn UI cũ
- thay đổi layout của một public page không tự động làm lệch width, gutter hoặc spacing của public page khác

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
- [x] đổi deploy workflow sang staged `dist` swap để tránh cửa sổ runtime đọc bundle lỗi khi build trực tiếp trên máy đích
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
