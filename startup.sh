#!/bin/bash
set -e

export PYTHONPATH="${PYTHONPATH}:$(pwd)"
mkdir -p /home/data
export SQLITE_DB_PATH="${SQLITE_DB_PATH:-/home/data/deviations.db}"
export PORT="${PORT:-8000}"

exec gunicorn \
  -w "${WEB_CONCURRENCY:-4}" \
  -k uvicorn.workers.UvicornWorker \
  api.server:app \
  --bind "0.0.0.0:${PORT}" \
  --timeout 180 \
  --access-logfile - \
  --error-logfile -
