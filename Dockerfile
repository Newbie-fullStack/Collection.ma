# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: Build the React SPA frontend
# ---------------------------------------------------------------------------
FROM node:22-alpine AS frontend-builder
WORKDIR /build/frontend

# frontend/package.json + lock are inside the frontend folder
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# The built SPA is emitted to /build/frontend/dist
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Install backend PHP dependencies (no dev)
# ---------------------------------------------------------------------------
FROM composer:2 AS composer-builder
WORKDIR /app
COPY composer.json composer.lock ./
# --no-autoloader: the real autoloader is generated in the final image
# from the actual source tree (psr-4 mappings need the source files).
RUN composer install --no-dev --prefer-dist --no-scripts --no-autoloader \
    --ignore-platform-reqs

# ---------------------------------------------------------------------------
# Stage 3: Final FrankenPHP image
# ---------------------------------------------------------------------------
FROM dunglas/frankenphp:1.3-php8.3-alpine

# Required extensions for Laravel + this app
RUN install-php-extensions \
    pdo_pgsql \
    pgsql \
    intl \
    bcmath \
    gd \
    exif \
    pcntl \
    zip \
    mbstring

ENV COMPOSER_ALLOW_SUPERUSER=1

# Composer binary needed for dump-autoload in image 3
COPY --from=composer-builder /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy built frontend into /web (served as SPA root)
COPY --from=frontend-builder /build/frontend/dist /web

# Copy backend application
COPY --from=composer-builder /app/vendor /var/www/vendor
COPY . /var/www

# storage symlink: let Laravel serve uploaded files under /storage
RUN mkdir -p /var/www/storage/app/public \
    && mkdir -p /var/www/bootstrap/cache \
    && mkdir -p /var/www/storage/logs \
    && mkdir -p /var/www/storage/framework/{cache,views,sessions} \
    && ln -sfn /var/www/storage/app/public /var/www/public/storage

# Regenerate the optimized autoloader from the real source tree
RUN composer dump-autoload --optimize --no-dev --no-scripts

# Regenerate package discovery (excludes dev-only providers like Pail/Sail)
RUN php artisan package:discover --ansi

# FrankenPHP serves index.php via Caddy configured in the Caddyfile
ENV APP_ENV=production

# Entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["entrypoint.sh"]