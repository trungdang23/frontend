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

## Accessibility

- Focus ring phải luôn nhìn thấy được.
- Form error phải có text cụ thể.
- Contrast không phụ thuộc vào blur hoặc ảnh nền.
- Hover effect luôn cần fallback usable trên touch device.

## Nội dung và ngôn ngữ

- Ưu tiên tiếng Việt cho copy chính nếu product đang đi theo hướng đó.
- Giữ nhất quán thuật ngữ như `chuyến đi`, `lịch trình`, `ngân sách`.
- Nếu sau này có song ngữ, text phải đi qua layer config chứ không hardcode khắp component.

## Anti-pattern cần tránh

- Giao diện giống admin panel generic.
- Lạm dụng gradient hoặc blur ở mọi block.
- Một màn hình có quá nhiều CTA ngang vai nhau.
- Dùng màu trạng thái không nhất quán giữa screen.
- Dùng demo copy trực tiếp mà không chuẩn hóa content production.
