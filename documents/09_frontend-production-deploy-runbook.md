# Frontend Production Deploy Runbook

## Mục tiêu

- Đồng bộ cách deploy `frontend/` với `backend`.
- Giữ source code frontend trên máy đích, nhưng không còn phụ thuộc vào SSH hay `cloudflared access ssh`.
- Giữ toàn bộ build-time và runtime config trên GitHub `Environment variables`.

## Checklist hardening verify sau deploy

- [x] Giữ local runtime verification trên self-hosted runner là tín hiệu blocking chính của workflow.
- [x] Giữ public domain verification để phát hiện lỗi ingress thật, nhưng không để lỗi Cloudflare/tunnel chặn deploy app đã restart thành công.
- [x] Ghi rõ trong runbook khi nào cần ưu tiên kiểm tra runtime local và khi nào cần điều tra tunnel/public ingress.

## Kiến trúc deploy hiện tại

- Workflow: `.github/workflows/deploy-frontend.yml`
- Kiểu deploy chính: tự động khi `push` vào `main`
- Fallback deploy: manual qua `workflow_dispatch`
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
- Workflow vẫn có public-domain verification qua `DEPLOY_VERIFY_URL`, nhưng bước này chỉ còn vai trò advisory để phát hiện lỗi Cloudflare/tunnel sớm mà không chặn deploy app đã restart thành công.
- Sau khi self-hosted job kết thúc, workflow còn có một delayed local runtime verification riêng trên self-hosted runner để bắt lỗi runtime chết sau deploy mà không phụ thuộc vào Cloudflare challenge

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

`DEPLOY_VERIFY_URL` hiện là advisory-only. Nếu URL này lỗi do Cloudflare/public ingress nhưng local runtime vẫn healthy, workflow vẫn cho phép deploy hoàn tất và yêu cầu operator điều tra ingress riêng.

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

`start-production.sh` sẽ clear `RUNNER_TRACKING_ID` nếu được gọi từ self-hosted GitHub Actions runner, để process frontend không bị runner cleanup sau khi job kết thúc.

## Quy trình deploy lặp lại

1. Push code đã chốt lên `main`.
2. GitHub Actions sẽ tự chạy `deploy-frontend`.
3. Workflow sẽ verify trên GitHub-hosted runner, rồi deploy trên self-hosted runner.
4. Nếu cần redeploy lại một ref cũ hoặc chạy lại sau khi runner bị lỗi, vào repo `frontend` trên GitHub rồi dùng `Run workflow`.
5. Mở:
   - `https://buicojourney.com`
   - `https://www.buicojourney.com`
6. Test:
   - landing
   - login
   - register
   - me/profile
   - refresh session
   - logout
   - đổi ngôn ngữ `VI/EN`

## Post-deploy checklist tối thiểu

Sau mỗi deploy production, ưu tiên verify nhanh:

1. mở landing tại `/`
2. đăng nhập từ `/auth/login`
3. mở `/community`
4. mở `/trips`
5. mở một public trip detail/planner read-only
6. đăng xuất và xác nhận quay lại flow public/auth

Nếu đang verify phase budget hardening, bổ sung thêm một trip có planner cost để rà lại budget summary owner flow.

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

### Push `main` nhưng deploy không tự chạy

Nguyên nhân:

- workflow đang bị disable
- push không vào đúng branch `main`
- self-hosted runner đang offline nên run bị kẹt

Khắc phục:

- kiểm tra tab `Actions`
- xác nhận commit đã vào `main`
- xác nhận runner online
- nếu cần, dùng `Run workflow` để redeploy thủ công

### Deploy báo xanh nhưng public domain rơi `502` ngay sau đó

Nguyên nhân hay gặp:

- frontend process được start từ self-hosted runner nhưng bị runner cleanup sau khi job kết thúc
- port `APP_PORT` còn bị chiếm bởi process cũ trong lúc restart

Khắc phục:

- đảm bảo `SERVICE_RESTART_COMMAND` đang dùng `bash ./scripts/restart-production.sh`
- giữ `scripts/start-production.sh` ở phiên bản đã clear `RUNNER_TRACKING_ID` trước khi detach process
- chạy:
  - `bash ./scripts/restart-production.sh`
  - `bash ./scripts/check-production-health.sh`
  - `curl -I https://buicojourney.com/health`

### Public domain trả `530`, `1033`, hoặc `The origin has been unregistered from Argo Tunnel`

Nguyên nhân hay gặp:

- `cloudflared` process trên Windows còn tồn tại nhưng tunnel `journey-backend` không còn active connection với Cloudflare
- Cloudflare còn nhìn thấy hostname nhưng không chạm được origin/tunnel đúng cách

Ảnh hưởng trong workflow:

- bước public ingress verification sẽ báo warning
- delayed local runtime verification vẫn tiếp tục chạy và mới là blocking gate cho deploy app

Khắc phục:

- chạy `pnpm status` trong `backend/` để kiểm tra trạng thái tunnel thật
- nếu tunnel không có active connection, chạy lại `pnpm up` trong `backend/` để recycle `cloudflared`

## Kết luận vận hành

- Frontend deploy không còn phụ thuộc vào SSH/Cloudflare Access.
- Độ ổn định của deploy giờ nằm ở self-hosted runner, filesystem local, và runtime scripts.
- Cloudflare vẫn chỉ còn vai trò public ingress cho domain thật.
