# Frontend Risk And Dependencies

## Mục tiêu

- Chỉ ra dependency thật giữa frontend redesign và backend contract hiện tại
- Giữ repo sạch mà không xóa nhầm phần nền kỹ thuật vẫn còn giá trị

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
- budget summary baseline
- public trip read
- posts APIs

### Còn mở

- budget summary hardening và mixed-currency runtime verify
- cleanup legacy itinerary/budget bridge
- comments APIs nếu social scope mở rộng sau này

## Rủi ro chính

## 1. Redesign rất dễ đụng nhầm contract thay vì chỉ đổi presentation

- UI đổi toàn bộ rất dễ kéo theo việc đổi route, query shape, hoặc wording của contract
- nếu không khóa rõ boundary, FE sẽ tự tạo breaking change không cần thiết

FE nên giữ:

- endpoint
- auth/session pipeline
- route semantics ở mức sản phẩm

FE chỉ nên thay:

- visual system
- component structure
- screen composition
- navigation feel

## 2. Xóa presentation cũ quá sớm sẽ làm app gãy build

- nếu xóa hàng loạt page/component cũ trước khi route mới sẵn, app sẽ không chạy được
- cleanup code nên đi theo từng route hoặc từng screen group

Thứ tự an toàn:

1. dọn docs
2. viết screen map mới
3. dựng primitives mới
4. cutover route mới
5. xóa file UI cũ sau khi route tương ứng đã thay xong

## 3. Legacy planner/budget bridge dễ sống dai

- `src/features/trips/api/trip-planning-api.ts` hiện không còn phù hợp làm file trung tâm cho UI mới
- nếu không tách phần `budget-summary` ra rõ, file này sẽ giữ lại rất nhiều noise itinerary cũ

## 4. Docs cũ dễ làm team đi nhầm hướng

- nếu vẫn giữ đầy backlog phase cũ, repo sẽ nặng và mâu thuẫn với redesign reset
- source of truth nên rút về một bộ docs active nhỏ

## 5. Tests dễ gãy vì structure/copy thay đổi hàng loạt

- phần này là bình thường trong redesign
- điều cần giữ là scenario behavior, không phải selector hoặc text cũ

## 6. Session localStorage vẫn là tradeoff có chủ đích

- Đây là hướng bám contract hiện tại
- Không phải security-optimal dài hạn
- Khi backend đổi sang cookie-based refresh, FE phải revisit toàn bộ session pipeline

## Điều nên giữ khi cleanup

- deploy runbook
- env/runtime conventions
- API integration plan
- app architecture
- definition of done
- redesign backlog hiện hành

## Điều không nên xóa ngay

- auth/session infrastructure
- router foundation
- API client và feature APIs
- tests behavior-level còn dùng được
