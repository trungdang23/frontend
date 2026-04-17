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
- trips list có cover image và summary notes
- trip create/edit với metadata tối giản
- trip detail đã chuyển thành planning workspace 2 cấp

Trạng thái UI hiện tại của `trips`:

- form tạo/chỉnh sửa chuyến đi chỉ còn `name`, `date range`, `budget`, `summaryNotes`, `coverImageUrl`
- `destination` và `timezone` không còn xuất hiện trong UI chính
- `Trip detail` có hero ảnh, overview, budget summary, và planner list
- form tạo địa điểm chính được ẩn mặc định, chỉ mở khi bấm CTA
- mỗi địa điểm chính và địa điểm con đều có thời gian, chi phí, ghi chú, và nhiều `imageUrl`

Điểm còn thiếu:

- planner vẫn là bridge 2 cấp dựa trên `itinerary`
- chưa có recursive planning thật
- chưa có modal/drawer editor riêng
- motion mới ở mức nhẹ, chưa có bộ animation đầy đủ cho planner

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

## 2. `Trip detail` đã trở thành planning workspace

Route giữ nguyên:

- `/app/trips/:tripId`

Vai trò của route này đã đổi từ:

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

Đã là:

- planning workspace chính
- media-first detail screen
- list-first planner với major stop và child activity

### `/app/trips/:tripId/edit`

Giữ vai trò:

- chỉnh metadata cấp trip

Không dùng route này để chỉnh planner node.

## Screen architecture mục tiêu

## 1. Trips list

Mỗi trip card nên có:

- cover image
- tên trip
- date range
- budget summary
- summary notes preview
- quick actions

Nếu chưa có ảnh:

- placeholder visual vẫn phải đủ đẹp

## 2. Trip create/edit

Metadata cấp trip nên gồm:

- name
- startDate
- endDate
- budgetAmount
- budgetCurrency
- summaryNotes
- coverImageUrl

`destination` và `timezone` vẫn có thể tồn tại ở response để giữ compatibility, nhưng không nên quay lại thành field bắt buộc của primary form.

## 3. Trip planning workspace

Trang `/app/trips/:tripId` nên có 3 vùng chính:

### Header

- cover image lớn
- title
- summary notes
- action back/edit/delete

### Overview + budget

- date range
- total budget
- total planned
- remaining budget
- total major stops
- total child activities

### Planner list

- danh sách node cuộn dọc
- CTA mở form tạo địa điểm chính
- form tạo địa điểm chính mặc định đóng
- node cha/con thể hiện bằng indentation, border, badge type, và grouped card layout

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

## Giai đoạn hiện tại

Chỉnh node bằng:

- inline editor có điều kiện trong cùng màn list

Lý do:

- tránh route sâu
- tránh modal quá nhiều khi flow còn đang thay đổi
- giữ người dùng ở ngay trong danh sách địa điểm

## Giai đoạn sau

Có thể thêm:

- modal hoặc drawer editor riêng
- drag-and-drop reorder
- expand/collapse nâng cao

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
- `destination` nullable
- `timezone` nullable

Primary UI hiện tại không yêu cầu user nhập `destination` và `timezone`.

## Planning data

Hiện tại frontend đang dùng itinerary bridge:

- `GET /trips/:tripId/itinerary`
- `POST /trips/:tripId/itinerary/days`
- `PATCH /trips/:tripId/itinerary/days/:dayId`
- `DELETE /trips/:tripId/itinerary/days/:dayId`
- `POST /trips/:tripId/itinerary/days/:dayId/activities`
- `PATCH /trips/:tripId/itinerary/days/:dayId/activities/:activityId`
- `DELETE /trips/:tripId/itinerary/days/:dayId/activities/:activityId`
- `GET /trips/:tripId/budget-summary`

Frontend sẽ dùng thêm planning API mới khi backend sẵn:

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
- `PlanNodeInlineEditor`
- `PlanNodeEditorModal` hoặc `PlanNodeEditorDrawer` ở phase sau

## Phase FE-4: image patterns

Component cần có:

- `RemoteImage`
- `ImageFallback`
- `NodeImageStrip`
- `PlanningImageGallery`

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

Status: `Completed`

Mục tiêu:

- list/detail nhìn giàu hình ảnh hơn ngay

Việc cần làm:

- mở rộng type `Trip`
- hiển thị `coverImageUrl`
- hiển thị `summaryNotes`
- thêm placeholder media card
- thêm hover motion và image reveal cho trip cards

## FE Phase B: workspace shell

Status: `Completed`

Mục tiêu:

- đổi `trip detail` thành planner shell

Việc cần làm:

- header mới
- overview + budget section gần hero
- empty state cho planner
- giữ action edit metadata riêng
- thêm page-enter motion và summary stagger

## FE Phase C: planning node CRUD

Status: `In Progress`

Mục tiêu:

- add/edit/delete node

Việc cần làm:

- query planning data
- inline editor cho major stop và child activity
- mutate node
- render hierarchy theo list
- animate add/remove/update node
- animate expand/collapse node groups

## FE Phase D: image URL display at node level

Status: `In Progress`

Mục tiêu:

- node có ảnh preview

Việc cần làm:

- node cover image
- fallback image
- multiple image URL gallery
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
3. Có bắt buộc phải có `day` ở level đầu không, hay cho phép trực tiếp nhiều địa điểm chính như hiện tại?
4. Khi chuyển sang `planning` module mới, có giữ inline editor hay chuyển hẳn sang modal/drawer?
5. Ở cấp `Trip` có cần gallery nhiều ảnh hay chỉ cần `coverImageUrl` là đủ?

## Định nghĩa hoàn thành

Nhánh mở rộng frontend được xem là đi đúng hướng khi:

- trip list có card hình ảnh
- trip detail đã là planning workspace thật
- planner xem được theo danh sách cuộn
- node hiển thị được thời gian, chi phí, ghi chú, ảnh
- edit node không cần route sâu
- UI giữ được sự rõ ràng trên desktop và mobile
