# syntax=docker/dockerfile:1

FROM composer:2 AS vendor
WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

FROM node:20 AS frontend
WORKDIR /var/www/html

COPY package.json package-lock.json ./
RUN npm ci

COPY resources ./resources
COPY tsconfig.json vite.config.ts components.json ./
COPY eslint.config.js ./
RUN npm run build

FROM php:8.3-fpm AS app
WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        sqlite3 \
        libsqlite3-dev \
    && docker-php-ext-configure zip \
    && docker-php-ext-install pdo pdo_sqlite zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=vendor /usr/bin/composer /usr/local/bin/composer

COPY . ./
COPY --from=vendor /var/www/html/vendor ./vendor
COPY --from=frontend /var/www/html/public/build ./public/build

RUN mkdir -p storage/database \
    && chown -R www-data:www-data storage bootstrap/cache database

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

USER www-data

EXPOSE 8000

ENTRYPOINT ["entrypoint"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
