# Frontend Rebuild Digital Scrapbook Backlog

## Trạng thái

- Date: `2026-05-05`
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

| Surface             | Route mục tiêu                              | Layout type             | Trạng thái mong muốn                      |
| ------------------- | ------------------------------------------- | ----------------------- | ----------------------------------------- |
| Trang chủ           | `/`                                         | fixed-layout            | editorial landing, branded scrapbook feel |
| Cộng đồng           | `/community`                                | fixed-layout            | feed/list/detail, không freeform          |
| Auth                | `/auth/login`, `/auth/register`             | fixed-layout            | brand-aligned forms                       |
| Dashboard           | `/app`                                      | fixed-layout            | overview ngắn gọn                         |
| Trips               | `/app/trips`                                | fixed-layout            | list + quick actions                      |
| Trip create/edit    | `/app/trips/new`, `/app/trips/:tripId/edit` | fixed-layout            | structured form                           |
| Planner             | `/app/trips/:tripId/planner`                | fixed-layout/structured | data-first workspace                      |
| Journal editor      | `/app/trips/:tripId/journal`                | freeform scrapbook      | drag/drop, rotate, layer                  |
| Journal public view | `/public/trips/:tripId/journal`             | scrapbook read-only     | share/publish surface                     |
| Profile             | `/app/profile`                              | fixed-layout            | user/account summary                      |
| Compatibility       | `/app/trips/:tripId`                        | redirect                | về `planner` trong giai đoạn đầu          |

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
- mọi bridge kiểu `trip-planning-api.ts` cho semantics itinerary cũ

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

## Follow-up journal signed asset delivery support

Status: `Completed in source`

### Mục tiêu

Giữ journal editor/public renderer tương thích khi backend đổi journal asset URL sang signed URL co query string, nhung khong doi model tuong tac tren UI.

### Scope của lượt triển khai này

- [x] giu `resolveJournalAssetUrl()` resolve dung relative URL co query string
- [x] normalize signed relative `imageUrl` trong owner/public journal response thanh absolute API URL truoc khi dua vao renderer/editor
- [x] dam bao asset-backed object tiep tuc dua tren `assetId` la chinh khi xac dinh asset dang duoc su dung
- [x] bo sung test nho cho helper resolve signed relative asset URL

### Deferred

- tu dong refresh signed URL cho journal da mo lau hon TTL neu sau nay can
- asset cache invalidation/tai lai anh khi signed URL thay doi trong session dai

## FR-PL1 - Planner step 1 local trip draft

### Mục tiêu

Đưa các trường cần thiết cho payload tạo chuyến đi vào bước 1 của quyển sổ planner hiện tại, nhưng chưa gọi API tạo chuyến đi.

### Scope của lượt triển khai này

- [x] giữ flow tạo chuyến đi trong `/app/planner?page=next`, không tạo route tạo trip mới
- [x] thêm local draft state cho thông tin chuyến đi ở bước 1
- [x] thêm các trường `name`, `destination`, `summaryNotes`, `coverImageUrl`, `startDate`, `endDate`, `budgetMode`, ngân sách thủ công, tiền tệ và `visibility`
- [x] bỏ trường `timezone` khỏi UI bước 1
- [x] đổi ô ngày đi thành control dạng lịch trong notebook, bấm để mở popup chọn ngày
- [x] khi bấm `Tiếp Tục`, chỉ validate và giữ draft tạm trong state trước khi chuyển sang bước hoạt động

### Acceptance criteria

- bước 1 vẫn nằm trong spread quyển sổ hiện tại
- không có request `POST /trips` khi bấm `Tiếp Tục`
- giá trị đã nhập không mất khi quay lại từ bước hoạt động về bước 1 trong cùng phiên planner
- UI không bị che bởi nội dung mô tả hoặc note trang trí không cần thiết

### Follow-up refinement

- [x] tăng khoảng thở trên/dưới của quyển sổ để action cuối trang không bị che
- [x] đổi popup ngày thành native date picker mở ngay khi bấm vào lịch
- [x] thay map preview bằng khung ảnh bìa lấy từ link ảnh bìa nếu có
- [x] đổi nhãn visibility trong bước 1 sang ngôn ngữ tự nhiên hơn
- [x] làm số bước hiện tại nổi bật hơn và có animation

### Follow-up fix

- [x] đưa nút `Tiếp Tục` lên khỏi mép dưới của quyển sổ
- [x] cố định chiều cao preview ảnh bìa để ảnh không đẩy layout
- [x] bỏ khối tìm kiếm điểm đến trên trang phải của bước 1
- [x] đổi date control thành popup lịch custom mở ngay khi bấm vào ô lịch

### Follow-up calendar refinement

- [x] mở popup lịch lên phía trên ô ngày để không bị che bởi cụm số bước
- [x] thêm chế độ chọn ngày, chọn tháng và chọn năm ngay trong popup lịch
- [x] click vào tiêu đề tháng/năm chuyển sang chọn tháng, click tiếp chuyển sang chọn năm
- [x] chọn tháng quay lại màn ngày, chọn năm quay lại màn tháng
- [x] click ra ngoài popup lịch thì tự đóng
- [x] đảm bảo popup lịch hiển thị trên nút quay lại trang trước

### Follow-up activity step refinement

- [x] hiển thị số bước bên dưới ở bước 2 và làm nổi bật số 2
- [x] chỉ hiển thị hai số bước trong cụm progress của flow tạo kế hoạch
- [x] bỏ note "Thông tin cố định..." khỏi trang trái bước hoạt động
- [x] đổi ngày hoạt động sang calendar picker thay vì nhập text
- [x] đổi giờ hoạt động sang picker chọn giờ bắt đầu/kết thúc
- [x] bỏ palette sticker, canvas sticker và ghi chú nodeId khỏi trang phải
- [x] dùng trang phải cho thông tin bổ sung của hoạt động: ghi chú và ảnh minh họa

### Follow-up activity payload alignment

- [x] bỏ các trường không nằm trong payload activity hiện tại: loại hoạt động, trạng thái đặt chỗ, độ ưu tiên, link tham khảo
- [x] đổi chi phí thành `costAmount` và `costCurrency` để bám API
- [x] thay native time select bằng popup chọn giờ custom, giới hạn chiều cao trong quyển sổ
- [x] cân lại hai trang để khung ảnh minh họa hiển thị rõ và không bị nội dung khác che

### Follow-up multi-activity page turn create flow

- [x] revert flow tạo hoạt động lỗi làm trống trang đầu bước 2
- [x] giữ form hành động đầu tiên hiển thị ngay ở bước 2
- [x] thêm nút `Thêm hành động` ở góc trên phải của trang hành động
- [x] khi thêm hành động, lật trang sang form hành động mới với đầy đủ field như hành động hiện tại
- [x] thêm nút quay lại hành động trước khi đang ở hành động thứ hai trở đi
- [x] giữ nút `Tạo` luôn hiển thị ở mỗi trang hành động và lưu toàn bộ hành động cùng chuyến đi

### Follow-up activity time constraints

- [x] giới hạn ngày của từng hoạt động nằm trong khoảng ngày bắt đầu/kết thúc của chuyến đi
- [x] bắt buộc hoạt động có đủ giờ bắt đầu và giờ kết thúc
- [x] chặn giờ kết thúc bằng hoặc sớm hơn giờ bắt đầu
- [x] chặn các hoạt động trong cùng ngày có khoảng thời gian giao nhau
- [x] khi có lỗi ở hoạt động khác, tự chuyển về trang hoạt động đầu tiên cần sửa

### Follow-up activity backend error mapping

- [x] map lỗi backend về đúng field của activity đang lỗi
- [x] khi backend từ chối một activity, tự lật về activity đó để người dùng sửa
- [x] giữ thông báo tổng ở nút `Tạo` để người dùng biết chuyến đi chưa lưu trọn vẹn
- [x] tạo activity tuần tự để không mất index activity lỗi trong quá trình lưu
- [x] bổ sung test nhỏ cho mapping lỗi backend của activity

### Follow-up created trip planner handoff

- [x] sau khi tạo thành công, chuyển sang planner của chuyến đi vừa tạo
- [x] load/refetch planner thật theo `tripId`
- [x] seed cache planner bằng activity vừa tạo để UI hiện ngay trước khi refetch
- [x] invalidate cache danh sách trip để profile/list nhìn thấy chuyến mới
- [x] hiển thị tiến trình đang lưu từng activity trong lúc bấm `Tạo`
- [x] khóa thao tác thêm/sửa activity trong lúc đang submit

### Follow-up saved planner activity management

- [x] thêm activity mới trực tiếp trong planner đã lưu theo `tripId`
- [x] sửa activity đã lưu bằng form nhập activity hiện có
- [x] xóa activity đã lưu và cập nhật cache planner
- [x] giữ ràng buộc ngày/giờ khi thêm hoặc sửa activity đã lưu
- [x] map lỗi backend khi thêm/sửa activity đã lưu về đúng form
- [x] refetch/invalidate planner sau mỗi thao tác thành công

### Follow-up saved planner direct item actions

- [x] màn planner đã lưu không hiện nút thêm activity tổng hay nút xong
- [x] mỗi activity trong danh sách luôn hiện nút sửa và xóa
- [x] form sửa một activity cụ thể có nút thêm activity để bổ sung hoạt động mới
- [x] khi lưu form sửa, cập nhật activity đang sửa và tạo thêm các activity mới nếu có

### Follow-up profile saved planner handoff

- [x] mở planner đã lưu từ tab kế hoạch trong trang cá nhân bằng `tripId`
- [x] chỉnh card kế hoạch trong profile để có CTA mở/chỉnh planner
- [x] đồng bộ giao diện profile với concept scrapbook hiện tại
- [x] chặn thêm activity mới khi activity hiện tại còn thiếu thông tin bắt buộc
- [x] cho phép xóa bản nháp activity được thêm thừa trong form activity

### Follow-up planner/profile edit refinements

- [x] đưa nút `Thêm hành động` và `Xóa hành động` trong form activity xuống khu action phía trên nút lưu/tạo
- [x] thêm nút `Thêm hoạt động` bên ngoài danh sách hoạt động trong planner đã lưu
- [x] cho phép sửa thông tin chung của planner/chuyến đi đã lưu
- [x] đổi CTA kế hoạch ở profile thành `Chỉnh sửa` và thêm xóa cả planner/chuyến đi
- [x] giữ danh sách kế hoạch trong profile scroll bên trong thẻ chứa, không làm body hoặc layout ngoài bị tràn

### Follow-up activity paging and profile overflow cleanup

- [x] ẩn scrollbar trong thẻ profile và chặn scroll ngang do card xoay/tràn
- [x] thêm nút lật sang hoạt động trước/sau trong form activity
- [x] khi thêm hoặc sửa activity ở planner đã lưu, nạp toàn bộ activity đã lưu để chỉnh nhiều activity trong một lượt
- [x] khi lưu form nhiều activity, cập nhật các activity đã lưu và tạo thêm draft mới nếu có

### Follow-up activity page navigation placement

- [x] bỏ vùng scroll riêng ở nửa trang phải của form activity
- [x] đưa nút `Hoạt động sau` lên góc trên phải trang phải
- [x] dùng cùng nút góc trên trái cho `Quay lại planner/thông tin chung` ở activity đầu tiên và `Hoạt động trước` ở các activity sau

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

### FR-B4 - Planner activity structured fields, sticker canvas superseded

### Mục tiêu

Thêm trang kế tiếp sau bước `Thông Tin Chung` trong planner để người dùng nhập hoạt động bằng các field cố định.

Re-baseline: activity creation hiện tại không cần sticker, palette sticker, hoặc canvas kéo thả. Sticker/freeform interaction thuộc phạm vi `journal`, không thuộc flow tạo hoạt động của planner.

### Scope của lượt triển khai này

- [x] thêm bước `Hoạt Động` sau `createSpread`
- [x] dùng form field cố định cho activity payload
- [x] bỏ palette sticker và canvas sticker khỏi flow nhập hoạt động
- [x] giữ sticker/freeform interaction ngoài planner activity creation
- [x] giữ màn hình hoạt động hoạt động được ở chế độ local draft khi route chưa có `nodeId`

### Deferred

- nối hoàn chỉnh bước `Thông Tin Chung` với tạo `Trip` thật
- autosave/debounce theo session editor
- nếu cần giữ API sticker hiện có, chỉ xem là legacy/experimental support; không coi là yêu cầu của activity creation hiện tại

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

### FR-B5E - Planner cover edge alignment and CTA copy correction

### Mục tiêu

Làm khối nội dung của quyển sổ khớp mép và bo góc với phần bìa, đồng thời bỏ copy thử nghiệm `Quay lại planner` trên trang trắng của hiệu ứng lật.

### Scope của lượt triển khai này

- [x] chỉnh mép dưới của khối nội dung để không dài hơn phần bìa nhìn thấy
- [x] đồng bộ bán kính bo góc của khối nội dung với bìa quyển sổ
- [x] thay CTA ở trang trắng từ `Quay lại planner` sang `Tạo chuyến đi`
- [x] giữ nguyên hiệu ứng lật nửa trang phải

### FR-B5F - Planner notebook scale reduction

### Mục tiêu

Thu nhỏ thêm phần bìa và wrapper của quyển sổ planner để desktop không còn phải scroll, nhưng vẫn giữ rõ hiệu ứng bìa và các lớp giấy.

### Scope của lượt triển khai này

- [x] giảm phần chìa xuống của các lớp bìa phía dưới
- [x] giảm nhẹ padding dọc của notebook wrapper

## FR-J1 - Journal read-only renderer and persistence client

### Mục tiêu

Đưa route journal từ placeholder sang surface đọc scene thật đầu tiên, dùng contract `GET/PUT /trips/:tripId/journal` mới của backend nhưng chưa dựng editor kéo thả đầy đủ.

### Scope của lượt triển khai này

- [x] thêm `features/journal/api/journal-api.ts`
- [x] thêm type/query key riêng cho journal scene
- [x] load journal theo `tripId` từ query string compatibility route `/app/journal?tripId=...`
- [x] dựng read-only renderer dùng canonical page space `width/height`
- [x] render trạng thái empty/loading/error rõ ràng
- [x] giữ editor controls và autosave ngoài scope phase này

### Deferred

- selection, drag/drop, resize, rotate
- asset upload
- autosave/debounce và manual save
- public read-only journal route

## FR-J2 - Journal trip handoff and minimal creator

### Mục tiêu

Nối profile/trip list với journal scene thật để người dùng không bị rơi vào `/app/journal` trống, đồng thời cho tạo vài object cơ bản và lưu scene bằng contract phase đầu.

### Scope của lượt triển khai này

- [x] thêm CTA mở nhật ký trên card kế hoạch trong profile
- [x] khi `/app/journal` thiếu `tripId`, không để người dùng rơi vào journal trống
- [x] thêm thao tác tạo note, ảnh bằng URL, sticker và tape ở journal route
- [x] lưu scene bằng `PUT /trips/:tripId/journal`
- [x] giữ drag/drop, resize, rotate tự do ngoài scope

### Deferred

- inspector chọn object đầy đủ
- kéo thả trực tiếp trên canvas
- upload asset thật
- autosave/debounce
- [x] public journal route qua `/public/trips/:tripId/journal`

## FR-J3 - Saved journal profile management

### Mục tiêu

Đưa tab nhật ký trong trang cá nhân về đúng dữ liệu journal scene đã lưu thay vì bài viết cộng đồng, đồng thời cho cập nhật/xóa journal đã lưu.

### Scope của lượt triển khai này

- [x] dùng `GET /journals/mine` cho tab nhật ký trong profile
- [x] hiển thị journal đã lưu sau khi save scene
- [x] thêm CTA cập nhật journal về `/app/journal?tripId=...`
- [x] thêm xóa journal bằng `DELETE /trips/:tripId/journal`
- [x] invalidate cache journal sau khi lưu hoặc xóa

### Deferred

- preview thumbnail render từ canvas thật
- phân trang journal trong profile
- public/published journal list riêng

## FR-J5 - Journal object selection and drag baseline

### Mục tiêu

Bắt đầu biến journal editor từ creator tĩnh thành editor trực tiếp trên scene, nhưng vẫn giữ renderer public ở chế độ read-only.

### Scope của lượt triển khai này

- [x] cho owner journal route chọn object trên scene
- [x] kéo object chưa khóa trong giới hạn page space canonical
- [x] hỗ trợ nudge bằng phím mũi tên cho object đang focus
- [x] giữ public journal renderer không nhận interaction editor

### Deferred

- resize/rotate handles
- layer reorder inspector
- autosave/debounce
- asset upload thật

## FR-J6 - Journal MVP editing controls and route cutover

### Mục tiêu

Đưa journal editor từ drag baseline sang MVP usable hơn, đồng thời chuyển planner/journal sang canonical trip routes để demo flow end-to-end không còn lệch route map.

### Scope của lượt triển khai này

- [x] chuyển `/app/trips/:tripId/planner` thành route planner chính thật
- [x] chuyển `/app/trips/:tripId/journal` thành route journal chính thật
- [x] giữ `/app/planner?tripId=...` và `/app/journal?tripId=...` làm compatibility redirect
- [x] cập nhật profile/public copy links sang canonical route mới
- [x] thêm panel object đang chọn trong journal editor
- [x] thêm delete object và đổi layer order tối thiểu
- [x] thêm dirty/saved state cho manual save hiện tại
- [x] cập nhật test route/presenter/editor helper liên quan

### Deferred

- resize handles
- rotate handles trực tiếp trên object
- autosave/debounce production-ready
- asset upload thật

## FR-J7 - Journal autosave and exit guard

### Mục tiêu

Giảm rủi ro mất dữ liệu trong journal editor hiện tại trước khi mở rộng thêm asset flow hoặc handles phức tạp hơn.

### Scope của lượt triển khai này

- [x] thêm autosave debounce cho scene journal khi có thay đổi
- [x] giữ manual save như fallback rõ ràng
- [x] thêm trạng thái đang tự lưu và đã tự lưu
- [x] chặn reload/close tab khi còn thay đổi chưa lưu hoặc đang lưu
- [x] chặn điều hướng nội bộ khỏi journal khi còn thay đổi chưa lưu hoặc đang lưu
- [~] bổ sung test helper cho autosave và stale-save protection; route-level navigation guard test còn deferred

### Deferred

- route-level guard test ổn định cho navigation confirm
- conflict resolution cho multi-tab editing
- revision history
- background retry queue ngoài session hiện tại

## FR-J8 - Data router migration for full journal navigation blocking

### Mục tiêu

Đổi app router sang data-router để journal editor có thể chặn điều hướng trong app đầy đủ hơn, bao gồm cả browser back/forward, thay vì chỉ xử lý reload/tab close và click link nội bộ.

### Scope của lượt triển khai này

- [x] chuyển `AppRouter` từ `BrowserRouter + Routes` sang `createBrowserRouter + RouterProvider`
- [x] giữ nguyên route map hiện tại, bao gồm canonical routes và compatibility redirects
- [x] chuyển journal exit guard sang `useBlocker` trên data router
- [x] chặn điều hướng nội bộ, bao gồm browser back/forward, khi journal còn dirty hoặc đang save
- [x] giữ `beforeunload` guard cho reload/close tab
- [x] bổ sung test helper nhỏ cho blocker flow của journal guard

### Deferred

- confirm UI tùy biến thay cho `window.confirm`
- scroll restoration/pending navigation UX riêng cho data router
- route loader/action refactor cho planner hoặc journal

## FR-J9 - Journal owner image upload phase 1

### Mục tiêu

Cho journal editor thêm ảnh từ file local thay vì chỉ nhập URL thủ công, nhưng chưa biến asset thành thư viện quản lý đầy đủ.

### Scope của lượt triển khai này

- [x] thêm `POST /trips/:tripId/journal/assets` vào journal API client
- [x] gửi multipart `file` với auth session hiện tại
- [x] đổi URL asset backend trả về thành absolute API URL để `<img>` render được trên frontend domain
- [x] thêm file picker trong journal editor, vẫn giữ URL input làm fallback
- [x] khi upload thành công, tạo object `photo` với `imageUrl`, `assetId`, `fileName`, và `contentType`
- [x] hiển thị trạng thái đang upload và lỗi upload cơ bản

### Deferred

- cloud/object storage provider production-ready
- cleanup file vật lý khi asset không còn được scene nào dùng

## FR-J10 - Journal asset library and delete controls

### Mục tiêu

Cho owner xem lại các ảnh đã upload trong journal editor, thêm nhanh ảnh cũ vào scene, và xóa asset không còn cần dùng bằng contract backend lifecycle mới.

### Scope của lượt triển khai này

- [x] thêm `GET /trips/:tripId/journal/assets` vào journal API client
- [x] thêm `DELETE /trips/:tripId/journal/assets/:assetId` vào journal API client
- [x] hiển thị asset library gọn trong journal editor
- [x] cho chọn asset đã upload để thêm lại thành object `photo`
- [x] cho xóa asset chưa được scene hiện tại dùng
- [x] chặn xóa asset đang được scene hiện tại hoặc scene đã lưu tham chiếu để tránh ảnh hỏng trong page

### Deferred

- asset search/filter/pagination
- cleanup orphan asset tự động sau autosave failure hoặc user rời trang
- cloud/object storage provider production-ready

## FR-J11 - Journal resize handles baseline

### Muc tieu

Cho owner doi kich thuoc `photo` va `note` truc tiep tren scene de journal editor biet "dan trang" thuc su, nhung van giu scope gon o mot handle resize co ban va khong mo them inspector phuc tap.

### Scope cua luot trien khai nay

- [x] them resize handle cho object `photo` va `note` trong journal editor
- [x] giu `sticker` va `tape` ngoai scope resize cua phase nay
- [x] resize giu goc tren trai lam diem neo va cap nhat `width/height` theo pointer
- [x] clamp kich thuoc de object khong tran khoi page
- [x] them test helper nho cho resize math/coercion

### Deferred

- multiple resize anchors theo tung canh/goc
- giu fixed aspect ratio toggle cho photo
- resize inspector field chinh xac theo pixel
- resize cho sticker va tape
- rotate-aware resize handles chinh xac hon

## FR-J12 - Journal direct rotate handle baseline

### Muc tieu

Cho owner xoay object truc tiep tren scene bang handle thay vi chi bam nut xoay trai/phai trong inspector, de journal editor co cam giac dan trang truc tiep hon ma van giu scope gon.

### Scope cua luot trien khai nay

- [x] them rotate handle cho object dang duoc chon va khong bi khoa
- [x] rotate theo pointer quanh tam object trong canonical page space
- [x] normalize rotation ve khoang signed on dinh `-180..180`
- [x] giu nut xoay trai/phai inspector hien co lam fallback chinh xac
- [x] them test helper nho cho rotation math theo pointer

### Deferred

- snap rotation theo buoc 15 do khi giu modifier key
- hien live angle tooltip trong luc xoay
- rotate-aware resize handles chinh xac hon

## FR-J4 - Profile share controls and public read-only pages

### Mục tiêu

Cho người dùng chia sẻ kế hoạch cá nhân hoặc nhật ký đã lưu từ page cá nhân mà không trộn hành động publish với editor. Scope này dùng `Trip.visibility` làm source of truth cho share mode: `private` và `public`.

### Scope của lượt triển khai này

- [x] thêm nút chia sẻ trên card kế hoạch và card nhật ký đã lưu trong profile
- [x] thêm modal chia sẻ với preview, chế độ riêng tư/công khai, link xem public và thao tác copy
- [x] cập nhật `Trip.visibility` frontend type sang `private | public`
- [x] khi đổi share mode, gọi `PATCH /trips/:tripId` với field `visibility`
- [x] thêm route read-only `/public/trips/:tripId` cho kế hoạch
- [x] thêm route read-only `/public/trips/:tripId/journal` cho nhật ký, reuse `JournalSceneRenderer`
- [x] invalidate profile trip/journal caches sau khi đổi share mode

### Ngoài phạm vi

- share token/signed URL riêng
- tùy chọn ẩn hiện từng phần ngân sách/ghi chú
- public journal discovery list
- social publish thành post cộng đồng
- [x] giữ nguyên bố cục nội dung và hiệu ứng lật trang
- [x] xác nhận quyển sổ fit gọn hơn trong body

### FR-B5G - Planner flip CTA correction

### Mục tiêu

Đưa CTA `Tạo chuyến đi` về đúng mặt trước của nửa trang phải và làm mặt sau sau khi lật chỉ còn là một trang trắng trống.

### Scope của lượt triển khai này

- [x] đổi CTA mặt trước từ `Tạo kế hoạch` sang `Tạo chuyến đi`
- [x] giữ click CTA để kích hoạt lật nửa trang phải
- [x] bỏ toàn bộ nút/CTA ở trang trắng mặt sau
- [x] giữ nguyên hiệu ứng 3D flip hiện có

### FR-B5H - Planner flip timing and body fit

### Mục tiêu

Làm hiệu ứng lật trang chậm/mượt hơn và thu nhỏ toàn bộ quyển sổ thêm một nhịp để phần body không phải scroll.

### Scope của lượt triển khai này

- [x] tăng thời lượng flip của nửa trang phải
- [x] giảm chiều cao section notebook so với body khả dụng
- [x] giảm nhẹ phần bìa/lớp giấy và padding liên quan
- [x] giữ trang trắng sau khi lật không có nội dung

### FR-B5I - Planner intro routing and no-scroll clamp

### Mục tiêu

Chặn hẳn scroll của planner intro bằng giới hạn chiều cao theo viewport khả dụng, đồng thời buộc navigation `Lập kế hoạch` mở đúng intro planner khi người dùng đã đăng nhập.

### Scope của lượt triển khai này

- [x] làm chậm thêm nhịp flip của nửa trang phải
- [x] clamp chiều cao notebook theo `100dvh` để desktop không còn scroll
- [x] giảm thêm một nhịp spacing desktop bên trong notebook nếu cần
- [x] làm nav `Lập kế hoạch` đi thẳng vào `/app/planner` khi đã đăng nhập

### FR-B5J - Planner arrowhead visibility and reverse flip

### Mục tiêu

Khôi phục arrowhead của planner board ở trạng thái đầu và thêm khả năng lật ngược từ trái sang phải bằng nút quay lại ở trang trắng.

### Scope của lượt triển khai này

- [x] làm arrowhead luôn hiển thị ngay cả trước khi bắt đầu flip
- [x] tách state flip tiến/lùi để hỗ trợ hướng lật ngược
- [x] thêm nút `Quay lại trang trước` trên trang trắng sau khi lật
- [x] giữ nút tạo tiếp tục lật từ phải sang trái

### FR-B5K - Planner nav-aware reverse flip and softer curl

### Mục tiêu

Cho navigation `Lập kế hoạch` tự kéo planner về trang giới thiệu đầu tiên nếu đang ở trang kế tiếp của intro planner, đồng thời làm cú lật cong và mềm hơn.

### Scope của lượt triển khai này

- [x] chuyển state intro/next page của planner sang URL để navigation điều khiển được
- [x] để link `Lập kế hoạch` về `/app/planner` tự kích hoạt lật ngược khi đang ở trang kế tiếp
- [x] chỉ áp dụng logic này cho intro planner, không ảnh hưởng các route khác
- [x] làm transform/shadow của flip mềm và lả lướt hơn

### FR-B5L - Planner reverse page alignment cleanup

### Mục tiêu

Làm mặt trái đứng thẳng sau khi lật sang trang kế tiếp và căn nút quay lại về mép trái của trang trái.

### Scope của lượt triển khai này

- [x] bỏ độ nghiêng còn sót lại của mặt trái ở trạng thái đã lật xong
- [x] giữ cảm giác cong/mềm bằng shadow thay vì để trang bị xiên
- [x] căn nút `Quay lại trang trước` về lề trái của trang trái
- [x] giữ nguyên logic lật ngược qua navigation planner

### FR-B5M - Planner create-trip notebook spread

### Mục tiêu

Khi người dùng bấm `Tạo chuyến đi` ở planner, chuyển sang một spread hai nửa quyển sổ có form thông tin chung ở trang trái và bản đồ/chọn điểm đến ở trang phải.

### Scope của lượt triển khai này

- [x] dựng trang trái kiểu notebook với tên chuyến đi, ngày đi và step dots
- [x] dựng trang phải với tiêu đề điểm đến, thanh tìm kiếm, bản đồ minh họa và nút tiếp tục
- [x] sửa nút `Quay lại trang trước` để toàn bộ vùng nút click được khi sang trang kế tiếp
- [x] giữ responsive mobile bằng cách xếp hai trang theo chiều dọc

### FR-B5N - Planner mobile notebook depth continuity

### Mục tiêu

Đảm bảo lớp bìa và các lớp giấy phía sau planner notebook trên mobile kéo dài theo toàn bộ chiều cao hai nửa trang, không chỉ dừng ở nửa trên/viewport đầu.

### Scope của lượt triển khai này

- [x] bỏ ràng buộc `h-full` mobile làm wrapper notebook chỉ cao bằng viewport
- [x] giữ desktop tiếp tục fit theo chiều cao body khả dụng
- [x] xác nhận lớp bìa/paper phía sau phủ tới nửa trang dưới

### FR-B5O - Planner mobile date row and calendar placement

### Mục tiêu

Làm hai ô chọn ngày bắt đầu/kết thúc nằm cùng một hàng trên mobile và để popup lịch mở xuống dưới input thay vì tràn lên trên rồi bị che.

### Scope của lượt triển khai này

- [x] đặt ngày bắt đầu và ngày kết thúc cùng một hàng trên mobile
- [x] giảm ràng buộc min-width của date input để fit trong hai cột nhỏ
- [x] đổi popup lịch sang neo dưới input để không bị cắt ở mép trên

### FR-B5P - Planner mobile QA sweep

### Mục tiêu

Rà lại toàn bộ `/app/planner` trên các viewport mobile phổ biến sau các chỉnh sửa responsive gần đây, ưu tiên lỗi tràn ngang, nội dung bị che, và controls khó thao tác.

### Scope của lượt triển khai này

- [x] kiểm viewport 360, 390, và 430 cho planner create flow
- [x] sửa các lỗi layout còn lại ở header/notebook/date/budget/footer trong planner
- [x] chạy lại lint/build sau khi sửa

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

### Auth login response compatibility hotfix

### Mục tiêu

Giữ flow `Đăng Nhập` không fail ở frontend khi backend omit các field user optional như `avatarUrl` trong payload `POST /auth/login`.

### Scope của lượt triển khai này

- [x] chấp nhận `avatarUrl` bị thiếu trong auth user response và normalize an toàn về `null`
- [x] giữ nguyên behavior resolve avatar URL tương đối sang absolute API URL khi field này có mặt
- [x] thêm test nhỏ mô phỏng response login success không có `avatarUrl`

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
- [x] nối route thật/compatibility flow cho `planner`, `journal`, `profile`
- [ ] thay ảnh demo bằng asset/content product thật

### Deferred rõ ràng sau homepage

- auth shell và auth screens theo visual mới
- cutover planner sang canonical route `/app/trips/:tripId/planner`
- journal route thật với renderer/editor riêng
- profile production polish sau khi canonical planner/journal route chốt

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

### FR-B1P - Homepage orientation responsive refinement

### Mục tiêu

Làm trang chủ co giãn tốt hơn trên màn hình nhỏ theo tỷ lệ màn hình: landscape vẫn giữ cảm giác hero/map một màn bằng cách thu nhỏ vòng polaroid và tiêu đề, còn portrait chuyển thành 1 cột 2 hàng với hero ở trên và bản đồ/hotspot ở dưới.

### Scope của lượt triển khai này

- [x] thêm layout responsive theo `orientation` cho homepage main
- [x] trên màn hình nhỏ landscape, thu nhỏ card ảnh và tiêu đề để không tràn chiều cao
- [x] trên portrait, chia thành 2 hàng: vòng ảnh bao quanh tiêu đề ở trên, bản đồ Việt Nam và hotspot ở dưới
- [x] cho phép scroll dọc khi portrait cần xem tiếp bản đồ/hotspot nhưng vẫn ẩn thanh scroll
- [x] giữ bản đồ và hotspot không tràn ngang viewport mobile

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

### FR-B1O - Mobile shared chrome balance refinement

### Mục tiêu

Cân lại shared header/footer trên mobile để navigation dãn đều theo đúng số note, đồng thời gom logo và các social stamp của footer trên một hàng gọn hơn.

### Scope của lượt triển khai này

- [x] header mobile dùng số cột khớp với số navigation item thật
- [x] footer mobile đặt logo và social stamps trên cùng một hàng
- [x] giữ footer link navigation tách hàng dưới để không làm hàng logo/social bị quá tải

## FR-C - Structured planner surfaces

### Mục tiêu

Làm planner thành khu rõ ràng, data-first, không cố giả scrapbook editor.

### FR-C0 - Non-visual trip route compatibility aliases

### Mục tiêu

Thêm nền route theo route map mới mà không thay đổi UI hiện tại, navigation hiện tại, hoặc flow planner hiện tại.

### Scope của lượt triển khai này

- [x] thêm alias protected cho `/app/trips/:tripId` và `/app/trips/:tripId/planner`
- [x] thêm alias protected cho `/app/trips/:tripId/journal`
- [x] redirect alias về route hiện tại tương ứng để giữ nguyên flow đang dùng
- [x] giữ nguyên toàn bộ link hiện tại như `/app/planner?tripId=...`, `/app/planner`, `/app/journal`
- [x] bổ sung test nhỏ cho redirect path builder để khóa behavior không đổi UI

### FR-C1 - Canonical planner and journal route cutover

### Mục tiêu

Đổi route target trong source thành route chính, giữ route compatibility cũ như cửa vào chuyển tiếp thay vì để target canonical tiếp tục redirect ngược.

### Scope của lượt triển khai này

- [x] route `/app/trips/:tripId/planner` render planner trực tiếp
- [x] route `/app/trips/:tripId/journal` render journal trực tiếp
- [x] route `/app/trips/:tripId` redirect về planner canonical
- [x] route `/app/planner?tripId=...` và `/app/journal?tripId=...` redirect về canonical tương ứng
- [x] route `/app/planner` không có `tripId` nay redirect sang `/app/trips/new`

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

- [x] dựng trip list
- [x] dựng trip create/edit form
- [~] dựng planner workspace theo structured layout
- [x] gỡ dead itinerary bridge files sau khi backend cleanup legacy itinerary support
- [~] xử lý loading/error/empty states nhất quán

### Acceptance criteria

- planner nhìn cùng thương hiệu nhưng vẫn là workspace có cấu trúc
- budget/planner data đọc dễ hơn UI cũ
- thay đổi layout của một public page không tự động làm lệch width, gutter hoặc spacing của public page khác

## Follow-up trips entrypoint and route alignment

### Mục tiêu

Biến `/app/trips` thành entrypoint thật cho core loop hiện tại để người dùng có nơi quản lý toàn bộ chuyến đi trước khi đi sâu vào planner và journal.

### Scope của lượt triển khai này

- [x] thêm route `/app/trips` dùng dữ liệu thật từ `GET /trips`
- [x] render list chuyến đi với loading, error, empty state rõ ràng
- [x] thêm CTA tạo chuyến đi mới từ list
- [x] thêm link trực tiếp sang planner và journal của từng trip
- [x] điều hướng workspace:
  - [x] `/app` -> `/app/trips`
  - [x] `/app/trips/new` dùng fixed-layout trip form riêng
  - [x] `/app/trips/:tripId/edit` dùng fixed-layout trip form riêng
- bulk action, filter, sort nâng cao cho trip list

### Acceptance criteria

- người dùng đăng nhập đi vào `/app` không còn rơi thẳng vào flow tạo planner
- từ `/app/trips` có thể mở planner, journal, và tạo chuyến đi mới mà không cần đi qua profile
- route mới không làm gãy compatibility redirects hiện có cho planner/journal

## Follow-up canonical planner workspace

### Mục tiêu

Biến `/app/trips/:tripId/planner` thành workspace planner dữ liệu có cấu trúc thật sự, tách rõ khỏi notebook create flow đang dùng cho `/app/trips/new`.

### Scope của lượt triển khai này

- [x] thêm budget client riêng cho `GET /trips/:tripId/budget-summary`
- [x] render planner tree thật trên route canonical với loading/error/empty state rõ ràng
- [x] hiển thị budget summary owner flow ngay trong planner workspace
- [x] cho thêm root node
- [x] cho thêm child node
- [x] cho sửa node
- [x] cho xóa node
- [x] tách metadata create/edit trip ra fixed-layout form riêng, để canonical planner tập trung vào node tree và budget summary

### Deferred

- reorder tree nâng cao bằng drag/drop
- grouped day/location editor chuyên biệt
- merge hẳn saved activity notebook flow vào planner tree CRUD

### Acceptance criteria

- `/app/trips/:tripId/planner` không còn mở notebook saved spread mặc định
- owner xem được planner tree, budget summary, và thao tác CRUD node trong cùng route
- route create/edit trip không còn phụ thuộc notebook planner để nhập metadata

## Follow-up fixed-layout trip form routes

### Mục tiêu

Đưa tạo và chỉnh sửa chuyến đi về đúng các route fixed-layout `/app/trips/new` và `/app/trips/:tripId/edit`, đồng thời giảm vai trò của notebook planner cũ xuống mức compatibility.

### Scope của lượt triển khai này

- [x] tách helper draft/payload/validation của trip form khỏi `PlannerPage`
- [x] thêm page fixed-layout riêng cho create/edit trip
- [x] route `/app/trips/new` render form mới và điều hướng sang planner canonical sau khi tạo thành công
- [x] route `/app/trips/:tripId/edit` render form mới và lưu trực tiếp về trip hiện tại
- [x] giữ `/app/planner` chỉ còn làm compatibility redirect, không còn render notebook create flow
- [x] bỏ redirect `/app/trips/:tripId/edit` sang planner `trip-info mode`
- [x] invalidate cache `trips`, `planner`, `journal`, và public trip/journal liên quan sau khi lưu

### Deferred

- hợp nhất các CTA chỉnh sửa metadata giữa trip form và planner workspace nếu sau này cần

### Acceptance criteria

- tạo và chỉnh sửa chuyến đi đi qua fixed-layout form thay vì notebook page
- tạo mới thành công mở thẳng `/app/trips/:tripId/planner`
- chỉnh sửa metadata không còn phụ thuộc route redirect sang planner `trip-info mode`

## Follow-up planner compatibility cleanup

### Mục tiêu

Kết thúc giai đoạn compatibility của notebook planner cũ để route metadata và route planner không còn chồng vai trò.

### Scope của lượt triển khai này

- [x] route `/app/planner` không có `tripId` redirect sang `/app/trips/new`
- [x] giữ `/app/planner?tripId=...` tiếp tục redirect sang planner canonical như compatibility path
- [x] gỡ `trip-info mode` khỏi `PlannerPage`
- [x] gỡ notebook create/edit trip flow cũ khỏi `PlannerPage`
- [x] giữ `PlannerPage` chỉ còn là route canonical mỏng cho workspace planner theo `tripId`
- [x] cập nhật CTA/test/doc để flow metadata không còn trỏ về compatibility planner path

### Deferred

- xóa hẳn helper notebook-only còn lại nếu sau này không còn route nào dùng
- gộp hoặc bỏ `PlannerPage` nếu app router chuyển thẳng sang `TripPlannerWorkspace`

### Acceptance criteria

- `/app/planner` không còn là màn create notebook thật
- metadata create/edit chỉ đi qua `/app/trips/new` và `/app/trips/:tripId/edit`
- canonical planner route không còn branch `trip-info mode`

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
- [~] dirty state + autosave indicator

### Acceptance criteria

- user có thể hoàn thành một page journal mà không đụng JSON thủ công
- editor usable bằng chuột trước, rồi touch/mobile follow-up nhưng không bị bỏ quên

## FR-F - Persistence, versioning, publish

### Mục tiêu

Kết nối editor với backend theo một contract bền vững.

### Việc cần làm

- [ ] chốt API draft cho journal page CRUD
- [~] chốt save strategy:
  - [~] snapshot save
  - [~] debounce autosave
  - [x] manual save fallback
- [ ] chốt revision model tối thiểu
- [ ] tách asset metadata khỏi scene payload
- [ ] dựng publish/read-only flow

### Acceptance criteria

- save/load vòng kín
- published journal render đúng scene đã lưu
- không cần đổi cả database platform để chạy feature này

## Follow-up share independence and community discovery

### Mục tiêu

Tách chia sẻ `planner` và `journal` ở UI/contract, đồng thời để tab cộng đồng discovery cả kế hoạch public lẫn nhật ký public.

### Việc cần làm

- [x] modal chia sẻ ở profile nhận visibility riêng theo loại nội dung
- [x] lưu chia sẻ kế hoạch qua `PATCH /trips/:tripId`
- [x] lưu chia sẻ nhật ký qua `PATCH /trips/:tripId/journal`
- [x] community feed gộp public posts, public trips, và public journals
- [x] public journal chỉ hiện link mở kế hoạch khi planner cũng đang share được
- [x] public planner hiển thị ghi chú và ngân sách rõ hơn
- [x] public planner có CTA tạo bản sao kế hoạch vào tài khoản đang đăng nhập
- [ ] smoke test thủ công flow share journal-only sau deploy

## Follow-up two-mode sharing and responsive public pages

### Mục tiêu

Thu gọn chế độ chia sẻ về đúng hai lựa chọn `private` và `public`, đồng thời đảm bảo các page public read-only có behavior responsive/scroll phù hợp trong shared shell.

### Scope

- [x] bỏ `unlisted` khỏi frontend type cho trip và journal
- [x] rút modal chia sẻ và form tạo trip về hai chế độ riêng tư/công khai
- [x] cập nhật copy, badge, và label i18n cho share mode hai trạng thái
- [x] cho auth và public trip/journal page dùng scroll responsive trong shared shell
- [x] cập nhật test presenter liên quan đến share badge

## Follow-up planner direct entry and profile-owned journal access

### Mục tiêu

Giảm các điểm vào bị lặp: planner mở thẳng quyển sổ lập kế hoạch, còn journal/chỉnh sửa đi qua tab Cá nhân thay vì có thêm màn chọn chuyến đi riêng.

### Scope

- [x] bỏ màn bìa/CTA trung gian khi vào `/app/planner`
- [x] mở trực tiếp spread nhập thông tin kế hoạch mới khi planner không có `tripId`
- [x] bỏ note điều hướng `Tạo Nhật Ký` khỏi chrome chung
- [x] khi `/app/journal` thiếu `tripId`, redirect về `/app/profile` thay vì render picker chọn chuyến đi
- [x] bỏ copy picker journal không còn dùng

## Follow-up authenticated shell logout

### Mục tiêu

Đưa hành động đăng xuất vào chrome chung để người dùng thoát tài khoản từ planner, journal, profile, community hoặc trang public mà không phải tìm trong một page riêng.

### Việc cần làm

- [x] hiển thị nút `Đăng xuất` trong shared header khi session đang authenticated
- [x] gọi `auth.logout()` và đưa người dùng về trang đăng nhập sau khi logout
- [ ] smoke test thủ công trên desktop/mobile sau deploy

## Follow-up profile-only logout relocation

### Mục tiêu

Dời hành động `Đăng xuất` khỏi chrome dùng chung và chỉ đặt trong page `Cá Nhân` để navigation/public shell không bị thêm action tài khoản ngoài ngữ cảnh.

### Việc cần làm

- [x] bỏ nút `Đăng xuất` khỏi shared header
- [x] bỏ nút `Đăng xuất` khỏi private shell dùng chung nếu còn được tái sử dụng
- [x] thêm nút `Đăng xuất` trong `/app/profile` và điều hướng về đăng nhập sau khi logout

## Follow-up register validation copy

### Mục tiêu

Giữ lỗi đăng ký bằng copy sản phẩm tiếng Việt, tránh để trình duyệt hiện thông báo native như password không khớp format.

### Việc cần làm

- [x] chuyển rule mật khẩu khỏi native `pattern` sang validate trong React
- [x] dùng message i18n hiện có cho email, tên hiển thị và mật khẩu
- [ ] smoke test thủ công form đăng ký sau deploy

## Follow-up editable profile avatar

### Mục tiêu

Cho người dùng cập nhật tên hiển thị và avatar thật thay vì dùng avatar placeholder chung, đồng thời giữ avatar mặc định local trung tính giới tính khi tài khoản chưa upload ảnh.

### Việc cần làm

- [x] thêm default avatar local trong `public/images/defaults/`
- [x] thay placeholder profile cũ bằng default avatar chung trung tính giới tính
- [x] cho upload avatar ngay trong form đăng ký
- [x] thêm form chỉnh tên hiển thị và avatar trong `/app/profile`
- [x] đồng bộ auth session sau khi cập nhật tên/avatar
- [x] hiển thị lỗi file không hợp lệ trước khi gọi API

## Follow-up site favicon wiring

### Mục tiêu

Dùng favicon Journey đã có trong `public` cho metadata trình duyệt của toàn bộ app.

### Việc cần làm

- [x] khai báo favicon từ asset public trong `index.html`

## FR-G - Verification, cleanup, deploy smoke refresh

### Mục tiêu

Làm giai đoạn rebuild này đủ sạch để bước vào implementation thật mà không bị docs/source drift trở lại.

### Việc cần làm

- [x] cập nhật smoke test plan theo route mới
- [x] đổi deploy workflow sang staged `dist` swap để tránh cửa sổ runtime đọc bundle lỗi khi build trực tiếp trên máy đích
- [x] cập nhật deploy smoke checklist cho compatibility routes hiện tại rồi cho canonical planner/journal cutover
- [x] bổ sung beta smoke checklist end-to-end cho planner, budget, journal signed asset, share, và community
- [ ] gỡ các tham chiếu cũ còn sót tới route/workspace model cũ
- [ ] rà README và docs active list một lần cuối

### Acceptance criteria

- team đọc docs là hiểu đúng product direction ngay
- deploy/test docs không còn mô tả nhầm app cũ

## Follow-up deploy smoke hardening - 2026-05-08

### Mục tiêu

Khóa lại các flow public/auth/journal đã vừa hoàn tất trong source bằng production smoke thật, trước khi mở thêm feature mới hoặc bắt đầu cleanup sâu hơn.

### Việc cần làm

- [x] verify flow `planner private` + `journal public` trên production ở mức API/runtime data
- [x] verify public journal discovery vẫn xuất hiện trong `GET /public/journals` khi planner còn private
- [x] thêm browser smoke script có thể tái chạy cho public journal, logout, và register validation copy
- [x] verify public route `/public/trips/:tripId/journal` ở mức browser render khi planner private
- [x] verify public journal không lộ CTA planner khi planner còn private
- [x] verify logout từ `/app/profile` và refresh route private không giữ stale session
- [x] verify đăng ký tài khoản mới vẫn dùng copy validation tiếng Việt đúng như source hiện tại
- [x] nếu có drift production/source, vá route hoặc state handling rồi cập nhật smoke checklist

### Kết quả đã có

- Production API pass cho `journal public` trong khi `trip.visibility = private`
- `GET /public/trips/:tripId/journal` trả được journal public với `trip.visibility = private`
- `GET /public/trips/:tripId` tiếp tục bị chặn `403`, nên planner private không bị lộ qua public trip route
- `GET /public/journals` vẫn discovery được journal public của trip private
- `pnpm smoke:production` hiện đã verify browser render cho public journal, logout guard ở route private, và copy validation tiếng Việt của `/auth/register`

### Deferred

- browser gesture coverage đầy đủ cho journal drag/resize/rotate trên mobile
- smoke toàn bộ visual spacing của fixed-layout surfaces

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
- [ ] cloud/signed asset delivery strategy sau phase upload local đầu tiên

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
