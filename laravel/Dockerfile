# STAGE 1: Build PHP dependencies (isolated for caching)
FROM php:8.4-cli AS php-deps-builder

WORKDIR /app

# Install extension installer for fast, pre-built binaries
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Install git and unzip for Composer
RUN apt-get update && apt-get install -y --no-install-recommends git unzip && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Copy PHP dependencies first
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN sed 's_@php artisan package:discover_/bin/true_;' -i composer.json \
    && COMPOSER_MEMORY_LIMIT=-1 composer install --ignore-platform-reqs --no-dev --no-scripts --optimize-autoloader --prefer-dist

# ----------------------------------------------------------------

# STAGE 2: Generate Wayfinder routes using PHP
FROM php-deps-builder AS wayfinder-generator

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

# Set environment to skip Telescope during build
ENV DOCKER_BUILD=true

# Generate Wayfinder routes with form variants
RUN php artisan wayfinder:generate --with-form

# ----------------------------------------------------------------

# STAGE 3: Build Frontend Assets
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

ENV DOCKER_BUILD=true
RUN pnpm build

# Install only production dependencies for SSR runtime
RUN pnpm prune --prod

# ----------------------------------------------------------------

# STAGE 4: Build the Final Production Image
FROM php:8.4-fpm-bookworm

WORKDIR /var/www

# Install extension installer (fast, pre-built binaries)
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Install PHP extensions using pre-built binaries (MUCH faster than compiling)
RUN install-php-extensions pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip redis

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy Node.js runtime from frontend builder (for SSR)
COPY --from=frontend-builder /usr/local/ /usr/local/
RUN corepack enable

RUN chown www-data:www-data /var/www

# --- SWITCH TO NON-ROOT USER ---
USER www-data

# Copy pre-built vendor directory from the PHP deps builder
COPY --chown=www-data:www-data --from=php-deps-builder /app/vendor ./vendor
COPY --chown=www-data:www-data composer.json composer.lock ./

# Copy production node_modules from frontend builder
COPY --chown=www-data:www-data --from=frontend-builder /app/node_modules ./node_modules
COPY --chown=www-data:www-data package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Copy the rest of the application code
COPY --chown=www-data:www-data . .

# Copy pre-built frontend assets
COPY --from=frontend-builder /app/public/build ./public/build

# Finalize composer and set permissions
RUN php artisan package:discover --ansi \
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