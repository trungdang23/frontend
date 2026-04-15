#!/usr/bin/env bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/journey-frontend"
readonly PID_FILE="${STATE_DIR}/journey-frontend.pid"
readonly LOG_FILE="${STATE_DIR}/journey-frontend.log"
readonly RUNTIME_ENV_FILE="${RUNTIME_ENV_PATH:-${APP_DIR}/.env.production}"

load_runtime_env() {
  if [ -f "${RUNTIME_ENV_FILE}" ]; then
    set -a
    . "${RUNTIME_ENV_FILE}"
    set +a
  fi
}

ensure_state_dir() {
  mkdir -p "${STATE_DIR}"
}

health_url() {
  printf 'http://127.0.0.1:%s/health' "${APP_PORT:-3000}"
}

app_port() {
  printf '%s' "${APP_PORT:-3000}"
}

running_pid() {
  if [ -f "${PID_FILE}" ]; then
    cat "${PID_FILE}"
  fi
}

port_listener_pids() {
  local port
  port="$(app_port)"

  if command -v lsof >/dev/null 2>&1; then
    lsof -tiTCP:"${port}" -sTCP:LISTEN 2>/dev/null | sed '/^$/d' | sort -u
    return
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltnp "sport = :${port}" 2>/dev/null | perl -ne 'print "$1\n" while /pid=(\d+)/g' | sed '/^$/d' | sort -u
    return
  fi

  if command -v fuser >/dev/null 2>&1; then
    fuser -n tcp "${port}" 2>/dev/null | tr ' ' '\n' | sed '/^$/d' | sort -u
  fi
}

wait_for_pid_exit() {
  local pid="$1"
  local attempts="${2:-20}"

  for _ in $(seq 1 "${attempts}"); do
    if ! kill -0 "${pid}" >/dev/null 2>&1; then
      return 0
    fi

    sleep 1
  done

  return 1
}

stop_pid_gracefully() {
  local pid="$1"
  local label="${2:-process}"

  if ! kill -0 "${pid}" >/dev/null 2>&1; then
    return 0
  fi

  kill "${pid}" >/dev/null 2>&1 || true

  if wait_for_pid_exit "${pid}"; then
    echo "${label} stopped."
    return 0
  fi

  kill -9 "${pid}" >/dev/null 2>&1 || true
  wait_for_pid_exit "${pid}" 5 || true
  echo "${label} was force stopped."
}

ensure_node_runtime() {
  if command -v node >/dev/null 2>&1; then
    return
  fi

  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

  if [ -s "${NVM_DIR}/nvm.sh" ]; then
    . "${NVM_DIR}/nvm.sh"
    nvm use 20.20.2 >/dev/null 2>&1 || nvm use default >/dev/null 2>&1 || true
  fi

  if ! command -v node >/dev/null 2>&1; then
    echo "node was not found in PATH. Ensure nvm or Node.js runtime is available on the deploy machine." >&2
    exit 1
  fi
}
