# Frontend Production Deploy Runbook

## Mục tiêu

- Đồng bộ cách deploy `frontend/` với `backend`.
- Giữ source code frontend trên máy đích, nhưng không còn phụ thuộc vào SSH hay `cloudflared access ssh`.
- Giữ toàn bộ build-time và runtime config trên GitHub `Environment variables`.

## Kiến trúc deploy hiện tại

- Workflow: `.github/workflows/deploy-frontend.yml`
- Kiểu deploy: manual qua `workflow_dispatch`
- Kiểu thực thi deploy: self-hosted runner Linux/X64 trên chính máy đích
- App frontend public:
  - `buicojourney.com -> http://localhost:3000`
  - `www.buicojourney.com -> http://localhost:3000`
- Deploy machine giữ source repo tại `DEPLOY_PATH`
- Workflow render `.env.production` trên runner rồi ghi trực tiếp vào `RUNTIME_ENV_PATH`
- Workflow sync source checkout vào `DEPLOY_PATH`, sau đó:
  - `pnpm install`
  - source env thật
  - `pnpm build`
  - `bash ./scripts/restart-production.sh`

## GitHub configuration bắt buộc

### Environment variables

- `DEPLOY_PATH`
- `RUNTIME_ENV_PATH`
- `SERVICE_RESTART_COMMAND`
- `RUNTIME_APP_NAME`
- `RUNTIME_APP_HOST`
- `RUNTIME_APP_PORT`
- `RUNTIME_VITE_API_BASE_URL`
- `RUNTIME_VITE_APP_ENV`

### Environment variables tùy chọn

- `DEPLOY_VERIFY_URL`

Frontend hiện không cần deploy secret riêng nếu đã chuyển sang self-hosted runner và không còn copy file qua SSH.

## Giá trị đề xuất cho máy hiện tại

```text
DEPLOY_PATH=/home/trungdang/apps/journey-frontend
RUNTIME_ENV_PATH=/home/trungdang/apps/journey-frontend/.env.production
SERVICE_RESTART_COMMAND=bash ./scripts/restart-production.sh
RUNTIME_APP_NAME=journey-frontend
RUNTIME_APP_HOST=127.0.0.1
RUNTIME_APP_PORT=3000
RUNTIME_VITE_API_BASE_URL=https://api.buicojourney.com/api/v1
RUNTIME_VITE_APP_ENV=production
DEPLOY_VERIFY_URL=https://buicojourney.com/health
```

## Self-hosted runner cần có

1. Một self-hosted runner Linux/X64 online trên chính máy deploy.
2. Runner user có quyền ghi vào:
   - `/home/trungdang/apps/journey-frontend`
   - `/home/trungdang/apps/journey-frontend/.env.production`
   - `${XDG_STATE_HOME:-$HOME/.local/state}/journey-frontend`
3. Runner có sẵn:
   - `git`
   - `rsync`
   - `node`
   - `pnpm`

## Cloudflare vẫn cần cho public traffic

Deploy frontend không còn đi qua Cloudflare SSH, nhưng public domain vẫn cần tunnel/ingress đúng:

- `buicojourney.com -> http://localhost:3000`
- `www.buicojourney.com -> http://localhost:3000`
- `api.buicojourney.com -> http://localhost:3001`

## Runtime scripts trên máy đích

Frontend có các script:

- `scripts/start-production.sh`
- `scripts/stop-production.sh`
- `scripts/restart-production.sh`
- `scripts/check-production-health.sh`

`stop-production.sh` sẽ cố dọn cả process đang giữ `APP_PORT` kể cả khi PID file cũ bị mất, để lượt restart sau reboot hoặc deploy dễ tự phục hồi hơn.

## Quy trình deploy lặp lại

1. Push code lên branch mong muốn.
2. Vào repo `frontend` trên GitHub.
3. Mở workflow `deploy-frontend`.
4. Chạy `Run workflow`.
5. Chọn `ref`.
6. Workflow sẽ verify trên GitHub-hosted runner, rồi deploy trên self-hosted runner.
7. Mở:
   - `https://buicojourney.com`
   - `https://www.buicojourney.com`
8. Test:
   - landing
   - login
   - register
   - me/profile
   - refresh session
   - logout
   - đổi ngôn ngữ `VI/EN`

## Kiểm tra sau reboot

### Local trên máy đích

```bash
cd /home/trungdang/apps/journey-frontend
bash ./scripts/check-production-health.sh
```

### Public

```bash
curl -I https://buicojourney.com
curl https://buicojourney.com/health
```

## Các lỗi có thể gặp và cách xử lý

### Runner ở trạng thái offline

Nguyên nhân:

- runner service chưa chạy
- WSL/Linux instance chưa bật
- machine đang sleep hoặc offline

Khắc phục:

- bật lại machine hoặc WSL
- start lại runner service
- xác nhận runner hiện `Idle` hoặc `Online` trong GitHub

### `rsync is required on the self-hosted runner`

Nguyên nhân:

- runner host chưa có `rsync`

Khắc phục:

- cài `rsync` trên WSL/Linux

### `RUNTIME_ENV_PATH points to a directory`

Nguyên nhân:

- khai báo `RUNTIME_ENV_PATH` sai thành thư mục

Khắc phục:

- sửa về file path thật, ví dụ `/home/trungdang/apps/journey-frontend/.env.production`

### `dist/index.html was not found`

Nguyên nhân:

- build chưa tạo được output hoặc build fail trước đó

Khắc phục:

- xem log `pnpm build`
- kiểm tra `RUNTIME_VITE_API_BASE_URL` và các env build-time
- chạy lại workflow sau khi sửa lỗi build

## Kết luận vận hành

- Frontend deploy không còn phụ thuộc vào SSH/Cloudflare Access.
- Độ ổn định của deploy giờ nằm ở self-hosted runner, filesystem local, và runtime scripts.
- Cloudflare vẫn chỉ còn vai trò public ingress cho domain thật.
