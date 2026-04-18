# Frontend Definition Of Done

## Mục tiêu

- Chốt tiêu chuẩn hoàn thành cho frontend theo DRD và user stories mới

## Một screen được xem là xong khi

- Có route hoặc entrypoint rõ ràng
- Có state `loading`, `error`, và `empty` nếu màn có dữ liệu động
- Primary action rõ ràng
- Keyboard navigation dùng được
- Responsive dùng được trên mobile và desktop
- Copy không còn placeholder ngẫu nhiên

## Một feature API-driven được xem là xong khi

- Đã dùng contract backend thật
- Nếu còn dùng bridge tạm, tài liệu phải ghi rõ đó là bridge
- Có xử lý lỗi API nhất quán
- Có invalidation hoặc refresh behavior đúng
- Không leak raw response ra khắp tree component

## Một feature auth được xem là xong khi

- login thành công
- register thành công
- reload vẫn boot lại session
- refresh hoạt động đúng
- logout clear session đúng
- unauthorized không tạo loop

## Một feature trip được xem là xong khi

- form create/edit bám đúng field theo DRD
- validation bám đúng rule theo DRD
- list/detail phản ánh đúng contract backend

## Một feature planner được xem là xong khi

- dùng planner APIs trên `PlanNode`
- render full tree
- add/edit/delete node chạy end-to-end
- không cần route sâu cho node
- loading dùng skeleton
- error có toast/banner + retry

## Một phase được xem là xong khi

- Checklist phase đã tick theo artifact thật
- Các flow chính của phase đã chạy end-to-end
- Các verify tối thiểu của package đã pass
- Tài liệu integration/plan/checklist đã cập nhật
- Deferred items đã được ghi rõ

## Checklist verify tối thiểu

- lint
- tests liên quan
- build
- smoke flow chính nếu phase đã có UI thật

## Điều không được coi là done

- Chỉ có UI đẹp nhưng chưa nối contract thật
- Chỉ có placeholder nhưng không ghi rõ
- Vẫn bám itinerary bridge cho flow chính nhưng gọi đó là planner aligned với DRD
- Có motion nhưng thiếu loading/error/empty states
