#!/bin/sh
# Collection.ma entrypoint — runs on every container start (Fly.io machine).

set -e

cd /var/www

# If a command was passed (release_command = "entrypoint.sh php artisan migrate --force"),
# run it directly and exit (no persistent server). Args already include the "php artisan" prefix,
# so we exec them verbatim. Fly uses this to run migrations.
if [ -n "$1" ]; then
    exec "$@"
fi

# --- Normal web process ---

# Generate an application key if not provided via secrets/env
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
    php artisan key:generate --force --no-interaction
fi

# Ensure the storage <-> public symlink exists each boot
mkdir -p storage/app/public
ln -sfn /var/www/storage/app/public /var/www/public/storage

# The storage volume is mounted fresh/empty, so recreate Laravel's required
# runtime subdirectories on every boot.
mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

# Warm caches (idempotent; Postgres must be reachable before cache of config
# that needs DB, so config:cache may fail silently here — run again post-release).
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true

# Start the Laravel scheduler in the background
php artisan schedule:work > /dev/null 2>&1 &

# Start FrankenPHP (Caddy)
exec frankenphp run --config /var/www/Caddyfile