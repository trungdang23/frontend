# Frontend Production Deploy Runbook

## Mục tiêu

- Đồng bộ cách deploy `frontend/` với `backend`.
- Giữ source code frontend trên máy đích, deploy bằng `git pull` và build trực tiếp trên máy đích.
- Giữ toàn bộ build-time và runtime config trên GitHub `Variables` và `Secrets`.
- Giữ hostname và deploy keys ổn định qua nhiều lần deploy hoặc sau reboot máy.

## Kiến trúc deploy hiện tại

- Workflow: `.github/workflows/deploy-frontend.yml`
- Kiểu deploy: manual qua `workflow_dispatch`
- Deploy transport: `Cloudflare Tunnel` + `cloudflared access ssh`
- SSH hostname ổn định: `ssh.buicojourney.com`
- App frontend public:
  - `buicojourney.com -> http://localhost:3000`
- `www.buicojourney.com -> http://localhost:3000`
- Deploy machine giữ source repo tại `DEPLOY_PATH`
- Workflow render `.env.production` trên GitHub runner rồi copy lên `RUNTIME_ENV_PATH`
- Nếu `DEPLOY_PATH` chưa là git repo, workflow sẽ tự `git init`, gắn `origin` qua `git@github.com`, fetch đúng `ref`, rồi checkout lần đầu
- Máy đích chạy:
  - `git fetch`
  - `git checkout`
  - `git pull`
  - `pnpm install`
  - source env thật
  - `pnpm build`
  - `bash ./scripts/restart-production.sh`

## GitHub Secrets bắt buộc

- `CLOUDFLARE_ACCESS_CLIENT_ID`
- `CLOUDFLARE_ACCESS_CLIENT_SECRET`
- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `SSH_KNOWN_HOSTS`

Các secret này có thể dùng cùng giá trị với repo backend.

## GitHub Variables bắt buộc

- `DEPLOY_PATH`
- `RUNTIME_ENV_PATH`
- `SERVICE_RESTART_COMMAND`
- `RUNTIME_APP_NAME`
- `RUNTIME_APP_HOST`
- `RUNTIME_APP_PORT`
- `RUNTIME_VITE_API_BASE_URL`
- `RUNTIME_VITE_APP_ENV`

## GitHub Variables tùy chọn

- `DEPLOY_VERIFY_URL`

## Giá trị đề xuất cho máy hiện tại

### Secrets

- `SSH_HOST=ssh.buicojourney.com`
- `SSH_PORT=22`
- `SSH_USER=trungdang`

### Variables

- `DEPLOY_PATH=/home/trungdang/apps/journey-frontend`
- `RUNTIME_ENV_PATH=/home/trungdang/apps/journey-frontend/.env.production`
- `SERVICE_RESTART_COMMAND=bash ./scripts/restart-production.sh`
- `RUNTIME_APP_NAME=journey-frontend`
- `RUNTIME_APP_HOST=127.0.0.1`
- `RUNTIME_APP_PORT=3000`
- `RUNTIME_VITE_API_BASE_URL=https://api.buicojourney.com/api/v1`
- `RUNTIME_VITE_APP_ENV=production`
- `DEPLOY_VERIFY_URL=https://buicojourney.com/health`

## Cloudflare cần có

### Tunnel routes

Thêm vào config tunnel ổn định hiện tại:

- `ssh.buicojourney.com -> ssh://localhost:22`
- `api.buicojourney.com -> http://localhost:3001`
- `buicojourney.com -> http://localhost:3000`
- `www.buicojourney.com -> http://localhost:3000`

File mẫu tham chiếu:

- `deploy/cloudflare/journey-frontend-config.yml.example`

### Access policy cho SSH hostname

Tại Access app của `ssh.buicojourney.com`:

- giữ policy `Service Auth` cho GitHub Actions
- có thể giữ thêm policy user-based riêng cho SSH thủ công

## Runtime scripts trên máy đích

Frontend có các script:

- `scripts/start-production.sh`
- `scripts/stop-production.sh`
- `scripts/restart-production.sh`
- `scripts/check-production-health.sh`

`stop-production.sh` sẽ cố dọn cả process đang giữ `APP_PORT` kể cả khi PID file cũ bị mất, để lượt restart sau reboot hoặc deploy dễ tự phục hồi hơn.

Sau reboot, nếu bạn chỉ muốn bật lại frontend runtime bằng một lệnh trên máy đích:

```bash
cd /home/trungdang/apps/journey-frontend
bash ./scripts/restart-production.sh
```

Nếu chạy từ Windows như backend, có thể dùng:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\TrungDang\journey\frontend\scripts\windows\start-personal-server.ps1
```

## Public domain sau deploy

Khi deploy xong và tunnel routes đúng:

- `https://buicojourney.com`
- `https://www.buicojourney.com`

frontend sẽ tự phục vụ toàn bộ SPA routes, kể cả refresh ở:

- `/auth/login`
- `/auth/register`
- `/app`
- `/app/profile`

## Quy trình deploy lặp lại

### Bootstrap lần đầu

Không bắt buộc phải SSH vào máy để `git clone` tay nữa. Nếu `DEPLOY_PATH` chưa có `.git`, workflow sẽ tự bootstrap repo ở đúng thư mục đó trong lần deploy đầu tiên.

Điều kiện để bootstrap thành công:

- user chạy deploy trên máy đích phải có GitHub SSH access tới repo `frontend`
- phần này nên dùng cùng cấu hình SSH GitHub đang deploy được cho `backend`

Trường hợp ngoại lệ:

- `DEPLOY_PATH` phải là thư mục source dành riêng cho frontend; không nên đặt file tay như `index.html` hay static publish cũ trong đó
- workflow bootstrap đầu tiên sẽ dùng `git checkout -f`, nên file local cũ đang chặn branch checkout có thể bị ghi đè
- nếu bạn paste `SERVICE_RESTART_COMMAND` từ môi trường Windows, workflow vẫn sẽ tự bỏ ký tự `CRLF` thừa trước khi chạy
- nếu máy đích chưa có GitHub SSH key hoặc key chưa được cấp quyền vào repo `frontend`, `git fetch` sẽ fail ngay từ lần bootstrap đầu tiên

## Quy trình deploy lặp lại

1. Push code lên branch mong muốn.
2. Vào repo `frontend` trên GitHub.
3. Mở workflow `deploy-frontend`.
4. Chạy `Run workflow`.
5. Chọn `ref`.
6. Nếu code chưa merge vào `main`, phải nhập đúng tên branch đang chứa code cần deploy, ví dụ `codex/scaffold-frontend-foundation`.
7. Workflow sẽ verify rồi deploy lên máy đích.
8. Mở:
   - `https://buicojourney.com`
   - `https://www.buicojourney.com`
9. Test:
   - landing
   - login
   - register
   - me/profile
   - refresh session
   - logout
   - đổi ngôn ngữ `VI/EN`

## Nguyên tắc ổn định qua reboot

- Không đổi `SSH_HOST`, `SSH_PORT`, `SSH_USER`
- Không đổi `SSH_PRIVATE_KEY` nếu chưa chủ động rotate key
- Không đổi `Cloudflare Service Token` nếu chưa chủ động rotate token
- Không đổi hostname public nếu vẫn dùng:
  - `ssh.buicojourney.com`
  - `api.buicojourney.com`
  - `buicojourney.com`
  - `www.buicojourney.com`

Nghĩa là:

- reboot máy không buộc đổi key
- deploy mới không buộc đổi key
- chỉ cần đảm bảo:
  - frontend runtime start lại
  - cloudflared tunnel start lại

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
