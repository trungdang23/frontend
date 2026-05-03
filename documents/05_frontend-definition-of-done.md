# Frontend Definition Of Done

## Mục tiêu

- Chốt tiêu chuẩn hoàn thành cho frontend sau khi chuyển sang hướng `Digital Scrapbook`.
- Tránh tình trạng "đẹp hơn" nhưng chưa usable, chưa persist được, hoặc chưa đúng boundary sản phẩm.

## Một fixed-layout screen được xem là xong khi

- Có route hoặc entrypoint rõ ràng
- Hierarchy và primary action rõ ràng
- Responsive tốt trên mobile và desktop
- Có state `loading`, `error`, `empty` nếu màn có dữ liệu động
- Copy không còn placeholder ngẫu nhiên
- Dùng semantic markup hợp lý

## Một journal viewer được xem là xong khi

- Render đúng scene đã lưu
- `rotation`, `zIndex`, `scale` hoạt động đúng
- Layout không drift khi mở ở viewport khác
- Ảnh, sticker, text, tape render đúng thứ tự lớp
- Read-only mode không phụ thuộc editor controls

## Một journal editor được xem là xong khi

- Có thể chọn object
- Có thể kéo object
- Có thể resize object
- Có thể rotate object
- Có thể đổi layer order
- Có thể xóa/nhân đôi object
- Có dirty state và save state rõ ràng
- Reload lại vẫn ra đúng layout vừa lưu
- Không lưu object theo pixel viewport hiện tại

## Một feature API-driven được xem là xong khi

- Đã bám contract backend thật hoặc contract proposed được đánh dấu rõ
- Error handling nhất quán
- Invalidation/refetch rõ ràng
- Không leak raw API response khắp tree component
- Không trộn structured planner data và freeform journal scene vào cùng một abstraction mơ hồ

## Một feature planner được xem là xong khi

- Là structured workspace, không bị ép thành scrapbook editor
- Dữ liệu load/save đúng contract planner hoặc bridge đang được phê duyệt
- Budget/planning information đọc rõ
- Route planner tách biệt với route journal
- Nếu còn dùng compatibility route, docs và tests phải ghi rõ target canonical route và route đang chạy thật

## Một mốc rebuild được xem là xong khi

- Checklist rebuild đã tick theo artifact thật
- Docs phản ánh đúng trạng thái source
- Các verify tối thiểu của package đã pass
- Route model, architecture, và API plan không mâu thuẫn nhau
- Deferred items được ghi rõ

## Checklist verify tối thiểu

- `pnpm lint`
- `pnpm test:run`
- `pnpm build`
- smoke flow chính nếu route liên quan đã tồn tại

## Điều không được coi là done

- Chỉ có mockup đẹp nhưng chưa có save/load cycle
- Chỉ kéo thả được trong một viewport nhưng reload sang viewport khác là lệch layout
- Chỉ có fixed-layout page đẹp nhưng journal editor chưa có boundary rõ
- Đổi DB/platform sớm hơn nhu cầu thực tế rồi gọi đó là "đã chốt foundation"
- Dùng một page canvas chung cho mọi màn rồi gọi đó là consistent architecture
