# Frontend Preview Deploy Runbook

## Mục tiêu

- Chuẩn hóa cách deploy `frontend/` lên môi trường preview bằng GitHub Actions.
- Giữ toàn bộ build-time config của frontend nằm trên GitHub `Variables` và `Secrets`.
- Không hardcode deploy env thật trong source.

## Kiến trúc deploy hiện tại

- Workflow: `.github/workflows/deploy-frontend.yml`
- Kiểu deploy: manual qua `workflow_dispatch`
- Build location: GitHub Actions runner
- Deploy transport: `Cloudflare Tunnel` + `cloudflared access ssh`
- Kết quả deploy: upload static artifact `dist/` vào `PUBLISH_PATH` trên máy đích

## GitHub Secrets bắt buộc

- `CLOUDFLARE_ACCESS_CLIENT_ID`
- `CLOUDFLARE_ACCESS_CLIENT_SECRET`
- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `SSH_KNOWN_HOSTS`

Các secret này có thể dùng cùng giá trị với repo backend nếu frontend deploy về cùng máy và cùng SSH endpoint.

## GitHub Variables bắt buộc

- `RUNTIME_VITE_API_BASE_URL`
- `RUNTIME_VITE_APP_ENV`
- `PUBLISH_PATH`

## GitHub Variables tùy chọn

- `DEPLOY_VERIFY_URL`

## Ví dụ giá trị

### Build-time env

- `RUNTIME_VITE_API_BASE_URL=https://api.buicojourney.com/api/v1`
- `RUNTIME_VITE_APP_ENV=preview`

### Publish target

- `PUBLISH_PATH=/mnt/c/xampp/htdocs/buicojourney-preview`
- `DEPLOY_VERIFY_URL=https://preview.buicojourney.com`

`PUBLISH_PATH` nên trỏ vào thư mục mà web server thật đang phục vụ. Nếu dùng Apache/XAMPP trên Windows, đường dẫn qua WSL thường có dạng `/mnt/c/...`.

## Web server gợi ý

- File mẫu Apache SPA vhost: `deploy/apache/frontend-static-vhost.conf.example`
- Nếu dùng Apache/XAMPP, cần bật `mod_rewrite`
- Document root của virtual host phải trỏ tới đúng thư mục publish thật

## Quy trình deploy

1. Vào repo `frontend` trên GitHub.
2. Kiểm tra `Secrets` và `Variables` đã đủ.
3. Mở workflow `deploy-frontend`.
4. Chạy `Run workflow`.
5. Chọn `ref` muốn deploy.
6. Workflow sẽ:
   - checkout đúng ref
   - lấy `VITE_*` từ GitHub Variables
   - `pnpm install`
   - `pnpm lint`
   - `npm test -- --run`
   - `pnpm build`
   - đóng gói `dist/`
   - upload artifact lên máy đích qua SSH
   - thay thế thư mục publish cũ bằng bản mới
   - gọi `DEPLOY_VERIFY_URL` nếu biến này được set

## Kiểm tra sau deploy

- Mở domain preview thật
- Kiểm tra landing page tải được asset mới
- Test:
  - đổi ngôn ngữ `VI/EN`
  - `login`
  - `register`
  - refresh trang tại route protected
  - logout

## Nguyên tắc quan trọng

- Không commit `.env.production` vào repo.
- Không hardcode `VITE_API_BASE_URL` thật trong source.
- `.env.example` chỉ là template local, không đại diện cho env deploy.
- Nếu đổi API base URL production hoặc preview, hãy sửa GitHub Variable chứ không sửa source code.
