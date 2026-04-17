# Frontend Design Principles

## Mục tiêu

- Giữ visual language có cá tính riêng, không rơi về generic dashboard.
- Bám tinh thần của `UI_demo.txt` nhưng chuyển thành hệ thống production có thể scale.
- Giữ sự nhất quán giữa public marketing surface và protected workspace.

## Hướng thẩm mỹ tổng thể

- `Nature-inspired editorial`
- `Warm travel journal`
- `Photo-led storytelling`
- `Soft rounded surfaces`
- `Selective glassmorphism`, không lạm dụng blur ở mọi nơi

## Từ khóa thị giác

- bình yên
- khám phá
- thủ công
- ấm áp
- đáng tin
- giàu hình ảnh

## Nguyên tắc thiết kế giao diện

### 1. Một màn hình, một trọng tâm

- Mỗi screen phải có primary action rõ.
- Landing ưu tiên CTA và storytelling.
- Dashboard ưu tiên trạng thái chuyến đi và CTA tạo chuyến đi.

### 2. Typography phải có chủ đích

- Heading dùng scale rõ ràng, không dùng nhiều cỡ gần nhau.
- Body text tối ưu readability hơn là trang trí.
- Không để font stack mặc định làm UI mất cá tính.
- Baseline hiện tại dùng `Plus Jakarta Sans` cho cả heading và body để giữ giao diện đồng nhất trên nhiều máy.

### 3. Color system theo token

- Màu nền thiên sáng và ấm.
- Màu chính gợi thiên nhiên, không quá corporate.
- Màu nhấn dùng có tiết chế để điều hướng mắt.

## Seed tokens từ reference hiện tại

| Token | Giá trị seed | Vai trò |
| --- | --- | --- |
| `color.primary` | `#546B41` | CTA chính, heading, brand anchor |
| `color.accent` | `#99AD7A` | hover, highlight, success accent |
| `color.sand` | `#DCCCAC` | border mềm, surface detail |
| `color.surface` | `#FFFFFF` với opacity có kiểm soát | card và elevated panels |

## Nguyên tắc layout

- Mobile-first.
- Khoảng trắng rộng nhưng có kỷ luật.
- Card bo tròn lớn là motif chính, nhưng chỉ dùng khi có chủ đích.
- Container width và spacing phải đi qua scale chung.

## Nguyên tắc component

- Button, input, card, dialog, toast, navbar, và empty state phải có primitive dùng lại.
- Không tạo style riêng cho từng screen nếu biến thể chỉ khác nhẹ.
- Component public và protected có thể dùng cùng token nhưng khác mức density.

## Motion

- Motion phải phục vụ định hướng và feedback.
- Ưu tiên reveal nhẹ, hover rõ, transition có nhịp.
- Tránh micro-interaction dày đặc khiến app nặng và rối.

## Motion system định hướng

### 1. Motion phải có vai trò rõ ràng

- hướng mắt người dùng tới vùng nội dung mới
- giúp phân biệt `enter`, `exit`, `expand`, `collapse`, `save success`
- làm giao diện bớt tĩnh mà không biến app thành một màn hình phô diễn hiệu ứng

### 2. Ưu tiên motion theo lớp

Frontend nên có tối thiểu 4 lớp motion:

- `page-enter motion`
- `card/list motion`
- `overlay motion`
- `feedback motion`

### 3. Page-enter motion

Nên có:

- fade + translate nhẹ khi vào screen mới
- stagger nhẹ cho section chính
- hero image hoặc cover image có scale-in rất nhỏ

Không nên:

- animate toàn bộ màn hình quá dài
- chặn thao tác chỉ để chờ animation

### 4. Card và list motion

Nên có:

- hover lift nhẹ cho trip card
- shadow shift nhẹ khi hover
- image zoom rất nhỏ khi hover card có ảnh
- stagger khi list planner hoặc trip list xuất hiện lần đầu
- smooth expand/collapse cho section planner

Không nên:

- bounce liên tục
- hover effect quá mạnh làm lệch layout

### 5. Overlay motion

Modal, drawer, side panel nên có:

- opacity fade cho backdrop
- slide hoặc scale có kiểm soát cho panel
- thời lượng ngắn và nhất quán

### 6. Feedback motion

Nên có:

- skeleton shimmer
- success state chuyển mượt
- optimistic insert/remove trong planner list
- smooth layout transition khi thêm/xóa node

### 7. Motion cho planner mới

Planner là khu vực nên có motion rõ nhất trong protected app:

- node mới chèn vào list phải có enter animation
- node bị xóa phải có exit animation
- expand/collapse node con phải có height + opacity transition
- reorder về sau nên có drag ghost và layout shift mượt

### 8. Motion và hiệu năng

- ưu tiên `transform` và `opacity`
- tránh animate `height` trên khối lớn trừ expand/collapse có giới hạn
- tránh blur nặng và shadow đậm trên quá nhiều item cùng lúc
- list dài cần cẩn thận với stagger để không làm app chậm

### 9. Motion và accessibility

- tôn trọng `prefers-reduced-motion`
- khi reduced motion bật:
  - bỏ stagger dài
  - bỏ parallax
  - giữ transition chức năng ở mức tối thiểu

### 10. Tính cách motion mong muốn

- mềm
- có nhịp
- tự nhiên
- thiên cảm giác travel journal hiện đại

Không nên:

- flashy
- game-like
- techno quá mạnh

## Accessibility

- Focus ring phải luôn nhìn thấy được.
- Form error phải có text cụ thể.
- Contrast không phụ thuộc vào blur hoặc ảnh nền.
- Hover effect luôn cần fallback usable trên touch device.

## Nội dung và ngôn ngữ

- Ưu tiên tiếng Việt cho copy chính nếu product đang đi theo hướng đó.
- Giữ nhất quán thuật ngữ như `chuyến đi`, `lịch trình`, `ngân sách`.
- Nếu sau này có song ngữ, text phải đi qua layer config chứ không hardcode khắp component.
- Locale hiện được tách thành file JSON theo ngôn ngữ để tránh trộn tiếng Việt và tiếng Anh trong cùng một flow.

## Anti-pattern cần tránh

- Giao diện giống admin panel generic.
- Lạm dụng gradient hoặc blur ở mọi block.
- Một màn hình có quá nhiều CTA ngang vai nhau.
- Dùng màu trạng thái không nhất quán giữa screen.
- Dùng demo copy trực tiếp mà không chuẩn hóa content production.
