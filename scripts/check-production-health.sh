#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common-production.sh"

load_runtime_env

attempts="${1:-20}"
delay_seconds="${2:-1}"
url="$(health_url)"

for _ in $(seq 1 "${attempts}"); do
  if curl --fail --silent --show-error "${url}" >/dev/null; then
    echo "${APP_NAME:-journey-frontend} health check passed at ${url}."
    exit 0
  fi

  sleep "${delay_seconds}"
done

echo "${APP_NAME:-journey-frontend} health check failed at ${url}." >&2
exit 1
