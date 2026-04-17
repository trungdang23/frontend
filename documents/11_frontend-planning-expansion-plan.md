# Frontend Planning Expansion Plan

## Mục tiêu

Tài liệu này chốt hướng mở rộng frontend cho phần `planning` theo yêu cầu mới:

- giao diện có nhiều hình ảnh hơn
- hiển thị ảnh bằng `image URL` lấy từ database
- một trip có nhiều phần kế hoạch, nhiều địa điểm, nhiều hoạt động
- có ghi chú, thời gian, chi phí ở nhiều cấp
- planner nên xem theo danh sách cuộn, không ép click sâu nhiều lần
- chuẩn bị UI seam cho AI sau này

## Trạng thái frontend hiện tại

Frontend hiện đã có:

- landing
- login/register
- protected app shell
- dashboard
- profile
- trips list
- trip create
- trip detail
- trip edit

`Trip detail` hiện mới là màn hình metadata:

- destination
- date range
- timezone
- budget
- createdAt
- updatedAt

Nó chưa phải planner workspace thật.

## Hướng UX tổng thể

## 1. Tăng vai trò của hình ảnh

Ngắn hạn, ảnh nên xuất hiện ở:

- trip card trong `/app/trips`
- header/hero của `/app/trips/:tripId`
- card của từng planner node

Nguyên tắc:

- ảnh là optional
- nếu có `imageUrl` thì render ảnh
- nếu không có thì render media placeholder

## 2. `Trip detail` phải trở thành planning workspace

Route giữ nguyên:

- `/app/trips/:tripId`

Nhưng vai trò của route này phải đổi từ:

- `detail metadata`

sang:

- `planning workspace`

## 3. Không mở route sâu cho từng node làm mặc định

Không nên đẩy UI sang dạng:

- `/app/trips/:tripId/day/:dayId`
- `/app/trips/:tripId/node/:nodeId`
- `/app/trips/:tripId/node/:nodeId/edit`

Hướng phù hợp hơn:

- planner nằm trên một màn chính
- chỉnh sửa bằng modal, drawer, side panel, hoặc inline editor

## 4. UI phải ưu tiên list-first

Planner nên được nhìn như:

- một outline
- một timeline list
- một danh sách có phân cấp

không phải một hệ route sâu hoặc tab lồng nhau.

## 5. UI không được quá tĩnh

Planner mới không nên chỉ là các khối text đứng yên.

UI cần có motion đủ rõ để tạo cảm giác:

- đang xây kế hoạch
- đang mở rộng ý tưởng
- đang thêm bớt phần tử sống động

Nhưng motion phải phục vụ thao tác, không chỉ để trang trí.

## Route strategy

## Giữ nguyên route hiện tại

- `/app/trips`
- `/app/trips/new`
- `/app/trips/:tripId`
- `/app/trips/:tripId/edit`

## Thay đổi ý nghĩa route

### `/app/trips`

Từ:

- danh sách trip text-heavy

Sang:

- danh sách card giàu hình ảnh hơn

### `/app/trips/new`

Giữ vai trò:

- tạo trip metadata cơ bản

Không nên nhét full planner vào ngay màn create.

### `/app/trips/:tripId`

Từ:

- metadata detail

Sang:

- planning workspace chính

### `/app/trips/:tripId/edit`

Giữ vai trò:

- chỉnh metadata cấp trip

Không dùng route này để chỉnh planner node.

## Screen architecture mục tiêu

## 1. Trips list

Mỗi trip card nên có:

- cover image
- tên trip
- destination summary
- date range
- budget summary
- quick actions

Nếu chưa có ảnh:

- placeholder visual vẫn phải đủ đẹp

## 2. Trip create/edit

Metadata cấp trip nên gồm:

- name
- destination summary
- startDate
- endDate
- timezone
- budgetAmount
- budgetCurrency
- summaryNotes
- coverImageUrl

Phase đầu chưa có upload, nên:

- `coverImageUrl` có thể là text input hoặc hidden tạm nếu BE đã có mà UI chưa muốn cho edit ngay

## 3. Trip planning workspace

Trang `/app/trips/:tripId` nên có 3 vùng chính:

### Header

- cover image lớn
- title
- destination summary
- summary notes
- budget tổng

### Summary strip

- tổng số mục
- tổng chi phí đã khai báo
- số ngày hoặc số section

### Planner list

- danh sách node cuộn dọc
- node cha/con thể hiện bằng:
  - indentation
  - border
  - line connector
  - badge type

## Planner node card

Mỗi node card nên hiển thị:

- title
- type badge
- thời gian
- chi phí
- notes preview
- image preview
- quick action buttons

Quick actions nên gồm:

- thêm node con
- sửa node
- xoá node

## Motion strategy cho planner mới

## 1. Mức motion mong muốn

Planner nên có motion ở mức `medium`:

- rõ hơn UI hiện tại
- sinh động hơn dashboard tĩnh
- nhưng vẫn gọn, sạch, usable

## 2. Những hiệu ứng nên có

### Trip list

- card fade-in + translate nhẹ khi list xuất hiện
- hover lift nhẹ
- cover image zoom rất nhỏ khi hover

### Trip planning header

- cover image reveal nhẹ khi vào trang
- summary strip stagger ngắn

### Planner list

- node card enter animation khi load lần đầu
- stagger nhẹ cho nhóm node đầu tiên
- smooth layout transition khi thêm/xóa node

### Planner section

- expand/collapse animation cho node cha có children
- opacity + height transition ngắn

### Overlay

- drawer/modal slide-fade
- backdrop fade

### Feedback

- shimmer cho skeleton
- success state nhẹ khi lưu xong
- optimistic insert/remove nếu mutation đủ ổn định

## 3. Những hiệu ứng chưa nên làm sớm

- parallax mạnh
- canvas background animation
- animation loop liên tục trong protected workspace
- motion quá nhiều trên mọi card cùng lúc
- drag-and-drop animation phức tạp trước khi node CRUD ổn định

## 4. Reduced motion

Planner mới phải hỗ trợ:

- tắt stagger dài
- bỏ zoom trang trí
- giữ transition chức năng ở mức tối thiểu

## 5. Component motion roadmap

### Phase FE-1

- trip card hover
- trip cover reveal

### Phase FE-2

- page-enter cho planning workspace
- summary strip stagger

### Phase FE-3

- node enter/exit
- modal/drawer motion
- expand/collapse

### Phase FE-4

- layout transition khi reorder hoặc regroup
- motion polish cho image strip

## Editing strategy

## Phase đầu

Chỉnh node bằng:

- modal hoặc drawer

Lý do:

- nhanh hơn route sâu
- ít state management phức tạp hơn inline editor hoàn chỉnh
- phù hợp với outline/list UI

## Phase sau

Có thể thêm:

- inline quick edit
- drag-and-drop reorder
- expand/collapse

## Data flow mục tiêu ở frontend

## Metadata trip

Frontend vẫn dùng:

- `GET /trips`
- `GET /trips/:tripId`
- `POST /trips`
- `PATCH /trips/:tripId`

nhưng response mở rộng thêm:

- `summaryNotes`
- `coverImageUrl`

## Planning data

Frontend sẽ dùng thêm planning API mới:

- `GET /trips/:tripId/planning`
- `POST /trips/:tripId/planning/nodes`
- `PATCH /trips/:tripId/planning/nodes/:nodeId`
- `DELETE /trips/:tripId/planning/nodes/:nodeId`

Nếu phase ảnh nhiều ảnh được mở:

- `POST /trips/:tripId/planning/nodes/:nodeId/images`
- `PATCH /trips/:tripId/planning/nodes/:nodeId/images/:imageId`
- `DELETE /trips/:tripId/planning/nodes/:nodeId/images/:imageId`

## Cấu trúc code đề xuất

Không nên tạo một feature song song mới quá sớm nếu phạm vi vẫn gắn chặt vào trip detail.

Khuyến nghị:

```text
features/trips/
  api/
  components/
  routes/
  planning/
    api/
    components/
    types/
    lib/
```

Lý do:

- giữ ownership của planner nằm trong `trips`
- tránh sinh parallel feature dư thừa
- dễ refactor sau này nếu planner lớn lên

## Component roadmap

## Phase FE-1: media-first cards

Component cần có:

- `TripCardMedia`
- `TripCover`
- `TripMediaPlaceholder`

## Phase FE-2: planning workspace shell

Component cần có:

- `TripPlanningHeader`
- `TripPlanningSummary`
- `TripPlanningList`
- `TripPlanningEmptyState`

## Phase FE-3: node UI

Component cần có:

- `PlanNodeCard`
- `PlanNodeBadge`
- `PlanNodeMeta`
- `PlanNodeActions`
- `PlanNodeEditorModal` hoặc `PlanNodeEditorDrawer`

## Phase FE-4: image patterns

Component cần có:

- `RemoteImage`
- `ImageFallback`
- `NodeImageStrip`

## UX principles cho planner mới

1. Nhìn được nhiều thông tin trên một màn hình.
2. Không bắt người dùng click sâu mới thấy nội dung.
3. Ảnh là bổ trợ ngữ cảnh, không che mất nội dung kế hoạch.
4. Notes phải đọc nhanh được ở list, không chôn hoàn toàn vào detail.
5. Mobile vẫn xem được planner theo list dọc.

## Rủi ro chính

## 1. Route cũ nói là detail nhưng UX mới là workspace

Cần chấp nhận đổi vai trò của `/app/trips/:tripId` rõ ràng, nếu không UI sẽ nửa vời.

## 2. Planner tree rất dễ thành UI rối

Cần tránh:

- nested accordion quá nhiều
- route sâu
- quá nhiều modal lồng nhau

## 3. Contract FE/BE dễ lệch

Vì planner là nhánh mới, phải chốt contract BE trước khi build UI lớn.

## 4. Ảnh chưa có upload

Giai đoạn này UI chỉ đọc `imageUrl`.

Cần đảm bảo:

- placeholder đẹp
- lỗi load ảnh không làm vỡ layout

## Phase roadmap

## FE Phase A: trip media

Mục tiêu:

- list/detail nhìn giàu hình ảnh hơn ngay

Việc cần làm:

- mở rộng type `Trip`
- hiển thị `coverImageUrl`
- hiển thị `summaryNotes`
- thêm placeholder media card
- thêm hover motion và image reveal cho trip cards

## FE Phase B: workspace shell

Mục tiêu:

- đổi `trip detail` thành planner shell

Việc cần làm:

- header mới
- summary strip
- empty state cho planner
- giữ action edit metadata riêng
- thêm page-enter motion và summary stagger

## FE Phase C: planning node CRUD

Mục tiêu:

- add/edit/delete node

Việc cần làm:

- query planning data
- modal/drawer editor
- mutate node
- render hierarchy theo list
- animate add/remove/update node
- animate expand/collapse node groups

## FE Phase D: image URL display at node level

Mục tiêu:

- node có ảnh preview

Việc cần làm:

- node cover image
- fallback image
- layout ổn định khi có/không có ảnh
- polish image motion ở mức nhẹ, không gây xao nhãng

## FE Phase E: future AI entrypoint

Chưa build AI, nhưng nên chừa:

- CTA `Gợi ý kế hoạch`
- CTA `Tìm hiểu địa điểm`
- panel `Gợi ý tham khảo`

Panel AI phải tách khỏi planner chính.

## Open questions cần chốt trước khi code

1. User-facing label có giữ là `Chuyến đi` hay đổi sang `Kế hoạch`?
2. Planner có cần nhiều tầng recursive thật hay giới hạn mềm 2-3 tầng?
3. Có bắt buộc phải có `day` ở level đầu không?
4. `summaryNotes` ở cấp trip có hiển thị luôn trong header hay nằm trong section riêng?
5. Phase đầu ở node có cần nhiều ảnh, hay chỉ cần `coverImageUrl`?

## Định nghĩa hoàn thành

Nhánh mở rộng frontend được xem là đi đúng hướng khi:

- trip list có card hình ảnh
- trip detail đã là planning workspace thật
- planner xem được theo danh sách cuộn
- node hiển thị được thời gian, chi phí, ghi chú, ảnh
- edit node không cần route sâu
- UI giữ được sự rõ ràng trên desktop và mobile
