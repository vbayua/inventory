#!/bin/sh
set -euo pipefail

APP_DIR="/var/www/html"
cd "$APP_DIR"

ENV_FILE="$APP_DIR/.env"
DB_PATH="${DB_DATABASE:-$APP_DIR/storage/database/database.sqlite}"
DB_DIR="$(dirname "$DB_PATH")"

# Directories Laravel needs writable
REQUIRED_DIRS="$APP_DIR/storage \
  $APP_DIR/storage/framework \
  $APP_DIR/storage/framework/cache \
  $APP_DIR/storage/framework/cache/data \
  $APP_DIR/storage/framework/sessions \
  $APP_DIR/storage/framework/views \
  $APP_DIR/storage/logs \
  $APP_DIR/bootstrap/cache \
  $DB_DIR"

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

# Helper to upsert keys in .env without duplicating
set_env_kv() {
  key="$1"; val="$2"
  if grep -q "^$key=" "$ENV_FILE"; then
    sed -i "s|^$key=.*|$key=$val|" "$ENV_FILE"
  else
    printf "%s=%s\n" "$key" "$val" >> "$ENV_FILE"
  fi
  ensure_app_ownership "$ENV_FILE"
}

# Ensure directories exist and are owned by www-data
if [ "$(id -u)" -eq 0 ]; then
  install -d -m 775 -o www-data -g www-data $REQUIRED_DIRS
  chown -R www-data:www-data "$APP_DIR/storage" "$APP_DIR/bootstrap/cache" "$DB_DIR"
else
  mkdir -p $REQUIRED_DIRS
fi

if [ ! -f "$ENV_FILE" ]; then
  cp "$APP_DIR/.env.example" "$ENV_FILE"
fi
ensure_app_ownership "$ENV_FILE"

# Force the DB path into .env so Laravel reads the correct sqlite file
set_env_kv DB_CONNECTION sqlite
set_env_kv DB_DATABASE "$DB_PATH"

# Clear any cached config/routes/views so new env vars take effect
run_as_app_user php artisan optimize:clear >/dev/null 2>&1 || true

if grep -q '^APP_KEY=$' "$ENV_FILE" || ! grep -q '^APP_KEY=' "$ENV_FILE"; then
  run_as_app_user php artisan key:generate --ansi --force >/dev/null
fi

# Ensure sqlite file exists and link default path to it (defensive)
if [ ! -f "$DB_PATH" ]; then
  run_as_app_user touch "$DB_PATH"
  ensure_app_ownership "$DB_PATH"
fi

# Skip seeding/copying a prebuilt sqlite database; rely on migrations to initialize schema

mkdir -p "$APP_DIR/database"
if [ "$DB_PATH" != "$APP_DIR/database/database.sqlite" ]; then
  ln -sf "$DB_PATH" "$APP_DIR/database/database.sqlite"
  ensure_app_ownership "$APP_DIR/database/database.sqlite"
fi
# No seeding from image; database will be created empty and migrations can populate schema

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  run_as_app_user php artisan migrate --force
fi

if [ "$(id -u)" -eq 0 ]; then
  exec gosu www-data "$@"
else
  exec "$@"
fi
