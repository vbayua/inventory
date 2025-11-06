#!/bin/sh
set -euo pipefail

APP_DIR="/var/www/html"
cd "$APP_DIR"

ENV_FILE="$APP_DIR/.env"
DB_PATH="${DB_DATABASE:-$APP_DIR/database/database.sqlite}"
DB_DIR="$(dirname "$DB_PATH")"

run_as_app_user() {
  if [ "$(id -u)" -eq 0 ]; then
    gosu www-data "$@"
  else
    "$@"
  fi
}

ensure_app_ownership() {
  if [ "$(id -u)" -eq 0 ]; then
    chown www-data:www-data "$@"
  fi
}

if [ "$(id -u)" -eq 0 ]; then
  install -d -o www-data -g www-data "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" "$DB_DIR"
  chown -R www-data:www-data "$DB_DIR"
else
  mkdir -p "$DB_DIR"
fi

if [ ! -f "$ENV_FILE" ]; then
  cp "$APP_DIR/.env.example" "$ENV_FILE"
fi
ensure_app_ownership "$ENV_FILE"

if grep -q '^APP_KEY=$' "$ENV_FILE" || ! grep -q '^APP_KEY=' "$ENV_FILE"; then
  run_as_app_user php artisan key:generate --ansi --force >/dev/null
fi

if [ ! -f "$DB_PATH" ]; then
  run_as_app_user touch "$DB_PATH"
  ensure_app_ownership "$DB_PATH"
fi

run_as_app_user php artisan migrate --force >/dev/null 2>&1 || true

if [ "$(id -u)" -eq 0 ]; then
  exec gosu www-data "$@"
else
  exec "$@"
fi
