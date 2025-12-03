# syntax=docker/dockerfile:1

FROM composer:2 AS vendor
WORKDIR /var/www/html

COPY composer.json composer.lock ./
COPY artisan ./
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY routes ./routes
RUN composer config platform.php 8.3 && composer install --no-dev --optimize-autoloader --no-interaction --no-progress

FROM node:20 AS frontend
WORKDIR /var/www/html

COPY package.json package-lock.json ./
RUN npm config delete proxy && npm config delete https-proxy && npm config set strict-ssl false && npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 600000 && npm ci

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
        gosu \
    && docker-php-ext-configure zip \
    && docker-php-ext-install pdo pdo_sqlite zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=vendor /usr/bin/composer /usr/local/bin/composer

COPY . ./
COPY --from=vendor /var/www/html/vendor ./vendor
COPY --from=frontend /var/www/html/public/build ./public/build
RUN install -d -m 775 -o www-data -g www-data storage/database && \
      cp database.sqlite storage/database/database.sqlite && \
      chown www-data:www-data storage/database/database.sqlite
RUN mkdir -p \
      storage/framework/cache/data \
      storage/framework/sessions \
      storage/framework/views \
      storage/logs \
      storage/database \
    && chown -R www-data:www-data storage bootstrap/cache database

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

EXPOSE 8080

ENTRYPOINT ["entrypoint"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
