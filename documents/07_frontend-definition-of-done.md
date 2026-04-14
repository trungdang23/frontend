# Frontend Definition Of Done

## Mục tiêu

- Chốt tiêu chuẩn hoàn thành cho screen, feature, và phase frontend.
- Đảm bảo khi bắt đầu code, team có chung cách hiểu về "xong".

## Một screen được xem là xong khi

- Có route hoặc entrypoint rõ ràng
- Có state `loading`, `error`, và `empty` nếu màn hình có dữ liệu động
- Responsive dùng được trên mobile và desktop
- Primary action rõ ràng
- Keyboard navigation dùng được
- Focus states nhìn thấy được
- Copy không còn ở trạng thái placeholder ngẫu nhiên

## Một feature API-driven được xem là xong khi

- Đã dùng contract backend thật hoặc mock có chủ đích được ghi rõ
- Có xử lý lỗi API nhất quán
- Có retry/refresh behavior phù hợp nếu phụ thuộc auth
- Không leak raw API response trực tiếp ra khắp component tree
- Query/mutation invalidation hoạt động đúng

## Một feature auth được xem là xong khi

- Login thành công và vào protected area đúng
- Register thành công theo đúng contract hiện tại
- Reload trang vẫn boot lại session hợp lệ
- Session hết hạn thì refresh hoặc logout đúng kỳ vọng
- Unauthorized state không làm app rơi vào vòng lặp vô hạn

## Một shared component được xem là xong khi

- Có API props đủ rõ
- Không buộc screen khác copy-paste style riêng
- Có biến thể tối thiểu cần thiết
- Dùng lại được ở ít nhất hai ngữ cảnh hợp lý hoặc là primitive rõ ràng

## Một phase được xem là xong khi

- Checklist phase đã được tick theo artifact thực tế
- Các screen chính của phase đã chạy được
- Các kiểm tra tối thiểu của package đã pass
- Tài liệu kế hoạch hoặc README đã được cập nhật nếu cần
- Không còn blocker ẩn bị đẩy sang phase sau mà không ghi chú

## Checklist verify tối thiểu sau khi scaffold frontend

- lint
- unit/component tests liên quan
- build
- smoke e2e cho flow trọng yếu nếu đã có

## Điều không được coi là done

- Chỉ dựng UI tĩnh không có luồng thật nhưng báo là hoàn thành
- Chỉ chạy local happy path mà không có empty/error state
- Có route nhưng chưa có auth guard hoặc session handling cần thiết
- Dùng mock data cho feature production mà không ghi rõ
