# Frontend Risk And Dependencies

## Mục tiêu

- Chỉ ra dependency thật giữa frontend roadmap và backend roadmap mới
- Tránh việc FE build theo DRD nhưng BE vẫn đang ở source bridge cũ

## Dependency chính từ backend

### Đã có baseline

- auth register
- auth login
- auth me
- auth refresh
- auth logout
- trips CRUD baseline
- trip `visibility`
- trip `budgetMode/manualBudget`
- planner APIs trên `PlanNode`
- planner workspace đã cutover sang `PlanNode`
- budget summary baseline

### Còn thiếu để aligned với DRD

- budget summary cutover khỏi itinerary bridge
- public trip read
- posts APIs
- comments APIs nếu mở trong MVP social

## Rủi ro chính

## 1. DRD mới và source hiện tại đang lệch nhau

- DRD muốn `PlanNode`
- source planner chính đã dùng `PlanNode`, nhưng một số docs cũ vẫn còn mô tả itinerary bridge như flow chính

Nếu docs không được re-baseline, thứ tự ưu tiên rất dễ bị kéo lệch sang backlog cũ thay vì gap thật còn lại là `budget/public/community`.

## 2. Planner tree rất dễ bị build quá tay

Các phần chưa nên làm sớm:

- drag-and-drop nhiều tầng
- route sâu cho từng node
- animation nặng
- modal lồng modal

FE phải ưu tiên:

- render tree ổn định
- inline CRUD
- empty/loading/error states

## 3. `budgetMode/manualBudget` có thể làm trip form vỡ nếu không chốt contract trước

Trước khi sửa form, FE cần chốt:

- field names
- validation rules
- response mapping

## 4. Public trip và community rất dễ bị trộn scope

Hai lớp này khác nhau:

- public trip = share planner
- post = social content

Nếu không tách rõ, FE sẽ build một màn nửa trip detail nửa post detail.

## 5. Session localStorage vẫn là tradeoff có chủ đích

- Đây là hướng bám DRD hiện tại
- Không phải security-optimal dài hạn
- Khi backend đổi sang cookie-based refresh, FE phải revisit toàn bộ session pipeline

## 6. Community UI dễ bị hiểu nhầm là production-ready quá sớm

Nếu backend mới chỉ có feed/list cơ bản:

- phải gắn scope rõ
- không thêm like/follow/reaction giả lập

## 7. Motion dễ làm che mất tiến độ

Motion cần đi sau:

- contract ổn
- state management ổn
- layout ổn

Không được để motion trở thành blocker cho planner CRUD.

## Dependency order khuyến nghị

1. BE chốt trip contract mới
2. FE cập nhật trip form/list/detail
3. BE mở planner APIs trên `PlanNode`
4. FE chuyển workspace sang planner APIs
5. BE chuyển budget summary sang `PlanNode`
6. BE mở public trip read
7. FE mở share/public trip UI
8. BE mở posts
9. FE mở community data-driven

## Stop conditions nên ghi rõ

- Nếu BE chưa chốt planner response shape:
  - FE chưa build tree renderer production
- Nếu BE chưa chốt trip budget fields:
  - FE chưa merge form `manualBudget`
- Nếu BE chưa có public trip read:
  - FE không nên giả public page bằng mock
- Nếu BE chưa cutover budget summary khỏi itinerary bridge:
  - FE không nên coi budget widget hiện tại là aligned hoàn toàn với DRD

## Những việc không nên làm tiếp theo

- Không mở rộng itinerary UI như thể đó là target lâu dài
- Không build community interactive trước khi có API thật
- Không giữ placeholder mà không ghi rõ là placeholder
- Không để route `/app/trips/:tripId` vừa là metadata detail vừa là planner tree vừa là post view
