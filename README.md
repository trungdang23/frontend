# Journey Frontend

Frontend package cho sản phẩm `journey`.

## Trạng thái hiện tại

- `frontend/` hiện chưa được scaffold source app thực tế.
- Giai đoạn hiện tại tập trung vào planning và chốt baseline để tránh làm frontend theo kiểu "đi tới đâu sửa tới đó".
- Các tài liệu trong `documents/` là nguồn tham chiếu chính trước khi bắt đầu scaffold.

## Bộ tài liệu planning

- `documents/00_frontend-foundation.md`
- `documents/01_frontend-phase-checklist.md`
- `documents/02_frontend-stack-decision.md`
- `documents/03_frontend-design-principles.md`
- `documents/04_frontend-route-and-screen-plan.md`
- `documents/05_frontend-api-integration-plan.md`
- `documents/06_frontend-app-architecture.md`
- `documents/07_frontend-definition-of-done.md`
- `documents/08_frontend-risk-and-dependencies.md`

## Giả định nền cho kế hoạch hiện tại

- `UI_demo.txt` là reference về concept và visual direction, không phải source code production.
- Backend production hiện đã sẵn auth flow thật với:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
  - `POST /auth/refresh`
- Các phase `trips`, `itineraries`, `budgets`, và `community` của backend vẫn là dependency cho các phase frontend tương ứng.

## Mục tiêu của bộ planning này

- Chốt cấu trúc tài liệu và roadmap cho frontend trước khi viết code.
- Chốt nguyên tắc thiết kế và kiến trúc app ở mức đủ rõ để scaffold một lần cho đúng.
- Chỉ ra rõ phần nào có thể làm ngay với backend hiện tại và phần nào cần chờ backend phase tiếp theo.

## Bước tiếp theo sau bộ planning

1. Review và chốt stack frontend.
2. Scaffold app trong `frontend/`.
3. Dựng design tokens, app shell, auth flow, và dashboard empty state trước.
4. Chỉ mở các màn phụ thuộc `trips/community` khi backend phase tương ứng đã sẵn contract thật.
