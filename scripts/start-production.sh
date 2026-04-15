#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common-production.sh"

load_runtime_env
ensure_node_runtime
ensure_state_dir

if [ ! -f "${APP_DIR}/dist/index.html" ]; then
  echo "dist/index.html was not found. Run pnpm build before starting production runtime." >&2
  exit 1
fi

existing_pid="$(running_pid || true)"

if [ -n "${existing_pid}" ] && kill -0 "${existing_pid}" >/dev/null 2>&1; then
  echo "${APP_NAME:-journey-frontend} is already running with PID ${existing_pid}." >&2
  exit 1
fi

port_conflict_pid="$(port_listener_pids | head -n 1 || true)"

if [ -n "${port_conflict_pid}" ]; then
  echo "${APP_NAME:-journey-frontend} cannot start because 127.0.0.1:$(app_port) is already in use by PID ${port_conflict_pid}." >&2
  echo "Run ./scripts/stop-production.sh to release the port before starting again." >&2
  exit 1
fi

cd "${APP_DIR}"
nohup setsid node scripts/serve-production.mjs </dev/null >>"${LOG_FILE}" 2>&1 &
pid="$!"
echo "${pid}" >"${PID_FILE}"

sleep 2

if ! kill -0 "${pid}" >/dev/null 2>&1; then
  echo "${APP_NAME:-journey-frontend} exited during startup. Check ${LOG_FILE}." >&2
  tail -n 50 "${LOG_FILE}" >&2 || true
  exit 1
fi

echo "${APP_NAME:-journey-frontend} started with PID ${pid}."
