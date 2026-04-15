#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common-production.sh"

load_runtime_env

pid="$(running_pid || true)"

if [ -z "${pid}" ]; then
  echo "${APP_NAME:-journey-frontend} is not running."
  exit 0
fi

if ! kill -0 "${pid}" >/dev/null 2>&1; then
  rm -f "${PID_FILE}"
  echo "Removed stale PID file for ${APP_NAME:-journey-frontend}."
  exit 0
fi

kill "${pid}"

for _ in $(seq 1 20); do
  if ! kill -0 "${pid}" >/dev/null 2>&1; then
    rm -f "${PID_FILE}"
    echo "${APP_NAME:-journey-frontend} stopped."
    exit 0
  fi

  sleep 1
done

kill -9 "${pid}" >/dev/null 2>&1 || true
rm -f "${PID_FILE}"
echo "${APP_NAME:-journey-frontend} was force stopped."
