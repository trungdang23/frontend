# Frontend Phase 06 Community Minimal Backlog

## Mục tiêu

Đóng `Phase 06` của frontend để biến `community` từ teaser tĩnh thành flow có dữ liệu thật, trong khi vẫn giữ scope vừa đủ để không chặn hardening và các phase sau.

Phase này tập trung vào:

- community feed route data-driven
- post detail route data-driven
- create post flow cho user đã đăng nhập
- optional bridge `create from trip`
- loading, empty, error states rõ ràng
- reuse tối đa shared UI hiện có mà không trộn `community` với public trip pages

Phase này chưa xử lý:

- comments
- likes, reactions, bookmark
- edit/delete post
- rich text editor hoặc markdown editor phức tạp
- search, filter, tag
- profile author page
- moderation UI

## Trạng thái

- Status: `Implemented in source`
- Date: `2026-04-20`
- Owner area: `frontend/src/features/community`
- Trạng thái source hiện tại:
  - `/community` đã là feed data-driven
  - `/community/:postId` đã là detail data-driven
  - đã có API layer cho posts
  - đã có create post flow trong app shell
  - public trip sharing đã được nối sang create post qua `tripId`
  - authenticated users vẫn có quick links từ app shell để quay lại `Khám phá`, `Chuyến đi public`, và `Cộng đồng`
- Dependency chặn:
  - backend `Phase 07` phải mở `POST /posts`, `GET /posts`, `GET /posts/:postId`
  - backend phải chốt semantics cho `tripId` linked post
- Dependency mở ra sau khi xong:
  - `Phase 07 FE`
  - `Phase 08 BE`

## Quyết định rollout cần chốt

## 1. Feed và detail của community tiếp tục là public route

Giữ route public:

- `/community`
- `/community/:postId`

Lý do:

- feed community là entrypoint public tự nhiên
- không kéo guest vào protected shell
- bám đúng navigation hiện tại ở `SiteHeader`
- khi user đã đăng nhập, app shell vẫn nên giữ đường quay lại route public này để community không biến thành flow chỉ dành cho guest

## 2. Create post nên sống trong protected shell

Khuyến nghị route:

- `/app/community/new`

Không khuyến nghị nhét form create vào `/community` ngay ở phase này.

Lý do:

- boundary auth/public rõ hơn
- dễ reuse protected session và form flow
- không phá simplicity của feed public

## 3. `community` phải tách scope rõ với `public trip`

Community post có thể link tới trip public, nhưng không được trở thành một bản copy của public trip page.

Guest ở community cần thấy:

- câu chuyện/post content
- author summary
- linked trip CTA nếu có

Guest không cần thấy:

- full planner tree
- owner workspace action
- trip edit/share controls

## 4. Create post dùng form đơn giản trước

Phase này khuyến nghị form chỉ có:

- `title`
- `content`
- `coverImageUrl`
- `tripId` optional

Không làm sớm:

- markdown toolbar
- autosave draft
- multiple images
- block editor

## 5. Nếu post link trip public, UI nên có CTA mở trip

Khuyến nghị:

- card/feed/detail có section nhỏ cho linked trip
- CTA tới `/trips/:tripId`

Lý do:

- nối mạch `public trip sharing` với `community`
- giúp post có giá trị điều hướng thật

## 6. `create from trip` nên là bridge gọn, không ép trong mọi flow

Khuyến nghị:

- create page chấp nhận query `?tripId=...`
- nếu có trip public phù hợp thì prefill linked trip
- nếu query invalid thì form vẫn mở bình thường và hiển thị warning nhẹ

Điều này giúp:

- owner có thể đi từ trip detail sang create post
- nhưng create post free-form vẫn tồn tại độc lập

## Contract frontend cần bám sau Phase 06

## Route map

Public routes:

- `/community`
- `/community/:postId`

Protected route:

- `/app/community/new`

## Data sources

Frontend gọi:

- `GET /posts`
- `GET /posts/:postId`
- `POST /posts`

Nếu bridge từ trip được mở:

- route create có thể đọc `tripId` từ query string
- FE có thể reuse owner trip data hiện có để hiển thị prefill/selector khi cần

## Query keys khuyến nghị

- `["community", "posts", "list", query]`
- `["community", "posts", "detail", postId]`

Create mutation thành công phải invalidate:

- community list
- linked detail nếu cần redirect/hydrate

## Create form shape

Khuyến nghị FE gửi:

```json
{
  "title": "Ba ngày ở Hoi An để đi chậm lại",
  "content": "Mình đi theo nhịp rất nhẹ...",
  "coverImageUrl": "https://example.com/posts/hoi-an-cover.jpg",
  "tripId": "optional-trip-id"
}
```

## Error semantics FE phải bám

- `404` ở detail:
  - render post not found state
- generic fetch error:
  - render retry state
- create `401`:
  - dùng session/auth handling hiện có
- create `400` với linked trip private:
  - render field/form error rõ ràng

## Slice FE-06A - Route wiring và API layer

### Việc cần làm

- [x] Giữ `/community` là route public data-driven
- [x] Giữ `/community/:postId` là route public data-driven
- [x] Thêm route protected `/app/community/new`
- [x] Tạo API client cho:
  - `listPosts`
  - `getPostDetail`
  - `createPost`
- [x] Tạo query keys riêng cho community
- [x] Giữ API layer community tách khỏi trips/public-trips

### File dự kiến

- `src/app/router/app-routes.tsx`
- `src/features/community/api/posts-api.ts`
- `src/features/community/lib/community-query-keys.ts`

## Slice FE-06B - Community feed data-driven

### Việc cần làm

- [x] Thay feed mock ở `/community` bằng data từ API
- [x] Render card cho post với:
  - title
  - content preview
  - cover image nếu có
  - author display name
  - linked trip badge/CTA nếu có
- [x] Empty state rõ ràng khi chưa có post
- [x] Loading skeleton phù hợp với public pages
- [x] Generic fetch error state có retry
- [x] Chốt responsive mobile/desktop tốt

### File dự kiến

- `src/features/community/routes/community-page.tsx`
- `src/features/community/components/community-post-list.tsx`
- `src/features/community/components/community-post-card.tsx`
- `src/shared/ui/public-page-skeleton.tsx` nếu cần variant mới

## Slice FE-06C - Post detail data-driven

### Việc cần làm

- [x] Thay placeholder `/community/:postId` bằng detail thật
- [x] Render đầy đủ:
  - title
  - cover image
  - content
  - author
  - createdAt
  - linked trip CTA nếu có
- [x] Tạo state riêng cho:
  - loading
  - not found
  - retry
- [x] Không render action mutate trong public detail

### File dự kiến

- `src/features/community/routes/community-post-page.tsx`
- `src/features/community/components/community-post-detail.tsx`

## Slice FE-06D - Create post flow trong app shell

### Việc cần làm

- [x] Tạo screen `/app/community/new`
- [x] Form fields:
  - title
  - content
  - coverImageUrl
  - linked trip optional
- [x] Validate client-side tối thiểu:
  - title required
  - content required
  - coverImageUrl valid URL nếu có
- [x] Submit dùng mutation `createPost`
- [x] Success redirect về `/community/:postId`
- [x] Error state rõ ràng ở form
- [x] Không yêu cầu rich editor trong phase này

### File dự kiến

- `src/features/community/routes/community-create-page.tsx`
- `src/features/community/components/community-post-form.tsx`
- `src/shared/i18n/locales/vi.json`
- `src/shared/i18n/locales/en.json`

## Slice FE-06E - Trip-to-post bridge

### Việc cần làm

- [x] Cho phép `/app/community/new?tripId=...`
- [x] Prefill linked trip nếu query hợp lệ
- [x] Nếu linked trip invalid/private:
  - không crash form
  - hiện warning/form error rõ ràng
- [x] Khuyến nghị thêm CTA từ trip owner page sang create post khi trip đang public
- [x] Không ép mọi post phải link trip

### File dự kiến

- `src/features/community/routes/community-create-page.tsx`
- `src/features/trips/routes/trip-detail-page.tsx`
- `src/features/trips/components/*` nếu cần CTA phụ

## Slice FE-06F - Tests, docs, regression safety

### Component / route tests

- [x] `/community` render được feed thật
- [x] `/community` render empty state khi chưa có post
- [x] `/community/:postId` render được detail thật
- [x] `/community/:postId` render not found state cho `404`
- [x] `/app/community/new` submit create thành công
- [x] create form hiển thị lỗi khi linked trip invalid/private
- [x] linked trip CTA chỉ hiện khi post có linked trip

### Docs

- [x] Cập nhật checklist phase sau khi implementation chốt
- [x] Cập nhật route plan nếu route `/app/community/new` được giữ
- [x] Ghi rõ comments vẫn deferred

### File dự kiến

- `src/tests/community-page.test.tsx`
- `src/tests/community-post-page.test.tsx`
- `src/tests/community-create-page.test.tsx`
- `documents/01_frontend-phase-checklist.md`
- `documents/04_frontend-route-and-screen-plan.md`

## UX copy cần có trong phase này

- community feed title/description
- empty state khi chưa có post
- not found state cho post detail
- create post CTA
- success message sau khi publish
- validation errors cho title/content/cover URL
- warning khi linked trip không hợp lệ hoặc chưa public
- CTA mở linked trip public

## Validation matrix của phase này

- feed/detail community vẫn là public route
- create post là protected route
- community detail không render trip-owner controls
- linked trip là optional
- linked trip CTA chỉ hiện khi backend trả trip summary
- `community` không kéo full planner vào cùng màn
- `404` detail và generic fetch error phải tách state

## Deferred rõ ràng sau phase này

- comments
- likes/reactions/bookmarks
- edit/delete post
- author profile page
- rich text editor
- search/filter/tag
- moderation UI
- feed ranking/personalization

## Definition of done cho Phase 06

Phase này chỉ được gọi là done khi:

- `/community` đã là feed data-driven thật
- `/community/:postId` đã là detail thật
- user đã đăng nhập tạo được post qua flow `/app/community/new`
- linked trip là optional và không làm crash create flow
- post có linked trip thì guest mở tiếp được `/trips/:tripId`
- comments được ghi rõ là deferred
- test đã có cho feed/detail/create và các state chính
