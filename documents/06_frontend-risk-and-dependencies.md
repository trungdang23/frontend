# Frontend Risk And Dependencies

## Mục tiêu

- Chỉ ra dependency thật cho lần rebuild frontend.
- Đánh giá rủi ro chính của hướng `Digital Scrapbook`.
- Giữ team tập trung vào đúng vấn đề cần giải thay vì đổi platform vô tội vạ.

## Dependency hiện có

### Từ source/frontend

- shared API client còn sống
- auth/session modules còn sống
- `trips`, `community`, i18n baseline còn sống
- runtime UI đã có homepage, community, auth, planner compatibility flow, profile, và journal placeholder route
- planner hiện dùng `PlanNode` API client riêng qua compatibility route `/app/planner?tripId=...`
- journal scene renderer/editor vẫn chưa có

### Từ backend

- backend đang đi theo `NestJS + Prisma + PostgreSQL`
- auth, trips, planner `PlanNode`, budget summary, public trips/planner, posts, và itinerary compatibility bridge đã có nền
- journal API riêng chưa có trong repo hiện tại

### Từ product direction

- brand mới là `Digital Scrapbook`
- chỉ journal là freeform
- planner vẫn là structured workspace

## Rủi ro chính

### 1. Scope nổ vì cố biến mọi page thành scrapbook

- Nếu home/community/planner/profile đều chuyển sang object-based layout tự do, frontend sẽ thành editor platform thay vì web app.
- Rủi ro này lớn nhất vì nó phá cả UX lẫn timeline.

Hướng xử lý:

- khóa rõ `journal-only freeform`
- các page còn lại dùng fixed-layout

### 2. Dùng sai mô hình dữ liệu cho journal

- Nếu lưu object theo pixel viewport hiện tại, layout sẽ drift giữa desktop và mobile.
- Nếu scene payload không versioned, nâng schema về sau sẽ rất đau.

Hướng xử lý:

- canonical page space
- `sceneVersion`
- object schema tối thiểu rõ ràng

### 3. Chuyển sang Mongo quá sớm

- Journal có dữ liệu linh hoạt không đồng nghĩa toàn bộ sản phẩm cần NoSQL.
- Đổi từ `Prisma + PostgreSQL` sang nền khác là chi phí nền tảng lớn hơn giá trị hiện tại.

Hướng xử lý:

- giữ `PostgreSQL`
- dùng `JSONB` cho scene
- chỉ mở lại câu hỏi Mongo khi scope editor thay đổi mạnh

### 4. Journal editor trở thành "mini Figma" ngoài ý muốn

- Càng thêm group, path draw, collaborative cursor, comment pin, smart guides, history stack phức tạp, scope càng trượt.

Hướng xử lý:

- giới hạn object types phase đầu
- làm renderer trước editor nâng cao
- chốt non-goals trong backlog

### 5. Mobile editor khó usable nếu không thiết kế riêng

- Kéo thả/rotate trong màn hình nhỏ rất dễ gây bực.
- Nếu chỉ dựng desktop rồi thu nhỏ, mobile edit sẽ rất tệ.

Hướng xử lý:

- dùng page scale + zoom/pan
- inspector dạng bottom sheet
- ưu tiên một bộ thao tác tối thiểu nhưng ổn định

### 6. Docs có thể lại drift khỏi source

- Repo vừa reset UI, nên nếu docs lại mô tả app như một hệ hoàn chỉnh trong khi source chưa scaffold lại, team sẽ lạc hướng lần nữa.

Hướng xử lý:

- xem docs là source of truth
- cập nhật checklist/backlog cùng lúc với các quyết định lớn

### 7. Planner và journal dễ bị trộn boundary

- Nếu planner cũng bị kéo theo freeform visual layer, dữ liệu có cấu trúc sẽ khó đọc.
- Nếu journal lại bị ép vào form/list cứng, mất đúng lý do tồn tại của feature.

Hướng xử lý:

- route tách riêng
- planner dùng structured layout
- journal dùng scene model riêng

## Dependency mở cần theo dõi

- contract backend cuối cùng cho journal pages
- asset upload/storage provider
- quyết định cutover từ compatibility route `/app/planner?tripId=...` sang canonical `/app/trips/:tripId/planner`
- deploy smoke checklist sau khi canonical planner/journal routes hoặc journal renderer lên đầy đủ

## Điều cần giữ kỷ luật

- không dùng editor runtime cho toàn bộ site
- không mở rộng thêm `trip-planning-api.ts` như hub cho journal
- không đổi database platform trước khi object schema và API boundary được chốt
- không để visual motif lấn át readability

## Kết luận

- Rủi ro lớn nhất không phải là thiếu công nghệ mới; rủi ro lớn nhất là chọn sai boundary sản phẩm.
- Nếu giữ chắc ba quyết định này:
  - chỉ journal freeform
  - planner/journal tách route
  - `PostgreSQL + JSONB` là nền lưu trữ hiện tại

thì giai đoạn rebuild sẽ thực tế và kiểm soát được hơn nhiều.
