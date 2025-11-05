#!/bin/sh
set -euo pipefail

APP_DIR="/var/www/html"
cd "$APP_DIR"

ENV_FILE="$APP_DIR/.env"
DB_PATH="${DB_DATABASE:-$APP_DIR/database/database.sqlite}"
DB_DIR="$(dirname "$DB_PATH")"

if [ ! -f "$ENV_FILE" ]; then
  cp "$APP_DIR/.env.example" "$ENV_FILE"
fi

if grep -q '^APP_KEY=$' "$ENV_FILE" || ! grep -q '^APP_KEY=' "$ENV_FILE"; then
  php artisan key:generate --ansi --force >/dev/null
fi

mkdir -p "$DB_DIR"
if [ ! -f "$DB_PATH" ]; then
  touch "$DB_PATH"
fi

php artisan migrate --force >/dev/null 2>&1 || true

exec "$@"
