# STAGE 1: Generate Wayfinder routes using PHP
FROM php:8.4-cli AS wayfinder-generator

WORKDIR /app

# Install git and unzip for Composer
RUN apt-get update && apt-get install -y git unzip && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Copy PHP dependencies first
COPY composer.json composer.lock ./

# Install PHP dependencies (we need wayfinder package)
# Use --ignore-platform-reqs to skip ext-gd and other extensions not needed for route generation
RUN sed 's_@php artisan package:discover_/bin/true_;' -i composer.json \
    && composer install --ignore-platform-reqs --no-dev --no-scripts --optimize-autoloader

# Copy application code needed for route generation
COPY app/ ./app/
COPY bootstrap/ ./bootstrap/
RUN rm -f bootstrap/cache/*.php
COPY config/ ./config/
COPY routes/ ./routes/
COPY artisan ./

# Create storage directories required by Laravel
RUN mkdir -p storage/framework/cache/data \
    && mkdir -p storage/framework/sessions \
    && mkdir -p storage/framework/views \
    && mkdir -p storage/logs

# Generate Wayfinder routes with form variants
RUN php artisan wayfinder:generate --with-form

# ----------------------------------------------------------------

# STAGE 2: Build Frontend Assets
FROM node:lts-bookworm AS frontend-builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Copy only dependency manifests first to leverage Docker cache
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Install all dependencies (including devDependencies needed for building)
RUN pnpm install --frozen-lockfile

# Copy source code required for the build process
COPY resources/ ./resources/
COPY vite.config.ts tsconfig.json components.json ./

# Copy generated Wayfinder routes from the PHP stage
COPY --from=wayfinder-generator /app/resources/js/actions ./resources/js/actions
COPY --from=wayfinder-generator /app/resources/js/routes ./resources/js/routes
COPY --from=wayfinder-generator /app/resources/js/wayfinder ./resources/js/wayfinder

# No need to skip wayfinder plugin now, but keep it for safety
ENV DOCKER_BUILD=true
RUN pnpm build

# ----------------------------------------------------------------

# STAGE 2: Build the Final Production Image
# This image contains the PHP app, the Node.js runtime (for SSR),
# and the pre-built assets from the previous stage.
FROM php:8.4-fpm-bookworm

WORKDIR /var/www

# --- ROOT-LEVEL TASKS ---
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    postgresql-client \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip \
    && pecl install redis \
    && docker-php-ext-enable redis

COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
COPY --from=frontend-builder /usr/local/ /usr/local/
RUN corepack enable

RUN chown www-data:www-data /var/www

# --- SWITCH TO NON-ROOT USER ---
USER www-data

# --- APPLICATION TASKS (as www-data) ---
# 1. Copy and install PHP dependencies
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN sed 's_@php artisan package:discover_/bin/true_;' -i composer.json \
    && COMPOSER_MEMORY_LIMIT=-1 composer install --ignore-platform-req=php --no-dev --no-scripts --no-interaction --prefer-dist --verbose \
    && COMPOSER_MEMORY_LIMIT=-1 composer dump-autoload --optimize --no-interaction --verbose

COPY --chown=www-data:www-data package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --prod --frozen-lockfile

COPY --chown=www-data:www-data . .

COPY --from=frontend-builder /app/public/build ./public/build

# Finalize composer and set permissions
RUN php artisan package:discover --ansi \
    && composer clear-cache \
    && mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x artisan

# --- FINAL ROOT-LEVEL TASKS ---
USER root

COPY ./scripts/php-entrypoint /usr/local/bin/php-entrypoint
RUN chmod +x /usr/local/bin/php-entrypoint

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/php-entrypoint"]
CMD ["php-fpm"]