# backend/docker/wait-and-start.sh

#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   /app/docker/wait-and-start.sh [mode]
# modes: (none) -> start backend (entrypoint.sh logic), "celery", "beat", "flower" -> start corresponding service
MODE=${1:-}

# Wait for init marker
echo "=> waiting for init marker /app/shared_state/.init_done ..."
for i in $(seq 1 300); do
  if [ -f /app/shared_state/.init_done ]; then
    echo "=> init marker found"
    break
  fi
  sleep 1
done

if [ ! -f /app/shared_state/.init_done ]; then
  echo "ERROR: init did not finish within timeout"; exit 1
fi

# Now choose what to run
if [ "$MODE" = "celery" ]; then
  echo "=> starting celery worker"
  exec celery -A pet_project worker -l info
elif [ "$MODE" = "beat" ]; then
  echo "=> starting celery beat"
  exec celery -A pet_project beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
elif [ "$MODE" = "flower" ]; then
  echo "=> starting flower"
  exec celery -A pet_project flower --port=5555
else
  echo "=> starting backend (entrypoint.sh)"
  exec /app/entrypoint.sh
fi
