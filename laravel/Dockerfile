FROM node:lts-bookworm AS frontend-builder

WORKDIR /app

# Install PHP for Laravel Wayfinder plugin
RUN apt-get update && apt-get install -y \
    php-cli \
    php-xml \
    php-mbstring \
    php-curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm via corepack
RUN corepack enable

# Copy only dependency manifests first to leverage Docker cache
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Install all dependencies (including devDependencies needed for building)
RUN pnpm install --frozen-lockfile

# Copy Laravel files needed for Wayfinder
COPY artisan composer.json composer.lock ./
COPY app/ ./app/
COPY bootstrap/ ./bootstrap/
COPY config/ ./config/
COPY routes/ ./routes/
COPY database/ ./database/

# Install PHP dependencies needed for Wayfinder
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && composer install --no-dev --no-scripts --optimize-autoloader

# Create .env file with minimal config for build
RUN echo "APP_KEY=base64:$(openssl rand -base64 32)" > .env \
    && echo "APP_ENV=production" >> .env \
    && echo "APP_DEBUG=false" >> .env

# Copy source code required for the build process
COPY resources/ ./resources/
COPY vite.config.ts tsconfig.json components.json ./

# Create a production vite config that skips wayfinder to avoid needing artisan during build
RUN echo "import tailwindcss from '@tailwindcss/vite';" > vite.config.docker.ts && \
    echo "import react from '@vitejs/plugin-react';" >> vite.config.docker.ts && \
    echo "import laravel from 'laravel-vite-plugin';" >> vite.config.docker.ts && \
    echo "import { defineConfig } from 'vite';" >> vite.config.docker.ts && \
    echo "" >> vite.config.docker.ts && \
    echo "export default defineConfig({" >> vite.config.docker.ts && \
    echo "    plugins: [" >> vite.config.docker.ts && \
    echo "        laravel({" >> vite.config.docker.ts && \
    echo "            input: ['resources/css/app.css', 'resources/js/app.tsx']," >> vite.config.docker.ts && \
    echo "            ssr: 'resources/js/ssr.tsx'," >> vite.config.docker.ts && \
    echo "            refresh: true," >> vite.config.docker.ts && \
    echo "        })," >> vite.config.docker.ts && \
    echo "        react()," >> vite.config.docker.ts && \
    echo "        tailwindcss()," >> vite.config.docker.ts && \
    echo "    ]," >> vite.config.docker.ts && \
    echo "    esbuild: {" >> vite.config.docker.ts && \
    echo "        jsx: 'automatic'," >> vite.config.docker.ts && \
    echo "    }," >> vite.config.docker.ts && \
    echo "});" >> vite.config.docker.ts

# Build using the Docker-specific config
RUN pnpm vite build -c vite.config.docker.ts

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
    && composer install --ignore-platform-req=php --no-dev --no-scripts --optimize-autoloader

COPY --chown=www-data:www-data package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --prod --frozen-lockfile

COPY --chown=www-data:www-data . .

COPY --from=frontend-builder /app/public/build ./public/build

# Finalize composer and set permissions
RUN composer dump-autoload --optimize \
    && php artisan package:discover --ansi \
    && composer clear-cache \
    && mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x artisan

# --- FINAL ROOT-LEVEL TASKS ---
USER root

COPY ./scripts/php-entrypoint /usr/local/bin/php-entrypoint
RUN chmod +x /usr/local/bin/php-entrypoint

EXPOSE 9000
CMD ["php-fpm"]