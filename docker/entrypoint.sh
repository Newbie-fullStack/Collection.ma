#!/bin/sh
# Collection.ma entrypoint — runs on every container start (Fly.io machine).

set -e

cd /var/www

# Generate an application key if not provided via secrets/env
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
    php artisan key:generate --force --no-interaction
fi

# Ensure the storage <-> public symlink exists each boot
mkdir -p storage/app/public
ln -sfn /var/www/storage/app/public /var/www/public/storage

# Warm caches (idempotent; Postgres must be reachable before cache of config
# that needs DB, so config:cache may fail silently here — run again post-release).
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true

# Start the Laravel scheduler in the background
php artisan schedule:work > /dev/null 2>&1 &

# Start FrankenPHP (Caddy)
exec frankenphp run --config /var/www/Caddyfile