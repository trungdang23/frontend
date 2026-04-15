#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common-production.sh"

load_runtime_env

pid="$(running_pid || true)"
stopped_anything=false

if [ -n "${pid}" ]; then
  if kill -0 "${pid}" >/dev/null 2>&1; then
    stop_pid_gracefully "${pid}" "${APP_NAME:-journey-frontend} (PID ${pid})"
    stopped_anything=true
  else
    echo "Removed stale PID file for ${APP_NAME:-journey-frontend}."
  fi

  rm -f "${PID_FILE}"
fi

while IFS= read -r listener_pid; do
  if [ -z "${listener_pid}" ]; then
    continue
  fi

  if [ -n "${pid}" ] && [ "${listener_pid}" = "${pid}" ]; then
    continue
  fi

  if kill -0 "${listener_pid}" >/dev/null 2>&1; then
    stop_pid_gracefully "${listener_pid}" "${APP_NAME:-journey-frontend} port listener PID ${listener_pid}"
    stopped_anything=true
  fi
done < <(port_listener_pids)

if [ "${stopped_anything}" = false ]; then
  echo "${APP_NAME:-journey-frontend} is not running."
fi
